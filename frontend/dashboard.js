// Elements
const bodyEl = document.body;
const themeToggle = document.getElementById("theme-toggle");
const avatarBtn = document.getElementById("avatarBtn");
const drawer = document.getElementById("drawer");
const drawerClose = document.getElementById("drawerClose");

const shell = document.querySelector(".shell");
const hamburger = document.getElementById("hamburger");
const collapsedPlus = document.getElementById("collapsedPlus");
const collapsedCreate = document.getElementById("collapsedCreate");

const topLogo = document.getElementById("topLogo");
const sideLogo = document.getElementById("sideLogo");

const tabCalendar = document.getElementById("tabCalendar");
const tabTasks = document.getElementById("tabTasks");
const calendarView = document.getElementById("calendarView");
const tasksView = document.getElementById("tasksView");

const infoUsername = document.getElementById("infoUsername");
const infoRole = document.getElementById("infoRole");

const monthLabel = document.getElementById("monthLabel");
const monthLabelBtn = document.getElementById("monthLabelBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const todayBtn = document.getElementById("todayBtn");

const weekHeader = document.getElementById("weekHeader");
const monthHeader = document.getElementById("monthHeader");
const weekGrid = document.getElementById("weekGrid");
const timeCol = document.getElementById("timeCol");
const monthGrid = document.getElementById("monthGrid");

const viewWeekBtn = document.getElementById("viewWeek");
const viewMonthBtn = document.getElementById("viewMonth");

// Popup mini calendar
const monthPopup = document.getElementById("monthPopup");
const popCalendar = document.getElementById("popCalendar");
const popTitle = document.getElementById("popTitle");
const popPrev = document.getElementById("popPrev");
const popNext = document.getElementById("popNext");

// Sidebar mini calendar
const miniCalendar = document.getElementById("miniCalendar");
const miniTitle = document.getElementById("miniTitle");
const miniPrev = document.getElementById("miniPrev");
const miniNext = document.getElementById("miniNext");

// Upcoming + tasks
const upcomingList = document.getElementById("upcomingList");
const tasksList = document.getElementById("tasksList");
const addTaskBtn = document.getElementById("addTaskBtn");

class AuthInfo {
  constructor(username, password, token, tokenExpiry, role) {
    this.username = username;
    this.password = password;
    this.token = token;
    this.tokenExpiry = tokenExpiry;
    this.role = role;
  }
}

const BackendUrl = "https://dexter.xtrayambak.xyz";
var authInfo = new AuthInfo(localStorage.getItem("username"), localStorage.getItem("password"), undefined, 1);

function populateDrawer() {
  infoUsername.textContent = authInfo.username;
  infoRole.textContent = authInfo.role == 0 ? "Administrator" : "Participant";
  avatarBtn.textContent = (authInfo.username[0] || "U").toUpperCase();
}

function waitUntil(timestamp) {
  console.debug(
    `Waiting until ${new Date(timestamp).toLocaleString()} to refresh auth tokens`,
  );

  const now = Date.now();
  const delay = timestamp - now;

  if (delay <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => setTimeout(resolve, delay));
}

async function updateAuthInfo() {
  /* NOTE: (trayambak): ok so pretty much here, we have to contact the backend URL. then we pretty much just
   * refresh the tokens. If we get a bad response, we take the user back to the index page because
   * something bad probably happened.
   */
  try {
	  const resp = await fetch(`${BackendUrl}/auth/login`, {
	    method: "POST",
	    headers: { "Content-Type": "application/json" },
	    body: JSON.stringify({
	      username: authInfo.username,
	      password: authInfo.password,
	    }),
	  });
	  if (!resp.ok) {
	    window.location.href = "../index.html";
	    let err = await resp.json().error;
	    console.error("Failed to log into account: " + err);
	    return;
	  }

	  const body = await resp.json();

	  console.log("Logged into account successfully, setting up AuthInfo struct");
	  authInfo = new AuthInfo(
	    authInfo.username,
	    authInfo.password,
	    body.token.code,
	    body.token.expires_at,
	    body.details.role,
	  );

	  populateDrawer();
	  waitUntil(body.token.expires_at * 1000).then(() => updateAuthInfo());
  } catch (exc) {
	console.log("Failed to log into account, redirecting back to index page...")
	window.location.href = "../index.html";
  }
}

// Theme
function setLogos() {
  const src = bodyEl.classList.contains("light")
    ? "logo-light.png"
    : "logo-dark.png";
  sideLogo.src = src;
  // topLogo.src = src;
}
themeToggle.addEventListener("click", () => {
  bodyEl.classList.toggle("light");
  themeToggle.textContent = bodyEl.classList.contains("light")
    ? "☀ Light" : "🌙 Dark";
  setLogos();
  if (bodyEl.classList.contains("light"))
  	localStorage.setItem("theme", "light");
  else
	localStorage.setItem("theme", "dark");
});
setLogos();

const theme = localStorage.getItem("theme");
if (theme === "light")
{
	bodyEl.classList.add("light");
	themeToggle.textContent = "☀ Light";
	setLogos();
} else {
	bodyEl.classList.remove("light");
	themeToggle.textContent = "🌙 Dark";
	setLogos();
}
localStorage.setItem("theme", theme);

// TODO mukund YAHAN SE KARNA HAI ^w^
const eventNameInput = document.getElementById("eventNameInput");
const eventVenueInput = document.getElementById("eventVenueInput");
const eventStartDate = document.getElementById("eventStartDateInput");
const eventStopDate = document.getElementById("eventEndDateInput");
const createEventBtn = document.getElementById("createEventBtn");
const eventDialog = document.getElementById("createEventDialog");

// Sidebar toggle (pane disappears completely when not pressed)
hamburger.addEventListener("click", () => {
  shell.classList.toggle("collapsed");
  eventDialog.classList.add("hidden");
  collapsedCreate.style.display = "none";
});
collapsedPlus.addEventListener("click", (e) => {
  e.stopPropagation();
  collapsedCreate.style.display =
    collapsedCreate.style.display === "block" ? "none" : "block";
  
  eventDialog.classList.remove("hidden");
});
document.addEventListener("click", (e) => {
  if (!collapsedCreate.contains(e.target) && e.target !== collapsedPlus) {
    collapsedCreate.style.display = "none";
  }

  eventDialog.classList.add("hidden");
});

// Create handlers (stub)
function handleCreate(type) {
console.log(type)
  if (type === "event") {
	  // IDHAR CREATE EVENT WALA FORM DIKHAO
	console.log("Create event");
  	eventDialog.classList.remove("hidden");
  }
}
document.querySelectorAll("[data-create]").forEach((btn) => {
  btn.addEventListener("click", () => handleCreate(btn.dataset.create));
});

console.log("devirtualizing")
document.getElementById("create-event").addEventListener("click", () => handleCreate("event"))

// Drawer
avatarBtn.addEventListener("click", () => drawer.classList.add("open"));
drawerClose.addEventListener("click", () => drawer.classList.remove("open"));
document.addEventListener("click", (e) => {
  if (
    drawer.classList.contains("open") &&
    !drawer.contains(e.target) &&
    !avatarBtn.contains(e.target)
  ) {
    drawer.classList.remove("open");
  }
});

/* ------------ Calendar core state ------------ */
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const dowNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
let current = new Date(); // anchor date for view
let currentView = "week"; // "week" | "month"

function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay(); // 0 Sun
  const diff = date.getDate() - day; // back to Sunday
  return new Date(date.setDate(diff));
}
function updateMonthLabel() {
  monthLabel.textContent = `${monthNames[current.getMonth()]} ${current.getFullYear()}`;
}

