const icon = {
  share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 8a3 3 0 1 0-2.8-4M6 14a3 3 0 1 0-2.8-4M18 22a3 3 0 1 0-2.8-4M8.7 13.1l6.6 3.8M15.3 7.1 8.7 10.9"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v4M17 3v4M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 11v6M14 11v6"/></svg>',
  grip: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/></svg>',
  external: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/><path d="M14 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8"/></svg>',
  signIn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/></svg>',
  signOut: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>',
};

const appConfig = normalizeSharedListsConfig(window.SHARED_LISTS_CONFIG);
const defaultListMarkerColor = "blue";
const defaultListMarkerIcon = "app";
const listMarkerColors = [
  { id: "blue", label: "Blue" },
  { id: "green", label: "Green" },
  { id: "amber", label: "Amber" },
  { id: "red", label: "Red" },
  { id: "purple", label: "Purple" },
  { id: "teal", label: "Teal" },
  { id: "slate", label: "Slate" },
];
const listMarkerIcons = [
  { id: "app", label: "Shared Lists", svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h9M8 12h9M8 18h9"/><path d="m4 6 .8.8L6.4 5.2M4 12h2M4 18h2"/></svg>' },
  { id: "circle", label: "Circle", svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/></svg>' },
  { id: "square", label: "Square", svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8h8v8H8z"/></svg>' },
  { id: "diamond", label: "Diamond", svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 5 7 7-7 7-7-7 7-7Z"/></svg>' },
  { id: "star", label: "Star", svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.4 5.6 6.1.5-4.6 4 1.4 5.9-5.3-3.1L6.7 19l1.4-5.9-4.6-4 6.1-.5L12 3Z"/></svg>' },
  { id: "flag", label: "Flag", svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4M6 4h11l-2 4 2 4H6"/></svg>' },
  { id: "briefcase", label: "Briefcase", svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2ZM4 12h16"/></svg>' },
];
const listMarkerColorIds = new Set(listMarkerColors.map((color) => color.id));
const listMarkerIconMap = new Map(listMarkerIcons.map((item) => [item.id, item]));

const feedbackTarget = {
  email: appConfig.feedbackEmail,
};
const feedbackSubject = "Shared Lists feedback";

const listSurfaceCacheMaxAgeMs = 7 * 24 * 60 * 60 * 1000;
const listDetailCacheMaxAgeMs = 30 * 60 * 1000;
const listDetailPersistentCacheMaxAgeMs = listSurfaceCacheMaxAgeMs;
const peopleIndexCacheMaxAgeMs = 24 * 60 * 60 * 1000;
const peopleIndexFreshMaxAgeMs = 5 * 60 * 1000;
const peopleSearchLimit = 8;
const defaultReadRequestTimeoutMs = 3500;
const defaultMutationRequestTimeoutMs = 8000;
const taskPatchDebounceMs = 160;
const reconcileDelayMs = 650;
const maxTaskTitleLength = 4000;
const mobileTaskDragStartDistance = 4;
const resumeRefreshMinIntervalMs = 15000;
const mobileListTransitionGuardMs = 180;
const overviewDemoAdvanceMs = 5200;
const listDeleteUndoWindowMs = 6200;
const listPrefetchConcurrency = 2;
const markerCoachDismissedKey = "sharedLists:markerCoachDismissed:v1";
const sidebarCollapsedKey = "sharedLists:sidebarCollapsed:v1";
const overviewDemoDismissedKey = "sharedLists:overviewDemoDismissed:v1";
const homeScreenGuideDismissedKey = "sharedLists:homeScreenGuideDismissed:v1";
const themePreferenceKey = "sharedLists:theme:v1";
const authRefreshParam = "__sl_auth";
const listLinkParam = "list";
const signInPath = "/signin-with-chatgpt";
const signOutPath = "/signout-with-chatgpt";
const quickActionParam = "quick_action";
const allowedQuickActionBridgeOrigins = new Set(appConfig.quickActionBridge.allowedOrigins);
const initialListLinkId = requestedListIdFromUrl();
const mobileQuery = window.matchMedia("(max-width: 760px)");
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
const overviewSteps = [
  {
    key: "create",
    title: "Create a list",
    copy: "Tap the blue plus, name the list, and it appears under Owned by me.",
  },
  {
    key: "task",
    title: "Add a task",
    copy: "Type what needs doing. Long notes and links can live inside one task.",
  },
  {
    key: "date",
    title: "Add a due date",
    copy: "Use the calendar control on a task to keep the list ordered by time.",
  },
  {
    key: "share",
    title: "Share the list",
    copy: "Open Share to add people, allow them to share, or remove access.",
  },
  {
    key: "copy",
    title: "Copy the list link",
    copy: "Use Link when you want to send the list directly in Messages or email.",
  },
  {
    key: "done",
    title: "Finish tasks",
    copy: "Check items off. Completed tasks stay in the archive until deleted.",
  },
  {
    key: "theme",
    title: "Choose a theme",
    copy: "Open Settings to use light mode, dark mode, or match system.",
  },
];

const state = {
  session: null,
  authConfirmed: Boolean(window.__SHARED_LISTS_AUTH_EMAIL__ || isLocalHost()),
  groups: { owned: [], shared: [] },
  activeListId: initialListLinkId,
  active: null,
  accessRequest: null,
  mobileView: mobileQuery.matches ? "lists" : "tasks",
  detailsSheetOpen: false,
  detailsPopoverOpen: false,
  pendingListLinkId: initialListLinkId,
  mobileListTransitionGuardPending: false,
  mobileListTransitionGuardUntil: 0,
  mobileExpandedTaskId: null,
  fastSurfaceHydrated: false,
  connectionIssue: false,
  authRequired: false,
  completedOpen: false,
  selectedCompleted: new Set(),
  editingTaskId: null,
  editingTaskOriginalTitle: "",
  editingListTitle: false,
  editingListOriginalTitle: "",
  people: {
    query: "",
    suggestions: [],
    loading: false,
    open: false,
    highlightedIndex: -1,
    selected: null,
  },
  peopleIndex: {
    email: "",
    entries: [],
    loaded: false,
    loadedAt: 0,
  },
  invite: {
    listId: "",
    email: "",
    message: "",
    tone: "neutral",
    pending: false,
  },
  newListDialogOpen: false,
  settingsDialogOpen: false,
  overviewDemoOpen: false,
  overviewStepIndex: 0,
  homeScreenGuideOpen: false,
  installGuideMode: installGuideModeForDevice(),
  themePreference: readThemePreference(),
  markerPicker: {
    open: false,
    listId: null,
  },
  markerCoach: {
    open: false,
    listId: null,
  },
  sidebarCollapsed: readSidebarCollapsedPreference(),
  loading: true,
};

const els = {
  sidebarToggleButton: document.querySelector("#sidebar-toggle-button"),
  sidebarRestoreButton: document.querySelector("#sidebar-restore-button"),
  currentUserLabel: document.querySelector("#current-user-label"),
  devUserSwitcher: document.querySelector("#dev-user-switcher"),
  listNav: document.querySelector("#list-nav"),
  newListButton: document.querySelector("#new-list-button"),
  feedbackButton: document.querySelector("#feedback-button"),
  settingsButton: document.querySelector("#settings-button"),
  settingsAuthAction: document.querySelector("#settings-auth-action"),
  settingsAuthIcon: document.querySelector("#settings-auth-icon"),
  settingsAuthTitle: document.querySelector("#settings-auth-title"),
  settingsAuthDescription: document.querySelector("#settings-auth-description"),
  mobileListButton: document.querySelector("#mobile-list-button"),
  activeListTitle: document.querySelector("#active-list-title"),
  visibilityChip: document.querySelector("#visibility-chip"),
  listOwnerLabel: document.querySelector("#list-owner-label"),
  headerAvatars: document.querySelector("#header-avatars"),
  shareButton: document.querySelector("#share-button"),
  shareButtonText: document.querySelector("#share-button-text"),
  shareRequestBadge: document.querySelector("#share-request-badge"),
  deleteListButton: document.querySelector("#delete-list-button"),
  accessDeniedPanel: document.querySelector("#access-denied-panel"),
  requestAccessButton: document.querySelector("#request-access-button"),
  returnToPickerButton: document.querySelector("#return-to-picker-button"),
  accessRequestStatus: document.querySelector("#access-request-status"),
  addTaskForm: document.querySelector("#add-task-form"),
  taskInput: document.querySelector("#task-input"),
  draftDueDate: document.querySelector("#draft-due-date"),
  taskList: document.querySelector("#task-list"),
  completedToggle: document.querySelector("#completed-toggle"),
  completedDrawer: document.querySelector(".completed-drawer"),
  completedCount: document.querySelector("#completed-count"),
  completedContent: document.querySelector("#completed-content"),
  completedList: document.querySelector("#completed-list"),
  selectAllCompleted: document.querySelector("#select-all-completed"),
  deleteSelectedButton: document.querySelector("#delete-selected-button"),
  clearCompletedButton: document.querySelector("#clear-completed-button"),
  shareStatus: document.querySelector("#share-status"),
  detailsPanel: document.querySelector("#details-panel"),
  markerPopover: document.querySelector("#marker-popover"),
  markerCoach: document.querySelector("#marker-coach"),
  copyListLinkButton: document.querySelector("#copy-list-link-button"),
  allowAllShareButton: document.querySelector("#allow-all-share-button"),
  accessRequestSection: document.querySelector("#access-request-section"),
  accessRequestCount: document.querySelector("#access-request-count"),
  accessRequestList: document.querySelector("#access-request-list"),
  memberList: document.querySelector("#member-list"),
  ownerOnlyLabel: document.querySelector("#owner-only-label"),
  inviteForm: document.querySelector("#invite-form"),
  inviteInput: document.querySelector("#invite-input"),
  inviteSubmitButton: document.querySelector("#invite-submit-button"),
  inviteStatus: document.querySelector("#invite-status"),
  peopleSuggestions: document.querySelector("#people-suggestions"),
  detailsSheetScrim: document.querySelector("#details-sheet-scrim"),
  detailsSheetClose: document.querySelector("#details-sheet-close"),
  newListDialog: document.querySelector("#new-list-dialog"),
  newListForm: document.querySelector("#new-list-form"),
  newListTitleInput: document.querySelector("#new-list-title-input"),
  newListCancel: document.querySelector("#new-list-cancel"),
  settingsDialog: document.querySelector("#settings-dialog"),
  settingsCloseButton: document.querySelector("#settings-close-button"),
  themePreferenceInputs: Array.from(document.querySelectorAll('input[name="theme-preference"]')),
  showHomeScreenGuideButton: document.querySelector("#show-home-screen-guide-button"),
  installAppSettingsDescription: document.querySelector("#install-app-settings-description"),
  showOverviewDemoButton: document.querySelector("#show-overview-demo-button"),
  overviewDemo: document.querySelector("#overview-demo"),
  overviewDemoClose: document.querySelector("#overview-demo-close"),
  overviewDemoBack: document.querySelector("#overview-demo-back"),
  overviewDemoNext: document.querySelector("#overview-demo-next"),
  overviewDemoDone: document.querySelector("#overview-demo-done"),
  overviewStepLabel: document.querySelector("#overview-step-label"),
  overviewStepTitle: document.querySelector("#overview-step-title"),
  overviewStepCopy: document.querySelector("#overview-step-copy"),
  overviewDots: document.querySelector("#overview-dots"),
  homeScreenGuide: document.querySelector("#home-screen-guide"),
  homeScreenGuideClose: document.querySelector("#home-screen-guide-close"),
  homeScreenGuideDone: document.querySelector("#home-screen-guide-done"),
  homeScreenGuideLater: document.querySelector("#home-screen-guide-later"),
  toast: document.querySelector("#toast"),
};

let toastTimer;
const pendingListCreates = new Map();
const resolvedListIds = new Map();
const pendingListDeletes = new Map();
const listDetailCache = new Map();
const listDetailRequests = new Map();
const listSecondaryDetailRequests = new Map();
const completedTaskRequests = new Map();
const resolvedTaskIds = new Map();
const taskMutations = new Map();
const reconcileTimers = new Map();
let taskReorderQueue = Promise.resolve();
let pendingTaskReorders = 0;
let latestTaskReorderToken = 0;
let activeTaskDragId = null;
const deferredTaskAdoptions = new Map();
let activeListLoadToken = 0;
let prefetchQueued = false;
let peopleSearchToken = 0;
let peopleIndexRequest = null;
let peopleSearchStartedAt = 0;
let resumeRefreshTimer = 0;
let lastResumeRefreshAt = 0;
let mobileListTransitionGuardTimer = 0;
let overviewDemoTimer = 0;

init();

async function init() {
  applyThemePreference(state.themePreference);
  setupLocalDevSwitcher();
  bindEvents();
  bindMobileViewport();
  bindSystemThemePreference();
  hydrateFastListSurface();
  registerShellServiceWorker();
  const sessionConfirmation = state.authConfirmed ? Promise.resolve() : confirmSessionAndHydrateFastSurface();
  await Promise.all([bootstrapApp(), sessionConfirmation]);
  await handleQuickActionBridge();
  if (!maybeShowOverviewDemo()) maybeShowHomeScreenGuide();
}

function bindEvents() {
  els.newListButton.addEventListener("click", openNewListDialog);
  if (feedbackTarget.email) {
    els.feedbackButton.addEventListener("click", openFeedback);
  } else {
    els.feedbackButton.hidden = true;
  }
  els.newListForm.addEventListener("submit", createList);
  els.newListCancel.addEventListener("click", closeNewListDialog);
  els.newListDialog.addEventListener("click", (event) => {
    if (event.target === els.newListDialog) closeNewListDialog();
  });
  els.addTaskForm.addEventListener("submit", addTask);
  els.addTaskForm.querySelector(".add-input-wrap").addEventListener("click", () => {
    if (!els.taskInput.disabled) els.taskInput.focus();
  });
  els.taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      els.addTaskForm.requestSubmit();
    }
  });
  els.completedToggle.addEventListener("click", () => {
    state.completedOpen = !state.completedOpen;
    renderCompleted();
    if (state.completedOpen) loadCompletedTasks();
  });
  els.selectAllCompleted.addEventListener("change", () => {
    if (!state.active?.completed_tasks_loaded) return;
    state.selectedCompleted = new Set(
      els.selectAllCompleted.checked ? state.active.completed_tasks.map((task) => task.id) : [],
    );
    renderCompleted();
  });
  els.deleteSelectedButton.addEventListener("click", deleteSelectedCompleted);
  els.clearCompletedButton.addEventListener("click", clearCompleted);
  els.inviteForm.addEventListener("submit", inviteMember);
  els.inviteInput.addEventListener("input", handleInviteInput);
  els.inviteInput.addEventListener("keydown", handleInviteKeydown);
  els.inviteInput.addEventListener("focus", () => {
    if (state.people.suggestions.length || state.people.loading) openPeopleSuggestions();
  });
  els.inviteInput.addEventListener("blur", () => {
    window.setTimeout(closePeopleSuggestions, 120);
  });
  els.copyListLinkButton.addEventListener("click", copyActiveListLink);
  els.settingsButton.addEventListener("click", openSettingsDialog);
  els.settingsDialog.addEventListener("click", (event) => {
    if (event.target === els.settingsDialog) closeSettingsDialog();
  });
  els.settingsCloseButton.addEventListener("click", closeSettingsDialog);
  els.themePreferenceInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) setThemePreference(input.value);
    });
  });
  els.showHomeScreenGuideButton.addEventListener("click", () => {
    closeSettingsDialog({ restoreFocus: false });
    openHomeScreenGuide({ automatic: false, mode: installGuideModeForDevice() });
  });
  els.showOverviewDemoButton.addEventListener("click", () => {
    closeSettingsDialog({ restoreFocus: false });
    openOverviewDemo({ automatic: false });
  });
  els.overviewDemo.addEventListener("click", (event) => {
    if (event.target === els.overviewDemo) closeOverviewDemo();
  });
  els.overviewDemoClose.addEventListener("click", closeOverviewDemo);
  els.overviewDemoBack.addEventListener("click", previousOverviewStep);
  els.overviewDemoNext.addEventListener("click", nextOverviewStep);
  els.overviewDemoDone.addEventListener("click", closeOverviewDemo);
  els.homeScreenGuide.addEventListener("click", (event) => {
    if (event.target === els.homeScreenGuide) closeHomeScreenGuide();
  });
  els.homeScreenGuideClose.addEventListener("click", closeHomeScreenGuide);
  els.homeScreenGuideDone.addEventListener("click", closeHomeScreenGuide);
  els.homeScreenGuideLater.addEventListener("click", closeHomeScreenGuide);
  els.activeListTitle.addEventListener("click", handleActiveListTitleClick);
  els.activeListTitle.addEventListener("keydown", handleActiveListTitleKeydown);
  els.allowAllShareButton.addEventListener("click", allowAllToShare);
  els.requestAccessButton.addEventListener("click", requestDeniedListAccess);
  els.returnToPickerButton.addEventListener("click", returnToListPickerFromAccessDenied);
  els.sidebarToggleButton.addEventListener("click", toggleDesktopSidebar);
  els.sidebarRestoreButton.addEventListener("click", toggleDesktopSidebar);
  els.mobileListButton.addEventListener("click", showMobileListPicker);
  els.detailsSheetScrim.addEventListener("click", closeDetailsSheet);
  els.detailsSheetClose.addEventListener("click", closeDetailsSheet);
  els.shareButton.addEventListener("click", handleShareButton);
  els.deleteListButton.addEventListener("click", deleteActiveList);
  document.addEventListener("pointerdown", blockMobileListTransitionCarryThrough, true);
  document.addEventListener("pointerup", blockMobileListTransitionCarryThrough, true);
  document.addEventListener("touchend", blockMobileListTransitionCarryThrough, true);
  document.addEventListener("click", blockMobileListTransitionCarryThrough, true);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.newListDialogOpen) closeNewListDialog();
    if (event.key === "Escape" && state.settingsDialogOpen) closeSettingsDialog();
    if (event.key === "Escape" && state.overviewDemoOpen) closeOverviewDemo();
    if (event.key === "Escape" && state.homeScreenGuideOpen) closeHomeScreenGuide();
    if (event.key === "Escape" && state.detailsSheetOpen) closeDetailsSheet();
    if (event.key === "Escape" && state.detailsPopoverOpen) closeDetailsPopover();
    if (event.key === "Escape" && state.markerPicker.open) closeMarkerPicker();
    if (event.key === "Escape" && state.markerCoach.open) dismissMarkerCoach();
  });
  document.addEventListener("click", (event) => {
    const authLinkButton = event.target.closest("[data-copy-auth-return-link]");
    if (authLinkButton) {
      copyCurrentSharedListsLink();
      return;
    }
    if (state.detailsPopoverOpen) {
      const clickedPeopleSuggestions = event.composedPath().includes(els.peopleSuggestions);
      if (event.target.closest("#details-panel") || event.target.closest("#share-button") || clickedPeopleSuggestions) return;
      closeDetailsPopover({ restoreFocus: false });
      return;
    }
    if (!state.markerPicker.open) return;
    if (event.target.closest("#marker-popover") || event.target.closest("[data-marker-trigger]")) return;
    closeMarkerPicker();
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) scheduleResumeRefresh("visible");
  });
  window.addEventListener("focus", () => scheduleResumeRefresh("focus"));
  window.addEventListener("online", () => scheduleResumeRefresh("online"));
  window.addEventListener("resize", positionFloatingOverlays);
  window.addEventListener("scroll", positionFloatingOverlays, true);
}

function bindMobileViewport() {
  const onViewportChange = () => {
    state.detailsSheetOpen = false;
    state.mobileExpandedTaskId = null;
    state.mobileView = isMobileLayout() ? "lists" : "tasks";
    state.detailsPopoverOpen = false;
    clearMobileListTransitionGuard();
    render();
  };
  if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", onViewportChange);
  else mobileQuery.addListener(onViewportChange);
}

function armMobileListTransitionGuard() {
  if (!isMobileLayout()) return;
  state.mobileListTransitionGuardUntil = window.performance.now() + mobileListTransitionGuardMs;
  document.body.classList.add("mobile-list-transition-guard");
  window.clearTimeout(mobileListTransitionGuardTimer);
  mobileListTransitionGuardTimer = window.setTimeout(clearMobileListTransitionGuard, mobileListTransitionGuardMs + 40);
}

function beginMobileListTransitionGuard() {
  if (!isMobileLayout()) return;
  state.mobileListTransitionGuardPending = true;
  state.mobileListTransitionGuardUntil = Number.POSITIVE_INFINITY;
  document.body.classList.add("mobile-list-transition-guard");
  window.clearTimeout(mobileListTransitionGuardTimer);
}

function settleMobileListTransitionGuard() {
  if (!state.mobileListTransitionGuardPending) return;
  state.mobileListTransitionGuardPending = false;
  armMobileListTransitionGuard();
}

function mobileListTransitionGuardActive() {
  const active = isMobileLayout() && window.performance.now() < state.mobileListTransitionGuardUntil;
  if (!active) document.body.classList.remove("mobile-list-transition-guard");
  return active;
}

function clearMobileListTransitionGuard() {
  state.mobileListTransitionGuardPending = false;
  state.mobileListTransitionGuardUntil = 0;
  document.body.classList.remove("mobile-list-transition-guard");
}

function blockMobileListTransitionCarryThrough(event) {
  if (!mobileListTransitionGuardActive()) return;
  const target = event.target instanceof Element ? event.target : event.target?.parentElement;
  if (!target?.closest(".task-pane")) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}

function setupLocalDevSwitcher() {
  if (!isLocalHost() || !els.devUserSwitcher) return;
  const queryUser = normalizeEmail(new URLSearchParams(window.location.search).get("as"));
  const storedUser = normalizeEmail(window.localStorage.getItem("sharedListsDevUser"));
  const user = queryUser || storedUser || defaultDevUser();
  if (!user) return;
  if (!Array.from(els.devUserSwitcher.options).some((option) => option.value === user)) {
    els.devUserSwitcher.append(new Option(user, user));
  }
  window.localStorage.setItem("sharedListsDevUser", user);
  els.devUserSwitcher.hidden = !queryUser && !storedUser && els.devUserSwitcher.options.length <= 1;
  els.devUserSwitcher.value = user;
  els.devUserSwitcher.addEventListener("change", () => {
    window.localStorage.setItem("sharedListsDevUser", els.devUserSwitcher.value);
    const url = new URL(window.location.href);
    url.searchParams.set("as", els.devUserSwitcher.value);
    if (state.activeListId) url.searchParams.set(listLinkParam, state.activeListId);
    window.location.href = `${url.pathname}${url.search}`;
  });
}

function requestedListIdFromUrl() {
  const value = new URLSearchParams(window.location.search).get(listLinkParam);
  return value?.trim() || null;
}

function requestedQuickActionPayload() {
  if (!appConfig.features.quickActionBridge) return null;
  const value = new URLSearchParams(window.location.search).get(quickActionParam);
  if (!value) return null;
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

async function handleQuickActionBridge() {
  if (!appConfig.features.quickActionBridge) return;
  const payload = requestedQuickActionPayload();
  if (!payload) return;
  clearQuickActionBridgeFromUrl();
  const replyOrigin = allowedQuickActionBridgeOrigins.has(payload.reply_origin) ? payload.reply_origin : "";
  try {
    const result = await apiFetch("/api/integrations/quick-actions", {
      method: "POST",
      body: JSON.stringify({
        source: payload.source || "quick-actions",
        external_id: payload.external_id,
        title: payload.title,
        due_date: payload.due_date || null,
        list_title: payload.list_title || "Quick Actions",
      }),
    });
    postQuickActionBridgeResult(replyOrigin, {
      type: "shared-lists-quick-action-result",
      ok: true,
      externalId: payload.external_id,
      result,
    });
    showToast("Added to Quick Actions.");
    window.setTimeout(() => window.close(), 450);
  } catch (error) {
    postQuickActionBridgeResult(replyOrigin, {
      type: "shared-lists-quick-action-result",
      ok: false,
      externalId: payload.external_id || "",
      error: error.message || "Shared Lists could not add the task.",
    });
    showToast(error.message || "Shared Lists could not add the task.");
  }
}

function clearQuickActionBridgeFromUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(quickActionParam)) return;
  url.searchParams.delete(quickActionParam);
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function postQuickActionBridgeResult(replyOrigin, message) {
  if (!replyOrigin || !window.opener || window.opener.closed) return;
  window.opener.postMessage(message, replyOrigin);
}

