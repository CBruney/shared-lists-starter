import test from "node:test";
import assert from "node:assert/strict";
import { scorePeopleAffinity } from "../src/lib/people-affinity.mjs";

test("balanced 90-day affinity qualifies two-source and repeated single-source contacts", () => {
  const result = scorePeopleAffinity({
    generated_at: "2026-06-25T20:30:00.000Z",
    window_days: 90,
    allowed_domains: ["local.test"],
    people: [
      {
        email: "two-sources@local.test",
        full_name: "Two Sources",
        signals: {
          slack: { active_days: 1, interaction_count: 3 },
          gmail: { active_days: 1, interaction_count: 1 },
          calendar: { active_days: 0, interaction_count: 0 },
        },
      },
      {
        email: "single-source@local.test",
        full_name: "Slack Regular",
        signals: { slack: { active_days: 4, interaction_count: 12 } },
      },
      {
        email: "low-signal@local.test",
        full_name: "Low Signal",
        signals: { slack: { active_days: 2, interaction_count: 2 } },
      },
      {
        email: "existing-user@local.test",
        full_name: "Existing User",
        existing_user: true,
        signals: {},
      },
      {
        email: "outside.invalid",
        full_name: "Outside Person",
        signals: { slack: { active_days: 20, interaction_count: 40 } },
      },
    ],
  });

  assert.equal(result.summary.observed_count, 4);
  assert.deepEqual(
    result.import_payload.profiles.map((profile) => profile.email).sort(),
    ["existing-user@local.test", "single-source@local.test", "two-sources@local.test"],
  );
  assert.equal(result.people.find((person) => person.email === "low-signal@local.test").qualified, false);
  assert.equal(result.import_payload.profiles.every((profile) => !("signals" in profile)), true);
});
