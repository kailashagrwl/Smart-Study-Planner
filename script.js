const subjects = JSON.parse(localStorage.getItem("subjects")) || [];
const schedules = JSON.parse(localStorage.getItem("schedules")) || [];
const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let completedCount = Number(localStorage.getItem("completed")) || 0;

const preferences =
    JSON.parse(localStorage.getItem("preferences")) || {
        notifications: true,
        theme: "light",
    };
if (preferences.theme === "dark") {
    document.body.classList.add("dark");
}

// Initialize: Hide all sections except the first one
window.addEventListener('DOMContentLoaded', function() {
    const allSections = document.querySelectorAll('section');
    allSections.forEach((s, index) => {
        s.style.display = index === 0 ? 'block' : 'none';
    });
});

function showSection(event, section) {
    event.preventDefault();

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const allSections = document.querySelectorAll('section');
    allSections.forEach(s => s.style.display = 'none');
    
    if (section === 'dashboard') {
        allSections[0].style.display = 'block';
    } else if (section === 'subject') {
        allSections[1].style.display = 'block';
    } else if (section === 'schedule') {
        allSections[2].style.display = 'block';
    } else if (section === 'task') {
        allSections[3].style.display = 'block';
    }
}

function addSubject() {
    if (!subject.value.trim()) {
        alert("Please enter subject name");
        return;
    }
    const newSubject = {
        id: Date.now(),
        name: subject.value,
        priority: priority.value,
        notes: subjectNotes.value,
    };
    subjects.push(newSubject);
    subject.value = "";
    subjectNotes.value = "";
    saveData();
    renderSubjects();
}

function editSubject(id) {
    const subjectItem = subjects.find((s) => s.id === id);
    if (!subjectItem) return;
    const updatedName = prompt("Edit subject name:", subjectItem.name);
    if (updatedName) {
        subjectItem.name = updatedName;
        saveData();
        renderSubjects();
    }
}

function deleteSubject(id) {
    if (!confirm("Delete this subject?")) return;
    const index = subjects.findIndex((s) => s.id === id);
    subjects.splice(index, 1);
    saveData();
    renderSubjects();
}

function renderSubjects() {
    subjectList.innerHTML = "";
    subjects.forEach((sub) => {
        const li = document.createElement("li");
        li.innerHTML = `
    <span>
      <b>${sub.name}</b> (${sub.priority})
      ${sub.notes ? `<br><small>${sub.notes}</small>` : ""}
    </span>
    <div>
      <button class="edit" onclick="editSubject(${sub.id})">Edit</button>
      <button class="delete" onclick="deleteSubject(${sub.id})">Delete</button>
    </div>
  `;
        subjectList.appendChild(li);
    });
    subCount.innerText = subjects.length;
}

function addSchedule() {
    if (!time.value || !schedSub.value) {
        alert("Fill all required fields");
        return;
    }
    const newSchedule = {
        id: Date.now(),
        day: day.value,
        start: time.value,
        end: endTime.value,
        subject: schedSub.value,
    };
    const conflictSubject = findScheduleConflict(newSchedule);
    if (
        conflictSubject &&
        !confirm(`Conflict with ${conflictSubject}. Add anyway?`)
    ) {
        return;
    }
    schedules.push(newSchedule);
    schedSub.value = "";
    endTime.value = "";
    saveData();
    renderSchedule();
}

function findScheduleConflict(newSchedule) {
    const conflict = schedules.find(
        (s) => s.day === newSchedule.day && s.start === newSchedule.start,
    );
    return conflict ? conflict.subject : null;
}

function deleteSchedule(id) {
    if (!confirm("Delete this schedule?")) return;
    const index = schedules.findIndex((s) => s.id === id);
    schedules.splice(index, 1);
    saveData();
    renderSchedule();
}

function renderSchedule() {
    scheduleList.innerHTML = "";
    today.innerHTML = "";
    weeklyView.innerHTML = "";
    const todayName = new Date().toLocaleString("en-US", {
        weekday: "long",
    });
    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];
    schedules.forEach((s) => {
        const timeRange = s.end ? `${s.start} - ${s.end}` : s.start;
        const li = document.createElement("li");
        li.innerHTML = `
    <span>
      <b>${s.day}</b> ${timeRange}
      <br><small>${s.subject}</small>
    </span>
    <button class="delete" onclick="deleteSchedule(${s.id})">Delete</button>
  `;
        scheduleList.appendChild(li);
        if (s.day === todayName) {
            today.innerHTML += `<li>${timeRange} - ${s.subject}</li>`;
        }
    });
    days.forEach((d) => {
        const count = schedules.filter((s) => s.day === d).length;
        if (count > 0) {
            weeklyView.innerHTML += `<li><b>${d}</b> (${count} classes)</li>`;
        }
    });
    schedCount.innerText = schedules.length;
    if (!today.innerHTML) today.innerHTML = "<li>No classes today!</li>";
}

function addTask() {
    if (!task.value || !date.value) {
        alert("Fill all required fields");
        return;
    }
    tasks.push({
        id: Date.now(),
        name: task.value,
        type: taskType.value,
        date: date.value,
        priority: taskPriority.value,
    });
    task.value = "";
    saveData();
    renderTasks();
}
function deleteTask(id) {
    if (!confirm("Delete this task?")) return;
    const index = tasks.findIndex((t) => t.id === id);
    tasks.splice(index, 1);
    saveData();
    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = "";
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    tasks.forEach((t) => {
        const taskDate = new Date(t.date);
        const daysLeft = Math.ceil(
            (taskDate - todayDate) / (1000 * 60 * 60 * 24),
        );
        const li = document.createElement("li");
        if (daysLeft < 0) li.className = "deadline-overdue";
        else if (daysLeft <= 3) li.className = "deadline-soon";

        li.innerHTML = `
    <span>
      <b>${t.name}</b> (${t.type})
      <br><small>${t.date} - ${t.priority} Priority</small>
    </span>
    <button class="delete" onclick="deleteTask(${t.id})">Delete</button>
  `;
        taskList.appendChild(li);
    });
    taskCount.innerText = tasks.length;
    showDeadlineAlerts();
}

function showDeadlineAlerts() {
    deadlineAlerts.innerHTML = "";
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    tasks.forEach((t) => {
        const daysLeft = Math.ceil(
            (new Date(t.date) - todayDate) / (1000 * 60 * 60 * 24),
        );
        if (daysLeft < 0) {
            deadlineAlerts.innerHTML += `<div class="alert conflict">OVERDUE: ${t.name}</div>`;
        } else if (daysLeft <= 3) {
            deadlineAlerts.innerHTML += `<div class="alert">Due soon: ${t.name} (${daysLeft} days)</div>`;
        }
    });
}
function toggleTheme() {
    document.body.classList.toggle("dark");
    preferences.theme = document.body.classList.contains("dark")
        ? "dark"
        : "light";
    saveData();
}
function resetData() {
    if (confirm("Clear all data?")) {
        localStorage.clear();
        location.reload();
    }
}
function saveData() {
    localStorage.setItem("subjects", JSON.stringify(subjects));
    localStorage.setItem("schedules", JSON.stringify(schedules));
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("completed", completedCount);
    localStorage.setItem("preferences", JSON.stringify(preferences));
}
renderSubjects();
renderSchedule();
renderTasks();
