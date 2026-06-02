// console.log("dashboard.js loaded");

function showToast(message, color = "#22c55e") {

  Toastify({

    text: message,

    duration: 3000,

    gravity: "top",

    position: "center",

    style: {
      background: color,
      borderRadius: "12px",
      padding: "12px"
    }

  }).showToast();
}

// ==========================
// GLOBAL SETTINGS
// ==========================


// ==========================
// GET USER
// ==========================

async function getUser() {

  const { data, error } =
    await client.auth.getUser();

  if (error || !data.user) {

    showToast("User not logged in",);

    window.location.href =
      "login.html";

    return null;
  }

  return data.user;
}


// ==========================
// LOAD NOTES
// ==========================

async function loadNotes() {

  const user =
    await getUser();

  if (!user) return;

  const { data, error } =
    await client
      .from("notes")
      .select("*")
      .eq("user_id", user.id);
    //   console.log(data);
    // console.log(error);

  if (error) {

    console.error(
      "LOAD ERROR:",
      error
    );

    return;
  }

  const container =
    document.getElementById(
      "notes"
    );

  container.innerHTML = "";

  data.forEach((note) => {

    const safeContent =
      encodeURIComponent(
        note.content
      );

    const noteDiv =
      document.createElement("div");

    noteDiv.className = `
      p-4
      mt-4
      rounded-3xl
      bg-white
      dark:bg-slate-800
      text-black
      dark:text-white
      shadow-xl
      border
      border-gray-200
      dark:border-slate-700
    `;

    noteDiv.innerHTML = `

      <p class="
        whitespace-pre-wrap
        leading-relaxed
      ">
        ${note.content}
      </p>

      <div class="mt-4 flex flex-wrap gap-2">

        <button
          class="bg-blue-500 text-white px-3 py-1 rounded summarize-btn">

          Summarize

        </button>

        <select
          class="difficulty border p-1 rounded text-black">

          <option value="easy">
            Easy
          </option>

          <option value="medium">
            Medium
          </option>

          <option value="hard">
            Hard
          </option>

        </select>

        <button
          class="bg-green-500 text-white px-3 py-1 rounded quiz-btn">

          Quiz

        </button>

        <button
          class="bg-purple-500 text-white px-3 py-1 rounded flashcard-btn">

          Flashcards

        </button>

        <button
          class="bg-yellow-500 text-white px-3 py-1 rounded pdf-btn">

          Export PDF

        </button>
        <button
          class="
            bg-orange-500
            text-white
            px-3 py-1
            rounded
            edit-btn
        ">

          Edit
        </button>
        <button
          class="bg-red-500 text-white px-3 py-1 rounded delete-btn">

          Delete

        </button>

      </div>
    `;

    // BUTTONS

    const summarizeBtn =
      noteDiv.querySelector(
        ".summarize-btn"
      );

    const quizBtn =
      noteDiv.querySelector(
        ".quiz-btn"
      );

    const flashcardBtn =
      noteDiv.querySelector(
        ".flashcard-btn"
      );

    const pdfBtn =
      noteDiv.querySelector(
        ".pdf-btn"
      );
      const editBtn =
      noteDiv.querySelector(
        ".edit-btn"
     );

    const deleteBtn =
      noteDiv.querySelector(
        ".delete-btn"
      );

    const difficultySelect =
      noteDiv.querySelector(
        ".difficulty"
      );

    // EVENTS

    summarizeBtn.onclick = () => {

      summarize(
        decodeURIComponent(
          safeContent
        )
      );
    };

    quizBtn.onclick = () => {

      generateQuiz(
        decodeURIComponent(
          safeContent
        ),
        difficultySelect.value
      );
    };

    flashcardBtn.onclick = () => {

      generateFlashcards(
        decodeURIComponent(
          safeContent
        )
      );
    };

    pdfBtn.onclick = () => {

      exportSinglePDF(
        decodeURIComponent(
          safeContent
        )
      );
    };
    editBtn.onclick = () => {

      editNote(
      note.id,
      decodeURIComponent(
      safeContent
    )
    );
    };

    deleteBtn.onclick = () => {

      deleteNote(note.id);
    };

    container.appendChild(
      noteDiv
    );

  });
}


// ==========================
// SAVE NOTE
// ==========================

async function saveNote() {

  try {

    // console.log("SAVE STARTED");

    const user =
      await getUser();

    // console.log("USER:", user);

    if (!user) return;

    const content =
      document.getElementById("note").value;

    // console.log("CONTENT:", content);

    if (!content.trim()) {

      showToast("Empty note", "#f59e0b");
      return;
    }

    const { data, error } =
      await client
        .from("notes")
        .insert([
          {
            user_id: user.id,
            content: content
          }
        ])
        .select();

    // console.log("INSERT DATA:", data);
    // console.log("INSERT ERROR:", error);

    if (error) {

      showToast("Save failed", "#ef4444");
      console.error(error);
      return;
    }

    showToast("Note saved!");

    document.getElementById("note").value = "";

    loadNotes();

  } catch (err) {

    console.error(
      "SAVE FUNCTION ERROR:",
      err
    );
  }
}

// ==========================
// EDIT NOTE
// ==========================

async function editNote(id, oldContent) {

  // console.log("UPDATED DATA:", data);
  const newContent = prompt(
    "Edit Note:",
    oldContent
  );

  if (
    newContent === null ||
    !newContent.trim()
  ) {
    return;
  }

  // console.log("ID:", id);
  // console.log("NEW CONTENT:", newContent);

  const { data, error } =
    await client
      .from("notes")
      .update({
        content: newContent
      })
      .eq("id", id)
      .select();

  // console.log("UPDATE DATA:", data);
  // console.log("UPDATE ERROR:", error);

  if (error) {

    alert(
      "Failed to edit note"
    );

    return;
  }

  showToast("Note Updated");

  await loadNotes();
}