/* ------------ Week view rendering ------------ */
const dowEls = document.querySelectorAll(".cal-header .dow");
function buildColumns() {
  weekGrid.innerHTML = "";
  for (let i = 0; i < 7; i++) {
    const col = document.createElement("div");
    col.className = "day-col";
    col.dataset.dayIndex = i;
    weekGrid.appendChild(col);
  }
}
buildColumns();

function updateHeaderDates(baseDate) {
  const start = startOfWeek(baseDate);
  const today = new Date();
  dowEls.forEach((el, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const isToday = d.toDateString() === today.toDateString();
    el.classList.toggle("today", isToday);
    el.innerHTML = `<div class="name">${dowNames[i]}</div><div class="date">${d.getDate()}</div>`;
    el.dataset.iso = d.toISOString().slice(0, 10);
  });
}

// Dummy events
var events = [];

async function getEvents() {
  console.log("Fetching event list");
  const resp = await fetch(`${BackendUrl}/events/list`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authInfo.token}`,
    },
  });
  if (!resp.ok) return;

  const body = await resp.json();
  const eventsList = body.events;

  for (var i = 0; i < eventsList.length; i++) {
    const event = eventsList[i];
    console.log(event);
    const startTs = new Date(event.date);
    const endTs = new Date(event.end);

    events.push({
      title: event.name,
      start: `${startTs.getHours().toString().padStart(2, "0")}:${startTs.getMinutes().toString().padStart(2, "0")}`,
      end: `${endTs.getHours().toString().padStart(2, "0")}:${endTs.getMinutes().toString().padStart(2, "0")}`,
      day: startTs.getDay(),
      startEpoch: event.date,
      endEpoch: event.end,
    });
  }

  console.log("Fetched events list successfully, calling renderer");

  renderEvents();
  paintUpcoming();
}

function toMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function renderEvents() {
  console.log("Rendering event timeline ( size =", events.length, ")");
  document.querySelectorAll(".day-col").forEach((col) => (col.innerHTML = ""));

  events.forEach((ev) => {
    const col = weekGrid.querySelector(`.day-col[data-day-index="${ev.day}"]`);
    if (!col) return;
    const top = toMinutes(ev.start); // 1 min = 1 px (since 1h = 60px)
    const height = toMinutes(ev.end) - toMinutes(ev.start);
    const el = document.createElement("div");
    el.className = "event";
    el.style.top = `${top}px`;
    el.style.height = `${height}px`;
    el.innerHTML = `<div><strong>${ev.title}</strong></div><div>${ev.start} – ${ev.end}</div>`;
    col.appendChild(el);
  });
}

updateAuthInfo().then((_) => {
  getEvents();
});

/* ------------ Month view rendering ------------ */
function buildMonthGrid(base) {
  monthGrid.innerHTML = "";
  const year = base.getFullYear();
  const month = base.getMonth();
  const todayStr = new Date().toDateString();

  // Find first visible day (Sunday before or equal to 1st of month)
  const firstOfMonth = new Date(year, month, 1);
  const start = startOfWeek(firstOfMonth);

  // Always show 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const cell = document.createElement("div");
    cell.className = "month-cell";

    // Mark "outside" days (from prev/next month)
    if (d.getMonth() !== month) cell.classList.add("out");
    // Mark "today"
    if (d.toDateString() === todayStr) cell.classList.add("today");

    // Put date number top-right
    cell.innerHTML = `<div class="mday">${d.getDate()}</div>`;
    cell.dataset.iso = d.toISOString().slice(0, 10);

    // Click → jump to week view
    cell.addEventListener("click", () => {
      current = new Date(d);
      switchToWeek();
    });

    monthGrid.appendChild(cell);
  }
}




/* ------------ View switching ------------ */
function switchToWeek() {
  currentView = "week";
  viewWeekBtn.classList.add("active");
  viewMonthBtn.classList.remove("active");
  weekHeader.classList.remove("hidden");
  timeCol.classList.remove("hidden");
  weekGrid.classList.remove("hidden");
  monthHeader.classList.add("hidden");
  monthGrid.classList.add("hidden");

  updateMonthLabel();
  updateHeaderDates(current);
  renderEvents();
}
function switchToMonth() {
  currentView = "month";
  viewMonthBtn.classList.add("active");
  viewWeekBtn.classList.remove("active");
  weekHeader.classList.add("hidden");
  timeCol.classList.add("hidden");
  weekGrid.classList.add("hidden");
  monthHeader.classList.remove("hidden");
  monthGrid.classList.remove("hidden");

  updateMonthLabel();
  buildMonthGrid(current);
}
viewWeekBtn.addEventListener("click", switchToWeek);
viewMonthBtn.addEventListener("click", switchToMonth);

/* ------------ Navigation (separate arrows) ------------ */
prevBtn.addEventListener("click", () => {
  if (currentView === "week") {
    current.setDate(current.getDate() - 7);
    switchToWeek();
  } else {
    current.setMonth(current.getMonth() - 1);
    switchToMonth();
  }
});
nextBtn.addEventListener("click", () => {
  if (currentView === "week") {
    current.setDate(current.getDate() + 7);
    switchToWeek();
  } else {
    current.setMonth(current.getMonth() + 1);
    switchToMonth();
  }
});
todayBtn.addEventListener("click", () => {
  current = new Date();
  currentView === "week" ? switchToWeek() : switchToMonth();
});

/* ------------ Init calendar ------------ */
updateMonthLabel();
updateHeaderDates(current);
// renderEvents();
populateDrawer();

/* ------------ Mini calendars (sidebar + popup) ------------ */
function renderMiniCalendar(container, titleEl, baseDate) {
  container.innerHTML = "";
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  titleEl.textContent = `${monthNames[month]} ${year}`;

  // weekday header
  dowNames.forEach((n) => {
    const h = document.createElement("div");
    h.textContent = n[0]; // single-letter header
    h.className = "dow-s";
    container.appendChild(h);
  });

  const first = new Date(year, month, 1);
  const start = startOfWeek(first);
  const todayStr = new Date().toDateString();

  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const el = document.createElement("div");
    el.className = "mini-day";
    if (d.getMonth() !== month) el.classList.add("out");
    if (d.toDateString() === todayStr) el.classList.add("today");
    el.textContent = d.getDate();
    el.addEventListener("click", () => {
      // Clicking date -> go to week of that date in main calendar
      current = new Date(d);
      switchToWeek();
      monthPopup.classList.add("hidden");
    });
    container.appendChild(el);
  }
}

// Mini calendar state mirrors "current" but uses its own cursor so arrows work independently
let miniCursor = new Date(current);
let popCursor = new Date(current);

function paintSideMini() {
  renderMiniCalendar(miniCalendar, miniTitle, miniCursor);
}
function paintPopMini() {
  renderMiniCalendar(popCalendar, popTitle, popCursor);
}

miniPrev.addEventListener("click", () => {
  miniCursor.setMonth(miniCursor.getMonth() - 1);
  paintSideMini();
});
miniNext.addEventListener("click", () => {
  miniCursor.setMonth(miniCursor.getMonth() + 1);
  paintSideMini();
});

popPrev.addEventListener("click", () => {
  popCursor.setMonth(popCursor.getMonth() - 1);
  paintPopMini();
});
popNext.addEventListener("click", () => {
  popCursor.setMonth(popCursor.getMonth() + 1);
  paintPopMini();
});

// Show popup on clicking month label
monthLabelBtn.addEventListener("click", () => {
  popCursor = new Date(current);
  paintPopMini();
  monthPopup.classList.remove("hidden");
});
monthPopup.addEventListener("click", (e) => {
  if (e.target === monthPopup) {
    monthPopup.classList.add("hidden");
  }
});

paintSideMini();

/* ------------ Tasks + Upcoming ------------ */
// ===== TASKS =====
const taskPopup = document.getElementById("taskPopup");
const taskNameInput = document.getElementById("taskNameInput");
const taskDueInput = document.getElementById("taskDueInput");
const taskSaveBtn = document.getElementById("taskSaveBtn");
const taskCancelBtn = document.getElementById("taskCancelBtn");
const taskList = document.getElementById("taskList");

let tasks = [];

// Open popup from "Add Task" button
document.getElementById("addTaskBtn").addEventListener("click", () => {
  taskNameInput.value = "";
  taskDueInput.value = "";
  taskPopup.classList.remove("hidden");
});

// Cancel popup
taskCancelBtn.addEventListener("click", () => {
  taskPopup.classList.add("hidden");
});

// Save task
taskSaveBtn.addEventListener("click", async () => {
  const payload = {
    task: {
      name: taskNameInput.value,
      due: new Date(taskDueInput.value).getTime()
    }
  };

  const resp = await fetch(`${BackendUrl}/tasks/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authInfo.token}`
    },
    body: JSON.stringify(payload)
  });

  if (resp.ok) {
    taskPopup.classList.add("hidden");
    await loadTasks();   // reload the list
  } else {
    alert("Failed to create task");
  }
});

// Load tasks from backend
async function loadTasks() {
  const resp = await fetch(`${BackendUrl}/tasks/list`, {
    headers: { Authorization: `Bearer ${authInfo.token}` }
  });
  if (!resp.ok) return;
  tasks = await resp.json();
  renderTasks();
}

// Render tasks into the Tasks page list
function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach(task => {
    const li = document.createElement("li");
    li.innerHTML = `
      <input type="checkbox">
      <span>${task.name} (due ${new Date(task.due).toLocaleDateString()})</span>
    `;
    const checkbox = li.querySelector("input");
    checkbox.addEventListener("change", async () => {
      if (checkbox.checked) {
        await fetch(`${BackendUrl}/tasks/remove`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authInfo.token}`
          },
          body: JSON.stringify({ target: task.name })
        });
        li.remove(); // instantly update UI
      }
    });
    taskList.appendChild(li);
  });
}

