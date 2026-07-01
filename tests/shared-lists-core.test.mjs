import test from "node:test";
import assert from "node:assert/strict";
import { AppError, MAX_TASK_TITLE_LENGTH, MemoryStore } from "../src/lib/shared-lists-core.mjs";

function expectStatus(status) {
  return (error) => error instanceof AppError && error.status === status;
}

test("many-to-many list sharing returns owned and shared lists for each user", async () => {
  const store = new MemoryStore({
    users: ["owner@local.test", "editor@local.test", "external-owner@local.test", "requester@local.test"],
  });

  const listOne = await store.createList("owner@local.test", "Editor checklist");
  await store.addMember("owner@local.test", listOne.list.id, "editor@local.test");

  const listTwo = await store.createList("external-owner@local.test", "Shared owner checklist");
  await store.addMember("external-owner@local.test", listTwo.list.id, "owner@local.test");

  const ownerLists = await store.getLists("owner@local.test");
  assert.equal(ownerLists.owned.length, 1);
  assert.equal(ownerLists.shared.length, 1);
  assert.equal(ownerLists.shared[0].title, "Shared owner checklist");
  assert.equal(ownerLists.owned[0].marker_icon, "app");

  const editorLists = await store.getLists("editor@local.test");
  assert.equal(editorLists.owned.length, 0);
  assert.equal(editorLists.shared[0].title, "Editor checklist");
  assert.equal(editorLists.shared[0].marker_icon, "app");

  const requesterLists = await store.getLists("requester@local.test");
  assert.deepEqual(requesterLists, { owned: [], shared: [] });
  await assert.rejects(() => store.getList("requester@local.test", listOne.list.id), expectStatus(403));
});

test("shared editors can add, date, complete, and delete tasks", async () => {
  const store = new MemoryStore({
    users: ["owner@local.test", "editor@local.test"],
  });
  const created = await store.createList("owner@local.test", "Editor checklist");
  await store.addMember("owner@local.test", created.list.id, "editor@local.test");

  const task = await store.createTask("editor@local.test", created.list.id, {
    title: "Bring launch questions",
    due_date: null,
  });
  assert.equal(task.due_date, null);

  const openDeleteTask = await store.createTask("editor@local.test", created.list.id, {
    title: "Delete from open",
    due_date: null,
  });
  const openDelete = await store.deleteTask("editor@local.test", openDeleteTask.id);
  assert.equal(openDelete.deleted_count, 1);
  const afterOpenDelete = await store.getList("owner@local.test", created.list.id);
  assert.equal(afterOpenDelete.open_tasks.some((item) => item.id === openDeleteTask.id), false);

  const dated = await store.patchTask("editor@local.test", task.id, { due_date: "2026-06-01" });
  assert.equal(dated.due_date, "2026-06-01");

  const completed = await store.patchTask("editor@local.test", task.id, { status: "completed" });
  assert.equal(completed.status, "completed");

  const list = await store.getList("owner@local.test", created.list.id);
  assert.equal(list.open_tasks.length, 0);
  assert.equal(list.completed_tasks.length, 0);

  const completedTasks = await store.getCompletedTasks("owner@local.test", created.list.id);
  assert.equal(completedTasks.length, 1);

  await store.deleteTask("editor@local.test", task.id);
  const afterDelete = await store.getList("owner@local.test", created.list.id);
  assert.equal(afterDelete.completed_tasks.length, 0);

  const afterDeleteCompleted = await store.getCompletedTasks("owner@local.test", created.list.id);
  assert.equal(afterDeleteCompleted.length, 0);

  const restored = await store.restoreDeletedTasks("editor@local.test", created.list.id, [task.id]);
  assert.equal(restored.restored_count, 1);
  const afterRestoreCompleted = await store.getCompletedTasks("owner@local.test", created.list.id);
  assert.equal(afterRestoreCompleted.length, 1);
});

test("task titles support several long document links without becoming unbounded", async () => {
  const store = new MemoryStore();
  const created = await store.createList("admin@local.test", "Document review");
  const multiLinkTitle = Array.from(
    { length: 8 },
    (_, index) => `Document ${index + 1}: https://docs.google.com/document/d/${"a".repeat(70)}${index}/edit?tab=t.${index}`,
  ).join("; ");

  assert.ok(multiLinkTitle.length > 500);
  assert.ok(multiLinkTitle.length < MAX_TASK_TITLE_LENGTH);
  const task = await store.createTask("admin@local.test", created.list.id, { title: multiLinkTitle });
  assert.equal(task.title, multiLinkTitle);

  await assert.rejects(
    () => store.createTask("admin@local.test", created.list.id, { title: "x".repeat(MAX_TASK_TITLE_LENGTH + 1) }),
    (error) => error instanceof AppError && error.status === 400 && error.message.includes(String(MAX_TASK_TITLE_LENGTH)),
  );
});

test("list markers are personal to each member", async () => {
  const store = new MemoryStore({
    users: ["owner@local.test", "editor@local.test", "requester@local.test"],
  });
  const created = await store.createList("owner@local.test", "Editor checklist");
  await store.addMember("owner@local.test", created.list.id, "editor@local.test");

  await store.updateListPreferences("owner@local.test", created.list.id, {
    marker_color: "green",
    marker_icon: "star",
  });
  await store.updateListPreferences("editor@local.test", created.list.id, {
    marker_color: "purple",
    marker_icon: "flag",
  });

  const ownerLists = await store.getLists("owner@local.test");
  assert.equal(ownerLists.owned[0].marker_color, "green");
  assert.equal(ownerLists.owned[0].marker_icon, "star");

  const editorLists = await store.getLists("editor@local.test");
  assert.equal(editorLists.shared[0].marker_color, "purple");
  assert.equal(editorLists.shared[0].marker_icon, "flag");

  await assert.rejects(
    () => store.updateListPreferences("editor@local.test", created.list.id, { marker_color: "neon", marker_icon: "flag" }),
    expectStatus(400),
  );
  await assert.rejects(
    () => store.updateListPreferences("requester@local.test", created.list.id, { marker_color: "blue", marker_icon: "circle" }),
    expectStatus(403),
  );
});

