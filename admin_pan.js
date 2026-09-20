loadDashboard();

async function loadDashboard() {

  loadNotes();

  loadStats();

  loadSettings();
}


// LOAD NOTES

async function loadNotes() {

  const { data, error } =
    await client
      .from("notes")
      .select("*");

  if (error) {

    console.error(error);

    return;
  }

  const container =
    document.getElementById(
      "all-notes"
    );

  container.innerHTML = "";

  data.forEach(note => {

    container.innerHTML += `

      <div class="
        bg-slate-700
        p-4
        rounded-xl
        mb-4
      ">

        <p>${note.content}</p>

        <button
          onclick="deleteNote('${note.id}')"
          class="
            bg-red-500
            px-3 py-1
            rounded
            mt-3
          ">

          Delete

        </button>

      </div>
    `;
  });
}


// DELETE NOTE

async function deleteNote(id) {

  await client
    .from("notes")
    .delete()
    .eq("id", id);

  loadNotes();
}


// LOAD STATS

async function loadStats() {

  const {
    count: notesCount
  } = await client
    .from("notes")
    .select("*", {
      count: "exact",
      head: true
    });

  document
    .getElementById(
      "total-notes"
    )
    .innerText =
    notesCount;
}


// LOAD SETTINGS

async function loadSettings() {

  const { data } =
    await client
      .from("settings")
      .select("*")
      .single();

  if (!data) return;

  document
    .getElementById(
      "site-name"
    )
    .value =
    data.site_name;

  document
    .getElementById(
      "quiz-count"
    )
    .value =
    data.quiz_count;
    document.getElementById(
  "enable-quiz"
).checked =
  data.enable_quiz;

document.getElementById(
  "enable-flashcards"
).checked =
  data.enable_flashcards;

document.getElementById(
  "enable-ai-tutor"
).checked =
  data.enable_ai_tutor;

document.getElementById(
  "enable-pdf-upload"
).checked =
  data.enable_pdf_upload;
}


// SAVE SETTINGS

async function saveSettings() {

  const site_name =
    document.getElementById(
      "site-name"
    ).value;

  const quiz_count =
    document.getElementById(
      "quiz-count"
    ).value;

  const enable_quiz =
    document.getElementById(
      "enable-quiz"
    ).checked;

  const enable_flashcards =
    document.getElementById(
      "enable-flashcards"
    ).checked;

  const enable_pdf =
    document.getElementById(
      "enable-pdf"
    ).checked;

  const { error } = await client
    .from("settings")
    .update({
      site_name,
      quiz_count,
      enable_quiz,
      enable_flashcards,
      enable_pdf
    })
    .eq("id", 1);

  if (error) {

    console.error(error);

    alert("Failed to save settings");

    return;
  }

  alert("Settings Saved");
}