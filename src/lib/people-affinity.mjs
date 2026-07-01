const SOURCES = ["slack", "gmail", "calendar"];

export function scorePeopleAffinity(input, { now = new Date().toISOString(), allowedDomains = null } = {}) {
  const generatedAt = validIso(input?.generated_at || now, "generated_at");
  const windowDays = clampInteger(input?.window_days, 1, 365, 90);
  const people = mergePeople(input?.people || [], allowedDomains || input?.allowed_domains || input?.allowedDomains || []);
  const scoredPeople = people
    .map((person) => scorePerson(person, generatedAt))
    .sort((a, b) => b.score - a.score || String(a.full_name || a.email).localeCompare(String(b.full_name || b.email)));
  const profiles = scoredPeople
    .filter((person) => person.qualified && person.full_name)
    .map((person) => ({
      email: person.email,
      full_name: person.full_name,
      display_name: person.full_name,
      slack_user_id: person.slack_user_id,
      slack_handle: person.slack_handle,
      aliases: person.aliases,
      profile_source: "weekly-interactions",
      profile_synced_at: generatedAt,
    }));
  return {
    generated_at: generatedAt,
    window_days: windowDays,
    qualification_rule: "existing user with exact profile, two sources, or four distinct active days in one source",
    people: scoredPeople,
    import_payload: {
      synced_at: generatedAt,
      profiles,
    },
    summary: {
      observed_count: scoredPeople.length,
      qualified_count: profiles.length,
      medium_count: scoredPeople.filter((person) => person.qualified && person.confidence === "medium").length,
      high_count: scoredPeople.filter((person) => person.qualified && person.confidence === "high").length,
      unresolved_name_count: scoredPeople.filter((person) => person.qualified && !person.full_name).length,
    },
  };
}

function scorePerson(person, generatedAt) {
  const signals = Object.fromEntries(SOURCES.map((source) => [source, normalizeSignal(person.signals?.[source])]))
  const sourceCount = SOURCES.filter((source) => signals[source].active_days > 0 || signals[source].interaction_count > 0).length;
  const maxActiveDays = Math.max(...SOURCES.map((source) => signals[source].active_days));
  const totalActiveDays = SOURCES.reduce((sum, source) => sum + signals[source].active_days, 0);
  const totalInteractions = SOURCES.reduce((sum, source) => sum + signals[source].interaction_count, 0);
  const existingUser = Boolean(person.existing_user);
  const qualified = existingUser || sourceCount >= 2 || maxActiveDays >= 4;
  const highConfidence = sourceCount >= 3 || (sourceCount >= 2 && totalActiveDays >= 8) || maxActiveDays >= 8;
  const confidence = qualified ? (highConfidence ? "high" : "medium") : "low";
  const score = sourceCount * 40 + Math.min(totalActiveDays, 30) * 3 + Math.min(totalInteractions, 100) + (existingUser ? 20 : 0);
  return {
    email: person.email,
    full_name: person.full_name,
    slack_user_id: person.slack_user_id,
    slack_handle: person.slack_handle,
    aliases: person.aliases,
    existing_user: existingUser,
    signals,
    source_count: sourceCount,
    max_active_days: maxActiveDays,
    total_active_days: totalActiveDays,
    total_interactions: totalInteractions,
    last_interaction_at: person.last_interaction_at || null,
    qualified,
    confidence,
    score,
    computed_at: generatedAt,
  };
}

function mergePeople(people, allowedDomains = []) {
  if (!Array.isArray(people)) throw new Error("people must be an array");
  const allowed = normalizedDomainSet(allowedDomains);
  const byEmail = new Map();
  for (const raw of people) {
    const email = String(raw?.email || "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) continue;
    const domain = email.split("@").at(-1);
    if (allowed.size && !allowed.has(domain)) continue;
    const current = byEmail.get(email) || {
      email,
      full_name: "",
      slack_user_id: "",
      slack_handle: "",
      aliases: [],
      existing_user: false,
      last_interaction_at: null,
      signals: Object.fromEntries(SOURCES.map((source) => [source, { active_days: 0, interaction_count: 0 }])),
    };
    current.full_name = richerText(current.full_name, raw.full_name || raw.fullName || raw.display_name);
    current.slack_user_id = current.slack_user_id || normalizeText(raw.slack_user_id || raw.slackUserId);
    current.slack_handle = current.slack_handle || normalizeText(raw.slack_handle || raw.slackHandle).replace(/^@/, "").toLowerCase();
    current.aliases = [...new Set([
      ...current.aliases,
      ...(Array.isArray(raw.aliases) ? raw.aliases : []),
      raw.display_name,
      raw.slack_handle,
    ].map(normalizeText).filter(Boolean))].slice(0, 20);
    current.existing_user = current.existing_user || Boolean(raw.existing_user || raw.existingUser);
    current.last_interaction_at = latestIso(current.last_interaction_at, raw.last_interaction_at || raw.lastInteractionAt);
    for (const source of SOURCES) {
      const signal = normalizeSignal(raw.signals?.[source]);
      current.signals[source].active_days = Math.max(current.signals[source].active_days, signal.active_days);
      current.signals[source].interaction_count = Math.max(current.signals[source].interaction_count, signal.interaction_count);
    }
    byEmail.set(email, current);
  }
  return [...byEmail.values()];
}

function normalizedDomainSet(domains) {
  if (!Array.isArray(domains)) return new Set();
  return new Set(
    domains
      .map((domain) => String(domain || "").trim().toLowerCase().replace(/^@/, ""))
      .filter((domain) => /^[a-z0-9.-]+\.[a-z0-9-]+$/.test(domain)),
  );
}

function normalizeSignal(signal) {
  return {
    active_days: clampInteger(signal?.active_days ?? signal?.activeDays, 0, 366, 0),
    interaction_count: clampInteger(signal?.interaction_count ?? signal?.interactionCount, 0, 100000, 0),
  };
}

function normalizeText(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 160);
}

function richerText(current, candidate) {
  const normalized = normalizeText(candidate);
  if (!normalized) return current;
  return normalized.split(/\s+/).length > String(current || "").split(/\s+/).length ? normalized : current || normalized;
}

function latestIso(current, candidate) {
  if (!candidate) return current;
  const normalized = validIso(candidate, "last_interaction_at");
  if (!current) return normalized;
  return new Date(normalized) > new Date(current) ? normalized : current;
}

function validIso(value, label) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} must be an ISO date`);
  return date.toISOString();
}

function clampInteger(value, minimum, maximum, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(Math.trunc(number), minimum), maximum);
}