test("owners can delegate sharing while admin controls stay owner-only", async () => {
  const store = new MemoryStore({
    users: ["owner@local.test", "editor@local.test", "requester@local.test", "delegate@local.test", "external-owner@local.test"],
  });
  const created = await store.createList("owner@local.test", "Editor checklist");
  const shared = await store.addMember("owner@local.test", created.list.id, "editor@local.test");
  assert.equal(shared.members.find((member) => member.email === "editor@local.test").can_share, false);

  await assert.rejects(
    () => store.addMember("editor@local.test", created.list.id, "requester@local.test"),
    expectStatus(403),
  );
  const granted = await store.updateMemberSharing("owner@local.test", created.list.id, "editor@local.test", true);
  assert.equal(granted.members.find((member) => member.email === "editor@local.test").can_share, true);

  const sharedByEditor = await store.addMember("editor@local.test", created.list.id, "requester@local.test");
  assert.equal(sharedByEditor.members.find((member) => member.email === "requester@local.test").can_share, false);
  await assert.rejects(
    () => store.updateMemberSharing("editor@local.test", created.list.id, "requester@local.test", true),
    expectStatus(403),
  );
  await assert.rejects(() => store.removeMember("editor@local.test", created.list.id, "requester@local.test"), expectStatus(403));

  await store.updateMemberSharing("owner@local.test", created.list.id, "editor@local.test", false);
  await assert.rejects(
    () => store.addMember("editor@local.test", created.list.id, "delegate@local.test"),
    expectStatus(403),
  );

  const allCanShare = await store.allowAllMembersToShare("owner@local.test", created.list.id);
  assert.equal(allCanShare.members.find((member) => member.email === "editor@local.test").can_share, true);
  assert.equal(allCanShare.members.find((member) => member.email === "requester@local.test").can_share, true);
  const memberOrderBeforeRevoke = allCanShare.members.map((member) => member.email);
  const revoked = await store.updateMemberSharing("owner@local.test", created.list.id, "editor@local.test", false);
  assert.deepEqual(revoked.members.map((member) => member.email), memberOrderBeforeRevoke);
  assert.equal(revoked.members.find((member) => member.email === "editor@local.test").can_share, false);
  await store.updateMemberSharing("owner@local.test", created.list.id, "editor@local.test", true);
  await store.addMember("editor@local.test", created.list.id, "external-owner@local.test");
  const gmailShare = await store.addMember("owner@local.test", created.list.id, "outside-member@local.test");
  assert.equal(gmailShare.members.some((member) => member.email === "outside-member@local.test"), true);
  const externalShare = await store.addMember("owner@local.test", created.list.id, "trusted-member@local.test");
  assert.equal(externalShare.members.some((member) => member.email === "trusted-member@local.test"), true);

  await assert.rejects(() => store.deleteList("editor@local.test", created.list.id), expectStatus(403));
  await assert.rejects(() => store.addMember("owner@local.test", created.list.id, "friend"), expectStatus(400));

  await store.deleteList("owner@local.test", created.list.id);
  await assert.rejects(() => store.getList("owner@local.test", created.list.id), expectStatus(404));
});

test("access requests are visible only to people who can share", async () => {
  const store = new MemoryStore({
    users: ["owner@local.test", "editor@local.test", "requester@local.test", "delegate@local.test"],
  });
  const created = await store.createList("owner@local.test", "Requestable list");
  await store.addMember("owner@local.test", created.list.id, "editor@local.test");

  const invalid = await store.requestAccess("requester@local.test", "missing_list");
  assert.equal(invalid.request_status, "pending");

  await assert.rejects(() => store.getList("requester@local.test", created.list.id), expectStatus(403));
  const request = await store.requestAccess("requester@local.test", created.list.id);
  assert.equal(request.request_status, "pending");

  const ownerLists = await store.getLists("owner@local.test");
  assert.equal(ownerLists.owned[0].pending_access_request_count, 1);

  const editorLists = await store.getLists("editor@local.test");
  assert.equal(editorLists.shared[0].pending_access_request_count, 0);
  const editorDetails = await store.getListDetails("editor@local.test", created.list.id);
  assert.deepEqual(editorDetails.access_requests, []);

  const ownerDetails = await store.getListDetails("owner@local.test", created.list.id);
  assert.equal(ownerDetails.access_requests[0].email, "requester@local.test");

  await assert.rejects(
    () => store.approveAccessRequest("editor@local.test", created.list.id, "requester@local.test"),
    expectStatus(403),
  );
  const approved = await store.approveAccessRequest("owner@local.test", created.list.id, "requester@local.test");
  assert.equal(approved.members.some((member) => member.email === "requester@local.test"), true);
  assert.equal(approved.list.pending_access_request_count, 0);

  await store.requestAccess("delegate@local.test", created.list.id);
  await store.updateMemberSharing("owner@local.test", created.list.id, "editor@local.test", true);
  const declined = await store.declineAccessRequest("editor@local.test", created.list.id, "delegate@local.test");
  assert.equal(declined.access_requests.length, 0);
});
