let appSettings = {
  quiz_count: 10
};

async function loadSettings() {

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

  appSettings = data;

  console.log(
    "SETTINGS LOADED:",
    appSettings
  );
}

loadSettings();


// =========================
// SUMMARY
// =========================

window.summarize = async function(text) {

  const output =
    document.getElementById("ai-output");

  output.innerText =
    "Generating summary...";

  try {

    const response =
      await fetch(
        "/api/groq",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            model:
              "openai/gpt-oss-20b",

            messages: [
              {
                role: "user",

                content: `
Summarize this into short bullet points:

${text}
`
              }
            ]
          })
        }
      );

    const data =
      await response.json();

    console.log(
      "SUMMARY DATA:",
      data
    );

    if (!response.ok) {

      console.error(
        "SUMMARY API ERROR:",
        data
      );

      output.innerText =
        data?.error?.message ||
        "Summary generation failed";

      return;
    }

    const summary =
      data?.choices?.[0]
        ?.message?.content;

    if (!summary) {

      output.innerText =
        "No summary generated";

      return;
    }

    output.innerText =
      summary;

  } catch (error) {

    console.error(
      "SUMMARY ERROR:",
      error
    );

    output.innerText =
      "Summary generation failed";
  }
};


// =========================
// GENERATE QUIZ
// =========================

window.generateQuiz =
async function(text) {

  const output =
    document.getElementById(
      "ai-output"
    );

  const difficulty =
    document.querySelector(
      ".difficulty"
    )?.value || "easy";

  const count =
    appSettings?.quiz_count || 10;

  output.innerText =
    "Generating quiz...";

  try {

    const response =
      await fetch(
        "/api/groq",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            model:
              "openai/gpt-oss-20b",

            messages: [

              {
                role: "system",

                content:
                  "You ONLY return raw JSON arrays. No markdown. No explanation."
              },

              {
                role: "user",

                content: `
Generate ${count} ${difficulty} difficulty MCQ questions.

Return ONLY a JSON array.

Example:

[
  {
    "question": "What is AI?",
    "options": [
      "Robot",
      "Machine Learning",
      "Pizza",
      "Car"
    ],
    "answer": "Machine Learning"
  }
]

Text:

${text}
`
              }
            ]
          })
        }
      );

    const data =
      await response.json();

    console.log(
      "FULL AI RESPONSE:",
      data
    );

    if (!response.ok) {

      console.error(
        "QUIZ API ERROR:",
        data
      );

      output.innerText =
        data?.error?.message ||
        "Quiz generation failed";

      return;
    }

    let rawQuiz =
      data?.choices?.[0]
        ?.message?.content;

    if (!rawQuiz) {

      output.innerText =
        "No quiz generated";

      return;
    }

    console.log(
      "RAW QUIZ:",
      rawQuiz
    );


    // =====================
    // CLEAN RESPONSE
    // =====================

    rawQuiz =
      rawQuiz
        .replace(
          /```json/g,
          ""
        )
        .replace(
          /```/g,
          ""
        )
        .trim();


    // =====================
    // EXTRACT JSON ARRAY
    // =====================

    const match =
      rawQuiz.match(
        /\[[\s\S]*\]/
      );

    if (!match) {

      output.innerText =
        "Could not find JSON array";

      console.log(
        rawQuiz
      );

      return;
    }

    rawQuiz =
      match[0];


    // =====================
    // REMOVE TRAILING COMMAS
    // =====================

    rawQuiz =
      rawQuiz.replace(
        /,\s*}/g,
        "}"
      );

    rawQuiz =
      rawQuiz.replace(
        /,\s*]/g,
        "]"
      );

    console.log(
      "CLEANED JSON:",
      rawQuiz
    );


    // =====================
    // PARSE JSON
    // =====================

    let quizData;

    try {

      quizData =
        JSON.parse(
          rawQuiz
        );

    } catch (err) {

      console.error(
        "JSON PARSE ERROR:",
        err
      );

      console.log(
        "BROKEN JSON:",
        rawQuiz
      );

      output.innerText =
        "AI generated broken JSON";

      return;
    }


    // =====================
    // VALIDATE
    // =====================

    if (
      !Array.isArray(
        quizData
      )
    ) {

      output.innerText =
        "Quiz is not array";

      return;
    }

    if (
      quizData.length === 0
    ) {

      output.innerText =
        "Quiz empty";

      return;
    }


    console.log(
      "FINAL QUIZ:",
      quizData
    );


    // =====================
    // START QUIZ
    // =====================

    startQuiz(
      quizData
    );

    output.innerText =
      "";

  } catch (error) {

    console.error(
      "QUIZ ERROR:",
      error
    );

    output.innerText =
      "Quiz generation failed";
  }
};