function activeListLink(listId) {
  const url = new URL(window.location.href);
  url.searchParams.delete(authRefreshParam);
  url.searchParams.set(listLinkParam, listId);
  return url.toString();
}

function writeActiveListToUrl(listId) {
  if (!listId) {
    clearListLinkFromUrl();
    return;
  }
  const url = new URL(window.location.href);
  url.searchParams.delete(authRefreshParam);
  url.searchParams.set(listLinkParam, listId);
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function clearListLinkFromUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(listLinkParam)) return;
  url.searchParams.delete(listLinkParam);
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

async function refreshSession() {
  const data = await apiFetch("/api/session");
  setSessionUser(data.user);
}

async function confirmSessionAndHydrateFastSurface() {
  try {
    const data = await apiFetchWithRetry("/api/session", {}, { retries: 1 });
    if (state.authConfirmed || !data?.user?.email) return;
    const identity = { email: normalizeEmail(data.user.email), confirmed: true };
    setSessionUser(data.user, { confirmed: true });
    hydrateFastListSurface(identity);
  } catch {
    // Bootstrap remains the authoritative identity and data path if the fast session hint misses.
  }
}

async function bootstrapApp() {
  state.loading = !state.fastSurfaceHydrated;
  if (!state.fastSurfaceHydrated) renderListNav();
  try {
    const data = await apiFetchWithRetry(bootstrapPath(), {}, { retries: 1 });
    state.connectionIssue = false;
    state.authRequired = false;
    setSessionUser(data.user, { confirmed: true });
    clearAuthRefreshParam();
    writeListSurfaceCache(data.user.email, data.groups);
    await refreshLists({ groups: data.groups, activeDetail: data.active || null, deferMobileDetail: true });
  } catch (error) {
    if (isAuthRequiredError(error) || !state.authConfirmed) {
      enterSignedOutState();
      return;
    }
    state.loading = false;
    state.connectionIssue = true;
    if (!state.session) {
      const email = initialKnownUserEmail();
      if (email) setSessionUser({ email, display_name: displayNameFromEmail(email) });
    }
    const hasFastSurface = Boolean(state.fastSurfaceHydrated);
    if (!hasFastSurface) {
      state.groups = { owned: [], shared: [] };
      state.activeListId = null;
      state.active = null;
    }
    render();
    showToast(hasFastSurface ? "Reconnecting..." : "Connect to load lists");
  }
}

function bootstrapPath() {
  const params = new URLSearchParams();
  if (!isMobileLayout() || state.pendingListLinkId) params.set("include_active", "true");
  if (state.pendingListLinkId || state.activeListId) params.set("active_list_id", state.pendingListLinkId || state.activeListId);
  const query = params.toString();
  return query ? `/api/bootstrap?${query}` : "/api/bootstrap";
}

function registerShellServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (!isServiceWorkerSafeOrigin()) return;
  const register = () => {
    navigator.serviceWorker.register("/service-worker.js").then((registration) => {
      const update = registration.update?.();
      if (update && typeof update.catch === "function") update.catch(() => {});
    }).catch(() => {
      // Shell caching is a speed/resilience enhancement; registration failure should not block the app.
    });
  };
  if (document.readyState === "complete") {
    register();
  } else {
    window.addEventListener("load", register, { once: true });
  }
}

function isStandaloneDisplay() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isServiceWorkerSafeOrigin() {
  if (window.location.protocol === "https:") return true;
  return window.location.protocol === "http:" && ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function setSessionUser(user, { confirmed = true } = {}) {
  state.session = user;
  if (confirmed) {
    state.authConfirmed = true;
  }
  els.currentUserLabel.textContent = state.session?.email || "Unknown user";
  preparePeopleIndexForUser(state.session?.email);
}

async function refreshLists({ groups = null, activeDetail = null, deferMobileDetail = false, requestedListId = state.pendingListLinkId } = {}) {
  state.loading = true;
  renderListNav();
  state.groups = filterPendingListDeletes(groups ?? (await apiFetch("/api/lists")));
  if (state.session?.email) writeListSurfaceCache(state.session.email, state.groups);
  const allLists = allListSummaries();
  if (state.active?.list?.id) {
    const activeSummary = allLists.find((list) => list.id === state.active.list.id);
    if (activeSummary) state.active = { ...state.active, list: { ...state.active.list, ...activeSummary } };
  }
  const requestedListVisible = requestedListId ? allLists.some((list) => list.id === requestedListId) : false;
  if (requestedListId && !requestedListVisible) {
    state.accessRequest = {
      listId: requestedListId,
      status: state.accessRequest?.listId === requestedListId ? state.accessRequest.status : "idle",
    };
    state.activeListId = null;
    state.active = null;
    state.loading = false;
    state.mobileView = "tasks";
    render();
    return;
  }
  state.accessRequest = null;
  const normalizedActive = activeDetail?.list?.id ? normalizeListDetail(activeDetail, activeDetail.list.id) : null;
  if (requestedListVisible) {
    state.activeListId = requestedListId;
    if (isMobileLayout()) state.mobileView = "tasks";
  }
  if (
    normalizedActive &&
    allLists.some((list) => list.id === normalizedActive.list.id) &&
    (!requestedListId || normalizedActive.list.id === requestedListId)
  ) {
    const loadToken = ++activeListLoadToken;
    state.activeListId = normalizedActive.list.id;
    state.active = normalizedActive;
    setCachedListDetail(normalizedActive.list.id, normalizedActive);
    state.loading = false;
    state.pendingListLinkId = null;
    render();
    if (state.completedOpen) loadCompletedTasks();
    if (!deferMobileDetail || !isMobileLayout() || state.mobileView !== "lists") {
      loadListDetails(normalizedActive.list.id, loadToken, { quiet: true });
    }
    prefetchVisibleLists();
    return;
  }
  if (!state.activeListId || !allLists.some((list) => list.id === state.activeListId)) {
    state.activeListId = allLists[0]?.id || null;
  }
  state.pendingListLinkId = null;
  if (state.activeListId) {
    if (deferMobileDetail && isMobileLayout() && state.mobileView === "lists") {
      state.active = null;
      state.loading = false;
      render();
      return;
    }
    const activeLoad = loadActiveList({ renderImmediate: false });
    prefetchVisibleLists();
    await activeLoad;
    prefetchVisibleLists();
  }
  else {
    state.active = null;
    state.loading = false;
    render();
  }
}

function hydrateFastListSurface(identity = fastSurfaceIdentity()) {
  if (!identity) return;
  const cached = readListSurfaceCache(identity.email);
  if (!cached) return;
  setSessionUser(
    {
      email: identity.email,
      display_name: displayNameFromEmail(identity.email),
    },
    { confirmed: identity.confirmed },
  );
  state.groups = cached.groups;
  const cachedLists = allListSummaries();
  const requestedListVisible = state.pendingListLinkId && cachedLists.some((list) => list.id === state.pendingListLinkId);
  state.activeListId = state.pendingListLinkId ? (requestedListVisible ? state.pendingListLinkId : null) : cachedLists[0]?.id || null;
  if (requestedListVisible && isMobileLayout()) state.mobileView = "tasks";
  state.active = fastInitialActiveDetail(state.activeListId);
  state.loading = false;
  state.fastSurfaceHydrated = true;
  render();
}

function fastInitialActiveDetail(listId) {
  if (!listId) return null;
  return getCachedListDetail(listId) || placeholderListDetail(findListSummary(listId));
}

function fastSurfaceIdentity() {
  const confirmedEmail = initialKnownUserEmail();
  if (confirmedEmail) return { email: confirmedEmail, confirmed: true };
  return null;
}

function initialKnownUserEmail() {
  return normalizeEmail(window.__SHARED_LISTS_AUTH_EMAIL__ || currentDevUser());
}

function listSurfaceCacheKey(email) {
  return `sharedLists:listSurface:v1:${normalizeEmail(email)}`;
}

function readListSurfaceCache(email, { maxAgeMs = listSurfaceCacheMaxAgeMs } = {}) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  try {
    const cached = JSON.parse(window.localStorage.getItem(listSurfaceCacheKey(normalized)) || "null");
    if (!cached || cached.email !== normalized || !isListGroups(cached.groups) || !cached.saved_at) return null;
    if (Date.now() - Date.parse(cached.saved_at) > maxAgeMs) return null;
    return cached;
  } catch {
    return null;
  }
}

function writeListSurfaceCache(email, groups) {
  const normalized = normalizeEmail(email);
  if (!normalized || !isListGroups(groups)) return;
  try {
    window.localStorage.setItem(
      listSurfaceCacheKey(normalized),
      JSON.stringify({
        email: normalized,
        saved_at: new Date().toISOString(),
        groups,
      }),
    );
  } catch {
    // Cache is only a fast visual hint; storage failures should never block the app.
  }
}

function peopleIndexCacheKey(email) {
  return `sharedLists:peopleIndex:v1:${normalizeEmail(email)}`;
}

function readPeopleIndexCache(email, { maxAgeMs = peopleIndexCacheMaxAgeMs } = {}) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  try {
    const cached = JSON.parse(window.localStorage.getItem(peopleIndexCacheKey(normalized)) || "null");
    if (!cached || cached.email !== normalized || !Array.isArray(cached.entries) || !cached.saved_at) return null;
    const loadedAt = Date.parse(cached.saved_at);
    if (!Number.isFinite(loadedAt) || Date.now() - loadedAt > maxAgeMs) return null;
    return { entries: cached.entries, loadedAt };
  } catch {
    return null;
  }
}

function writePeopleIndexCache(email, entries) {
  const normalized = normalizeEmail(email);
  if (!normalized || !Array.isArray(entries)) return;
  try {
    window.localStorage.setItem(
      peopleIndexCacheKey(normalized),
      JSON.stringify({
        email: normalized,
        saved_at: new Date().toISOString(),
        entries,
      }),
    );
  } catch {
    // The in-memory index still removes per-keystroke network latency when storage is unavailable.
  }
}

function preparePeopleIndexForUser(email) {
  const normalized = normalizeEmail(email);
  if (!normalized || state.peopleIndex.email === normalized) return;
  const cached = readPeopleIndexCache(normalized);
  state.peopleIndex = {
    email: normalized,
    entries: cached?.entries || [],
    loaded: Boolean(cached),
    loadedAt: cached?.loadedAt || 0,
  };
  prefetchPeopleIndex({ force: true }).catch(() => {});
}

function prefetchPeopleIndex({ force = false } = {}) {
  const email = normalizeEmail(state.session?.email);
  if (!state.authConfirmed || !email) return Promise.resolve(state.peopleIndex.entries);
  if (
    !force &&
    state.peopleIndex.email === email &&
    state.peopleIndex.loaded &&
    Date.now() - state.peopleIndex.loadedAt < peopleIndexFreshMaxAgeMs
  ) {
    return Promise.resolve(state.peopleIndex.entries);
  }
  if (peopleIndexRequest?.email === email) return peopleIndexRequest.promise;
  const promise = apiFetch("/api/people/index")
    .then((data) => {
      if (normalizeEmail(state.session?.email) !== email) return [];
      const entries = Array.isArray(data.people) ? data.people : [];
      state.peopleIndex = {
        email,
        entries,
        loaded: true,
        loadedAt: Date.now(),
      };
      writePeopleIndexCache(email, entries);
      if (state.people.query.length >= 2 && document.activeElement === els.inviteInput) {
        applyPeopleIndexSuggestions(state.people.query);
      }
      return entries;
    })
    .finally(() => {
      if (peopleIndexRequest?.promise === promise) peopleIndexRequest = null;
    });
  peopleIndexRequest = { email, promise };
  return promise;
}

function isListGroups(groups) {
  return Boolean(groups && Array.isArray(groups.owned) && Array.isArray(groups.shared));
}

async function loadActiveList({ renderImmediate = true } = {}) {
  const listId = state.activeListId;
  if (!listId) return;
  const loadToken = ++activeListLoadToken;
  abortStaleListDetailRequests(listId);
  const cached = getCachedListDetail(listId);
  state.selectedCompleted.clear();
  state.editingTaskId = null;
  state.editingTaskOriginalTitle = "";
  state.mobileExpandedTaskId = null;

  if (cached) {
    state.active = cached;
    state.loading = false;
    render();
    if (state.completedOpen) loadCompletedTasks();
    prefetchVisibleLists();
    refreshActiveListDetail(listId, loadToken, { quiet: true });
    loadListDetails(listId, loadToken, { quiet: true });
    return;
  }

  const summary = findListSummary(listId);
  if (summary && renderImmediate) {
    state.active = placeholderListDetail(summary);
    state.loading = false;
    render();
  } else {
    state.loading = true;
  }

  try {
    const active = await fetchListDetail(listId);
    if (loadToken !== activeListLoadToken || state.activeListId !== listId) return;
    state.active = active;
    state.loading = false;
    render();
    loadListDetails(listId, loadToken, { quiet: true });
  } catch (error) {
    if (isAbortError(error)) return;
    if (loadToken !== activeListLoadToken || state.activeListId !== listId) return;
    showToast(error.message);
    state.active = null;
  } finally {
    if (loadToken !== activeListLoadToken || state.activeListId !== listId) return;
    state.loading = false;
    render();
    if (state.completedOpen) loadCompletedTasks();
    prefetchVisibleLists();
  }
}

function openFeedback() {
  if (!feedbackTarget.email) {
    showToast("Feedback is not configured");
    return;
  }
  const message = buildFeedbackMessage();
  window.location.href = feedbackMailtoUrl(message);
  showToast("Opening email for feedback");
}

function feedbackMailtoUrl(message) {
  return `mailto:${feedbackTarget.email}?subject=${encodeURIComponent(feedbackSubject)}&body=${encodeURIComponent(message)}`;
}

function handleShareButton() {
  if (isMobileLayout()) {
    openDetailsSheet();
    return;
  }
  if (state.detailsPopoverOpen) {
    closeDetailsPopover();
    return;
  }
  openDetailsPopover();
}

function toggleDesktopSidebar() {
  if (isMobileLayout()) return;
  state.sidebarCollapsed = !state.sidebarCollapsed;
  writeSidebarCollapsedPreference(state.sidebarCollapsed);
  if (state.sidebarCollapsed) closeMarkerPicker();
  renderShellState();
  positionDetailsPopover();
}

function showMobileListPicker() {
  if (state.accessRequest?.listId) {
    returnToListPickerFromAccessDenied();
    return;
  }
  state.mobileView = "lists";
  state.detailsSheetOpen = false;
  state.mobileExpandedTaskId = null;
  render();
}

function returnToListPickerFromAccessDenied() {
  state.accessRequest = null;
  state.pendingListLinkId = null;
  state.activeListId = null;
  state.active = null;
  state.detailsSheetOpen = false;
  state.detailsPopoverOpen = false;
  state.mobileExpandedTaskId = null;
  if (isMobileLayout()) state.mobileView = "lists";
  clearListLinkFromUrl();
  render();
}

function openDetailsSheet() {
  if (!state.active || state.active.loading) return;
  state.detailsSheetOpen = true;
  state.detailsPopoverOpen = false;
  renderShellState();
  els.shareButton.setAttribute("aria-expanded", "true");
  window.requestAnimationFrame(() => els.detailsSheetClose.focus());
}

function closeDetailsSheet() {
  state.detailsSheetOpen = false;
  renderShellState();
  els.shareButton.setAttribute("aria-expanded", "false");
}

function openDetailsPopover() {
  if (!state.active || state.active.loading) return;
  state.detailsSheetOpen = false;
  state.detailsPopoverOpen = true;
  render();
  els.shareButton.setAttribute("aria-expanded", "true");
  if (!state.active.details_loaded) loadListDetails(state.active.list.id, activeListLoadToken, { quiet: true });
  window.requestAnimationFrame(() => {
    positionDetailsPopover();
    if (canShareList()) els.inviteInput.focus();
  });
}

function closeDetailsPopover({ renderNow = true, restoreFocus = true } = {}) {
  state.detailsPopoverOpen = false;
  if (renderNow) {
    renderShellState();
    els.shareButton.setAttribute("aria-expanded", "false");
    positionDetailsPopover();
    if (restoreFocus) els.shareButton.focus();
  }
}

function openNewListDialog() {
  state.newListDialogOpen = true;
  els.newListDialog.hidden = false;
  els.newListTitleInput.value = "";
  window.requestAnimationFrame(() => els.newListTitleInput.focus());
}

function closeNewListDialog({ restoreFocus = true } = {}) {
  state.newListDialogOpen = false;
  els.newListDialog.hidden = true;
  els.newListTitleInput.value = "";
  if (restoreFocus) els.newListButton.focus();
}

function openSettingsDialog() {
  state.settingsDialogOpen = true;
  renderShellState();
  window.requestAnimationFrame(() => els.settingsCloseButton.focus());
}

function closeSettingsDialog({ restoreFocus = true } = {}) {
  state.settingsDialogOpen = false;
  renderShellState();
  if (restoreFocus) els.settingsButton.focus();
}

function maybeShowOverviewDemo() {
  if (!shouldAutoShowOverviewDemo()) return false;
  window.setTimeout(() => {
    if (shouldAutoShowOverviewDemo()) openOverviewDemo();
  }, 650);
  return true;
}

function shouldAutoShowOverviewDemo() {
  return Boolean(
    state.authConfirmed
      && !state.authRequired
      && !state.loading
      && !state.newListDialogOpen
      && !state.settingsDialogOpen
      && !state.homeScreenGuideOpen
      && !readOverviewDemoDismissed(),
  );
}

function openOverviewDemo({ automatic = true } = {}) {
  if (automatic && !shouldAutoShowOverviewDemo()) return;
  state.overviewDemoOpen = true;
  state.overviewStepIndex = 0;
  state.settingsDialogOpen = false;
  state.homeScreenGuideOpen = false;
  state.detailsSheetOpen = false;
  state.detailsPopoverOpen = false;
  renderShellState();
  renderOverviewDemo();
  startOverviewDemoTimer();
  window.requestAnimationFrame(() => els.overviewDemoNext.focus());
}

function closeOverviewDemo({ restoreFocus = true } = {}) {
  state.overviewDemoOpen = false;
  writeOverviewDemoDismissed();
  stopOverviewDemoTimer();
  renderShellState();
  if (!restoreFocus) return;
  if (isElementVisible(els.settingsButton)) els.settingsButton.focus();
  else if (isElementVisible(els.mobileListButton)) els.mobileListButton.focus();
}

function nextOverviewStep() {
  setOverviewStep(state.overviewStepIndex + 1);
}

function previousOverviewStep() {
  setOverviewStep(Math.max(0, state.overviewStepIndex - 1));
}

function setOverviewStep(index) {
  const stepCount = overviewSteps.length;
  state.overviewStepIndex = ((index % stepCount) + stepCount) % stepCount;
  renderOverviewDemo();
  startOverviewDemoTimer();
}

function renderOverviewDemo() {
  if (!els.overviewDemo) return;
  const step = overviewSteps[state.overviewStepIndex] || overviewSteps[0];
  els.overviewDemo.dataset.overviewStep = step.key;
  els.overviewStepLabel.textContent = `Step ${state.overviewStepIndex + 1} of ${overviewSteps.length}`;
  els.overviewStepTitle.textContent = step.title;
  els.overviewStepCopy.textContent = step.copy;
  els.overviewDemoBack.disabled = state.overviewStepIndex === 0;
  els.overviewDemoNext.textContent = state.overviewStepIndex === overviewSteps.length - 1 ? "Start over" : "Next";
  els.overviewDots.innerHTML = overviewSteps.map((item, index) => (
    `<button class="overview-dot${index === state.overviewStepIndex ? " active" : ""}" type="button" aria-label="Show ${escapeAttr(item.title)}" data-overview-step="${index}"></button>`
  )).join("");
  els.overviewDots.querySelectorAll("[data-overview-step]").forEach((button) => {
    button.addEventListener("click", () => setOverviewStep(Number(button.dataset.overviewStep)));
  });
}

function startOverviewDemoTimer() {
  stopOverviewDemoTimer();
  if (!state.overviewDemoOpen) return;
  overviewDemoTimer = window.setTimeout(nextOverviewStep, overviewDemoAdvanceMs);
}

function stopOverviewDemoTimer() {
  window.clearTimeout(overviewDemoTimer);
  overviewDemoTimer = 0;
}

function readOverviewDemoDismissed() {
  try {
    return window.localStorage.getItem(overviewDemoDismissedKey) === "true";
  } catch {
    return false;
  }
}

function writeOverviewDemoDismissed() {
  try {
    window.localStorage.setItem(overviewDemoDismissedKey, "true");
  } catch {
    // This only controls whether the tour auto-opens; storage failures should not block the app.
  }
}

function maybeShowHomeScreenGuide() {
  if (!shouldAutoShowHomeScreenGuide()) return;
  window.setTimeout(() => {
    if (shouldAutoShowHomeScreenGuide()) openHomeScreenGuide();
  }, 650);
}

function shouldAutoShowHomeScreenGuide() {
  return shouldOfferHomeScreenGuide() && !readHomeScreenGuideDismissed();
}

function shouldOfferHomeScreenGuide() {
  return isMobileLayout() && isLikelyIosDevice() && !isStandaloneDisplay();
}

