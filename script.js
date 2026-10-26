const progressForm = document.getElementById("progressForm");
const statusMessage = document.getElementById("statusMessage");
const listMessage = document.getElementById("listMessage");
const progressList = document.getElementById("progressList");
const submitBtn = document.getElementById("submitBtn");

// Display all student progress records
async function loadProgress() {
  listMessage.textContent = "Loading progress records...";

  try {
    const response = await fetch("/api/progress");

    if (!response.ok) {
      throw new Error("Failed to load progress records.");
    }

    const progressEntries = await response.json();

    progressList.replaceChildren();

    if (progressEntries.length === 0) {
      listMessage.textContent = "No progress records found. Add a student first.";
      return;
    }

    listMessage.textContent =
      `${progressEntries.length} progress record(s) found.`;

    progressEntries.forEach((entry) => {
      const card = document.createElement("article");
      card.className = "progress-item";

      const student = document.createElement("h3");
      student.textContent = entry.studentName;

      const course = document.createElement("p");
      course.textContent = `Course: ${entry.courseName}`;

      const percentage = Number(entry.completionPercentage);

      const progressText = document.createElement("p");
      progressText.className = "percentage";
      progressText.textContent = `Completion: ${percentage}%`;

      const progressBar = document.createElement("div");
      progressBar.className = "progress-bar";

      const progressFill = document.createElement("div");
      progressFill.className = "progress-fill";
      progressFill.style.width = `${percentage}%`;

      progressBar.setAttribute("role", "progressbar");
      progressBar.setAttribute("aria-label", `${entry.courseName} completion`);
      progressBar.setAttribute("aria-valuemin", "0");
      progressBar.setAttribute("aria-valuemax", "100");
      progressBar.setAttribute("aria-valuenow", String(percentage));

      const updated = document.createElement("small");

      if (entry.lastUpdated) {
        const date = new Date(entry.lastUpdated);

        updated.textContent = `Last updated: ${
          Number.isNaN(date.getTime())
            ? "Unknown"
            : date.toLocaleString()
        }`;
      }

      progressBar.appendChild(progressFill);
      card.append(student, course, progressText, progressBar, updated);
      progressList.appendChild(card);
    });
  } catch (error) {
    listMessage.textContent = error.message;
    console.error("Load progress error:", error);
  }
}

// Submit new student progress
progressForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(progressForm);

  const progress = {
    studentName: formData.get("studentName").trim(),
    courseName: formData.get("courseName").trim(),
    completionPercentage: Number(
      formData.get("completionPercentage")
    )
  };

  statusMessage.textContent = "";
  statusMessage.className = "";

  if (
    !progress.studentName ||
    !progress.courseName ||
    !Number.isInteger(progress.completionPercentage) ||
    progress.completionPercentage < 0 ||
    progress.completionPercentage > 100
  ) {
    statusMessage.textContent =
      "Please enter valid details and a whole percentage from 0 to 100.";
    statusMessage.className = "error";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Saving...";

  try {
    const response = await fetch("/api/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(progress)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to save progress.");
    }

    statusMessage.textContent = result.message;
    statusMessage.className = "success";

    progressForm.reset();

    await loadProgress();
  } catch (error) {
    statusMessage.textContent =
      error.message || "Something went wrong. Please try again.";
    statusMessage.className = "error";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Add Progress";
  }
});

// Load existing records when the page opens
loadProgress();