// =========================
// QUIZ SYSTEM
// =========================

let currentQuestion =
  0;

let score =
  0;

let quiz =
  [];

let timer;

let timeLeft =
  15;


function startQuiz(data) {

  quiz =
    data;

  currentQuestion =
    0;

  score =
    0;

  document
    .getElementById(
      "quiz-container"
    )
    .classList.remove(
      "hidden"
    );

  document
    .getElementById(
      "score"
    )
    .innerText =
    "";

  showQuestion();
}


function showQuestion() {

  const q =
    quiz[
      currentQuestion
    ];

  if (!q) {
    return;
  }


  // QUESTION

  document
    .getElementById(
      "question"
    )
    .innerText =
    q.question;


  // PROGRESS TEXT

  document
    .getElementById(
      "progress-text"
    )
    .innerText =
    `Question ${
      currentQuestion + 1
    }/${quiz.length}`;


  // PROGRESS BAR

  const progress =
    (
      (currentQuestion + 1)
      /
      quiz.length
    ) * 100;

  document
    .getElementById(
      "progress-bar"
    )
    .style.width =
    `${progress}%`;


  // OPTIONS

  const optionsDiv =
    document.getElementById(
      "options"
    );

  optionsDiv.innerHTML =
    "";


  q.options.forEach(
    option => {

      const btn =
        document.createElement(
          "button"
        );

      btn.innerText =
        option;

      btn.className =
        "block w-full bg-gray-200 hover:bg-gray-300 text-black p-2 rounded";

      btn.onclick =
        () =>
          selectAnswer(
            option,
            q.answer
          );

      optionsDiv.appendChild(
        btn
      );
    }
  );


  // HIDE NEXT BUTTON

  document
    .getElementById(
      "next-btn"
    )
    .classList.add(
      "hidden"
    );


  // START TIMER

  startTimer();
}


function startTimer() {

  clearInterval(
    timer
  );

  timeLeft =
    15;

  document
    .getElementById(
      "timer"
    )
    .innerText =
    `${timeLeft}s`;


  timer =
    setInterval(
      () => {

        timeLeft--;

        document
          .getElementById(
            "timer"
          )
          .innerText =
          `${timeLeft}s`;


        if (
          timeLeft <= 0
        ) {

          clearInterval(
            timer
          );

          autoRevealAnswer();
        }

      },
      1000
    );
}


function autoRevealAnswer() {

  const q =
    quiz[
      currentQuestion
    ];

  const buttons =
    document.querySelectorAll(
      "#options button"
    );


  buttons.forEach(
    btn => {

      btn.disabled =
        true;

      if (
        btn.innerText.trim()
        ===
        q.answer.trim()
      ) {

        btn.classList.remove(
          "bg-gray-200"
        );

        btn.classList.add(
          "bg-green-500",
          "text-white"
        );
      }
    }
  );


  document
    .getElementById(
      "next-btn"
    )
    .classList.remove(
      "hidden"
    );
}


function selectAnswer(
  selected,
  correct
) {

  const buttons =
    document.querySelectorAll(
      "#options button"
    );

  clearInterval(
    timer
  );


  buttons.forEach(
    btn => {

      btn.disabled =
        true;

      const text =
        btn.innerText.trim();


      // CORRECT ANSWER

      if (
        text ===
        correct.trim()
      ) {

        btn.classList.remove(
          "bg-gray-200",
          "hover:bg-gray-300"
        );

        btn.classList.add(
          "bg-green-500",
          "text-white"
        );
      }


      // WRONG SELECTED ANSWER

      if (
        text ===
        selected.trim()
        &&
        selected.trim()
        !==
        correct.trim()
      ) {

        btn.classList.remove(
          "bg-gray-200",
          "hover:bg-gray-300"
        );

        btn.classList.add(
          "bg-red-500",
          "text-white"
        );
      }

    }
  );


  // SCORE

  if (
    selected.trim()
    ===
    correct.trim()
  ) {

    score++;
  }


  // SHOW NEXT

  document
    .getElementById(
      "next-btn"
    )
    .classList.remove(
      "hidden"
    );
}