function isLikelyIosDevice() {
  const userAgent = window.navigator.userAgent || "";
  const platform = window.navigator.platform || "";
  return /iPad|iPhone|iPod/.test(userAgent) || (platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
}

function openHomeScreenGuide({ automatic = true, mode = installGuideModeForDevice() } = {}) {
  if (automatic && !shouldOfferHomeScreenGuide()) return;
  state.installGuideMode = mode;
  state.homeScreenGuideOpen = true;
  state.overviewDemoOpen = false;
  stopOverviewDemoTimer();
  state.detailsSheetOpen = false;
  state.detailsPopoverOpen = false;
  renderShellState();
  window.requestAnimationFrame(() => els.homeScreenGuideDone.focus());
}

function closeHomeScreenGuide({ restoreFocus = true } = {}) {
  state.homeScreenGuideOpen = false;
  writeHomeScreenGuideDismissed();
  renderShellState();
  if (!restoreFocus) return;
  if (isElementVisible(els.settingsButton)) els.settingsButton.focus();
  else if (isElementVisible(els.mobileListButton)) els.mobileListButton.focus();
}

function bindSystemThemePreference() {
  const listener = () => {
    if (state.themePreference === "system") applyThemePreference("system");
  };
  if (typeof systemThemeQuery.addEventListener === "function") {
    systemThemeQuery.addEventListener("change", listener);
  } else if (typeof systemThemeQuery.addListener === "function") {
    systemThemeQuery.addListener(listener);
  }
}

function installGuideModeForDevice() {
  return isLikelyIosDevice() || isMobileLayout() ? "mobile" : "desktop";
}

function installGuideDescription() {
  return installGuideModeForDevice() === "desktop"
    ? "Show the desktop install guide"
    : "Show the phone install guide";
}

function setThemePreference(preference) {
  const next = normalizeThemePreference(preference);
  state.themePreference = next;
  writeThemePreference(next);
  applyThemePreference(next);
  renderThemePreference();
}

function applyThemePreference(preference) {
  const normalized = normalizeThemePreference(preference);
  const resolved = resolveTheme(normalized);
  document.documentElement.dataset.themePreference = normalized;
  document.documentElement.dataset.theme = resolved;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.setAttribute("content", resolved === "dark" ? "#111827" : "#ffffff");
}

function resolveTheme(preference) {
  if (preference !== "system") return preference;
  return systemThemeQuery.matches ? "dark" : "light";
}

function normalizeThemePreference(preference) {
  return ["system", "light", "dark"].includes(preference) ? preference : "system";
}

async function createList(event) {
  event.preventDefault();
  const title = normalizeClientTitle(els.newListTitleInput.value);
  if (!title) return;
  if (title.length > 120) {
    showToast("List title must be 120 characters or less");
    return;
  }
  closeNewListDialog({ restoreFocus: false });
  const tempListId = newClientId("list");
  const previousActiveListId = state.activeListId;
  const previousActive = state.active;
  const previousCompletedOpen = state.completedOpen;
  const optimistic = optimisticList(tempListId, title);
  setCachedListDetail(tempListId, optimistic);

  state.groups = {
    ...state.groups,
    owned: sortListSummaries([...state.groups.owned, optimistic.list]),
  };
  state.activeListId = tempListId;
  state.active = optimistic;
  state.completedOpen = false;
  state.mobileExpandedTaskId = null;
  if (isMobileLayout()) state.mobileView = "tasks";
  state.loading = false;
  render();

  const createPromise = apiFetch("/api/lists", {
    method: "POST",
    body: { title },
  });
  pendingListCreates.set(tempListId, createPromise);

  try {
    const created = await createPromise;
    resolvedListIds.set(tempListId, created.list.id);
    replaceOptimisticList(tempListId, created);
  } catch (error) {
    removeListSummary(tempListId);
    listDetailCache.delete(tempListId);
    if (state.activeListId === tempListId || state.active?.list.id === tempListId) {
      state.activeListId = previousActiveListId;
      state.active = previousActive;
      state.completedOpen = previousCompletedOpen;
    }
    showToast(error.message);
    render();
  } finally {
    pendingListCreates.delete(tempListId);
  }
}

async function deleteActiveList() {
  if (!state.active || !isOwner()) return;
  const listId = state.active.list.id;
  const ok = window.confirm(`Delete "${state.active.list.title}"?`);
  if (!ok) return;
  const snapshot = snapshotUiState();
  const nextList = allListSummaries().find((list) => list.id !== listId);
  removeListSummary(listId);
  listDetailCache.delete(listId);
  listDetailRequests.delete(listId);
  state.activeListId = nextList?.id || null;
  state.active = nextList ? getCachedListDetail(nextList.id) || placeholderListDetail(nextList) : null;
  state.completedOpen = false;
  state.mobileExpandedTaskId = null;
  state.loading = false;
  if (state.activeListId) writeActiveListToUrl(state.activeListId);
  else clearListLinkFromUrl();
  render();
  if (nextList) loadActiveList();
  try {
    const serverListId = await resolveServerListId(listId);
    await apiFetch(`/api/lists/${encodeURIComponent(serverListId)}`, { method: "DELETE" });
    if (serverListId !== listId) listDetailCache.delete(serverListId);
    showToast("List deleted");
    refreshLists();
  } catch (error) {
    restoreUiState(snapshot);
    showToast(error.message);
  }
}

function deleteListFromPicker(listId) {
  const list = findListSummary(listId);
  if (!list || list.current_user_role !== "owner" || pendingListDeletes.has(listId)) return;
  const snapshot = snapshotUiState();
  const nextList = allListSummaries().find((item) => item.id !== listId) || null;
  const wasActive = state.activeListId === listId || state.active?.list.id === listId;
  removeListSummary(listId);
  listDetailCache.delete(listId);
  listDetailRequests.delete(listId);
  listSecondaryDetailRequests.delete(listId);
  if (wasActive) {
    state.activeListId = nextList?.id || null;
    state.active = null;
    state.completedOpen = false;
    state.mobileExpandedTaskId = null;
    clearListLinkFromUrl();
  }
  if (state.session?.email) writeListSurfaceCache(state.session.email, state.groups);
  render();

  const timer = window.setTimeout(() => finalizePendingListDelete(listId), listDeleteUndoWindowMs);
  pendingListDeletes.set(listId, { timer, snapshot });
  showToast("List deleted", {
    actionLabel: "Undo",
    action: () => undoPendingListDelete(listId),
  });
}

function undoPendingListDelete(listId) {
  const pending = pendingListDeletes.get(listId);
  if (!pending) return;
  window.clearTimeout(pending.timer);
  pendingListDeletes.delete(listId);
  restoreUiState(pending.snapshot);
  if (state.session?.email) writeListSurfaceCache(state.session.email, state.groups);
  showToast("List restored");
}

async function finalizePendingListDelete(listId) {
  const pending = pendingListDeletes.get(listId);
  if (!pending) return;
  pendingListDeletes.delete(listId);
  try {
    const serverListId = await resolveServerListId(listId);
    await apiFetch(`/api/lists/${encodeURIComponent(serverListId)}`, { method: "DELETE" });
    listDetailCache.delete(serverListId);
    if (serverListId !== listId) listDetailCache.delete(listId);
    refreshLists({ requestedListId: null }).catch(() => {});
  } catch (error) {
    restoreUiState(pending.snapshot);
    if (state.session?.email) writeListSurfaceCache(state.session.email, state.groups);
    showToast(error.message);
  }
}

async function addTask(event) {
  event.preventDefault();
  if (!state.active) return;
  const listId = state.active.list.id;
  const title = normalizeClientTitle(els.taskInput.value);
  if (!title) return;
  if (title.length > maxTaskTitleLength) {
    showToast(`Task title must be ${maxTaskTitleLength} characters or less`);
    return;
  }
  const dueDate = els.draftDueDate.value || null;
  const tempTaskId = newClientId("task");
  const optimisticTask = optimisticOpenTask(tempTaskId, listId, title, dueDate);
  const snapshot = snapshotUiState();
  const mutation = createTaskMutation(tempTaskId, listId, { title, due_date: dueDate }, snapshot);

  els.taskInput.value = "";
  els.draftDueDate.value = "";
  state.active.open_tasks = sortOpenTasksClient([...state.active.open_tasks, optimisticTask]);
  state.active.activity = [optimisticActivity("created_task", { title }), ...state.active.activity].slice(0, 20);
  adjustOpenTaskCount(listId, 1);
  render();
  window.requestAnimationFrame(() => els.taskInput.focus());

  mutation.createPromise = (async () => {
    const serverListId = await resolveServerListId(listId);
    const created = await apiFetchWithRetry(`/api/lists/${encodeURIComponent(serverListId)}/tasks`, {
      method: "POST",
      headers: { "idempotency-key": mutation.createKey },
      body: {
        title,
        due_date: dueDate,
      },
    });
    adoptServerTask(tempTaskId, created.task, { preserveOptimistic: true });
    return created.task;
  })();
  mutation.createPromise
    .then(() => scheduleTaskMutationFlush(mutation))
    .catch((error) => {
      removeOptimisticTask(tempTaskId);
      taskMutations.delete(tempTaskId);
      adjustOpenTaskCount(listId, -1);
      if (!els.taskInput.value) {
        els.taskInput.value = title;
        els.draftDueDate.value = dueDate || "";
      }
      showToast(error.message);
      render();
      window.requestAnimationFrame(() => els.taskInput.focus());
    });
}

async function completeTask(taskId) {
  const listId = state.active?.list.id;
  const task = state.active?.open_tasks.find((item) => item.id === taskId);
  if (!listId || !task) return;
  const snapshot = snapshotUiState();
  const now = new Date().toISOString();
  const completedTask = {
    ...task,
    status: "completed",
    completed_at: now,
    completed_by_email: state.session?.email || currentDevUser(),
    updated_at: now,
  };
  state.active.open_tasks = state.active.open_tasks.filter((item) => item.id !== taskId);
  if (state.mobileExpandedTaskId === taskId) state.mobileExpandedTaskId = null;
  if (state.active.completed_tasks_loaded) {
    state.active.completed_tasks = sortCompletedTasksClient([completedTask, ...state.active.completed_tasks]);
  } else {
    state.active.completed_tasks = [completedTask];
    state.active.completed_tasks_loaded = true;
    state.active.completed_tasks_loading = false;
  }
  state.active.activity = [optimisticActivity("completed_task", { title: task.title }), ...state.active.activity].slice(0, 20);
  state.completedOpen = true;
  adjustOpenTaskCount(listId, -1);
  adjustCompletedTaskCount(listId, 1);
  cacheActiveDetail();
  render();
  enqueueTaskPatch(taskId, { status: "completed" }, snapshot);
}

async function updateTaskDate(taskId, dueDate) {
  const listId = state.active?.list.id;
  if (!listId) return;
  const snapshot = snapshotUiState();
  const changed = updateTaskInActive(taskId, (task) => ({ ...task, due_date: dueDate || null, updated_at: new Date().toISOString() }));
  if (!changed) return;
  cacheActiveDetail();
  render();
  enqueueTaskPatch(taskId, { due_date: dueDate || null }, snapshot);
}

async function renameTask(taskId, title) {
  const listId = state.active?.list.id;
  const snapshot = snapshotUiState();
  state.editingTaskId = null;
  state.editingTaskOriginalTitle = "";
  const changed = updateTaskInActive(taskId, (task) => ({ ...task, title, updated_at: new Date().toISOString() }));
  if (changed) {
    cacheActiveDetail();
    render();
  }
  enqueueTaskPatch(taskId, { title }, snapshot);
  if (listId) scheduleQuietReconcile(listId);
}

async function renameActiveList(title) {
  const listId = state.active?.list.id;
  if (!listId || !isOwner()) return;
  const snapshot = snapshotUiState();
  state.editingListTitle = false;
  state.editingListOriginalTitle = "";
  state.active.list = {
    ...state.active.list,
    title,
    updated_at: new Date().toISOString(),
  };
  updateListSummary(listId, (list) => ({ ...list, title, updated_at: state.active.list.updated_at }));
  state.active.activity = [optimisticActivity("updated_list", { title }), ...state.active.activity].slice(0, 20);
  cacheActiveDetail();
  render();
  try {
    state.active = await apiFetch(`/api/lists/${encodeURIComponent(listId)}`, {
      method: "PATCH",
      body: { title },
    });
    updateListSummary(listId, (list) => ({ ...list, ...state.active.list }));
    setCachedListDetail(state.active.list.id, state.active);
    showToast("List title updated");
    syncListAndSummaries(listId, { quiet: true });
  } catch (error) {
    restoreUiState(snapshot);
    showToast(error.message);
  }
}

async function reopenTask(taskId) {
  const listId = state.active?.list.id;
  const task = state.active?.completed_tasks.find((item) => item.id === taskId);
  if (!listId || !task) return;
  const snapshot = snapshotUiState();
  const now = new Date().toISOString();
  state.active.completed_tasks = state.active.completed_tasks.filter((item) => item.id !== taskId);
  state.active.open_tasks = sortOpenTasksClient([
    ...state.active.open_tasks,
    {
      ...task,
      status: "open",
      completed_at: null,
      completed_by_email: null,
      updated_at: now,
      sort_order: nextClientOpenTaskSortOrder(),
    },
  ]);
  state.active.activity = [optimisticActivity("updated_task", { title: task.title }), ...state.active.activity].slice(0, 20);
  state.selectedCompleted.delete(taskId);
  adjustOpenTaskCount(listId, 1);
  adjustCompletedTaskCount(listId, -1);
  cacheActiveDetail();
  render();
  enqueueTaskPatch(taskId, { status: "open" }, snapshot);
}

async function deleteTask(taskId) {
  const listId = state.active?.list.id;
  if (!listId) return;
  const task = state.active?.completed_tasks.find((item) => item.id === taskId);
  if (!task) return;
  const existingMutation = taskMutations.get(taskId) || taskMutations.get(resolvedTaskIds.get(taskId));
  if (existingMutation || task.pending) {
    const snapshot = snapshotUiState();
    const mutation = taskMutationFor(taskId, listId, snapshot);
    mutation.deleteRequested = true;
    mutation.deletedTask = task;
    state.active.completed_tasks = state.active.completed_tasks.filter((item) => item.id !== taskId);
    state.selectedCompleted.delete(taskId);
    state.active.activity = [optimisticActivity("deleted_completed_tasks", { count: 1 }), ...state.active.activity].slice(0, 20);
    adjustCompletedTaskCount(listId, -1);
    cacheActiveDetail();
    render();
    showToast("Completed task deleted", {
      actionLabel: "Undo",
      action: () => undoCompletedTaskDelete(listId, task, mutation),
    });
    flushTaskMutation(mutation);
    return;
  }
  await deleteCompletedTaskSet(
    [task],
    () =>
      apiFetchWithRetry(`/api/tasks/${encodeURIComponent(taskId)}`, {
        method: "DELETE",
        headers: {
          "idempotency-key": newClientId("delete_key"),
          ...(Number.isInteger(Number(task.revision)) ? { "if-match-revision": String(task.revision) } : {}),
        },
      }),
    "Completed task deleted",
  );
}

async function undoCompletedTaskDelete(listId, task, mutation) {
  if (mutation && !mutation.deleteSent) {
    mutation.deleteRequested = false;
    mutation.deleteUndone = true;
    restoreCompletedTaskLocally(listId, serverTaskForRestore(task, mutation));
    if (Object.keys(mutation.pendingPatch).length) scheduleTaskMutationFlush(mutation, 0);
    showToast("Completed task restored");
    return;
  }
  if (mutation?.deletePromise) {
    mutation.deleteUndone = true;
    restoreCompletedTaskLocally(listId, serverTaskForRestore(task, mutation));
    showToast("Completed task restored");
    return;
  }
  await restoreDeletedTasks(listId, [serverTaskForRestore(task, mutation)]);
}

async function deleteOpenTask(taskId) {
  const listId = state.active?.list.id;
  if (!listId) return;
  const task = state.active?.open_tasks.find((item) => item.id === taskId);
  if (!task) return;
  const snapshot = snapshotUiState();
  const mutation = taskMutationFor(taskId, listId, snapshot);
  mutation.deleteRequested = true;
  mutation.deletedTask = task;
  state.active.open_tasks = state.active.open_tasks.filter((item) => item.id !== taskId);
  if (state.mobileExpandedTaskId === taskId) state.mobileExpandedTaskId = null;
  state.active.activity = [optimisticActivity("deleted_task", { title: task.title }), ...state.active.activity].slice(0, 20);
  adjustOpenTaskCount(listId, -1);
  cacheActiveDetail();
  render();
  showUndoOpenDeleteToast(listId, task, mutation);
  flushTaskMutation(mutation);
}

async function deleteSelectedCompleted() {
  const ids = Array.from(state.selectedCompleted);
  if (!ids.length) return;
  const ok = window.confirm(`Delete ${ids.length} completed ${plural(ids.length, "task", "tasks")}?`);
  if (!ok) return;
  const tasks = state.active.completed_tasks.filter((task) => ids.includes(task.id));
  await deleteCompletedTaskSet(
    tasks,
    (listId) =>
      apiFetchWithRetry(`/api/lists/${encodeURIComponent(listId)}/tasks/delete-completed`, {
        method: "POST",
        headers: { "idempotency-key": newClientId("delete_key") },
        body: { task_ids: ids },
      }),
    "Completed tasks deleted",
  );
}

async function clearCompleted() {
  if (!state.active?.completed_tasks.length) return;
  const ok = window.confirm(`Delete all ${state.active.completed_tasks.length} completed ${plural(state.active.completed_tasks.length, "task", "tasks")}?`);
  if (!ok) return;
  const tasks = [...state.active.completed_tasks];
  await deleteCompletedTaskSet(
    tasks,
    (listId) =>
      apiFetchWithRetry(`/api/lists/${encodeURIComponent(listId)}/tasks/delete-completed`, {
        method: "POST",
        headers: { "idempotency-key": newClientId("delete_key") },
        body: {},
      }),
    "Completed tasks cleared",
  );
}

async function deleteCompletedTaskSet(tasks, requestFn, successMessage) {
  const listId = state.active?.list.id;
  if (!listId || !tasks.length) return;
  const snapshot = snapshotUiState();
  const ids = tasks.map((task) => task.id);
  state.active.completed_tasks = state.active.completed_tasks.filter((task) => !ids.includes(task.id));
  ids.forEach((id) => state.selectedCompleted.delete(id));
  state.active.activity = [optimisticActivity("deleted_completed_tasks", { count: tasks.length }), ...state.active.activity].slice(0, 20);
  adjustCompletedTaskCount(listId, -tasks.length);
  cacheActiveDetail();
  render();
  try {
    await requestFn(listId);
    showUndoDeleteToast(successMessage, listId, tasks);
    scheduleQuietReconcile(listId);
  } catch (error) {
    restoreUiState(snapshot);
    showToast(error.message);
  }
}

function showUndoDeleteToast(message, listId, tasks) {
  showToast(message, {
    actionLabel: "Undo",
    action: () => restoreDeletedTasks(listId, tasks),
  });
}

function showUndoOpenDeleteToast(listId, task, mutation) {
  showToast("Task deleted", {
    actionLabel: "Undo",
    action: () => undoOpenTaskDelete(listId, task, mutation),
  });
}

async function undoOpenTaskDelete(listId, task, mutation) {
  if (mutation && !mutation.deleteSent) {
    mutation.deleteRequested = false;
    mutation.deleteUndone = true;
    restoreOpenTaskLocally(listId, serverTaskForRestore(task, mutation));
    if (Object.keys(mutation.pendingPatch).length) scheduleTaskMutationFlush(mutation, 0);
    showToast("Task restored");
    return;
  }
  if (mutation?.deletePromise) {
    mutation.deleteUndone = true;
    restoreOpenTaskLocally(listId, serverTaskForRestore(task, mutation));
    showToast("Task restored");
    return;
  }
  await restoreDeletedTasks(listId, [serverTaskForRestore(task, mutation)]);
}

function serverTaskForRestore(task, mutation) {
  const serverId = resolvedTaskIds.get(task.id) || mutation?.taskId || task.id;
  return { ...task, id: serverId };
}

async function restoreDeletedTasks(listId, tasks, { quiet = false } = {}) {
  try {
    const result = await apiFetch(`/api/lists/${encodeURIComponent(listId)}/tasks/restore-deleted`, {
      method: "POST",
      body: { task_ids: tasks.map((task) => task.id) },
    });
    const restoredTasks = result.restored_tasks || [];
    if (!restoredTasks.length) {
      if (!quiet) showToast("Nothing to restore");
      return;
    }
    if (state.active?.list.id === listId) {
      const openTasks = restoredTasks.filter((task) => task.status === "open");
      const completedTasks = restoredTasks.filter((task) => task.status === "completed");
      const existingOpenIds = new Set(state.active.open_tasks.map((task) => task.id));
      const existingCompletedIds = new Set(state.active.completed_tasks.map((task) => task.id));
      const newOpenTasks = openTasks.filter((task) => !existingOpenIds.has(task.id));
      const newCompletedTasks = completedTasks.filter((task) => !existingCompletedIds.has(task.id));
      if (newOpenTasks.length) {
        state.active.open_tasks = sortOpenTasksClient([...state.active.open_tasks, ...newOpenTasks]);
        adjustOpenTaskCount(listId, newOpenTasks.length);
      }
      if (newCompletedTasks.length) {
        state.active.completed_tasks = sortCompletedTasksClient([...state.active.completed_tasks, ...newCompletedTasks]);
        state.active.completed_tasks_loaded = true;
        adjustCompletedTaskCount(listId, newCompletedTasks.length);
      }
      state.active.activity = [optimisticActivity("restored_completed_tasks", { count: restoredTasks.length }), ...state.active.activity].slice(0, 20);
      cacheActiveDetail();
      render();
    }
    if (!quiet) showToast("Tasks restored");
    scheduleQuietReconcile(listId);
  } catch (error) {
    if (!quiet) showToast(error.message);
    else throw error;
  }
}

function restoreOpenTaskLocally(listId, task) {
  if (state.active?.list.id === listId && !state.active.open_tasks.some((item) => item.id === task.id)) {
    state.active.open_tasks = sortOpenTasksClient([...state.active.open_tasks, { ...task, deleted_at: null }]);
    state.active.activity = [optimisticActivity("restored_completed_tasks", { count: 1 }), ...state.active.activity].slice(0, 20);
    adjustOpenTaskCount(listId, 1);
    cacheActiveDetail();
    render();
  }
}

function restoreCompletedTaskLocally(listId, task) {
  if (state.active?.list.id === listId && !state.active.completed_tasks.some((item) => item.id === task.id)) {
    state.active.completed_tasks = sortCompletedTasksClient([...state.active.completed_tasks, { ...task, deleted_at: null }]);
    state.active.completed_tasks_loaded = true;
    state.active.activity = [optimisticActivity("restored_completed_tasks", { count: 1 }), ...state.active.activity].slice(0, 20);
    adjustCompletedTaskCount(listId, 1);
    cacheActiveDetail();
    render();
  }
}

function handleInviteInput() {
  if (!state.invite.pending && state.invite.message) clearInviteStatus();
  state.people.selected = null;
  const query = els.inviteInput.value.trim();
  state.people.query = query;
  if (query.length < 2) {
    resetPeopleSuggestions();
    return;
  }
  peopleSearchToken += 1;
  peopleSearchStartedAt = window.performance.now();
  if (state.peopleIndex.loaded) {
    applyPeopleIndexSuggestions(query);
    return;
  }
  state.people.loading = true;
  state.people.open = true;
  state.people.highlightedIndex = -1;
  renderPeopleSuggestions();
  const token = peopleSearchToken;
  prefetchPeopleIndex()
    .then(() => {
      if (token !== peopleSearchToken || query !== state.people.query) return;
      if (state.peopleIndex.loaded) applyPeopleIndexSuggestions(query);
      else fetchPeopleSuggestions(query, token);
    })
    .catch(() => fetchPeopleSuggestions(query, token));
}

function handleInviteKeydown(event) {
  if (!state.people.open) return;
  const suggestions = state.people.suggestions;
  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (!suggestions.length) return;
    state.people.highlightedIndex = (state.people.highlightedIndex + 1) % suggestions.length;
    renderPeopleSuggestions();
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (!suggestions.length) return;
    state.people.highlightedIndex =
      state.people.highlightedIndex <= 0 ? suggestions.length - 1 : state.people.highlightedIndex - 1;
    renderPeopleSuggestions();
  }
  if (event.key === "Enter" && state.people.highlightedIndex >= 0 && suggestions[state.people.highlightedIndex]) {
    event.preventDefault();
    selectPeopleSuggestion(suggestions[state.people.highlightedIndex]);
  }
  if (event.key === "Escape") {
    event.preventDefault();
    closePeopleSuggestions();
  }
}

async function fetchPeopleSuggestions(query, token = ++peopleSearchToken) {
  try {
    const data = await apiFetch(`/api/people?q=${encodeURIComponent(query)}`);
    if (token !== peopleSearchToken || query !== state.people.query) return;
    state.people.suggestions = filterInviteSuggestions(data.people || []);
  } catch (error) {
    if (token !== peopleSearchToken) return;
    state.people.suggestions = [];
  } finally {
    if (token !== peopleSearchToken || query !== state.people.query) return;
    state.people.loading = false;
    state.people.open = document.activeElement === els.inviteInput;
    state.people.highlightedIndex = state.people.suggestions.length ? 0 : -1;
    renderPeopleSuggestions();
    markPeopleSuggestionLatency("network");
  }
}

function applyPeopleIndexSuggestions(query) {
  if (query !== state.people.query) return;
  state.people.suggestions = searchPeopleIndex(query);
  state.people.loading = false;
  state.people.open = document.activeElement === els.inviteInput;
  state.people.highlightedIndex = state.people.suggestions.length ? 0 : -1;
  renderPeopleSuggestions();
  markPeopleSuggestionLatency("local-index");
}