// Initial load when Tasks page is opened
loadTasks();
// Hook up sidebar "+ Task" button as well
const sidebarTaskBtn = document.querySelector('[data-create="task"]');
if (sidebarTaskBtn) {
  sidebarTaskBtn.addEventListener("click", () => {
    taskNameInput.value = "";
    taskDueInput.value = "";
    taskPopup.classList.remove("hidden");
  });
}


function paintUpcoming() {
  var buffer = "";
  let time = Date.now();
  events.forEach((event) => {
console.log("endepoch:", event.endEpoch, "currtime:", time)
    if (event.endEpoch > Date.now())
      // FIXME: This is kinda ugly, make it less so
      buffer += `
		<div class="event-chip"><div><strong>${event.title}</strong></div><div>${dowNames[event.day][0].toUpperCase() + dowNames[event.day].slice(1).toLowerCase()} • ${event.start} — ${event.end}</div></div>
    	`;
  });
  upcomingList.innerHTML = buffer;
}

/* ------------ Tabs ------------ */
function setTab(which) {
  if (which === "calendar") {
    tabCalendar.classList.add("active");
    tabTasks.classList.remove("active");
    calendarView.classList.remove("hidden");
    tasksView.classList.add("hidden");
  } else {
    tabTasks.classList.add("active");
    tabCalendar.classList.remove("active");
    tasksView.classList.remove("hidden");
    calendarView.classList.add("hidden");
  }
}
tabCalendar.addEventListener("click", () => setTab("calendar"));
tabTasks.addEventListener("click", () => setTab("tasks"));
// Popup elements
const eventPopup = document.getElementById("eventPopup");
const popupTitle = document.getElementById("popupTitle");
const popupEventName = document.getElementById("popupEventName");
const popupEventVenue = document.getElementById("popupEventVenue");
const popupEventStart = document.getElementById("popupEventStart");
const popupEventEnd = document.getElementById("popupEventEnd");
const popupParticipants = document.getElementById("popupParticipants");
const popupSave = document.getElementById("popupSave");
const popupCancel = document.getElementById("popupCancel");