function nextQuestion() {

  currentQuestion++;


  if (
    currentQuestion
    <
    quiz.length
  ) {

    showQuestion();

  } else {

    clearInterval(
      timer
    );

    document
      .getElementById(
        "question"
      )
      .innerText =
      "Quiz Finished!";

    document
      .getElementById(
        "options"
      )
      .innerHTML =
      "";

    document
      .getElementById(
        "score"
      )
      .innerText =
      `Final Score: ${score}/${quiz.length}`;

    document
      .getElementById(
        "next-btn"
      )
      .classList.add(
        "hidden"
      );
  }
}


// =========================
// FLASHCARD VARIABLES
// =========================

let flashcards =
  [];

let currentFlashcard =
  0;

let showingAnswer =
  false;


// =========================
// GENERATE FLASHCARDS
// =========================

window.generateFlashcards =
async function(text) {

  const output =
    document.getElementById(
      "ai-output"
    );

  output.innerText =
    "Generating flashcards...";


  try {

    const response =
      await fetch(
        "/api/groq",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            model:
              "openai/gpt-oss-20b",

            messages: [

              {
                role: "user",

                content: `
You are a JSON generator.

Return ONLY valid JSON.

Do NOT use markdown.
Do NOT use backticks.
Do NOT explain anything.

Return exactly this format:

[
  {
    "question": "Question here",
    "answer": "Answer here"
  }
]

Generate 10 flashcards from this text:

${text}
`
              }
            ]
          })
        }
      );


    const data =
      await response.json();

    console.log(
      "FLASHCARD DATA:",
      data
    );


    if (!response.ok) {

      console.error(
        "FLASHCARD API ERROR:",
        data
      );

      output.innerText =
        data?.error?.message ||
        "Flashcard generation failed";

      return;
    }


    let raw =
      data?.choices?.[0]
        ?.message?.content;


    if (!raw) {

      output.innerText =
        "No flashcards generated";

      return;
    }


    raw =
      raw
        .replace(
          /```json/g,
          ""
        )
        .replace(
          /```/g,
          ""
        )
        .trim();


    console.log(
      "RAW FLASHCARDS:",
      raw
    );


    let parsed;


    try {

      parsed =
        JSON.parse(
          raw
        );

    } catch (err) {

      console.error(
        "JSON ERROR:",
        err
      );

      output.innerText =
        "AI generated invalid flashcards";

      return;
    }


    if (
      !Array.isArray(
        parsed
      )
    ) {

      output.innerText =
        "Invalid flashcard format";

      return;
    }


    flashcards =
      parsed;

    currentFlashcard =
      0;

    showingAnswer =
      false;


    document
      .getElementById(
        "flashcard-container"
      )
      .classList.remove(
        "hidden"
      );


    showFlashcard();

    output.innerText =
      "";

  } catch (err) {

    console.error(
      "FLASHCARD ERROR:",
      err
    );

    output.innerText =
      "Flashcard generation failed";
  }
};


// =========================
// SHOW FLASHCARD
// =========================

function showFlashcard() {

  if (
    !flashcards ||
    flashcards.length === 0
  ) {

    return;
  }


  const card =
    flashcards[
      currentFlashcard
    ];


  if (!card) {
    return;
  }


  const flashcard =
    document.getElementById(
      "flashcard"
    );


  // RESET CLASSES

  flashcard.className =
    `
    w-full
    max-w-[320px]
    h-[450px]
    rounded-3xl
    shadow-2xl
    cursor-pointer
    flex
    items-center
    justify-center
    text-center
    text-2xl
    font-bold
    transition-all
    duration-500
    hover:scale-105
    hover:rotate-1
    p-6
    select-none
    `;


  // QUESTION

  if (
    !showingAnswer
  ) {

    flashcard.innerText =
      card.question;

    flashcard.classList.add(
      "bg-blue-500",
      "text-white"
    );

  }


  // ANSWER

  else {

    flashcard.innerText =
      card.answer;

    flashcard.classList.add(
      "bg-green-500",
      "text-white"
    );
  }
}


// =========================
// FLIP CARD
// =========================

function flipCard() {

  showingAnswer =
    !showingAnswer;

  showFlashcard();
}


// =========================
// NEXT CARD
// =========================

function nextFlashcard() {

  if (
    currentFlashcard
    <
    flashcards.length - 1
  ) {

    currentFlashcard++;

    showingAnswer =
      false;

    showFlashcard();
  }
}


// =========================
// PREVIOUS CARD
// =========================