function markPeopleSuggestionLatency(source) {
  els.peopleSuggestions.dataset.searchSource = source;
  els.peopleSuggestions.dataset.latencyMs = String(Math.max(0, Math.round(window.performance.now() - peopleSearchStartedAt)));
}

function searchPeopleIndex(query) {
  const normalized = normalizePeopleSearchTerm(query);
  if (normalized.length < 2) return [];
  const currentMembers = new Set((state.active?.members || []).map((member) => normalizeEmail(member.email)));
  return state.peopleIndex.entries
    .filter((person) => isAllowedEmail(person.email) && !currentMembers.has(normalizeEmail(person.email)))
    .filter((person) => peopleSearchTerms(person).some((term) => term.includes(normalized)))
    .sort((a, b) => {
      const rank = peopleIndexRank(a, normalized) - peopleIndexRank(b, normalized);
      if (rank !== 0) return rank;
      return String(a.display_name || a.email).localeCompare(String(b.display_name || b.email));
    })
    .slice(0, peopleSearchLimit)
    .map(({ email, display_name }) => ({ email, display_name }));
}

function peopleSearchTerms(person) {
  const supplied = Array.isArray(person.search_terms) ? person.search_terms : [];
  return [...new Set([
    normalizeEmail(person.email),
    normalizeEmail(person.email).split("@")[0] || "",
    person.display_name,
    ...supplied,
  ].map(normalizePeopleSearchTerm).filter(Boolean))];
}

function peopleIndexRank(person, query) {
  const email = normalizeEmail(person.email);
  const localPart = email.split("@")[0] || "";
  const terms = peopleSearchTerms(person);
  if (email === query || localPart === query || terms.some((term) => term === query)) return 0;
  if (email.startsWith(query) || localPart.startsWith(query)) return 1;
  if (terms.some((term) => term.startsWith(query))) return 2;
  return 3;
}

function normalizePeopleSearchTerm(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function filterInviteSuggestions(people) {
  const currentMembers = new Set((state.active?.members || []).map((member) => normalizeEmail(member.email)));
  return people.filter((person) => isAllowedEmail(person.email) && !currentMembers.has(normalizeEmail(person.email)));
}

function selectPeopleSuggestion(person) {
  state.people.selected = person;
  els.inviteInput.value = person.email;
  closePeopleSuggestions();
}

function openPeopleSuggestions() {
  state.people.open = true;
  renderPeopleSuggestions();
}

function closePeopleSuggestions() {
  state.people.open = false;
  renderPeopleSuggestions();
}

function resetPeopleSuggestions() {
  peopleSearchToken += 1;
  state.people = {
    query: "",
    suggestions: [],
    loading: false,
    open: false,
    highlightedIndex: -1,
    selected: null,
  };
  renderPeopleSuggestions();
}

function renderPeopleSuggestions() {
  if (!els.peopleSuggestions) return;
  const query = state.people.query;
  const shouldShow = state.people.open && query.length >= 2 && !els.inviteForm.hidden && !els.inviteInput.disabled;
  els.inviteInput.setAttribute("aria-expanded", String(shouldShow));
  if (!shouldShow) {
    els.peopleSuggestions.hidden = true;
    els.peopleSuggestions.innerHTML = "";
    return;
  }

  els.peopleSuggestions.hidden = false;
  if (state.people.loading) {
    els.peopleSuggestions.innerHTML = '<div class="people-empty">Searching...</div>';
    positionPeopleSuggestions();
    return;
  }

  if (!state.people.suggestions.length) {
    els.peopleSuggestions.innerHTML = '<div class="people-empty">No known people yet. Enter a full email address.</div>';
    positionPeopleSuggestions();
    return;
  }

  els.peopleSuggestions.innerHTML = state.people.suggestions
    .map((person, index) => `
      <button
        class="people-option ${index === state.people.highlightedIndex ? "active" : ""}"
        type="button"
        role="option"
        aria-selected="${index === state.people.highlightedIndex ? "true" : "false"}"
        data-people-email="${escapeAttr(person.email)}"
      >
        <strong>${escapeHtml(person.display_name || displayNameFromEmail(person.email))}</strong>
        <span>${escapeHtml(person.email)}</span>
      </button>
    `)
    .join("");

  els.peopleSuggestions.querySelectorAll("[data-people-email]").forEach((button) => {
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => {
      const person = state.people.suggestions.find((item) => normalizeEmail(item.email) === normalizeEmail(button.dataset.peopleEmail));
      if (person) selectPeopleSuggestion(person);
    });
  });
  positionPeopleSuggestions();
}

async function inviteMember(event) {
  event.preventDefault();
  if (!state.active) return;
  const listId = state.active.list.id;
  if (!canShareList()) {
    setInviteStatus("You need share permission to add people to this list.", "error", { listId });
    return;
  }
  if (isInvitePendingFor(listId)) return;
  const email = normalizeInviteValue(els.inviteInput.value);
  if (!email) {
    setInviteStatus("Enter an email address to add someone.", "error", { listId });
    return;
  }
  if (!isAllowedEmail(email)) {
    setInviteStatus("Enter a full email address.", "error", { email, listId });
    showToast("Enter a full email address");
    return;
  }
  const existing = state.active.members.some((member) => normalizeEmail(member.email) === email);
  if (existing) {
    setInviteStatus(`${email} is already on this list.`, "neutral", { email, listId });
    showToast("Already on this list");
    return;
  }

  setInviteStatus(`Adding ${email}...`, "pending", { email, listId, pending: true });
  const snapshot = snapshotUiState();
  const hadPendingRequest = (state.active.access_requests || []).some((request) => normalizeEmail(request.email) === email);
  state.active.members = sortMembersClient([
    ...state.active.members,
    {
      email,
      role: "editor",
      can_share: false,
      display_name: displayNameFromEmail(email),
      created_at: new Date().toISOString(),
      pending: true,
    },
  ]);
  if (hadPendingRequest) {
    state.active.access_requests = (state.active.access_requests || []).filter((request) => normalizeEmail(request.email) !== email);
    state.active.list = {
      ...state.active.list,
      pending_access_request_count: Math.max(0, pendingAccessRequestCount(state.active.list) - 1),
    };
  }
  updateListSummary(listId, (list) => ({
    ...list,
    member_count: Number(list.member_count || 0) + 1,
    pending_access_request_count: hadPendingRequest ? Math.max(0, pendingAccessRequestCount(list) - 1) : pendingAccessRequestCount(list),
  }));
  state.active.list = { ...state.active.list, member_count: Number(state.active.list.member_count || 0) + 1 };
  state.active.activity = [optimisticActivity("added_member", { email }), ...state.active.activity].slice(0, 20);
  els.inviteInput.value = "";
  resetPeopleSuggestions();
  cacheActiveDetail();
  renderSharing();
  try {
    const active = await apiFetch(`/api/lists/${encodeURIComponent(state.active.list.id)}/members`, {
      method: "POST",
      body: { email },
    });
    setInviteStatus(`Added ${email} to ${state.active.list.title}.`, "success", { email, listId });
    commitSharing(active, listId);
    showToast("Person added");
  } catch (error) {
    restoreUiState(snapshot, { repaint: false });
    if (!els.inviteInput.value) els.inviteInput.value = email;
    setInviteStatus(`Could not add ${email}: ${error.message}`, "error", { email, listId });
    showToast(error.message);
    renderSharing();
  }
}

function isInvitePendingFor(listId) {
  return Boolean(state.invite.pending && state.invite.listId === listId);
}

function setInviteStatus(message, tone = "neutral", { email = "", listId = state.active?.list?.id || "", pending = false } = {}) {
  state.invite = {
    email: normalizeEmail(email),
    listId,
    message,
    tone,
    pending,
  };
  paintInviteStatus(listId);
}

function clearInviteStatus() {
  state.invite = {
    listId: state.active?.list?.id || "",
    email: "",
    message: "",
    tone: "neutral",
    pending: false,
  };
  paintInviteStatus(state.invite.listId);
}

function paintInviteStatus(listId = state.active?.list?.id || "") {
  if (!els.inviteStatus) return;
  const show = Boolean(state.invite.message && state.invite.listId === listId);
  els.inviteStatus.hidden = !show;
  els.inviteStatus.textContent = show ? state.invite.message : "";
  els.inviteStatus.className = show ? `invite-status ${state.invite.tone}` : "invite-status";
}

async function copyActiveListLink() {
  const listId = state.active?.list?.id;
  if (!listId) return;
  const copied = await copyText(activeListLink(listId));
  showToast(copied ? "List link copied" : "Could not copy list link");
}

async function copyCurrentSharedListsLink() {
  const copied = await copyText(currentSharedListsLink());
  showToast(copied ? "Shared Lists link copied" : "Use the address bar to copy this link");
}

async function requestDeniedListAccess() {
  const request = state.accessRequest;
  if (!request?.listId || request.status === "sending" || request.status === "sent") return;
  state.accessRequest = { ...request, status: "sending" };
  renderMain();
  try {
    await apiFetch(`/api/lists/${encodeURIComponent(request.listId)}/access-requests`, { method: "POST" });
    state.accessRequest = { ...request, status: "sent" };
    showToast("Request sent");
  } catch (error) {
    state.accessRequest = { ...request, status: "error", message: error.message };
    showToast(error.message);
  }
  renderMain();
}

async function updateMemberSharing(email, canShareValue) {
  if (!state.active || !isOwner()) return;
  const normalized = normalizeEmail(email);
  const listId = state.active.list.id;
  const snapshot = snapshotUiState();
  state.active.members = sortMembersClient(
    state.active.members.map((member) =>
      normalizeEmail(member.email) === normalized ? { ...member, can_share: Boolean(canShareValue) } : member,
    ),
  );
  state.active.activity = [
    optimisticActivity("updated_member_sharing", { email: normalized, can_share: Boolean(canShareValue) }),
    ...state.active.activity,
  ].slice(0, 20);
  cacheActiveDetail();
  renderSharing();
  try {
    const active = await apiFetch(
      `/api/lists/${encodeURIComponent(state.active.list.id)}/members/${encodeURIComponent(normalized)}`,
      {
        method: "PATCH",
        body: { can_share: Boolean(canShareValue) },
      },
    );
    commitSharing(active, listId);
    showToast(canShareValue ? "Sharing allowed" : "Sharing removed");
  } catch (error) {
    restoreUiState(snapshot, { repaint: false });
    showToast(error.message);
    renderSharing();
  }
}

async function allowAllToShare() {
  if (!state.active || !isOwner()) return;
  const listId = state.active.list.id;
  const changedCount = state.active.members.filter((member) => member.role !== "owner" && !member.can_share).length;
  if (!changedCount) return;
  const snapshot = snapshotUiState();
  state.active.members = sortMembersClient(
    state.active.members.map((member) => (member.role === "owner" ? member : { ...member, can_share: true })),
  );
  state.active.activity = [optimisticActivity("allowed_all_to_share", { count: changedCount }), ...state.active.activity].slice(0, 20);
  cacheActiveDetail();
  renderSharing();
  try {
    const active = await apiFetch(`/api/lists/${encodeURIComponent(state.active.list.id)}/members/share-all`, {
      method: "POST",
    });
    commitSharing(active, listId);
    showToast("Everyone on this list can share");
  } catch (error) {
    restoreUiState(snapshot, { repaint: false });
    showToast(error.message);
    renderSharing();
  }
}

async function approveAccessRequest(email) {
  if (!state.active || !canShareList()) return;
  const normalized = normalizeEmail(email);
  const listId = state.active.list.id;
  try {
    state.active = await apiFetch(
      `/api/lists/${encodeURIComponent(listId)}/access-requests/${encodeURIComponent(normalized)}/approve`,
      { method: "POST" },
    );
    setCachedListDetail(state.active.list.id, state.active);
    updateListSummary(state.active.list.id, (list) => ({ ...list, ...state.active.list }));
    showToast("Access approved");
    render();
    syncListAndSummaries(listId, { quiet: true });
  } catch (error) {
    showToast(error.message);
  }
}

async function declineAccessRequest(email) {
  if (!state.active || !canShareList()) return;
  const normalized = normalizeEmail(email);
  const listId = state.active.list.id;
  try {
    state.active = await apiFetch(`/api/lists/${encodeURIComponent(listId)}/access-requests/${encodeURIComponent(normalized)}`, {
      method: "DELETE",
    });
    setCachedListDetail(state.active.list.id, state.active);
    updateListSummary(state.active.list.id, (list) => ({ ...list, ...state.active.list }));
    showToast("Request declined");
    render();
    syncListAndSummaries(listId, { quiet: true });
  } catch (error) {
    showToast(error.message);
  }
}

async function updateListMarkerPreference(listId, patch) {
  const targetListId = listId || state.active?.list.id;
  const summary = findListSummary(targetListId) || state.active?.list;
  if (!targetListId || !summary) return;
  const current = listMarkerPreferences(summary);
  const next = listMarkerPreferences({ ...current, ...patch });
  if (next.marker_color === current.marker_color && next.marker_icon === current.marker_icon) return;

  const snapshot = snapshotUiState();
  applyListMarkerPreference(targetListId, next);
  try {
    const serverListId = await resolveServerListId(targetListId);
    const result = await apiFetch(`/api/lists/${encodeURIComponent(serverListId)}/preferences`, {
      method: "PATCH",
      body: next,
    });
    applyListMarkerPreference(serverListId, result.list || next);
  } catch (error) {
    restoreUiState(snapshot);
    showToast(error.message);
  }
}

async function removeMember(email) {
  if (!state.active || !isOwner()) return;
  const ok = window.confirm(`Remove ${email} from this list?`);
  if (!ok) return;
  const listId = state.active.list.id;
  const snapshot = snapshotUiState();
  const normalized = normalizeEmail(email);
  state.active.members = state.active.members.filter((member) => normalizeEmail(member.email) !== normalized);
  updateListSummary(listId, (list) => ({ ...list, member_count: Math.max(1, Number(list.member_count || 1) - 1) }));
  state.active.list = { ...state.active.list, member_count: Math.max(1, Number(state.active.list.member_count || 1) - 1) };
  state.active.activity = [optimisticActivity("removed_member", { email: normalized }), ...state.active.activity].slice(0, 20);
  cacheActiveDetail();
  renderSharing();
  try {
    const active = await apiFetch(
      `/api/lists/${encodeURIComponent(state.active.list.id)}/members/${encodeURIComponent(email)}`,
      { method: "DELETE" },
    );
    commitSharing(active, listId);
    showToast("Member removed");
  } catch (error) {
    restoreUiState(snapshot, { repaint: false });
    showToast(error.message);
    renderSharing();
  }
}

async function reloadActiveAndSummaries() {
  if (!state.activeListId) {
    await refreshLists();
    return;
  }
  const activeListId = state.activeListId;
  const loadToken = ++activeListLoadToken;
  try {
    const [active, groups] = await Promise.all([
      fetchListDetail(activeListId, { force: true }),
      apiFetch("/api/lists"),
    ]);
    if (state.activeListId === activeListId) {
      state.selectedCompleted.clear();
      state.editingTaskId = null;
      state.editingTaskOriginalTitle = "";
      state.active = active;
    }
    state.groups = groups;
    state.loading = false;
    render();
    loadListDetails(activeListId, loadToken, { quiet: true });
    prefetchVisibleLists();
  } catch (error) {
    showToast(error.message);
  }
}

function scheduleResumeRefresh(reason = "resume", delay = 0) {
  if (!state.authConfirmed || document.hidden) return;
  window.clearTimeout(resumeRefreshTimer);
  resumeRefreshTimer = window.setTimeout(() => {
    resumeRefreshTimer = 0;
    if (hasPendingMutations()) {
      scheduleResumeRefresh(reason, reconcileDelayMs);
      return;
    }
    if (Date.now() - lastResumeRefreshAt < resumeRefreshMinIntervalMs) return;
    refreshFromServerOnResume(reason);
  }, delay);
}

async function refreshFromServerOnResume(reason = "resume") {
  if (document.hidden || hasPendingMutations()) return;
  lastResumeRefreshAt = Date.now();
  prefetchPeopleIndex().catch(() => {});
  try {
    state.connectionIssue = false;
    if (state.activeListId) {
      await syncListAndSummaries(state.activeListId, { quiet: true });
    } else {
      await refreshLists({ deferMobileDetail: true });
    }
  } catch {
    state.connectionIssue = true;
    if (reason === "online") showToast("Reconnecting...");
  }
}

function hasPendingMutations() {
  return pendingListCreates.size > 0 || taskMutations.size > 0 || pendingTaskReorders > 0;
}

function render() {
  renderShellState();
  renderListNav();
  renderMain();
  renderCompleted();
  renderDetails();
  renderFloatingOverlays();
}

function renderSharing() {
  const active = state.active;
  if (active) {
    renderActiveListTitle(active.list.title, { editable: isOwner() && !active.loading });
    els.visibilityChip.textContent = isOwner() ? "Owned by me" : "Shared with me";
    els.visibilityChip.className = isOwner() ? "visibility-chip owned" : "visibility-chip shared";
    els.listOwnerLabel.textContent = isOwner() ? "Private or shared list" : `Owned by ${active.list.owner_name}`;
    els.headerAvatars.innerHTML = active.members.slice(0, 5).map(memberAvatar).join("");
    renderShareRequestBadge(active.list);
  }
  renderDetails();
  positionFloatingOverlays();
}

function renderShellState() {
  const mobile = isMobileLayout();
  if (!mobile || !state.active) state.detailsSheetOpen = false;
  if (mobile || !state.active || state.active.loading) state.detailsPopoverOpen = false;
  const sidebarCollapsed = !mobile && state.sidebarCollapsed;
  document.documentElement.classList.toggle("sidebar-pref-collapsed", sidebarCollapsed);
  document.body.classList.toggle("is-mobile-layout", mobile);
  document.body.classList.toggle("sidebar-collapsed", sidebarCollapsed);
  document.body.classList.toggle("details-sheet-open", mobile && state.detailsSheetOpen);
  document.body.classList.toggle("details-popover-open", !mobile && state.detailsPopoverOpen);
  document.body.classList.toggle("auth-required", state.authRequired);
  document.body.dataset.mobileView = mobile ? state.mobileView : "desktop";
  els.newListButton.hidden = state.authRequired;
  els.newListButton.disabled = state.authRequired;
  els.sidebarToggleButton.setAttribute("aria-expanded", String(!sidebarCollapsed));
  els.sidebarToggleButton.setAttribute("aria-label", sidebarCollapsed ? "Expand shared lists sidebar" : "Collapse shared lists sidebar");
  els.sidebarRestoreButton.setAttribute("aria-expanded", String(!sidebarCollapsed));
  els.sidebarRestoreButton.setAttribute("aria-label", sidebarCollapsed ? "Expand shared lists sidebar" : "Collapse shared lists sidebar");
  els.detailsSheetScrim.hidden = !(mobile && state.detailsSheetOpen);
  els.settingsDialog.hidden = !state.settingsDialogOpen;
  els.overviewDemo.hidden = !state.overviewDemoOpen;
  els.homeScreenGuide.hidden = !state.homeScreenGuideOpen;
  els.homeScreenGuide.dataset.guideMode = state.installGuideMode;
  els.showHomeScreenGuideButton.hidden = false;
  els.installAppSettingsDescription.textContent = installGuideDescription();
  if (state.overviewDemoOpen) renderOverviewDemo();
  renderThemePreference();
  renderSettingsAuthAction();
}

function renderThemePreference() {
  els.themePreferenceInputs.forEach((input) => {
    input.checked = input.value === state.themePreference;
  });
}

function renderSettingsAuthAction() {
  const signedOut = state.authRequired || !state.session?.email;
  els.settingsAuthAction.href = signedOut ? signInUrl() : signOutUrl();
  els.settingsAuthAction.dataset.authAction = signedOut ? "signin" : "signout";
  els.settingsAuthAction.setAttribute("aria-label", signedOut ? "Sign in with ChatGPT" : "Sign out of Shared Lists");
  els.settingsAuthIcon.innerHTML = signedOut ? icon.signIn : icon.signOut;
  els.settingsAuthTitle.textContent = signedOut ? "Sign in" : "Sign out";
  els.settingsAuthDescription.textContent = signedOut
    ? "Sign in with ChatGPT to view shared lists"
    : state.session.email;
}

function renderListNav() {
  if (state.authRequired) {
    els.currentUserLabel.textContent = "Sign in required";
    els.listNav.innerHTML = `
      <section class="connection-state sign-in-list-state" aria-label="Sign in required">
        <strong>Sign in required</strong>
        <span>Sign in with ChatGPT to view lists shared with this account.</span>
        <a class="primary-link-button" href="${escapeAttr(signInUrl())}">Sign in with ChatGPT</a>
        <span class="auth-recovery-copy">If sign-in says "Session ended", close that page and reopen this Shared Lists link.</span>
        <button class="quiet-button auth-copy-link-button" type="button" data-copy-auth-return-link>Copy Shared Lists link</button>
      </section>
    `;
    return;
  }

  if (state.loading && !allListSummaries().length) {
    els.listNav.innerHTML = '<div class="loading-block">Loading lists...</div>';
    return;
  }

  if (state.connectionIssue && !allListSummaries().length) {
    els.listNav.innerHTML = '<div class="connection-state">Connect to load lists.</div>';
    return;
  }

  const groups = [
    { label: "Owned by me", lists: state.groups.owned },
    { label: "Shared with me", lists: state.groups.shared },
  ];
  const showActive = shouldShowListSelection();

  els.listNav.innerHTML = groups
    .map((group) => {
      const listHtml = group.lists
        .map((list) => {
          const shared = list.current_user_role !== "owner";
          const active = showActive && list.id === state.activeListId;
          const canSwipeDelete = isMobileLayout() && list.current_user_role === "owner" && !list.pending;
          const requestCount = pendingAccessRequestCount(list);
          const requestBadge =
            requestCount > 0 && list.current_user_can_share
              ? `<span class="request-pill">${requestCount} ${plural(requestCount, "request", "requests")}</span>`
              : "";
          return `
            <div class="list-row ${active ? "active" : ""} ${canSwipeDelete ? "list-row-deletable" : ""}" data-list-row="${escapeAttr(list.id)}" ${canSwipeDelete ? `data-delete-list="${escapeAttr(list.id)}"` : ""}>
              ${canSwipeDelete ? `<span class="swipe-action" aria-hidden="true"><span>Delete</span>${icon.trash}</span>` : ""}
              <span class="swipe-content">
                <button class="list-marker-button" type="button" data-marker-trigger="${escapeAttr(list.id)}" aria-label="Customize marker for ${escapeAttr(list.title)}" aria-haspopup="dialog" aria-expanded="${state.markerPicker.open && state.markerPicker.listId === list.id ? "true" : "false"}">
                  ${renderListMarker(list)}
                </button>
                <button class="list-button ${active ? "active" : ""}" type="button" data-list-id="${escapeAttr(list.id)}">
                  <span class="list-text">
                    <span class="list-name">${escapeHtml(list.title)}</span>
                    <span class="list-meta">${shared ? `Owned by ${escapeHtml(list.owner_name)}` : `${list.member_count} ${plural(list.member_count, "person", "people")}`}</span>
                  </span>
                  <span class="list-badges">
                    <span class="count-pill">${list.open_task_count}</span>
                    ${requestBadge}
                  </span>
                </button>
              </span>
            </div>
          `;
        })
        .join("");
      return `
        <div class="list-group">
          <div class="group-label">${group.label}</div>
          ${listHtml || '<div class="empty-group">None</div>'}
        </div>
      `;
    })
    .join("");

  els.listNav.querySelectorAll("[data-list-id]").forEach((button) => {
    button.addEventListener("click", () => {
      if (isMobileLayout()) beginMobileListTransitionGuard();
      openList(button.dataset.listId);
    });
    button.addEventListener("mouseenter", () => {
      if (!isMobileLayout()) prefetchListDetail(button.dataset.listId);
    });
    button.addEventListener("focus", () => {
      if (!isMobileLayout()) prefetchListDetail(button.dataset.listId);
    });
  });
  bindMobileListSwipeDelete();
  els.listNav.querySelectorAll("[data-marker-trigger]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleMarkerPicker(button.dataset.markerTrigger);
    });
  });
}