// ==========================
// DELETE NOTE
// ==========================

async function deleteNote(id) {

  const { error } =
    await client
      .from("notes")
      .delete()
      .eq("id", id);

  if (error) {

    console.error(
      "DELETE ERROR:",
      error
    );

    return;
  }

  loadNotes();
}


// ==========================
// LOGOUT
// ==========================

async function logout() {

  await client.auth.signOut();

  window.location.href =
    "login.html";
}


// ==========================
// READ PDF
// ==========================

async function readPDF() {

  const fileInput =
    document.getElementById(
      "pdf-upload"
    );

  const file =
    fileInput.files[0];

  if (!file) {

    showToast(
      "Please select a PDF"
    );

    return;
  }

  const reader =
    new FileReader();

  reader.onload =
  async function () {

    try {

      const typedArray =
        new Uint8Array(
          this.result
        );

      const pdf =
        await pdfjsLib
          .getDocument(
            typedArray
          )
          .promise;

      let fullText = "";

      for (
          pageNum = 1;
        pageNum <= pdf.numPages;
        pageNum++
      ) {

        const page =
          await pdf.getPage(
            pageNum
          );

        const textContent =
          await page.getTextContent();

        let pageText = "";

        textContent.items.forEach(
          item => {

            if (item.str) {

              pageText +=
                item.str + " ";
            }
          }
        );

        fullText +=
          pageText + "\n";
      }

      document.getElementById(
        "note"
      ).value = fullText;

      if (fullText.trim()) {

        summarize(
          fullText.slice(0, 12000)
        );
      }

    } catch (error) {

      console.error(
        "PDF ERROR:",
        error
      );

      showToast("PDF reading failed", "#ef4444");
    }
  };

  reader.readAsArrayBuffer(
    file
  );
}


// ==========================
// EXPORT PDF
// ==========================

function exportSinglePDF(content) {

  const { jsPDF } =
    window.jspdf;

  const doc =
    new jsPDF();

  doc.setFontSize(20);

  doc.text(
    "Study Note",
    20,
    20
  );

  doc.setFontSize(12);

  const splitText =
    doc.splitTextToSize(
      content,
      170
    );

  doc.text(
    splitText,
    20,
    40
  );

  doc.save(
    "Study_Note.pdf"
  );
}


// ==========================
// LOAD APP SETTINGS
// ==========================

async function loadAppSettings() {

  const { data, error } =
    await client
      .from("settings")
      .select("*")
      .single();

  if (error) {

    console.error(
      "SETTINGS ERROR:",
      error
    );

    return;
  }

  if (!data) return;

  window.appSettings = data;

  // SITE NAME

  document.title =
    data.site_name;

  const heading =
    document.getElementById(
      "site-heading"
    );

  if (heading) {

    heading.innerText =
      data.site_name;
  }

  // QUIZ

  if (
    data.enable_quiz === false
  ) {

    const quizSection =
      document.getElementById(
        "quiz-container"
      );

    if (quizSection) {

      quizSection.style.display =
        "none";
    }
  }

  // FLASHCARDS

  if (
    data.enable_flashcards === false
  ) {

    const flashcardSection =
      document.getElementById(
        "flashcard-container"
      );

    if (flashcardSection) {

      flashcardSection.style.display =
        "none";
    }
  }

  // AI TUTOR

  if (
    data.enable_tutor === false
  ) {

    const tutorSection =
      document.getElementById(
        "ai-tutor-section"
      );

    if (tutorSection) {

      tutorSection.style.display =
        "none";
    }
  }

  // PDF SECTION

  if (
    data.enable_pdf_upload === false
  ) {

    const pdfSection =
      document.getElementById(
        "pdf-section"
      );

    if (pdfSection) {

      pdfSection.style.display =
        "none";
    }
  }
}


// ==========================
// GLOBAL FUNCTIONS
// ==========================

window.saveNote = saveNote;
window.logout = logout;
window.readPDF = readPDF;
window.deleteNote = deleteNote;
window.editNote = editNote;
window.exportSinglePDF = exportSinglePDF;


// ==========================
// START APP AFTER HTML LOADS
// ==========================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    // console.log(
    //   "DOM FULLY LOADED"
    // );

    // CONNECT SAVE BUTTON

    const saveBtn =
      document.getElementById(
        "save-note-btn"
      );

    if (saveBtn) {

      saveBtn.addEventListener(
        "click",
        saveNote
      );

      // console.log(
      //   "SAVE BUTTON CONNECTED"
      // );

    } else {

      console.log(
        "SAVE BUTTON NOT FOUND"
      );
    }

    // LOAD SETTINGS

    await loadAppSettings();

    // LOAD NOTES

    await loadNotes();

    console.log(
      "APP FULLY STARTED"
    );
    
  }
);

// ==========================
// SEARCH NOTES
// ==========================

const searchInput =
  document.getElementById(
    "search-notes"
  );

searchInput.addEventListener(
  "input",
  function () {

    const searchText =
      this.value.toLowerCase();

    const notes =
      document.querySelectorAll(
        "#notes > div"
      );

    notes.forEach(note => {

      const text =
        note.innerText.toLowerCase();

      if (
        text.includes(searchText)
      ) {

        note.style.display =
          "block";

      } else {

        note.style.display =
          "none";
      }
    });
  }
);