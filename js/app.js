// ===== app.js =====

// --------------------
// HELPERS
// --------------------
function getStorageKey(exerciseId) {
  return `workout-${exerciseId}`;
}

// --------------------
// MODAL ELEMENTS
// --------------------
let currentExerciseId = "";
const exerciseModal = document.getElementById("exerciseModal");
if (exerciseModal) {
  const modalExerciseName = document.getElementById("modalExerciseName");
  const weightInput = document.getElementById("weight");
  const setsInput = document.getElementById("sets");
  const repsInput = document.getElementById("reps");
  const notesInput = document.getElementById("notes");
  const exerciseHistory = document.getElementById("exerciseHistory");
  const saveBtn = document.getElementById("saveExercise");
  const cancelBtn = document.getElementById("cancelExercise");

  // --------------------
  // OPEN EXERCISE MODAL
  // --------------------
  document.querySelectorAll(".exercise a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      if (e.target.classList.contains("delete-exercise")) return;
      const exEl = e.target.closest(".exercise");
      const id = exEl.dataset.exerciseId;
      const name = e.target.textContent.split("–")[0].trim();
      openExerciseModal(id, name);
    });
  });

  function openExerciseModal(id, name) {
    currentExerciseId = id;
    modalExerciseName.textContent = name;

    // Load last saved data
    const saved = JSON.parse(localStorage.getItem(getStorageKey(id))) || {};
    weightInput.value = saved.weight || "";
    setsInput.value = saved.sets || "";
    repsInput.value = saved.reps || "";
    notesInput.value = saved.notes || "";

    displayHistory(id);
    exerciseModal.style.display = "flex";
  }

  // --------------------
  // DISPLAY HISTORY
  // --------------------
  function displayHistory(id) {
    exerciseHistory.innerHTML = "";
    const history =
      JSON.parse(localStorage.getItem(getStorageKey(id) + "-history")) || [];
    if (!history.length) {
      exerciseHistory.innerHTML = "<p>No previous records.</p>";
      return;
    }
    history
      .slice(-5)
      .reverse()
      .forEach((r) => {
        const div = document.createElement("div");
        div.className = "history-item";
        div.innerHTML = `
        <div class="date">${new Date(r.date).toLocaleDateString()}</div>
        <div>${r.weight} × ${r.sets}×${r.reps}</div>
        ${r.notes ? `<div>${r.notes}</div>` : ""}
      `;
        exerciseHistory.appendChild(div);
      });
  }

  // --------------------
  // SAVE EXERCISE
  // --------------------
  saveBtn.addEventListener("click", () => {
    if (!weightInput.value || !setsInput.value || !repsInput.value) {
      alert("Please fill in weight, sets, and reps.");
      return;
    }
    const data = {
      date: new Date().toISOString(),
      weight: weightInput.value,
      sets: setsInput.value,
      reps: repsInput.value,
      notes: notesInput.value,
    };

    // Save main data
    localStorage.setItem(
      getStorageKey(currentExerciseId),
      JSON.stringify(data),
    );

    // Save history
    const histKey = getStorageKey(currentExerciseId) + "-history";
    const history = JSON.parse(localStorage.getItem(histKey)) || [];
    history.push(data);
    localStorage.setItem(histKey, JSON.stringify(history));

    exerciseModal.style.display = "none";
    // Update stats
    updateExerciseStats(currentExerciseId);
  });

  cancelBtn.addEventListener(
    "click",
    () => (exerciseModal.style.display = "none"),
  );

  // --------------------
  // UPDATE STATS
  // --------------------
  function updateExerciseStats(id) {
    const exEl = document.querySelector(`[data-exercise-id="${id}"]`);
    if (!exEl) return;
    const statsEl = exEl.querySelector(".exercise-stats");
    const saved = JSON.parse(localStorage.getItem(getStorageKey(id)));
    statsEl.textContent = saved
      ? `${saved.weight} × ${saved.sets}×${saved.reps}`
      : "";
  }

  function updateAllStats() {
    document.querySelectorAll(".exercise").forEach((el) => {
      const id = el.dataset.exerciseId;
      if (id) updateExerciseStats(id);
    });
  }

  document.addEventListener("DOMContentLoaded", updateAllStats);
}

// --------------------
// EXPORT / IMPORT
// --------------------
function exportData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("workout-")) data[key] = localStorage.getItem(key);
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `workout-data-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = JSON.parse(e.target.result);
    Object.keys(data).forEach((k) => localStorage.setItem(k, data[k]));
    alert("Workout data imported!");
    updateAllStats();
  };
  reader.readAsText(file);
}
document.addEventListener("DOMContentLoaded", function () {
  const workoutKey = window.location.pathname
    .split("/")
    .pop()
    .replace(".html", "");

  const addExerciseModal = document.getElementById("addExerciseModal");
  const customNameInput = document.getElementById("customExerciseName");
  const saveCustomBtn = document.getElementById("saveCustomExercise");
  const cancelCustomBtn = document.getElementById("cancelCustomExercise");
  const openCustomBtn = document.getElementById("openAddExercise");

  const customContainer = document.getElementById(
    `${workoutKey}-custom-exercises`,
  );

  if (openCustomBtn && addExerciseModal) {
    openCustomBtn.addEventListener("click", () => {
      addExerciseModal.style.display = "flex";
    });
  }

  if (cancelCustomBtn) {
    cancelCustomBtn.addEventListener("click", () => {
      addExerciseModal.style.display = "none";
    });
  }

  if (saveCustomBtn && customContainer) {
    saveCustomBtn.addEventListener("click", () => {
      const name = customNameInput.value.trim();
      if (!name) {
        alert("Please enter an exercise name.");
        return;
      }

      const id = `${workoutKey}-custom-${Date.now()}`;

      const exerciseHTML = `
        <div class="exercise" data-exercise-id="${id}">
          <a href="#">${name}</a>
          <span class="exercise-stats"></span>
          <input type="checkbox" />
        </div>
      `;

      customContainer.insertAdjacentHTML("beforeend", exerciseHTML);

      const storageKey = `${workoutKey}-custom-exercises`;
      const saved = JSON.parse(localStorage.getItem(storageKey)) || [];

      saved.push({ id, name });
      localStorage.setItem(storageKey, JSON.stringify(saved));

      addExerciseModal.style.display = "none";
      customNameInput.value = "";
    });
  }

  // Load saved custom exercises
  if (customContainer) {
    const storageKey = `${workoutKey}-custom-exercises`;
    const saved = JSON.parse(localStorage.getItem(storageKey)) || [];

    saved.forEach((ex) => {
      const exerciseHTML = `
        <div class="exercise" data-exercise-id="${ex.id}">
          <a href="#">${ex.name}</a>
          <span class="exercise-stats"></span>
          <input type="checkbox" />
        </div>
      `;
      customContainer.insertAdjacentHTML("beforeend", exerciseHTML);
    });
  }
});