function shouldShowListSelection() {
  return !isMobileLayout() || state.mobileView !== "lists";
}

function renderListMarker(list) {
  const color = listMarkerColor(list?.marker_color);
  const markerIcon = listMarkerIcon(list?.marker_icon);
  return `<span class="list-icon list-marker marker-${color}" aria-hidden="true">${markerIcon.svg}</span>`;
}

function toggleMarkerPicker(listId) {
  if (state.markerPicker.open && state.markerPicker.listId === listId) {
    closeMarkerPicker();
    return;
  }
  state.markerPicker = { open: true, listId };
  state.markerCoach.open = false;
  renderMarkerOverlays();
}

function closeMarkerPicker() {
  state.markerPicker = { open: false, listId: null };
  renderMarkerOverlays();
}

function renderFloatingOverlays() {
  renderMarkerPicker();
  renderMarkerCoach();
  positionFloatingOverlays();
}

function positionFloatingOverlays() {
  positionDetailsPopover();
  positionPeopleSuggestions();
  positionMarkerOverlays();
}

function positionPeopleSuggestions() {
  if (!els.peopleSuggestions || els.peopleSuggestions.hidden || !els.inviteInput.getClientRects().length) return;
  const anchor = els.inviteInput.getBoundingClientRect();
  const gap = 6;
  const viewportPadding = 12;
  const desiredHeight = Math.min(240, els.peopleSuggestions.scrollHeight);
  const spaceBelow = window.innerHeight - anchor.bottom - gap - viewportPadding;
  const spaceAbove = anchor.top - gap - viewportPadding;
  const openAbove = spaceBelow < Math.min(desiredHeight, 160) && spaceAbove > spaceBelow;
  const availableHeight = Math.max(72, openAbove ? spaceAbove : spaceBelow);
  const menuHeight = Math.min(desiredHeight, availableHeight);
  const width = Math.min(anchor.width, window.innerWidth - viewportPadding * 2);
  const left = Math.min(
    Math.max(viewportPadding, anchor.left),
    Math.max(viewportPadding, window.innerWidth - width - viewportPadding),
  );
  const top = openAbove ? anchor.top - gap - menuHeight : anchor.bottom + gap;

  els.peopleSuggestions.dataset.placement = openAbove ? "top" : "bottom";
  els.peopleSuggestions.style.left = `${Math.round(left)}px`;
  els.peopleSuggestions.style.top = `${Math.round(Math.max(viewportPadding, top))}px`;
  els.peopleSuggestions.style.width = `${Math.round(width)}px`;
  els.peopleSuggestions.style.maxHeight = `${Math.round(availableHeight)}px`;
}

function renderMarkerOverlays() {
  renderMarkerPicker();
  renderMarkerCoach();
  positionMarkerOverlays();
}

function positionDetailsPopover() {
  if (!els.detailsPanel || isMobileLayout() || !state.detailsPopoverOpen || !state.active) {
    if (els.detailsPanel) {
      els.detailsPanel.style.left = "";
      els.detailsPanel.style.top = "";
      els.detailsPanel.style.maxHeight = "";
    }
    return;
  }
  if (!els.shareButton.getClientRects().length) return;
  const anchor = els.shareButton.getBoundingClientRect();
  const gap = 8;
  const viewportPadding = 12;
  const width = Math.min(360, window.innerWidth - viewportPadding * 2);
  const height = els.detailsPanel.offsetHeight || 360;
  const belowTop = anchor.bottom + gap;
  const aboveTop = anchor.top - height - gap;
  const fitsBelow = belowTop + height + viewportPadding <= window.innerHeight;
  const top = fitsBelow ? belowTop : Math.max(viewportPadding, aboveTop);
  const left = Math.min(
    Math.max(viewportPadding, anchor.right - width),
    Math.max(viewportPadding, window.innerWidth - width - viewportPadding),
  );
  els.detailsPanel.style.left = `${Math.round(left)}px`;
  els.detailsPanel.style.top = `${Math.round(top)}px`;
  els.detailsPanel.style.maxHeight = `${Math.max(220, Math.round(window.innerHeight - top - viewportPadding))}px`;
}

function renderMarkerPicker() {
  const list = state.markerPicker.open ? findListSummary(state.markerPicker.listId) : null;
  if (!list) {
    els.markerPopover.hidden = true;
    els.markerPopover.innerHTML = "";
    return;
  }
  els.markerPopover.hidden = false;
  els.markerPopover.innerHTML = `
    <div class="marker-popover-header">
      <strong>List icon</strong>
      <button class="row-icon-button" type="button" aria-label="Close marker picker" data-close-marker-picker>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
    ${markerChoiceMarkup(list)}
  `;
  bindMarkerChoiceEvents(els.markerPopover, list.id);
  els.markerPopover.querySelector("[data-close-marker-picker]")?.addEventListener("click", closeMarkerPicker);
}

function renderMarkerCoach() {
  const list = state.markerCoach.open ? findListSummary(state.markerCoach.listId) : null;
  if (!list) {
    els.markerCoach.hidden = true;
    els.markerCoach.innerHTML = "";
    return;
  }
  els.markerCoach.hidden = false;
  els.markerCoach.innerHTML = `
    <button class="row-icon-button marker-coach-close" type="button" aria-label="Dismiss" data-dismiss-marker-coach>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
    <strong>Customize list icons</strong>
    <p>Group similar lists and organize your sidebar visually.</p>
    <button class="quiet-button" type="button" data-open-marker-picker>Customize</button>
  `;
  els.markerCoach.querySelector("[data-dismiss-marker-coach]")?.addEventListener("click", dismissMarkerCoach);
  els.markerCoach.querySelector("[data-open-marker-picker]")?.addEventListener("click", () => {
    dismissMarkerCoach({ persist: true, renderNow: false });
    state.markerPicker = { open: true, listId: list.id };
    renderMarkerOverlays();
  });
}

function maybeShowMarkerCoach(listId) {
  if (markerCoachDismissed()) return;
  if (state.groups.owned.length < 2) return;
  state.markerPicker = { open: false, listId: null };
  state.markerCoach = { open: true, listId };
}

function dismissMarkerCoach({ persist = true, renderNow = true } = {}) {
  state.markerCoach = { open: false, listId: null };
  if (persist) {
    try {
      window.localStorage.setItem(markerCoachDismissedKey, "true");
    } catch {
      // The coach is informational only; storage failures should not interrupt work.
    }
  }
  if (renderNow) renderMarkerOverlays();
}

function markerCoachDismissed() {
  try {
    return window.localStorage.getItem(markerCoachDismissedKey) === "true";
  } catch {
    return false;
  }
}

function positionMarkerOverlays() {
  positionMarkerOverlay(els.markerPopover, state.markerPicker.open ? state.markerPicker.listId : null);
  positionMarkerOverlay(els.markerCoach, state.markerCoach.open ? state.markerCoach.listId : null, { gap: 10 });
}

function positionMarkerOverlay(element, listId, { gap = 8 } = {}) {
  if (!element || element.hidden || !listId) return;
  const trigger = document.querySelector(`[data-marker-trigger="${cssEscape(listId)}"]`);
  if (!trigger || !trigger.getClientRects().length) {
    element.hidden = true;
    return;
  }
  const anchor = trigger.getBoundingClientRect();
  const width = element.offsetWidth || 256;
  const height = element.offsetHeight || 160;
  const rightSideLeft = anchor.right + gap;
  const leftSideLeft = anchor.left - width - gap;
  const left = rightSideLeft + width + 12 <= window.innerWidth ? rightSideLeft : Math.max(12, leftSideLeft);
  const top = Math.min(Math.max(12, anchor.top - 6), Math.max(12, window.innerHeight - height - 12));
  element.style.left = `${Math.round(left)}px`;
  element.style.top = `${Math.round(top)}px`;
}

function openList(listId, { updateUrl = true } = {}) {
  if (!listId) return;
  const alreadyActive = state.activeListId === listId;
  state.activeListId = listId;
  state.pendingListLinkId = null;
  state.accessRequest = null;
  state.completedOpen = false;
  state.detailsSheetOpen = false;
  state.detailsPopoverOpen = false;
  state.mobileExpandedTaskId = null;
  state.editingListTitle = false;
  state.editingListOriginalTitle = "";
  if (isMobileLayout()) {
    state.mobileView = "tasks";
    beginMobileListTransitionGuard();
  }
  if (updateUrl) writeActiveListToUrl(listId);
  if (alreadyActive && state.active?.list.id === listId && !state.active.loading) {
    render();
    if (!state.active.details_loaded) loadListDetails(listId, activeListLoadToken, { quiet: true });
    return;
  }
  loadActiveList();
}

function renderMain() {
  const active = state.active;
  const disabled = !active;
  const listActionDisabled = !active || active.loading;
  const mobile = isMobileLayout();
  const deniedListRequest = state.accessRequest?.listId ? state.accessRequest : null;
  els.addTaskForm.toggleAttribute("inert", disabled);
  els.addTaskForm.hidden = Boolean(deniedListRequest);
  els.completedDrawer.hidden = Boolean(deniedListRequest);
  els.accessDeniedPanel.hidden = !deniedListRequest;
  els.taskInput.disabled = disabled;
  els.draftDueDate.disabled = disabled;
  els.copyListLinkButton.hidden = listActionDisabled || Boolean(deniedListRequest);
  els.copyListLinkButton.disabled = listActionDisabled || !active?.list?.id || Boolean(deniedListRequest);
  els.shareButton.hidden = listActionDisabled;
  els.shareButton.disabled = listActionDisabled;
  els.shareButtonText.textContent = mobile ? "Details" : "Share";
  els.shareButton.setAttribute("aria-label", mobile ? "List details" : "Share list");
  els.shareButton.setAttribute("aria-expanded", String(mobile ? state.detailsSheetOpen : state.detailsPopoverOpen));
  renderShareRequestBadge(active?.list);
  els.deleteListButton.hidden = listActionDisabled || !isOwner();

  if (state.authRequired) {
    settleMobileListTransitionGuard();
    renderActiveListTitle("Shared Lists", { editable: false });
    els.visibilityChip.textContent = "Sign in";
    els.visibilityChip.className = "visibility-chip";
    els.listOwnerLabel.textContent = "Private list access";
    els.headerAvatars.innerHTML = "";
    els.accessDeniedPanel.hidden = true;
    els.addTaskForm.hidden = true;
    els.completedDrawer.hidden = true;
    els.copyListLinkButton.hidden = true;
    els.copyListLinkButton.disabled = true;
    els.shareButton.hidden = true;
    els.shareButton.disabled = true;
    els.deleteListButton.hidden = true;
    els.taskInput.disabled = true;
    els.draftDueDate.disabled = true;
    els.taskList.innerHTML = `
      <article class="empty-state sign-in-state">
        <strong>Sign in to Shared Lists</strong>
        <span>Your lists stay private. You will only see lists shared with this account.</span>
        <a class="primary-link-button" href="${escapeAttr(signInUrl())}">Sign in with ChatGPT</a>
        <span class="auth-recovery-copy">If sign-in says "Session ended", close that page, reopen this Shared Lists link, then tap Sign in again.</span>
        <button class="quiet-button auth-copy-link-button" type="button" data-copy-auth-return-link>Copy Shared Lists link</button>
      </article>
    `;
    return;
  }

  if (deniedListRequest) {
    settleMobileListTransitionGuard();
    renderActiveListTitle("Shared Lists", { editable: false });
    els.visibilityChip.textContent = "Private";
    els.visibilityChip.className = "visibility-chip";
    els.listOwnerLabel.textContent = "Access needed";
    els.headerAvatars.innerHTML = "";
    renderDeniedListAccess();
    els.taskList.innerHTML = "";
    return;
  }

  if (!active) {
    settleMobileListTransitionGuard();
    const hasLists = allListSummaries().length > 0;
    renderActiveListTitle(hasLists ? "Choose a list" : "No lists yet", { editable: false });
    els.visibilityChip.textContent = hasLists ? "Lists" : "Private";
    els.visibilityChip.className = "visibility-chip";
    els.listOwnerLabel.textContent = hasLists ? "Select from the sidebar" : "Create a list";
    els.headerAvatars.innerHTML = "";
    els.accessDeniedPanel.hidden = true;
    els.addTaskForm.hidden = false;
    els.completedDrawer.hidden = false;
    els.taskList.innerHTML = `<article class="empty-state">${hasLists ? "Pick a list to view its tasks." : "Use the blue plus to create your first list."}</article>`;
    return;
  }

  renderActiveListTitle(active.list.title, { editable: isOwner() && !active.loading });
  els.accessDeniedPanel.hidden = true;
  els.addTaskForm.hidden = false;
  els.completedDrawer.hidden = false;
  els.visibilityChip.textContent = isOwner() ? "Owned by me" : "Shared with me";
  els.visibilityChip.className = isOwner() ? "visibility-chip owned" : "visibility-chip shared";
  els.listOwnerLabel.textContent = isOwner() ? "Private or shared list" : `Owned by ${active.list.owner_name}`;
  els.headerAvatars.innerHTML = active.members.slice(0, 5).map(memberAvatar).join("");

  if (active.loading) {
    els.taskList.innerHTML = `
      <article class="empty-state loading-state">
        <strong>Loading tasks</strong>
        <span>Refreshing this list...</span>
      </article>
    `;
    return;
  }

  if (!active.open_tasks.length) {
    els.taskList.innerHTML = `
      <article class="empty-state">
        <strong>No open tasks</strong>
        <span>Anything completed will stay in the archive until it is deleted.</span>
      </article>
    `;
    settleMobileListTransitionGuard();
    return;
  }

  els.taskList.innerHTML = active.open_tasks
    .map((task) => {
      const titleControl = taskTitleControl(task);
      const dueLabel = task.due_date ? formatTaskDueLabel(task.due_date) : "Add date";
      const expandedClass = state.mobileExpandedTaskId === task.id ? " mobile-expanded" : "";
      const editingClass = state.editingTaskId === task.id ? " task-editing" : "";
      return `
      <article class="task-row${expandedClass}${editingClass}" data-task-id="${escapeAttr(task.id)}">
        <span class="swipe-action" aria-hidden="true"><span>Delete</span>${icon.trash}</span>
        <span class="swipe-content">
          <label class="task-check-wrap">
            <input class="task-check" type="checkbox" aria-label="Complete ${escapeAttr(task.title)}" data-complete-task="${escapeAttr(task.id)}" />
          </label>
          <span class="task-main">
            ${titleControl}
            ${task.due_date ? `<span class="task-subtitle">Due ${formatDate(task.due_date)}</span>` : ""}
          </span>
          <span class="task-date-actions">
            <label class="row-date ${task.due_date ? "has-date" : "no-date"}" aria-label="Due date for ${escapeAttr(task.title)}">
              ${icon.calendar}
              <span class="row-date-label">${escapeHtml(dueLabel)}</span>
              <input type="date" value="${escapeAttr(task.due_date || "")}" data-task-date="${escapeAttr(task.id)}" />
            </label>
            ${task.due_date ? `<button class="row-icon-button" type="button" aria-label="Clear due date" data-clear-date="${escapeAttr(task.id)}">${icon.trash}</button>` : ""}
          </span>
          <button class="task-drag-handle" type="button" aria-label="Reorder ${escapeAttr(task.title)}" data-task-drag-handle="${escapeAttr(task.id)}">${icon.grip}</button>
        </span>
      </article>
    `;
    })
    .join("");

  els.taskList.querySelectorAll("[data-complete-task]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => completeTask(checkbox.dataset.completeTask));
  });
  els.taskList.querySelectorAll("[data-task-date]").forEach((input) => {
    input.addEventListener("change", () => updateTaskDate(input.dataset.taskDate, input.value));
  });
  els.taskList.querySelectorAll("[data-clear-date]").forEach((button) => {
    button.addEventListener("click", () => updateTaskDate(button.dataset.clearDate, null));
  });
  bindTaskReordering();
  bindMobileSwipeDelete();
  bindMobileTaskExpansion();
  bindTaskTitleEditing(els.taskList);
  settleMobileListTransitionGuard();
}

function renderShareRequestBadge(list) {
  const count = pendingAccessRequestCount(list);
  const show = Boolean(count > 0 && list?.current_user_can_share && state.active && !state.active.loading);
  els.shareRequestBadge.hidden = !show;
  els.shareRequestBadge.textContent = String(count);
  els.shareButton.classList.toggle("has-request-badge", show);
  if (show) els.shareButton.setAttribute("aria-label", `${isMobileLayout() ? "List details" : "Share list"}, ${count} access ${plural(count, "request", "requests")}`);
}

function renderDeniedListAccess() {
  const status = state.accessRequest?.status || "idle";
  const sent = status === "sent";
  const sending = status === "sending";
  els.requestAccessButton.disabled = sending || sent;
  els.requestAccessButton.textContent = sending ? "Sending..." : sent ? "Request sent" : "Request access";
  els.accessRequestStatus.hidden = status !== "sent" && status !== "error";
  els.accessRequestStatus.className = `access-request-status ${status === "error" ? "error" : "sent"}`;
  els.accessRequestStatus.innerHTML =
    status === "sent"
      ? '<span class="status-dot">✓</span><span>We\'ll add it here if access is approved.</span>'
      : `<span>${escapeHtml(state.accessRequest?.message || "Could not send request.")}</span>`;
}

function renderCompleted() {
  const tasks = state.active?.completed_tasks || [];
  const completedCount = Number(state.active?.list.completed_task_count ?? tasks.length);
  els.completedCount.textContent = `Completed ${completedCount}`;
  els.completedToggle.setAttribute("aria-expanded", String(state.completedOpen));
  els.completedContent.hidden = !state.completedOpen;
  els.completedToggle.classList.toggle("open", state.completedOpen);

  if (!state.completedOpen) return;

  const loaded = Boolean(state.active?.completed_tasks_loaded);
  const loading = Boolean(state.active?.completed_tasks_loading);
  els.selectAllCompleted.disabled = !loaded || loading || tasks.length === 0;
  els.selectAllCompleted.checked = Boolean(loaded && tasks.length && state.selectedCompleted.size === tasks.length);
  els.deleteSelectedButton.disabled = !loaded || loading || state.selectedCompleted.size === 0;
  els.clearCompletedButton.disabled = !loaded || loading || tasks.length === 0;

  if (!loaded || loading) {
    els.completedList.innerHTML = '<div class="empty-completed">Loading completed tasks...</div>';
    return;
  }

  if (!tasks.length) {
    els.completedList.innerHTML = '<div class="empty-completed">Nothing completed yet</div>';
    return;
  }

  els.completedList.innerHTML = tasks
    .map((task) => {
      const titleControl = taskTitleControl(task, { completed: true });
      return `
      <article class="completed-row ${task.due_date ? "has-due" : "no-due"}" data-completed-task-id="${escapeAttr(task.id)}">
        <span class="swipe-action" aria-hidden="true"><span>Delete</span>${icon.trash}</span>
        <span class="swipe-content">
          <label class="completed-select-wrap">
            <input type="checkbox" aria-label="Select ${escapeAttr(task.title)}" data-select-completed="${escapeAttr(task.id)}" ${state.selectedCompleted.has(task.id) ? "checked" : ""} />
          </label>
          ${titleControl}
          ${task.due_date ? `<span class="due-chip">${formatDate(task.due_date)}</span>` : ""}
          <button class="row-icon-button" type="button" aria-label="Reopen task" data-reopen-task="${escapeAttr(task.id)}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v6h6" /></svg>
          </button>
          <button class="row-icon-button" type="button" aria-label="Delete task" data-delete-task="${escapeAttr(task.id)}">${icon.trash}</button>
        </span>
      </article>
    `;
    })
    .join("");

  els.completedList.querySelectorAll("[data-select-completed]").forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) state.selectedCompleted.add(input.dataset.selectCompleted);
      else state.selectedCompleted.delete(input.dataset.selectCompleted);
      renderCompleted();
    });
  });
  els.completedList.querySelectorAll("[data-delete-task]").forEach((button) => {
    button.addEventListener("click", () => deleteTask(button.dataset.deleteTask));
  });
  els.completedList.querySelectorAll("[data-reopen-task]").forEach((button) => {
    button.addEventListener("click", () => reopenTask(button.dataset.reopenTask));
  });
  bindMobileSwipeDelete(els.completedList);
  bindTaskTitleEditing(els.completedList);
}

function taskTitleControl(task, { completed = false } = {}) {
  const isEditing = state.editingTaskId === task.id;
  const inputClass = completed ? "task-title-input completed-title-input" : "task-title-input";
  const buttonClass = completed ? "completed-title-button" : "task-title-button";
  const label = completed ? "completed task title" : "task title";
  if (isEditing) {
    return `<textarea class="${inputClass}" rows="2" aria-label="Edit ${label}" data-edit-task-title="${escapeAttr(task.id)}">${escapeHtml(task.title)}</textarea>`;
  }
  return `<span class="${buttonClass}" role="button" tabindex="0" aria-label="Edit ${label}: ${escapeAttr(task.title)}" data-edit-task="${escapeAttr(task.id)}">${linkifyTaskTitle(task.title)}</span>`;
}

function renderActiveListTitle(title, { editable = false } = {}) {
  const safeTitle = title || "Untitled list";
  els.activeListTitle.classList.toggle("editable-list-title", editable);
  els.activeListTitle.classList.toggle("editing-list-title", Boolean(editable && state.editingListTitle));
  if (editable && state.editingListTitle) {
    els.activeListTitle.innerHTML = `<input class="list-title-inline-input" type="text" value="${escapeAttr(safeTitle)}" maxlength="120" aria-label="Edit list title" data-edit-list-title />`;
    const input = els.activeListTitle.querySelector("[data-edit-list-title]");
    input?.addEventListener("click", (event) => event.stopPropagation());
    input?.addEventListener("keydown", handleActiveListTitleInputKeydown);
    input?.addEventListener("blur", () => saveActiveListTitle(input));
    window.requestAnimationFrame(() => {
      input?.focus();
      input?.select();
    });
    return;
  }
  if (editable) {
    els.activeListTitle.innerHTML = `<button class="list-title-inline-button" type="button" aria-label="Edit list title: ${escapeAttr(safeTitle)}" data-edit-list-title-trigger>${escapeHtml(safeTitle)}</button>`;
    return;
  }
  els.activeListTitle.textContent = safeTitle;
}

function handleActiveListTitleClick(event) {
  if (!event.target.closest("[data-edit-list-title-trigger]")) return;
  startEditingActiveListTitle();
}

function handleActiveListTitleKeydown(event) {
  if (!event.target.closest("[data-edit-list-title-trigger]")) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  startEditingActiveListTitle();
}

function handleActiveListTitleInputKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    saveActiveListTitle(event.currentTarget);
  }
  if (event.key === "Escape") {
    event.preventDefault();
    cancelActiveListTitleEdit();
  }
}

function startEditingActiveListTitle() {
  if (!state.active?.list || !isOwner() || state.active.loading) return;
  state.editingListTitle = true;
  state.editingListOriginalTitle = state.active.list.title;
  render();
}

function cancelActiveListTitleEdit() {
  state.editingListTitle = false;
  state.editingListOriginalTitle = "";
  render();
}