const eventDetailsPopup = document.getElementById("eventDetailsPopup");
const detailsTitle = document.getElementById("detailsTitle");
const detailsVenue = document.getElementById("detailsVenue");
const detailsStart = document.getElementById("detailsStart");
const detailsEnd = document.getElementById("detailsEnd");
const detailsParticipants = document.getElementById("detailsParticipants");
const editEventBtn = document.getElementById("editEventBtn");
const closeDetailsBtn = document.getElementById("closeDetailsBtn");

let editingEvent = null;

// Open popup
function openEventPopup(defaultStart=null, defaultEnd=null) {
  const isEditing = !!editingEvent;
  popupTitle.textContent = isEditing ? "Edit Event" : "Create Event";
  popupEventName.value = isEditing ? editingEvent.title : "";
  popupEventVenue.value = isEditing ? editingEvent.venue : "";
  popupEventStart.value = defaultStart || (isEditing ? new Date(editingEvent.startEpoch).toISOString().slice(0,16) : "");
  popupEventEnd.value = defaultEnd || (isEditing ? new Date(editingEvent.endEpoch).toISOString().slice(0,16) : "");
  popupParticipants.value = isEditing ? (editingEvent.participants ? editingEvent.participants.join(",") : "") : "";
  eventPopup.classList.remove("hidden");
}