function prevFlashcard() {

  if (
    currentFlashcard
    >
    0
  ) {

    currentFlashcard--;

    showingAnswer =
      false;

    showFlashcard();
  }
}


// =========================
// AI CHAT TUTOR
// =========================

window.askTutor =
async function() {

  const input =
    document.getElementById(
      "chat-input"
    );

  const chatBox =
    document.getElementById(
      "chat-box"
    );

  const question =
    input.value.trim();


  if (!question) {
    return;
  }


  // USER MESSAGE

  chatBox.innerHTML += `
    <div class="text-right mb-4">

      <div class="inline-block
      bg-blue-500 text-white
      px-4 py-2 rounded-xl">

        ${question}

      </div>

    </div>
  `;


  input.value =
    "";


  // LOADING

  chatBox.innerHTML += `
    <div id="typing"
      class="mb-4 text-gray-500">

      AI is thinking...

    </div>
  `;


  chatBox.scrollTop =
    chatBox.scrollHeight;


  try {

    const response =
      await fetch(
        "/api/groq",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            model:
              "openai/gpt-oss-20b",

            messages: [

              {
                role: "system",

                content: `
You are a modern AI study tutor.

IMPORTANT RULES:

- NEVER use ---- or ==== separators
- NEVER use markdown tables
- Use ONLY:
  # Heading
  ## Subheading
  * Bullet points

- Keep paragraphs short
- Keep formatting like ChatGPT
- Remove unnecessary space between heading and Subheading
- Keep formatting clean
- Explain like ChatGPT
- Avoid giant walls of text
- Make responses visually beautiful
`
              },

              {
                role: "user",

                content:
                  question
              }
            ]
          })
        }
      );


    const data =
      await response.json();


    console.log(
      "CHAT DATA:",
      data
    );


    document
      .getElementById(
        "typing"
      )
      ?.remove();


    if (!response.ok) {

      console.error(
        "CHAT API ERROR:",
        data
      );

      chatBox.innerHTML += `
        <div class="text-red-500 mb-4">
          ${
            data?.error?.message ||
            "AI failed to respond"
          }
        </div>
      `;

      return;
    }


    const reply =
      data?.choices?.[0]
        ?.message?.content;


    chatBox.innerHTML += `

      <div class="flex justify-start">

        <div class="
        max-w-[85%]
        bg-white dark:bg-slate-700
        text-black dark:text-white
        px-6 py-5
        rounded-3xl
        shadow-md
        leading-relaxed
        prose
        text-[15px]
        whitespace-pre-wrap
        break-words
        border border-gray-200 dark:border-slate-600
        text-left">

          <div class="font-bold mb-2 text-green-500">
            AI Tutor
          </div>

          ${formatAIResponse(
            reply ||
            "No response"
          )}

        </div>

      </div>

    `;


    chatBox.scrollTop =
      chatBox.scrollHeight;


  } catch (err) {

    console.error(
      "AI TUTOR ERROR:",
      err
    );


    document
      .getElementById(
        "typing"
      )
      ?.remove();


    chatBox.innerHTML += `
      <div class="text-red-500 mb-4">
        AI failed to respond
      </div>
    `;
  }
};


// =========================
// FORMAT AI RESPONSE
// =========================

function formatAIResponse(text) {

  return text

    // REMOVE SEPARATORS

    .replace(
      /[-=]{3,}/g,
      ""
    )

    // H1

    .replace(
      /^# (.*)$/gm,

      `<h1 class="text-2xl font-bold mt-6 mb-4 text-blue-500">
        $1
      </h1>`
    )

    // H2

    .replace(
      /^## (.*)$/gm,

      `<h2 class="text-xl font-bold mt-5 mb-3 text-green-500">
        $1
      </h2>`
    )

    // H3

    .replace(
      /^### (.*)$/gm,

      `<h3 class="text-lg font-bold mt-4 mb-2 text-purple-500">
        $1
      </h3>`
    )

    // BULLET POINTS

    .replace(
      /^\* (.*)$/gm,

      `<li class="ml-6 mb-2">
        $1
      </li>`
    )

    // BOLD TEXT

    .replace(
      /\*\*(.*?)\*\*/g,

      `<strong>$1</strong>`
    )

    // DOUBLE LINE BREAKS

    .replace(
      /\n\n/g,
      "<br><br>"
    )

    // SINGLE LINE BREAKS

    .replace(
      /\n/g,
      "<br>"
    );
}