function saveActiveListTitle(input) {
  if (!input || !state.editingListTitle || input.dataset.saving === "true") return;
  const title = input.value.trim().replace(/\s+/g, " ");
  if (!title) {
    input.value = state.editingListOriginalTitle;
    showToast("List title is required");
    window.requestAnimationFrame(() => input.focus());
    return;
  }
  if (title.length > 120) {
    showToast("List title must be 120 characters or less");
    window.requestAnimationFrame(() => input.focus());
    return;
  }
  if (title === state.editingListOriginalTitle) {
    cancelActiveListTitleEdit();
    return;
  }
  input.dataset.saving = "true";
  renameActiveList(title).catch((error) => {
    input.dataset.saving = "false";
    showToast(error.message);
    window.requestAnimationFrame(() => input.focus());
  });
}

function bindTaskTitleEditing(container) {
  container.querySelectorAll(".task-title-link").forEach((link) => {
    link.addEventListener("click", (event) => event.stopPropagation());
    link.addEventListener("pointerdown", (event) => event.stopPropagation());
  });
  container.querySelectorAll("[data-edit-task]").forEach((control) => {
    control.addEventListener("click", (event) => {
      if (event.target.closest(".task-title-link")) return;
      event.stopPropagation();
      startEditingTask(control.dataset.editTask);
    });
    control.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (event.target.closest(".task-title-link")) return;
      event.preventDefault();
      startEditingTask(control.dataset.editTask);
    });
  });
  container.querySelectorAll("[data-edit-task-title]").forEach((input) => {
    sizeTaskTitleEditor(input);
    input.addEventListener("input", () => sizeTaskTitleEditor(input));
    input.addEventListener("blur", () => saveTaskTitle(input));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        saveTaskTitle(input);
      }
      if (event.key === "Escape") {
        event.preventDefault();
        cancelTaskTitleEdit();
      }
    });
  });
}

function bindTaskReordering() {
  els.taskList.querySelectorAll("[data-task-drag-handle]").forEach((handle) => {
    const row = handle.closest(".task-row[data-task-id]");
    if (!row) return;
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let latestY = 0;
    let dragging = false;
    let dropTarget = null;
    let dropIndex = -1;
    let dragLayout = [];
    let dragStep = 0;

    handle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });

    handle.addEventListener("pointerdown", (event) => {
      if (state.editingTaskId || (event.button !== undefined && event.button !== 0)) return;
      if (activeTaskDragId && activeTaskDragId !== row.dataset.taskId) return;
      event.preventDefault();
      event.stopPropagation();
      activeTaskDragId = row.dataset.taskId;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      latestY = event.clientY;
      try {
        handle.setPointerCapture?.(pointerId);
      } catch {
        // Pointer capture is optional in synthetic webview events.
      }
      if (!isMobileLayout()) beginDragging();
    });

    handle.addEventListener("pointermove", (event) => {
      if (pointerId !== event.pointerId) return;
      latestY = event.clientY;
      if (!dragging) {
        if (Math.abs(latestY - startY) < mobileTaskDragStartDistance) return;
        beginDragging();
      }
      event.preventDefault();
      event.stopPropagation();
      row.style.setProperty("--task-drag-y", `${latestY - startY}px`);
      dropIndex = taskDropIndex(row, latestY, dragLayout);
      applyTaskDragShifts(row, dragLayout, dropIndex, dragStep);
      const nextTarget = taskDropTargetAtIndex(row, dragLayout, dropIndex);
      clearTaskDropTarget(dropTarget);
      dropTarget = nextTarget?.row || null;
      if (dropTarget) dropTarget.classList.add(nextTarget.insertAfter ? "task-drop-after" : "task-drop-before");
      scrollTaskDragViewport(latestY);
    });

    const finishDrag = (event) => {
      if (pointerId !== event.pointerId) return;
      const draggedTaskId = row.dataset.taskId;
      try {
        handle.releasePointerCapture?.(pointerId);
      } catch {
        // Pointer capture may already have been released.
      }
      pointerId = null;
      if (!dragging) {
        finishActiveTaskDrag(draggedTaskId);
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      dragging = false;
      row.classList.remove("task-dragging");
      els.taskList.classList.remove("task-reordering");
      row.style.removeProperty("--task-drag-y");
      clearTaskDropTarget(dropTarget);
      clearTaskDragShifts(dragLayout);
      if (event.type !== "pointercancel" && dropIndex >= 0) reorderOpenTask(draggedTaskId, dropIndex);
      finishActiveTaskDrag(draggedTaskId);
      dropTarget = null;
      dragLayout = [];
      dropIndex = -1;
    };

    handle.addEventListener("pointerup", finishDrag);
    handle.addEventListener("pointercancel", finishDrag);

    function beginDragging() {
      if (pointerId === null) return;
      dragging = true;
      dragLayout = taskDragLayout();
      dropIndex = dragLayout.findIndex((item) => item.row === row);
      dragStep = taskDragStep(dragLayout);
      row.classList.add("task-dragging");
      els.taskList.classList.add("task-reordering");
    }
  });
}

function finishActiveTaskDrag(taskId) {
  if (activeTaskDragId === taskId) activeTaskDragId = null;
  const adoption = deferredTaskAdoptions.get(taskId);
  if (!adoption) return;
  deferredTaskAdoptions.delete(taskId);
  adoptServerTask(taskId, adoption.serverTask, { preserveOptimistic: adoption.preserveOptimistic });
}

function taskDragLayout() {
  return [...els.taskList.querySelectorAll(".task-row[data-task-id]")].map((row) => {
    const rect = row.getBoundingClientRect();
    return {
      row,
      centerY: rect.top + rect.height / 2,
      height: rect.height,
    };
  });
}

function taskDragStep(layout) {
  if (layout.length > 1) return Math.abs(layout[1].centerY - layout[0].centerY);
  return Number(layout[0]?.height || 0);
}

function taskDropIndex(draggedRow, clientY, layout) {
  const rows = layout.filter((item) => item.row !== draggedRow);
  for (let index = 0; index < rows.length; index += 1) {
    if (clientY < rows[index].centerY) return index;
  }
  return rows.length;
}

function taskDropTargetAtIndex(draggedRow, layout, dropIndex) {
  const rows = layout.filter((item) => item.row !== draggedRow);
  if (!rows.length) return null;
  if (dropIndex >= rows.length) return { row: rows[rows.length - 1].row, insertAfter: true };
  return { row: rows[dropIndex].row, insertAfter: false };
}

function clearTaskDropTarget(row) {
  row?.classList.remove("task-drop-before", "task-drop-after");
}

function applyTaskDragShifts(draggedRow, layout, dropIndex, step) {
  const draggedIndex = layout.findIndex((item) => item.row === draggedRow);
  layout.forEach((item, index) => {
    if (item.row === draggedRow) return;
    let shift = 0;
    if (dropIndex > draggedIndex && index > draggedIndex && index <= dropIndex) shift = -step;
    if (dropIndex < draggedIndex && index >= dropIndex && index < draggedIndex) shift = step;
    item.row.classList.toggle("task-shifting", shift !== 0);
    if (shift) item.row.style.setProperty("--task-shift-y", `${shift}px`);
    else item.row.style.removeProperty("--task-shift-y");
  });
}

function clearTaskDragShifts(layout) {
  layout.forEach(({ row }) => {
    row.classList.remove("task-shifting");
    row.style.removeProperty("--task-shift-y");
  });
}

function scrollTaskDragViewport(clientY) {
  const edge = 72;
  if (clientY < edge) window.scrollBy({ top: -12, behavior: "auto" });
  else if (clientY > window.innerHeight - edge) window.scrollBy({ top: 12, behavior: "auto" });
}

function reorderOpenTask(taskId, targetIndex) {
  const listId = state.active?.list.id;
  const tasks = state.active?.open_tasks || [];
  const dragged = tasks.find((task) => task.id === taskId);
  if (!listId || !dragged) return;
  const reordered = tasks.filter((task) => task.id !== taskId);
  reordered.splice(Math.min(Math.max(targetIndex, 0), reordered.length), 0, dragged);
  if (reordered.every((task, index) => task.id === tasks[index]?.id)) return;
  state.active.open_tasks = assignClientSortOrders(reordered);
  cacheActiveDetail();
  render();
  persistOpenTaskOrder(listId, state.active.open_tasks.map((task) => task.id));
}

function persistOpenTaskOrder(listId, taskIds) {
  const token = ++latestTaskReorderToken;
  pendingTaskReorders += 1;
  taskReorderQueue = taskReorderQueue
    .catch(() => {})
    .then(async () => {
      const serverListId = await resolveServerListId(listId);
      const serverTaskIds = await Promise.all(taskIds.map(resolveServerTaskId));
      await apiFetchWithRetry(`/api/lists/${encodeURIComponent(serverListId)}/tasks/reorder`, {
        method: "PATCH",
        body: { task_ids: serverTaskIds },
      });
      if (token === latestTaskReorderToken) scheduleQuietReconcile(serverListId);
    })
    .catch((error) => {
      if (token === latestTaskReorderToken) {
        showToast(error.message || "Could not save task order");
        scheduleQuietReconcile(listId, 0);
      }
    })
    .finally(() => {
      pendingTaskReorders = Math.max(0, pendingTaskReorders - 1);
    });
}

async function resolveServerTaskId(taskId) {
  if (resolvedTaskIds.has(taskId)) return resolvedTaskIds.get(taskId);
  const mutation = taskMutations.get(taskId);
  if (!mutation?.createPromise) return taskId;
  const created = await mutation.createPromise;
  return created.id;
}

function bindMobileSwipeDelete(container = els.taskList) {
  bindSwipeDeleteRows(container, {
    rowSelector: ".task-row[data-task-id], .completed-row[data-completed-task-id]",
    ignoreTarget: (target) => target.closest("a, input, textarea, label, .row-icon-button, .task-check, .task-drag-handle"),
    onDelete: (row) => {
      if (row.dataset.completedTaskId) deleteTask(row.dataset.completedTaskId);
      else deleteOpenTask(row.dataset.taskId);
    },
  });
}

function bindMobileListSwipeDelete() {
  bindSwipeDeleteRows(els.listNav, {
    rowSelector: ".list-row[data-delete-list]",
    ignoreTarget: (target) => target.closest("[data-marker-trigger], .list-marker-button, input, textarea, select"),
    onDelete: (row) => deleteListFromPicker(row.dataset.deleteList),
  });
}

function bindSwipeDeleteRows(container, { rowSelector, ignoreTarget, onDelete }) {
  if (!isMobileLayout()) return;
  container.querySelectorAll(rowSelector).forEach((row) => {
    let startX = 0;
    let startY = 0;
    let latestX = 0;
    let pointerId = null;
    let dragging = false;
    let suppressNextClick = false;
    let rowWidth = 0;
    let pendingOffset = 0;
    let swipeFrame = 0;

    row.addEventListener(
      "click",
      (event) => {
        if (!suppressNextClick) return;
        suppressNextClick = false;
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      true,
    );

    row.addEventListener("pointerdown", (event) => {
      if (!isMobileLayout() || state.editingTaskId) return;
      if (ignoreTarget?.(event.target)) return;
      startX = event.clientX;
      startY = event.clientY;
      latestX = event.clientX;
      pointerId = event.pointerId;
      dragging = false;
      rowWidth = row.offsetWidth;
      pendingOffset = 0;
      row.classList.remove("swipe-ready", "swipe-deleting");
      row.style.removeProperty("--swipe-offset");
      row.style.removeProperty("--swipe-reveal");
    });

    row.addEventListener("pointermove", (event) => {
      if (pointerId !== event.pointerId) return;
      latestX = event.clientX;
      const deltaX = latestX - startX;
      const deltaY = event.clientY - startY;
      if (!dragging && Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        dragging = true;
        row.classList.add("swiping");
        try {
          row.setPointerCapture?.(pointerId);
        } catch {
          // Some synthetic/mobile webview pointer events do not expose an active pointer capture target.
        }
      }
      if (!dragging) return;
      event.preventDefault();
      const offset = Math.max(deltaX, -rowWidth);
      const leftOffset = Math.min(0, offset);
      applySwipeOffset(leftOffset);
    });

    const applySwipeOffset = (offset) => {
      pendingOffset = offset;
      if (swipeFrame) return;
      swipeFrame = window.requestAnimationFrame(() => {
        swipeFrame = 0;
        row.style.setProperty("--swipe-offset", `${pendingOffset}px`);
        row.style.setProperty("--swipe-reveal", `${Math.abs(pendingOffset)}px`);
        row.classList.toggle("swipe-ready", Math.abs(pendingOffset) >= swipeDeleteThreshold(row, rowWidth));
      });
    };

    const finishSwipe = (event) => {
      if (pointerId !== event.pointerId) return;
      try {
        row.releasePointerCapture?.(pointerId);
      } catch {
        // Pointer capture may not have been established for this gesture.
      }
      const deltaX = latestX - startX;
      const shouldDelete = dragging && deltaX <= -swipeDeleteThreshold(row, rowWidth);
      if (dragging) suppressNextClick = true;
      pointerId = null;
      dragging = false;
      if (swipeFrame) {
        window.cancelAnimationFrame(swipeFrame);
        swipeFrame = 0;
      }
      row.classList.remove("swiping", "swipe-ready");
      if (shouldDelete) {
        row.classList.add("swipe-deleting");
        row.style.setProperty("--swipe-offset", `-${rowWidth}px`);
        row.style.setProperty("--swipe-reveal", `${rowWidth}px`);
        window.setTimeout(() => {
          onDelete(row);
        }, 140);
        return;
      }
      row.style.removeProperty("--swipe-offset");
      row.style.removeProperty("--swipe-reveal");
    };

    row.addEventListener("pointerup", finishSwipe);
    row.addEventListener("pointercancel", finishSwipe);
  });
}

function swipeDeleteThreshold(row, width = row.offsetWidth) {
  return Math.min(220, width * 0.55);
}

function bindMobileTaskExpansion() {
  if (!isMobileLayout()) return;
  els.taskList.querySelectorAll(".task-row[data-task-id]").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (!isMobileLayout()) return;
      if (event.target.closest("button, input, textarea, label, .task-check")) return;
      state.mobileExpandedTaskId = state.mobileExpandedTaskId === row.dataset.taskId ? null : row.dataset.taskId;
      render();
    });
  });
}

function startEditingTask(taskId) {
  if (els.taskList.classList.contains("task-reordering")) return;
  const task = findActiveTask(taskId);
  if (!task) return;
  state.editingTaskId = task.id;
  state.editingTaskOriginalTitle = task.title;
  if (isMobileLayout()) state.mobileExpandedTaskId = task.id;
  render();
  window.requestAnimationFrame(() => {
    const input = document.querySelector(`[data-edit-task-title="${cssEscape(task.id)}"]`);
    sizeTaskTitleEditor(input);
    input?.focus();
    input?.select();
  });
}

function sizeTaskTitleEditor(input) {
  if (!input || input.tagName !== "TEXTAREA") return;
  input.style.height = "auto";
  const borderHeight = input.offsetHeight - input.clientHeight;
  input.style.height = `${input.scrollHeight + Math.max(0, borderHeight)}px`;
}

function cancelTaskTitleEdit() {
  state.editingTaskId = null;
  state.editingTaskOriginalTitle = "";
  render();
}

function saveTaskTitle(input) {
  const taskId = input.dataset.editTaskTitle;
  if (!taskId || taskId !== state.editingTaskId || input.dataset.saving === "true") return;
  const title = normalizeClientTitle(input.value);
  if (!title) {
    input.value = state.editingTaskOriginalTitle;
    showToast("Task title is required");
    window.requestAnimationFrame(() => input.focus());
    return;
  }
  if (title.length > maxTaskTitleLength) {
    showToast(`Task title must be ${maxTaskTitleLength} characters or less`);
    window.requestAnimationFrame(() => input.focus());
    return;
  }
  if (title === state.editingTaskOriginalTitle) {
    cancelTaskTitleEdit();
    return;
  }
  input.dataset.saving = "true";
  renameTask(taskId, title).catch((error) => {
    input.dataset.saving = "false";
    showToast(error.message);
    window.requestAnimationFrame(() => input.focus());
  });
}

function markerChoiceMarkup(list) {
  const selected = listMarkerPreferences(list);
  const defaultSelected = selected.marker_color === defaultListMarkerColor && selected.marker_icon === defaultListMarkerIcon;
  return `
    <button
      class="marker-default-choice${defaultSelected ? " selected" : ""}"
      type="button"
      aria-pressed="${defaultSelected ? "true" : "false"}"
      data-marker-default
    >
      <span class="list-icon list-marker marker-${defaultListMarkerColor}" aria-hidden="true">${listMarkerIcon(defaultListMarkerIcon).svg}</span>
      <span>Default</span>
    </button>
    <div class="marker-choice-row" role="group" aria-label="Marker color">
      ${listMarkerColors
        .map(
          (color) => `
            <button
              class="marker-choice marker-color-choice marker-${color.id}${color.id === selected.marker_color ? " selected" : ""}"
              type="button"
              aria-label="${escapeAttr(color.label)}"
              aria-pressed="${color.id === selected.marker_color ? "true" : "false"}"
              data-marker-color="${escapeAttr(color.id)}"
            ></button>
          `,
        )
        .join("")}
    </div>
    <div class="marker-choice-row" role="group" aria-label="Marker icon">
      ${listMarkerIcons
        .map(
          (markerIcon) => `
            <button
              class="marker-choice marker-icon-choice${markerIcon.id === selected.marker_icon ? " selected" : ""}"
              type="button"
              aria-label="${escapeAttr(markerIcon.label)}"
              aria-pressed="${markerIcon.id === selected.marker_icon ? "true" : "false"}"
              data-marker-icon="${escapeAttr(markerIcon.id)}"
            >${markerIcon.svg}</button>
          `,
        )
        .join("")}
    </div>
  `;
}

function bindMarkerChoiceEvents(container, listId) {
  container.querySelector("[data-marker-default]")?.addEventListener("click", (event) => {
    event.stopPropagation();
    updateListMarkerPreference(listId, {
      marker_color: defaultListMarkerColor,
      marker_icon: defaultListMarkerIcon,
    });
  });
  container.querySelectorAll("[data-marker-color]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      updateListMarkerPreference(listId, { marker_color: button.dataset.markerColor });
    });
  });
  container.querySelectorAll("[data-marker-icon]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      updateListMarkerPreference(listId, { marker_icon: button.dataset.markerIcon });
    });
  });
}

function renderDetails() {
  const active = state.active;
  if (state.authRequired) {
    els.shareStatus.textContent = "Sign in required";
    els.memberList.innerHTML = "";
    els.ownerOnlyLabel.textContent = "";
    els.allowAllShareButton.hidden = true;
    els.inviteForm.hidden = true;
    paintInviteStatus("");
    renderAccessRequests(null, { sharer: false });
    return;
  }

  if (!active) {
    els.shareStatus.textContent = "No active list";
    els.memberList.innerHTML = "";
    els.ownerOnlyLabel.textContent = "";
    els.allowAllShareButton.hidden = true;
    els.inviteForm.hidden = true;
    paintInviteStatus("");
    renderAccessRequests(null, { sharer: false });
    return;
  }

  const owner = isOwner();
  const sharer = canShareList();
  if (active.loading || !active.details_loaded) {
    els.shareStatus.textContent = active.loading ? "Loading list details" : "Loading sharing details";
    els.ownerOnlyLabel.textContent = owner ? "Owner" : sharer ? "Can share" : "Editor";
    els.allowAllShareButton.hidden = true;
    els.inviteForm.hidden = true;
    els.inviteInput.disabled = true;
    els.inviteSubmitButton.disabled = true;
    paintInviteStatus(active.list?.id || "");
    renderAccessRequests(active, { sharer, loading: true });
    els.memberList.innerHTML = active.members.length
      ? active.members.map(memberAvatar).join("")
      : '<div class="empty-completed">Loading people...</div>';
    return;
  }

  els.shareStatus.textContent = `${active.members.length} ${plural(active.members.length, "person", "people")} on this list`;
  els.ownerOnlyLabel.textContent = owner ? "Owner" : sharer ? "Can share" : "Editor";
  const invitePending = isInvitePendingFor(active.list.id);
  els.inviteForm.hidden = !sharer;
  els.inviteInput.disabled = !sharer || invitePending;
  els.inviteSubmitButton.disabled = !sharer || invitePending;
  paintInviteStatus(active.list.id);

  const shareableMembers = active.members.filter((member) => member.role !== "owner");
  const hasMemberWithoutSharing = shareableMembers.some((member) => !member.can_share);
  els.allowAllShareButton.hidden = !owner || shareableMembers.length === 0;
  els.allowAllShareButton.disabled = !hasMemberWithoutSharing;
  els.allowAllShareButton.textContent = hasMemberWithoutSharing ? "Allow all to share" : "All can share";
  renderAccessRequests(active, { sharer });

  renderMemberList(active.members, owner);
}

function renderMemberList(members, owner) {
  const seen = new Set();
  members.forEach((member) => {
    const email = normalizeEmail(member.email);
    let row = els.memberList.querySelector(`[data-member-email="${cssEscape(email)}"]`);
    const signature = `${member.display_name}|${member.email}|${member.role}|${Boolean(member.can_share)}|${Boolean(member.pending)}|${Boolean(owner)}`;
    if (!row) {
      row = document.createElement("div");
      row.className = "member-row";
      row.dataset.memberEmail = email;
    }
    if (row.dataset.sig !== signature) {
      row.dataset.sig = signature;
      row.innerHTML = memberRowContents(member, owner);
      bindMemberRowControls(row);
    }
    seen.add(email);
    els.memberList.appendChild(row);
  });

  els.memberList.querySelectorAll("[data-member-email]").forEach((row) => {
    if (!seen.has(row.dataset.memberEmail)) row.remove();
  });
}

function memberRowContents(member, owner) {
  return `
    ${memberAvatar(member)}
    <span class="member-identity">
      <strong>${escapeHtml(member.display_name)}</strong>
      <small>${escapeHtml(member.email)}</small>
    </span>
    ${memberControls(member, owner)}
  `;
}

function bindMemberRowControls(row) {
  row.querySelector("[data-member-share]")?.addEventListener("change", (event) => {
    updateMemberSharing(event.currentTarget.dataset.memberShare, event.currentTarget.checked);
  });
  row.querySelector("[data-remove-member]")?.addEventListener("click", (event) => {
    removeMember(event.currentTarget.dataset.removeMember);
  });
}

function renderAccessRequests(active, { sharer = false, loading = false } = {}) {
  const requests = Array.isArray(active?.access_requests) ? active.access_requests : [];
  const count = loading ? pendingAccessRequestCount(active?.list) : requests.length;
  const shouldShow = Boolean(sharer && count > 0);
  els.accessRequestSection.hidden = !shouldShow;
  els.accessRequestCount.textContent = String(count);
  if (!shouldShow) {
    els.accessRequestList.innerHTML = "";
    return;
  }
  if (loading) {
    els.accessRequestList.innerHTML = '<div class="access-request-empty">Loading requests...</div>';
    return;
  }
  els.accessRequestList.innerHTML = requests
    .map(
      (request) => `
        <div class="access-request-row">
          ${memberAvatar({ ...request, role: "editor" })}
          <span>
            <strong>${escapeHtml(request.display_name || displayNameFromEmail(request.email))}</strong>
            <small>${escapeHtml(request.email)}</small>
          </span>
          <button class="request-approve-button" type="button" data-approve-access="${escapeAttr(request.email)}">Approve</button>
          <button class="icon-button small request-decline-button" type="button" aria-label="Decline access for ${escapeAttr(request.email)}" data-decline-access="${escapeAttr(request.email)}">${icon.trash}</button>
        </div>
      `,
    )
    .join("");
  els.accessRequestList.querySelectorAll("[data-approve-access]").forEach((button) => {
    button.addEventListener("click", () => approveAccessRequest(button.dataset.approveAccess));
  });
  els.accessRequestList.querySelectorAll("[data-decline-access]").forEach((button) => {
    button.addEventListener("click", () => declineAccessRequest(button.dataset.declineAccess));
  });
}