popupCancel.addEventListener("click", ()=> eventPopup.classList.add("hidden"));

// Save event
popupSave.addEventListener("click", async ()=>{
  const partsRaw = popupParticipants.value.trim();
  const parts = partsRaw ? partsRaw.split(",").map(x=>x.trim()).filter(x=>x) : [];

  if (!editingEvent) {
    // ---- Create New Event ----
    const payload = {
      event: {
        name: popupEventName.value,
        venue: popupEventVenue.value,
        date: new Date(popupEventStart.value).getTime(),
        end_date: new Date(popupEventEnd.value).getTime(),
        participants: parts
      }
    };

    const resp = await fetch(`${BackendUrl}/events/create`, {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        Authorization: `Bearer ${authInfo.token}`
      },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      alert("Failed to create event");
      return;
    }
  } else {
    // ---- Edit Existing Event ----
    const oldName = editingEvent.title;
    const newName = popupEventName.value;

    // 1. Change name if needed
    if (oldName !== newName) {
      await fetch(`${BackendUrl}/events/change_name`, {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization: `Bearer ${authInfo.token}`
        },
        body: JSON.stringify({ target: oldName, updated: newName })
      });
    }

    // 2. Sync participants
    const oldParts = editingEvent.participants || [];
    const toAdd = parts.filter(p => !oldParts.includes(p));
    const toRemove = oldParts.filter(p => !parts.includes(p));

    for (let p of toAdd) {
      await fetch(`${BackendUrl}/events/add_participants`, {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization: `Bearer ${authInfo.token}`
        },
        body: JSON.stringify({ target: newName, updated: p })
      });
    }
    for (let p of toRemove) {
      await fetch(`${BackendUrl}/events/remove_participants`, {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization: `Bearer ${authInfo.token}`
        },
        body: JSON.stringify({ target: newName, remove: p })
      });
    }

    // (Future: update venue/date/time when backend supports)
  }

  eventPopup.classList.add("hidden");
  events = [];
  await getEvents(); // refresh
});