function optimisticList(id, title) {
  const now = new Date().toISOString();
  const ownerEmail = state.session?.email || currentDevUser();
  const ownerName = state.session?.display_name || displayNameFromEmail(ownerEmail);
  const list = {
    id,
    title,
    owner_email: ownerEmail,
    owner_name: ownerName,
    current_user_role: "owner",
    current_user_can_share: true,
    marker_color: defaultListMarkerColor,
    marker_icon: defaultListMarkerIcon,
    member_count: 1,
    open_task_count: 0,
    completed_task_count: 0,
    pending_access_request_count: 0,
    created_at: now,
    updated_at: now,
    pending: true,
  };
  return {
    list,
    members: [{ email: ownerEmail, role: "owner", can_share: true, display_name: ownerName, created_at: now }],
    open_tasks: [],
    completed_tasks: [],
    completed_tasks_loaded: true,
    completed_tasks_loading: false,
    activity: [optimisticActivity("created_list", { title }, now, id)],
    access_requests: [],
    details_loaded: true,
    details_loading: false,
  };
}

function placeholderListDetail(summary) {
  const owner = {
    email: summary.owner_email,
    role: "owner",
    can_share: true,
    display_name: summary.owner_name || displayNameFromEmail(summary.owner_email),
    created_at: summary.created_at,
  };
  return {
    list: summary,
    members: [owner],
    open_tasks: [],
    completed_tasks: [],
    completed_tasks_loaded: false,
    completed_tasks_loading: false,
    activity: [],
    access_requests: [],
    details_loaded: false,
    details_loading: false,
    loading: true,
  };
}

function optimisticOpenTask(id, listId, title, dueDate) {
  const now = new Date().toISOString();
  return {
    id,
    list_id: listId,
    title,
    due_date: dueDate,
    status: "open",
    created_by_email: state.session?.email || currentDevUser(),
    completed_by_email: null,
    created_at: now,
    updated_at: now,
    completed_at: null,
    sort_order: nextClientOpenTaskSortOrder(),
    pending: true,
  };
}

function createTaskMutation(localTaskId, listId, createPayload, snapshot) {
  const mutation = {
    localTaskId,
    taskId: localTaskId,
    listId,
    createPayload,
    createKey: newClientId("create_key"),
    deleteKey: newClientId("delete_key"),
    createPending: true,
    createPromise: null,
    deletePromise: null,
    pendingPatch: {},
    patchTimer: 0,
    flushing: false,
    needsFlush: false,
    deleteRequested: false,
    deleteSent: false,
    deleteUndone: false,
    deletedTask: null,
    baseline: snapshot,
    serverBaseline: null,
    expectedRevision: null,
  };
  taskMutations.set(localTaskId, mutation);
  return mutation;
}

function taskMutationFor(taskId, listId = state.active?.list.id, snapshot = null) {
  const resolvedId = resolvedTaskIds.get(taskId) || taskId;
  const mutation = taskMutations.get(taskId) || taskMutations.get(resolvedId);
  if (mutation) {
    if (!mutation.baseline && snapshot) mutation.baseline = snapshot;
    if (mutation.expectedRevision === null && snapshot) {
      const baselineTask = taskFromSnapshot(snapshot, resolvedId) || taskFromSnapshot(snapshot, taskId);
      if (Number.isInteger(Number(baselineTask?.revision))) mutation.expectedRevision = Number(baselineTask.revision);
    }
    return mutation;
  }
  const baselineTask = taskFromSnapshot(snapshot, resolvedId) || findActiveTask(resolvedId) || findActiveTask(taskId);
  const next = {
    localTaskId: taskId,
    taskId: resolvedId,
    listId,
    createPayload: null,
    createKey: "",
    deleteKey: newClientId("delete_key"),
    createPending: false,
    createPromise: null,
    deletePromise: null,
    pendingPatch: {},
    patchTimer: 0,
    flushing: false,
    needsFlush: false,
    deleteRequested: false,
    deleteSent: false,
    deleteUndone: false,
    deletedTask: null,
    baseline: snapshot,
    serverBaseline: null,
    expectedRevision: Number.isInteger(Number(baselineTask?.revision)) ? Number(baselineTask.revision) : null,
  };
  taskMutations.set(resolvedId, next);
  return next;
}

function enqueueTaskPatch(taskId, patch, snapshot = null) {
  const task = findActiveTask(taskId);
  const mutation = taskMutationFor(taskId, task?.list_id || state.active?.list.id, snapshot);
  mutation.pendingPatch = { ...mutation.pendingPatch, ...patch };
  if (mutation.deleteRequested) return;
  scheduleTaskMutationFlush(mutation);
}

function scheduleTaskMutationFlush(mutation, delay = taskPatchDebounceMs) {
  if (mutation.patchTimer) window.clearTimeout(mutation.patchTimer);
  mutation.patchTimer = window.setTimeout(() => {
    mutation.patchTimer = 0;
    flushTaskMutation(mutation);
  }, delay);
}

async function flushTaskMutation(mutation) {
  if (!mutation || mutation.flushing) {
    if (mutation) mutation.needsFlush = true;
    return;
  }
  mutation.flushing = true;
  try {
    if (mutation.createPromise) await mutation.createPromise;
    if (mutation.deleteRequested && !mutation.deleteUndone) {
      await flushTaskDelete(mutation);
      return;
    }
    while (Object.keys(mutation.pendingPatch).length) {
      const patch = mutation.pendingPatch;
      mutation.pendingPatch = {};
      const taskId = resolvedTaskIds.get(mutation.taskId) || mutation.taskId;
      const body = { ...patch };
      if (mutation.expectedRevision !== null) body.revision = mutation.expectedRevision;
      const result = await apiFetchWithRetry(`/api/tasks/${encodeURIComponent(taskId)}`, {
        method: "PATCH",
        body,
      });
      mutation.serverBaseline = result.task;
      mutation.expectedRevision = Number.isInteger(Number(result.task?.revision)) ? Number(result.task.revision) : null;
      adoptServerTask(taskId, result.task, { preserveOptimistic: Object.keys(mutation.pendingPatch).length > 0 });
    }
    taskMutations.delete(mutation.taskId);
    scheduleQuietReconcile(mutation.listId);
  } catch (error) {
    handleTaskMutationFailure(mutation, error);
  } finally {
    mutation.flushing = false;
    if (mutation.needsFlush) {
      mutation.needsFlush = false;
      scheduleTaskMutationFlush(mutation, 0);
    }
  }
}

async function flushTaskDelete(mutation) {
  if (mutation.deleteSent || mutation.deleteUndone) return;
  mutation.deleteSent = true;
  const taskId = resolvedTaskIds.get(mutation.taskId) || mutation.taskId;
  const headers = { "idempotency-key": mutation.deleteKey };
  if (mutation.expectedRevision !== null) headers["if-match-revision"] = String(mutation.expectedRevision);
  mutation.deletePromise = apiFetchWithRetry(`/api/tasks/${encodeURIComponent(taskId)}`, {
    method: "DELETE",
    headers,
  });
  await mutation.deletePromise;
  mutation.deletePromise = null;
  if (mutation.deleteUndone) {
    await restoreDeletedTasks(mutation.listId, [serverTaskForRestore(mutation.deletedTask, mutation)], { quiet: true });
    taskMutations.delete(mutation.taskId);
    return;
  }
  taskMutations.delete(mutation.taskId);
  scheduleQuietReconcile(mutation.listId);
}

function adoptServerTask(oldTaskId, serverTask, { preserveOptimistic = false } = {}) {
  if (!serverTask?.id) return;
  resolvedTaskIds.set(oldTaskId, serverTask.id);
  if (activeTaskDragId === oldTaskId) {
    deferredTaskAdoptions.set(oldTaskId, { serverTask, preserveOptimistic });
    return;
  }
  const mutation = taskMutations.get(oldTaskId);
  if (mutation && oldTaskId !== serverTask.id) {
    taskMutations.delete(oldTaskId);
    mutation.taskId = serverTask.id;
    mutation.createPending = false;
    mutation.createPromise = null;
    mutation.serverBaseline = serverTask;
    mutation.expectedRevision = Number.isInteger(Number(serverTask?.revision)) ? Number(serverTask.revision) : null;
    taskMutations.set(serverTask.id, mutation);
  }
  replaceTaskEverywhere(oldTaskId, serverTask, { preserveOptimistic });
}

function replaceTaskEverywhere(oldTaskId, serverTask, { preserveOptimistic = false } = {}) {
  const replaceInDetail = (detail) => {
    if (!detail) return detail;
    let changed = false;
    const replaceTask = (task) => {
      if (task.id !== oldTaskId && task.id !== serverTask.id) return task;
      changed = true;
      return preserveOptimistic
        ? { ...serverTask, ...task, id: serverTask.id, list_id: serverTask.list_id, pending: false }
        : { ...serverTask, pending: false };
    };
    const next = {
      ...detail,
      open_tasks: sortOpenTasksClient((detail.open_tasks || []).map(replaceTask)),
      completed_tasks: sortCompletedTasksClient((detail.completed_tasks || []).map(replaceTask)),
    };
    return changed ? next : detail;
  };

  if (state.active) state.active = replaceInDetail(state.active);
  for (const [listId, detail] of listDetailCache.entries()) {
    const next = replaceInDetail(detail);
    if (next !== detail) setCachedListDetail(listId, next);
  }
  cacheActiveDetail();
  render();
}

function handleTaskMutationFailure(mutation, error) {
  if (mutation?.baseline) restoreUiState(mutation.baseline);
  else render();
  if (mutation?.taskId) taskMutations.delete(mutation.taskId);
  if (mutation?.localTaskId) taskMutations.delete(mutation.localTaskId);
  showToast(error.message || "Task update failed");
  scheduleQuietReconcile(mutation?.listId);
}

function listHasPendingTaskMutations(listId) {
  if (pendingTaskReorders > 0 || activeTaskDragId || deferredTaskAdoptions.size > 0) return true;
  const serverListId = resolvedListIds.get(listId) || listId;
  return Array.from(taskMutations.values()).some((mutation) => {
    const mutationListId = resolvedListIds.get(mutation.listId) || mutation.listId;
    return mutationListId === serverListId;
  });
}

function scheduleQuietReconcile(listId, delay = reconcileDelayMs) {
  const serverListId = resolvedListIds.get(listId) || listId;
  if (!serverListId) return;
  window.clearTimeout(reconcileTimers.get(serverListId));
  reconcileTimers.set(
    serverListId,
    window.setTimeout(() => {
      reconcileTimers.delete(serverListId);
      if (listHasPendingTaskMutations(serverListId)) {
        scheduleQuietReconcile(serverListId);
        return;
      }
      syncListAndSummaries(serverListId, { quiet: true });
    }, delay),
  );
}

function optimisticActivity(action, metadata, createdAt = new Date().toISOString(), listId = state.active?.list.id || "") {
  const actorEmail = state.session?.email || currentDevUser();
  return {
    id: null,
    list_id: listId,
    actor_email: actorEmail,
    actor_name: state.session?.display_name || displayNameFromEmail(actorEmail),
    action,
    metadata: metadata ? JSON.stringify(metadata) : null,
    created_at: createdAt,
    pending: true,
  };
}

function replaceOptimisticList(tempListId, created) {
  const tempSummary = findListSummary(tempListId);
  const openTaskCount = Math.max(Number(created.list.open_task_count || 0), Number(tempSummary?.open_task_count || 0));
  const createdSummary = { ...created.list, open_task_count: openTaskCount };
  const createdDetail = { ...created, list: createdSummary };
  listDetailCache.delete(tempListId);
  setCachedListDetail(created.list.id, createdDetail);
  state.groups = {
    owned: sortListSummaries(state.groups.owned.map((list) => (list.id === tempListId ? createdSummary : list))),
    shared: state.groups.shared,
  };

  if (state.activeListId === tempListId) {
    state.activeListId = created.list.id;
    writeActiveListToUrl(created.list.id);
  }

  if (state.active?.list.id === tempListId) {
    const pendingTasks = state.active.open_tasks
      .filter((task) => task.pending)
      .map((task) => ({ ...task, list_id: created.list.id }));
    state.active = {
      ...createdDetail,
      list: createdSummary,
      open_tasks: sortOpenTasksClient([...pendingTasks, ...created.open_tasks]),
    };
    setCachedListDetail(created.list.id, state.active);
  }
  maybeShowMarkerCoach(created.list.id);
  render();
}

function replaceOptimisticTask(tempTaskId, task) {
  if (!state.active?.open_tasks.some((item) => item.id === tempTaskId)) return;
  state.active.open_tasks = sortOpenTasksClient(
    state.active.open_tasks.map((item) => (item.id === tempTaskId ? task : item)),
  );
  setCachedListDetail(state.active.list.id, state.active);
  render();
}

function removeOptimisticTask(tempTaskId) {
  if (!state.active?.open_tasks.some((task) => task.id === tempTaskId)) return;
  state.active.open_tasks = state.active.open_tasks.filter((task) => task.id !== tempTaskId);
  cacheActiveDetail();
}

function removeListSummary(listId) {
  state.groups = {
    owned: state.groups.owned.filter((list) => list.id !== listId),
    shared: state.groups.shared.filter((list) => list.id !== listId),
  };
}

function filterPendingListDeletes(groups) {
  if (!pendingListDeletes.size) return groups;
  return {
    owned: (groups.owned || []).filter((list) => !pendingListDeletes.has(list.id)),
    shared: (groups.shared || []).filter((list) => !pendingListDeletes.has(list.id)),
  };
}

function updateListSummary(listId, updater) {
  state.groups = {
    owned: state.groups.owned.map((list) => (list.id === listId ? updater(list) : list)),
    shared: state.groups.shared.map((list) => (list.id === listId ? updater(list) : list)),
  };
}

function applyListMarkerPreference(listId, marker) {
  const resolvedId = resolvedListIds.get(listId) || listId;
  const preferences = listMarkerPreferences(marker);
  const update = (list) => ({ ...list, ...preferences });
  const matches = (list) => list.id === listId || list.id === resolvedId;
  state.groups = {
    owned: state.groups.owned.map((list) => (matches(list) ? update(list) : list)),
    shared: state.groups.shared.map((list) => (matches(list) ? update(list) : list)),
  };
  for (const key of [listId, resolvedId]) {
    const cached = getCachedListDetail(key);
    if (cached?.list && matches(cached.list)) {
      setCachedListDetail(key, { ...cached, list: update(cached.list) });
    }
  }
  if (state.active?.list && matches(state.active.list)) {
    state.active = { ...state.active, list: update(state.active.list) };
    cacheActiveDetail();
  }
  if (state.session?.email) writeListSurfaceCache(state.session.email, state.groups);
  render();
}

function snapshotUiState() {
  return {
    activeListId: state.activeListId,
    active: clonePlain(state.active),
    groups: clonePlain(state.groups),
    completedOpen: state.completedOpen,
    selectedCompleted: Array.from(state.selectedCompleted),
    editingTaskId: state.editingTaskId,
    editingTaskOriginalTitle: state.editingTaskOriginalTitle,
    mobileExpandedTaskId: state.mobileExpandedTaskId,
    markerPicker: clonePlain(state.markerPicker),
    markerCoach: clonePlain(state.markerCoach),
  };
}

function restoreUiState(snapshot, { repaint = true } = {}) {
  state.activeListId = snapshot.activeListId;
  state.active = clonePlain(snapshot.active);
  state.groups = clonePlain(snapshot.groups);
  state.completedOpen = snapshot.completedOpen;
  state.selectedCompleted = new Set(snapshot.selectedCompleted);
  state.editingTaskId = snapshot.editingTaskId;
  state.editingTaskOriginalTitle = snapshot.editingTaskOriginalTitle;
  state.mobileExpandedTaskId = snapshot.mobileExpandedTaskId || null;
  state.markerPicker = snapshot.markerPicker || { open: false, listId: null };
  state.markerCoach = snapshot.markerCoach || { open: false, listId: null };
  if (state.active?.list.id) setCachedListDetail(state.active.list.id, state.active);
  if (repaint) render();
}

function clonePlain(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function updateTaskInActive(taskId, update) {
  if (!state.active) return false;
  let changed = false;
  state.active.open_tasks = sortOpenTasksClient(
    state.active.open_tasks.map((task) => {
      if (task.id !== taskId) return task;
      changed = true;
      return update(task);
    }),
  );
  state.active.completed_tasks = sortCompletedTasksClient(
    state.active.completed_tasks.map((task) => {
      if (task.id !== taskId) return task;
      changed = true;
      return update(task);
    }),
  );
  return changed;
}

function removeTaskFromActive(taskId) {
  if (!state.active) return null;
  const openTask = state.active.open_tasks.find((task) => task.id === taskId);
  const completedTask = state.active.completed_tasks.find((task) => task.id === taskId);
  const removed = openTask || completedTask || null;
  if (!removed) return null;
  state.active.open_tasks = state.active.open_tasks.filter((task) => task.id !== taskId);
  state.active.completed_tasks = state.active.completed_tasks.filter((task) => task.id !== taskId);
  return removed;
}

function findActiveTask(taskId) {
  if (!state.active) return null;
  return (
    state.active.open_tasks.find((task) => task.id === taskId) ||
    state.active.completed_tasks.find((task) => task.id === taskId) ||
    null
  );
}

function taskFromSnapshot(snapshot, taskId) {
  const detail = snapshot?.active;
  if (!detail || !taskId) return null;
  return (
    (detail.open_tasks || []).find((task) => task.id === taskId) ||
    (detail.completed_tasks || []).find((task) => task.id === taskId) ||
    null
  );
}

function cacheActiveDetail() {
  if (state.active?.list.id) setCachedListDetail(state.active.list.id, state.active);
}

function getCachedListDetail(listId) {
  if (listDetailCache.has(listId)) return listDetailCache.get(listId);
  const cached = readSessionListDetailCache(listId);
  if (cached) {
    listDetailCache.set(listId, cached);
    return cached;
  }
  return null;
}

function setCachedListDetail(listId, detail) {
  if (!listId || !detail) return;
  listDetailCache.set(listId, detail);
  writeSessionListDetailCache(listId, detail);
}

function listDetailSessionCacheKey(listId) {
  const email = normalizeEmail(state.session?.email || initialKnownUserEmail());
  if (!email || !listId) return "";
  return `sharedLists:listDetail:v1:${email}:${listId}`;
}

function readSessionListDetailCache(listId) {
  const key = listDetailSessionCacheKey(listId);
  if (!key) return null;
  return (
    readStoredListDetail(window.sessionStorage, key, listId, listDetailCacheMaxAgeMs) ||
    readStoredListDetail(window.localStorage, key, listId, listDetailPersistentCacheMaxAgeMs)
  );
}

function writeSessionListDetailCache(listId, detail) {
  const key = listDetailSessionCacheKey(listId);
  if (!key) return;
  const saved_at = new Date().toISOString();
  try {
    window.sessionStorage.setItem(
      key,
      JSON.stringify({
        list_id: listId,
        saved_at,
        detail,
      }),
    );
  } catch {
    // Detail caching is best-effort; memory cache still handles the current session.
  }
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        list_id: listId,
        saved_at,
        detail: persistentListDetail(detail),
      }),
    );
  } catch {
    // Persistent detail cache is only used to speed up the next launch.
  }
}

function readStoredListDetail(storage, key, listId, maxAgeMs) {
  try {
    const cached = JSON.parse(storage.getItem(key) || "null");
    if (!cached || cached.list_id !== listId || !cached.saved_at || !cached.detail?.list) return null;
    if (Date.now() - Date.parse(cached.saved_at) > maxAgeMs) return null;
    return cached.detail;
  } catch {
    return null;
  }
}

function persistentListDetail(detail) {
  return {
    ...detail,
    completed_tasks: [],
    completed_tasks_loaded: false,
    completed_tasks_loading: false,
    activity: (detail.activity || []).slice(0, 20),
  };
}

async function syncListAndSummaries(listId, { quiet = false } = {}) {
  const serverListId = resolvedListIds.get(listId) || listId;
  if (quiet && listHasPendingTaskMutations(serverListId)) {
    scheduleQuietReconcile(serverListId);
    return;
  }
  const loadToken = state.activeListId === listId || state.activeListId === serverListId ? ++activeListLoadToken : activeListLoadToken;
  try {
    const [active, groups] = await Promise.all([
      fetchListDetail(serverListId, { force: true }),
      apiFetch("/api/lists"),
    ]);
    state.groups = groups;
    if (state.activeListId === listId || state.activeListId === serverListId) {
      state.activeListId = serverListId;
      state.active = active;
      state.loading = false;
    }
    render();
    if (state.completedOpen) loadCompletedTasks(serverListId);
    if (state.activeListId === serverListId) loadListDetails(serverListId, loadToken, { quiet: true });
    prefetchVisibleLists();
  } catch {
    // The optimistic action already succeeded locally; the next explicit refresh will reconcile.
  }
}

async function fetchListDetail(listId, { force = false } = {}) {
  if (!force) {
    const cached = getCachedListDetail(listId);
    if (cached) return cached;
  }
  const existingRequest = listDetailRequests.get(listId);
  if (existingRequest) return existingRequest.promise;
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const request = apiFetchWithRetry(
    `/api/lists/${encodeURIComponent(listId)}/task-surface`,
    { signal: controller?.signal },
    { retries: 1 },
  )
    .then((active) => {
      const detail = normalizeListDetail(active, listId);
      setCachedListDetail(listId, detail);
      return detail;
    })
    .finally(() => {
      if (listDetailRequests.get(listId)?.promise === request) listDetailRequests.delete(listId);
    });
  listDetailRequests.set(listId, { promise: request, controller });
  return request;
}

async function fetchListDetails(listId, { force = false } = {}) {
  if (!force) {
    const cached = getCachedListDetail(listId);
    if (cached?.details_loaded) return pickCachedListDetails(cached);
  }
  const existingRequest = listSecondaryDetailRequests.get(listId);
  if (existingRequest) return existingRequest.promise;
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const request = apiFetchWithRetry(
    `/api/lists/${encodeURIComponent(listId)}/details`,
    { signal: controller?.signal },
    { retries: 1 },
  )
    .then((details) => normalizeListDetails(details, listId))
    .finally(() => {
      if (listSecondaryDetailRequests.get(listId)?.promise === request) listSecondaryDetailRequests.delete(listId);
    });
  listSecondaryDetailRequests.set(listId, { promise: request, controller });
  return request;
}

async function loadListDetails(listId, loadToken, { quiet = false } = {}) {
  if (!listId) return;
  const current = getCachedListDetail(listId) || state.active;
  if (state.active?.list.id === listId && !state.active.details_loaded) {
    state.active.details_loading = true;
    renderDetails();
  }
  try {
    const details = await fetchListDetails(listId, { force: true });
    if (loadToken !== activeListLoadToken || state.activeListId !== listId) return;
    if (quiet && listHasPendingTaskMutations(listId)) {
      scheduleQuietReconcile(listId);
      return;
    }
    const base = state.active?.list.id === listId ? state.active : current;
    const merged = mergeListDetails(base, details);
    state.active = merged;
    setCachedListDetail(listId, merged);
    renderMain();
    renderDetails();
  } catch (error) {
    if (isAbortError(error)) return;
    if (state.active?.list.id === listId) {
      state.active.details_loading = false;
      renderDetails();
    }
    if (!quiet) showToast(error.message);
  }
}

async function refreshActiveListDetail(listId, loadToken, { quiet = false } = {}) {
  if (quiet && listHasPendingTaskMutations(listId)) {
    scheduleQuietReconcile(listId);
    return;
  }
  try {
    const active = await fetchListDetail(listId, { force: true });
    if (loadToken !== activeListLoadToken || state.activeListId !== listId) return;
    if (quiet && listHasPendingTaskMutations(listId)) {
      scheduleQuietReconcile(listId);
      return;
    }
    state.active = active;
    state.loading = false;
    render();
    if (state.completedOpen) loadCompletedTasks(listId);
    loadListDetails(listId, loadToken, { quiet: true });
  } catch (error) {
    if (isAbortError(error)) return;
    if (loadToken !== activeListLoadToken || state.activeListId !== listId) return;
    showToast(error.message);
  }
}

function prefetchListDetail(listId) {
  if (!listId || listDetailCache.has(listId) || listDetailRequests.has(listId)) return;
  fetchListDetail(listId).catch(() => {});
}

function abortStaleListDetailRequests(activeListId) {
  for (const [listId, request] of listDetailRequests.entries()) {
    if (listId === activeListId) continue;
    request.controller?.abort();
    listDetailRequests.delete(listId);
  }
  for (const [listId, request] of listSecondaryDetailRequests.entries()) {
    if (listId === activeListId) continue;
    request.controller?.abort();
    listSecondaryDetailRequests.delete(listId);
  }
}

function isAbortError(error) {
  return error?.name === "AbortError";
}

function prefetchVisibleLists() {
  const listIds = allListSummaries()
    .map((list) => list.id)
    .filter((listId) => listId !== state.activeListId)
    .filter((listId) => !listDetailCache.has(listId) && !listDetailRequests.has(listId));
  if (!listIds.length || prefetchQueued) return;
  prefetchQueued = true;
  const run = async () => {
    for (let index = 0; index < listIds.length; index += listPrefetchConcurrency) {
      const batch = listIds.slice(index, index + listPrefetchConcurrency);
      await Promise.allSettled(batch.map((listId) => fetchListDetail(listId)));
    }
  };
  const runLater = () => {
    run().finally(() => {
      prefetchQueued = false;
    });
  };
  if (window.requestIdleCallback) window.requestIdleCallback(runLater, { timeout: 500 });
  else window.setTimeout(runLater, 80);
}

async function loadCompletedTasks(listId = state.active?.list.id, { force = false } = {}) {
  if (!listId || !state.active || state.active.list.id !== listId) return;
  if (!force && state.active.completed_tasks_loaded) return;
  if (completedTaskRequests.has(listId)) return completedTaskRequests.get(listId);
  state.active.completed_tasks_loading = true;
  cacheActiveDetail();
  renderCompleted();
  const request = apiFetchWithRetry(
    `/api/lists/${encodeURIComponent(listId)}/completed-tasks`,
    {},
    { retries: 1 },
  )
    .then((data) => {
      if (state.active?.list.id !== listId) return data.completed_tasks || [];
      state.active.completed_tasks = sortCompletedTasksClient(data.completed_tasks || []);
      state.active.completed_tasks_loaded = true;
      state.active.completed_tasks_loading = false;
      state.selectedCompleted = new Set([...state.selectedCompleted].filter((id) => state.active.completed_tasks.some((task) => task.id === id)));
      cacheActiveDetail();
      renderCompleted();
      return state.active.completed_tasks;
    })
    .catch((error) => {
      if (state.active?.list.id === listId) {
        state.active.completed_tasks_loading = false;
        cacheActiveDetail();
        renderCompleted();
      }
      showToast(error.message);
      return [];
    })
    .finally(() => completedTaskRequests.delete(listId));
  completedTaskRequests.set(listId, request);
  return request;
}

function normalizeListDetail(active, listId) {
  const cached = listDetailCache.get(listId);
  const detailsLoaded = active.details_loaded !== undefined ? Boolean(active.details_loaded) : true;
  const incomingMembers = Array.isArray(active.members) ? active.members : null;
  const incomingActivity = Array.isArray(active.activity) ? active.activity : null;
  const incomingAccessRequests = Array.isArray(active.access_requests) ? active.access_requests : null;
  const detail = {
    ...active,
    members: incomingMembers || cached?.members || [],
    activity: incomingActivity || cached?.activity || [],
    access_requests: incomingAccessRequests || cached?.access_requests || [],
    completed_tasks: active.completed_tasks || [],
    completed_tasks_loaded: Boolean(active.completed_tasks_loaded),
    completed_tasks_loading: false,
    details_loaded: detailsLoaded,
    details_loading: !detailsLoaded,
  };
  if (!detail.completed_tasks_loaded && shouldReuseCachedCompletedTasks(cached, detail)) {
    detail.completed_tasks = cached.completed_tasks || [];
    detail.completed_tasks_loaded = true;
  }
  return detail;
}

function shouldReuseCachedCompletedTasks(cached, detail) {
  if (!cached?.completed_tasks_loaded || !Array.isArray(cached.completed_tasks)) return false;
  const cachedCount = Number(cached.list?.completed_task_count ?? cached.completed_tasks.length);
  const detailCount = Number(detail.list?.completed_task_count ?? cachedCount);
  return cached.completed_tasks.length === cachedCount && cached.completed_tasks.length === detailCount;
}

function normalizeListDetails(details, listId) {
  return {
    list_id: listId,
    list: details.list || findListSummary(listId) || getCachedListDetail(listId)?.list || null,
    members: Array.isArray(details.members) ? details.members : [],
    activity: Array.isArray(details.activity) ? details.activity : [],
    access_requests: Array.isArray(details.access_requests) ? details.access_requests : [],
    details_loaded: true,
  };
}

function pickCachedListDetails(detail) {
  return {
    list_id: detail.list?.id,
    list: detail.list,
    members: detail.members || [],
    activity: detail.activity || [],
    access_requests: detail.access_requests || [],
    details_loaded: Boolean(detail.details_loaded),
  };
}

function mergeListDetails(base, details) {
  if (!base) return normalizeListDetail({ ...details, open_tasks: [], completed_tasks: [] }, details.list_id || details.list?.id);
  return {
    ...base,
    list: details.list ? { ...base.list, ...details.list } : base.list,
    members: details.members || base.members || [],
    activity: details.activity || base.activity || [],
    access_requests: details.access_requests || base.access_requests || [],
    details_loaded: true,
    details_loading: false,
  };
}

function commitSharing(active, listId = state.active?.list.id) {
  const detail = normalizeListDetail(active, active?.list?.id || listId);
  const serverListId = detail.list.id;
  if (state.active?.list.id === listId || state.active?.list.id === serverListId) {
    state.activeListId = serverListId;
    state.active = {
      ...state.active,
      list: { ...state.active.list, ...detail.list },
      members: detail.members,
      activity: detail.activity,
      access_requests: detail.access_requests,
      details_loaded: true,
      details_loading: false,
    };
    setCachedListDetail(serverListId, state.active);
  } else {
    setCachedListDetail(serverListId, detail);
  }
  updateListSummary(serverListId, (list) => ({ ...list, ...detail.list }));
  if (state.session?.email) writeListSurfaceCache(state.session.email, state.groups);
  renderSharing();
}

function adjustOpenTaskCount(listId, amount) {
  const resolvedId = resolvedListIds.get(listId) || listId;
  state.groups = {
    owned: adjustGroupOpenTaskCount(state.groups.owned, listId, resolvedId, amount),
    shared: adjustGroupOpenTaskCount(state.groups.shared, listId, resolvedId, amount),
  };
  if (state.active?.list.id === listId || state.active?.list.id === resolvedId) {
    state.active.list.open_task_count = Math.max(0, Number(state.active.list.open_task_count || 0) + amount);
  }
}

function adjustGroupOpenTaskCount(group, listId, resolvedId, amount) {
  return group.map((list) => {
    if (list.id !== listId && list.id !== resolvedId) return list;
    return {
      ...list,
      open_task_count: Math.max(0, Number(list.open_task_count || 0) + amount),
    };
  });
}

function adjustCompletedTaskCount(listId, amount) {
  const resolvedId = resolvedListIds.get(listId) || listId;
  state.groups = {
    owned: adjustGroupCompletedTaskCount(state.groups.owned, listId, resolvedId, amount),
    shared: adjustGroupCompletedTaskCount(state.groups.shared, listId, resolvedId, amount),
  };
  if (state.active?.list.id === listId || state.active?.list.id === resolvedId) {
    state.active.list.completed_task_count = Math.max(0, Number(state.active.list.completed_task_count || 0) + amount);
  }
}

function adjustGroupCompletedTaskCount(group, listId, resolvedId, amount) {
  return group.map((list) => {
    if (list.id !== listId && list.id !== resolvedId) return list;
    return {
      ...list,
      completed_task_count: Math.max(0, Number(list.completed_task_count || 0) + amount),
    };
  });
}

function findListSummary(listId) {
  return allListSummaries().find((list) => list.id === listId);
}

async function resolveServerListId(listId) {
  if (resolvedListIds.has(listId)) return resolvedListIds.get(listId);
  const pending = pendingListCreates.get(listId);
  if (!pending) return listId;
  const created = await pending;
  return created.list.id;
}

function sortListSummaries(lists) {
  return [...lists].sort((a, b) => a.title.localeCompare(b.title));
}

function sortOpenTasksClient(tasks) {
  return [...tasks].sort((a, b) => {
    const order = Number(a.sort_order || 0) - Number(b.sort_order || 0);
    if (order !== 0) return order;
    const created = String(a.created_at).localeCompare(String(b.created_at));
    if (created !== 0) return created;
    return String(a.id).localeCompare(String(b.id));
  });
}

function assignClientSortOrders(tasks) {
  return tasks.map((task, index) => ({ ...task, sort_order: (index + 1) * 1024 }));
}

function nextClientOpenTaskSortOrder() {
  return (
    Math.max(
      0,
      ...(state.active?.open_tasks || []).map((task) => Number(task.sort_order || 0)),
    ) + 1024
  );
}

function sortCompletedTasksClient(tasks) {
  return [...tasks].sort((a, b) => String(b.completed_at || b.updated_at || "").localeCompare(String(a.completed_at || a.updated_at || "")));
}

function sortMembersClient(members) {
  return [...members].sort((a, b) => {
    if (a.role === "owner" && b.role !== "owner") return -1;
    if (a.role !== "owner" && b.role === "owner") return 1;
    if (a.can_share && !b.can_share) return -1;
    if (!a.can_share && b.can_share) return 1;
    return String(a.display_name || a.email).localeCompare(String(b.display_name || b.email));
  });
}

function normalizeClientTitle(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function listMarkerColor(value) {
  const color = String(value || defaultListMarkerColor).trim().toLowerCase();
  return listMarkerColorIds.has(color) ? color : defaultListMarkerColor;
}

function listMarkerIcon(value) {
  const name = String(value || defaultListMarkerIcon).trim().toLowerCase();
  return listMarkerIconMap.get(name) || listMarkerIconMap.get(defaultListMarkerIcon);
}

function listMarkerPreferences(value = {}) {
  return {
    marker_color: listMarkerColor(value.marker_color),
    marker_icon: listMarkerIcon(value.marker_icon).id,
  };
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeInviteValue(value) {
  const trimmed = String(value || "").trim();
  const email = normalizeEmail(trimmed);
  if (!email) return "";
  if (state.people.selected && normalizeEmail(state.people.selected.email) === email) return email;
  if (email.includes("@")) return email;
  if (/^[a-z0-9._-]+$/i.test(trimmed)) return email;
  return email;
}

function isAllowedEmail(value) {
  const email = normalizeEmail(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function newClientId(prefix) {
  return `${prefix}_local_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("accept", "application/json");
  if (options.body !== undefined) headers.set("content-type", "application/json");
  const devUser = currentDevUser();
  if (devUser) headers.set("x-dev-user-email", devUser);
  const timeoutMs = Number.isFinite(options.timeoutMs)
    ? Math.max(0, Number(options.timeoutMs))
    : (options.method || "GET").toUpperCase() === "GET"
      ? defaultReadRequestTimeoutMs
      : defaultMutationRequestTimeoutMs;
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const upstreamSignal = options.signal;
  let timedOut = false;
  let timeoutId = 0;
  const abortFromUpstream = () => controller?.abort(upstreamSignal?.reason);
  if (controller && upstreamSignal) {
    if (upstreamSignal.aborted) abortFromUpstream();
    else upstreamSignal.addEventListener("abort", abortFromUpstream, { once: true });
  }
  if (controller && timeoutMs > 0) {
    timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
  }
  let response;
  try {
    response = await fetch(path, {
      method: options.method || "GET",
      headers,
      signal: controller?.signal || upstreamSignal,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch (error) {
    if (timedOut) {
      const timeoutError = new Error("Shared Lists took too long to respond");
      timeoutError.name = "TimeoutError";
      timeoutError.transient = true;
      timeoutError.timedOut = true;
      throw timeoutError;
    }
    if (!isAbortError(error)) error.transient = true;
    throw error;
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
    upstreamSignal?.removeEventListener?.("abort", abortFromUpstream);
  }
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const error = new Error("Sign in to refresh lists");
    error.authRequired = true;
    error.authRefreshRequired = true;
    throw error;
  }
  if (!response.ok) {
    const error = new Error(data.error || "Request failed");
    error.status = response.status;
    error.authRequired = response.status === 401;
    error.authRefreshRequired = response.status === 401;
    error.transient = isTransientStatus(response.status);
    throw error;
  }
  return data;
}

async function apiFetchWithRetry(path, options = {}, { retries = 2 } = {}) {
  let attempt = 0;
  while (true) {
    try {
      return await apiFetch(path, options);
    } catch (error) {
      if (attempt >= retries || !isTransientError(error) || options.signal?.aborted) throw error;
      await sleep(retryDelay(attempt));
      attempt += 1;
    }
  }
}

function isTransientError(error) {
  return Boolean(error?.transient && !error?.authRefreshRequired && !isAbortError(error));
}

function isTransientStatus(status) {
  return [408, 429, 500, 502, 503, 504].includes(Number(status));
}

function retryDelay(attempt) {
  return 250 + attempt * 500;
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function requiresAuthRefresh(error) {
  return isAuthRequiredError(error);
}

function isAuthRequiredError(error) {
  return Boolean(error?.authRequired || error?.authRefreshRequired || error?.status === 401);
}

function enterSignedOutState() {
  state.authRequired = true;
  state.authConfirmed = false;
  state.connectionIssue = false;
  state.loading = false;
  state.session = null;
  state.groups = { owned: [], shared: [] };
  state.activeListId = null;
  state.active = null;
  state.accessRequest = null;
  state.fastSurfaceHydrated = false;
  els.currentUserLabel.textContent = "Sign in required";
  render();
}

function signInUrl() {
  const signIn = new URL(signInPath, window.location.origin);
  signIn.searchParams.set("return_to", currentAuthReturnTo({ markAuthAttempt: true }));
  return `${signIn.pathname}${signIn.search}`;
}

function signOutUrl() {
  const signOut = new URL(signOutPath, window.location.origin);
  signOut.searchParams.set("return_to", currentAuthReturnTo());
  return `${signOut.pathname}${signOut.search}`;
}

function currentAuthReturnTo({ markAuthAttempt = false } = {}) {
  const url = new URL(window.location.href);
  url.searchParams.delete(authRefreshParam);
  if (markAuthAttempt) url.searchParams.set(authRefreshParam, Date.now().toString(36));
  return `${url.pathname}${url.search}${url.hash}` || "/";
}

function currentSharedListsLink() {
  const url = new URL(window.location.href);
  url.searchParams.delete(authRefreshParam);
  return url.toString();
}

function clearAuthRefreshParam() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(authRefreshParam)) return;
  url.searchParams.delete(authRefreshParam);
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function allListSummaries() {
  return [...(state.groups.owned || []), ...(state.groups.shared || [])];
}

function buildFeedbackMessage() {
  const userEmail = state.session?.email || currentDevUser() || "Unknown user";
  const activeList = state.active?.list || null;
  const listTitle = activeList?.title || "No active list";
  return [
    "Feedback:",
    "[Tell us what happened, what you expected, or what would make this better.]",
    "",
    "",
    "",
    "Codex context:",
    "source: shared-lists",
    "feedback_version: 1",
    `generated_at: ${new Date().toISOString()}`,
    `user_email: ${feedbackContextValue(userEmail)}`,
    `active_list_id: ${feedbackContextValue(activeList?.id || "none")}`,
    `active_list_title: ${feedbackContextValue(listTitle)}`,
    `current_user_role: ${feedbackContextValue(activeList?.current_user_role || "none")}`,
    `current_user_can_share: ${Boolean(activeList?.current_user_can_share)}`,
    `app_origin: ${feedbackContextValue(window.location.origin)}`,
    `page_url: ${feedbackContextValue(window.location.href)}`,
    `user_agent: ${feedbackContextValue(window.navigator.userAgent)}`,
  ].join("\n");
}

function feedbackContextValue(value) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text || "unknown";
}

async function copyText(value) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Try the older selection-based copy path below.
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}

function isOwner() {
  return state.active?.list.current_user_role === "owner";
}

function canShareList() {
  if (isOwner()) return true;
  return Boolean(state.active?.list.current_user_can_share);
}

function pendingAccessRequestCount(list) {
  return Number(list?.pending_access_request_count || 0);
}

function readSidebarCollapsedPreference() {
  try {
    return window.localStorage.getItem(sidebarCollapsedKey) === "true";
  } catch {
    return false;
  }
}

function writeSidebarCollapsedPreference(value) {
  try {
    window.localStorage.setItem(sidebarCollapsedKey, value ? "true" : "false");
  } catch {
  }
}

function readHomeScreenGuideDismissed() {
  try {
    return window.localStorage.getItem(homeScreenGuideDismissedKey) === "true";
  } catch {
    return false;
  }
}

function writeHomeScreenGuideDismissed() {
  try {
    window.localStorage.setItem(homeScreenGuideDismissedKey, "true");
  } catch {
  }
}

function readThemePreference() {
  try {
    return normalizeThemePreference(window.localStorage.getItem(themePreferenceKey));
  } catch {
    return "system";
  }
}

function writeThemePreference(preference) {
  try {
    window.localStorage.setItem(themePreferenceKey, normalizeThemePreference(preference));
  } catch {
  }
}

function isElementVisible(element) {
  return Boolean(element && element.getClientRects().length);
}

function isMobileLayout() {
  return mobileQuery.matches;
}

function currentDevUser() {
  if (!isLocalHost()) return "";
  const queryUser = normalizeEmail(new URLSearchParams(window.location.search).get("as"));
  const storedUser = normalizeEmail(window.localStorage.getItem("sharedListsDevUser"));
  return queryUser || storedUser || defaultDevUser();
}

function defaultDevUser() {
  if (!els.devUserSwitcher) return "";
  const firstOption = Array.from(els.devUserSwitcher.options).find((option) => option.value);
  return firstOption?.value || "";
}

function isLocalHost() {
  return ["localhost", "127.0.0.1", "::1", ""].includes(window.location.hostname);
}

function displayNameFromEmail(email) {
  const localPart = String(email || "").split("@")[0] || "OpenAI teammate";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function memberAvatar(member) {
  const initials = member.display_name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return `<span class="avatar" title="${escapeAttr(member.email)}">${escapeHtml(initials || "?")}</span>`;
}

function memberControls(member, owner) {
  if (member.role === "owner") return `<span class="role-chip">Owner</span>`;
  if (!owner) return `<span class="role-chip">${memberRoleLabel(member)}</span>`;
  return `
    <span class="member-actions">
      <label class="permission-toggle">
        <input type="checkbox" data-member-share="${escapeAttr(member.email)}" ${member.can_share ? "checked" : ""} ${member.pending ? "disabled" : ""} />
        <span>Can share</span>
      </label>
      <button class="row-icon-button" type="button" aria-label="Remove ${escapeAttr(member.display_name)}" data-remove-member="${escapeAttr(member.email)}">${icon.trash}</button>
    </span>
  `;
}

function memberRoleLabel(member) {
  if (member.role === "owner") return "Owner";
  return member.can_share ? "Can share" : "Editor";
}

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date.getTime() === today.getTime()) return "Today";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function formatTaskDueLabel(value) {
  if (!value) return "Add date";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayDiff = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (dayDiff === 0) return "Due today";
  if (dayDiff === 1) return "Tomorrow";
  return formatDate(value);
}

function plural(count, singular, pluralValue) {
  return count === 1 ? singular : pluralValue;
}

function showToast(message, options = {}) {
  clearTimeout(toastTimer);
  els.toast.innerHTML = "";
  const messageSpan = document.createElement("span");
  messageSpan.textContent = message;
  els.toast.append(messageSpan);
  if (options.actionLabel && typeof options.action === "function") {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = options.actionLabel;
    button.addEventListener("click", () => {
      clearTimeout(toastTimer);
      els.toast.classList.remove("visible");
      options.action();
    });
    els.toast.append(button);
  }
  els.toast.classList.add("visible");
  toastTimer = window.setTimeout(() => els.toast.classList.remove("visible"), options.actionLabel ? 6000 : 2200);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function linkifyTaskTitle(value) {
  const text = String(value ?? "");
  const urlPattern = /(?:https?:\/\/|www\.)[^\s<]+/gi;
  let html = "";
  let lastIndex = 0;
  for (const match of text.matchAll(urlPattern)) {
    const rawMatch = match[0];
    const start = match.index ?? 0;
    const { urlText, trailingText } = splitTrailingUrlPunctuation(rawMatch);
    if (!urlText) continue;
    const href = normalizeTaskTitleHref(urlText);
    const displayLabel = taskLinkDisplayLabel(href);
    html += escapeHtml(text.slice(lastIndex, start));
    html += `<a class="task-title-link" href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer" title="${escapeAttr(urlText)}" aria-label="Open ${escapeAttr(displayLabel)}: ${escapeAttr(urlText)}"><span class="task-title-link-label">${escapeHtml(displayLabel)}</span>${icon.external}</a>`;
    html += escapeHtml(trailingText);
    lastIndex = start + rawMatch.length;
  }
  html += escapeHtml(text.slice(lastIndex));
  return html;
}

function normalizeTaskTitleHref(value) {
  return /^www\./i.test(value) ? `https://${value}` : value;
}

function taskLinkDisplayLabel(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./i, "");
    if (host === "docs.google.com") {
      if (url.pathname.startsWith("/document/")) return "Google Doc";
      if (url.pathname.startsWith("/spreadsheets/")) return "Google Sheet";
      if (url.pathname.startsWith("/presentation/")) return "Google Slides";
      if (url.pathname.startsWith("/forms/")) return "Google Form";
      return "Google Docs";
    }
    if (host === "drive.google.com") return "Google Drive";
    if (host.endsWith("slack.com")) return "Slack";
    return host || value;
  } catch {
    return value;
  }
}

function normalizeSharedListsConfig(value = {}) {
  const config = value && typeof value === "object" ? value : {};
  const features = config.features && typeof config.features === "object" ? config.features : {};
  const quickAction = config.quickActionBridge && typeof config.quickActionBridge === "object"
    ? config.quickActionBridge
    : {};
  return {
    appName: String(config.appName || "Shared Lists").trim() || "Shared Lists",
    publicUrl: String(config.publicUrl || "").trim(),
    feedbackEmail: String(config.feedbackEmail || "").trim(),
    authProvider: String(config.authProvider || "openai-sites").trim() || "openai-sites",
    features: {
      quickActionBridge: features.quickActionBridge === true,
      accessAudit: features.accessAudit === true,
      peopleImport: features.peopleImport === true,
    },
    quickActionBridge: {
      allowedOrigins: Array.isArray(quickAction.allowedOrigins)
        ? quickAction.allowedOrigins.map((origin) => String(origin || "").trim()).filter(Boolean)
        : [],
    },
  };
}

function splitTrailingUrlPunctuation(value) {
  let urlText = value;
  let trailingText = "";
  while (/[.,!?;:)\]}]$/.test(urlText)) {
    const nextTrailing = urlText.at(-1);
    if (nextTrailing === ")" && (urlText.match(/\(/g) || []).length >= (urlText.match(/\)/g) || []).length) break;
    trailingText = nextTrailing + trailingText;
    urlText = urlText.slice(0, -1);
  }
  return { urlText, trailingText };
}

function cssEscape(value) {
  if (window.CSS?.escape) return window.CSS.escape(String(value));
  return String(value).replace(/["\\]/g, "\\$&");
}