// Open details popup
function openDetailsPopup(ev) {
  editingEvent = ev;
  detailsTitle.textContent = ev.title;
  detailsVenue.textContent = ev.venue;
  detailsStart.textContent = new Date(ev.startEpoch).toLocaleString();
  detailsEnd.textContent = new Date(ev.endEpoch).toLocaleString();
  detailsParticipants.textContent = ev.participants ? ev.participants.join(", ") : "—";
  eventDetailsPopup.classList.remove("hidden");
}
closeDetailsBtn.addEventListener("click", ()=> eventDetailsPopup.classList.add("hidden"));
editEventBtn.addEventListener("click", ()=>{
  eventDetailsPopup.classList.add("hidden");
  openEventPopup();
});

// Hook up UI
document.querySelector('[data-create="event"]').addEventListener("click", ()=> {
  editingEvent = null;
  openEventPopup();
});

// Calendar cell click → create event with default times
document.querySelectorAll(".day-col").forEach(col=>{
  col.addEventListener("click",(e)=>{
    const dayIso = col.dataset.iso;
    const start = new Date(dayIso + "T09:00:00");
    const end = new Date(dayIso + "T10:00:00");
    openEventPopup(start.toISOString().slice(0,16), end.toISOString().slice(0,16));
  });
});

// Modify renderEvents to allow clicking events
function renderEvents() {
  document.querySelectorAll(".day-col").forEach((col) => (col.innerHTML = ""));
  events.forEach((ev) => {
    const col = weekGrid.querySelector(`.day-col[data-day-index="${ev.day}"]`);
    if (!col) return;
    const top = toMinutes(ev.start);
    const height = toMinutes(ev.end) - toMinutes(ev.start);
    const el = document.createElement("div");
    el.className = "event";
    el.style.top = `${top}px`;
    el.style.height = `${height}px`;
    el.innerHTML = `<div><strong>${ev.title}</strong></div><div>${ev.start} – ${ev.end}</div>`;
    el.addEventListener("click", (e)=> {
      e.stopPropagation();
      openDetailsPopup(ev);
    });
    col.appendChild(el);
  });
}
