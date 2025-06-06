// //import { getStoredData } from "./utils/storage";
// pdfjsLib import left in case you reuse PDF in future; not used here now

// Extract questions and options from the form
 // Extract questions and options from the form
const extractQuestionsWithOptions = () => {
  const questionItems = document.querySelectorAll('[role="listitem"]');
  const results: { question: string; options: string[] }[] = [];

  questionItems.forEach((item) => {
    const headingEl = item.querySelector('div[role="heading"]');
    const questionText = headingEl?.textContent?.trim() || '';

    if (!questionText) return;

    const optionsSet = new Set<string>();

    const potentialOptionEls = item.querySelectorAll(
      'div[aria-label], div[role="radio"], div[role="option"], span'
    );

    potentialOptionEls.forEach((el) => {
      const text = el.textContent?.trim();
      if (
        text &&
        text !== questionText &&
        text.length < 100 &&
        !/^[\*\-:]+$/.test(text)
      ) {
        optionsSet.add(text);
      }
    });

    // Convert Set to Array and remove the first 2 entries
    const options = Array.from(optionsSet).slice(2);

    results.push({
      question: questionText,
      options,
    });
  });

  return results;
};

// Fetch resume text from local .txt file in /public/
const fetchResumeText = async (): Promise<string> => {
  return `Ranjeet Nath Chaudhary
+91 95618 59161 | ranjitchaudhary839@gmail.com
LinkedIn: https://www.linkedin.com/in/ranjit-chaudhary-b01a92222/
GitHub: https://github.com/Ranjitdon

Education
Pimpri Chinchwad College of Engineering, Pune, Maharashtra
BTech. in Computer Science — Nov. 2022 – July 2026

Experience
Technical Team Member - ACM Student Chapter, PCCOE, Pune, Maharashtra
Sep. 2023 – Sep. 2024
• Organized and managed coding events, workshops, and technical sessions.
• Developed internal tools and event websites using ReactJS and Firebase.

Projects

Eduease (Live Demo: https://hm-0069-frontend.vercel.app/)
ReactJS, TypeScript, FastAPI, MongoDB, Google Classroom API — Oct. 2024
• Developed a real-time AI-powered feedback system for student assignments.
• Integrated semantic search using Vector DB for instant context-aware feedback.
• Connected with Google Classroom for assignment retrieval and feedback.
• Enabled grading, plagiarism detection, and learning insights, boosting productivity by 40%.

Finance Buddy (Live Demo: https://financebuddy-livid.vercel.app/)
Flask, Firebase, Firestore, HTML, CSS, JavaScript — Apr. 2024
• Built a financial literacy platform with tools for budgeting, savings, and investment.
• Implemented secure login and real-time cloud data with Firebase and Firestore.

Technical Skills
Languages: C, C++, Java, Python, HTML5, CSS3, JavaScript, TypeScript, SQL, NoSQL
Frameworks: ReactJS, Tailwind CSS, Bootstrap
Developer Tools: Git, VSCode, Vercel, Render
Platforms: GitHub, Google Cloud

Achievements
• Winner of Hackmatrix 2025 with Eduease.
• First Rank in BYTEME CTF by OWASP PCCOE.
• 3rd place at TECHFIESTA 2025 (Education domain), PICT Pune.
• Finalist at Hackmatrix 2024 with Finance Buddy.
• Solved 300+ coding problems on various platforms.

Certifications
• Goethe-Zertifikat A2: Fit in Deutsch – Goethe-Institut (Issued Dec 2024)
• Responsive Web Design – freeCodeCamp (Issued Mar 2024)
• Google GCloud Training – Google (Issued Sep 2023)
`;
};


// Call Gemini API
const callGeminiAPI = async (
  question: string,
  options: string[],
  resume: string,
  apiKey: string
): Promise<string> => {
  const basePrompt = `You are an assistant helping to fill out a form using only the information from the resume below.

Resume:
${resume}

Instructions:
- Answer the following question as specifically as possible based only on the resume content.
- If the answer cannot be confidently determined from the resume, respond with exactly: "Unidentified".
${options.length ? "- Choose one of the given options if possible.\n" : ""}
`;

  const prompt = options.length
    ? `${basePrompt}Question: ${question}\nOptions: ${options.join(", ")}`
    : `${basePrompt}Question: ${question}`;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const result = await response.json();
  return result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Unidentified";
};


// Inject floating chat box with Q&A
const injectChatBox = (qnaPairs: { question: string; answer: string }[]) => {
  const chatContainer = document.createElement("div");
  chatContainer.style.position = "fixed";
  chatContainer.style.bottom = "20px";
  chatContainer.style.right = "20px";
  chatContainer.style.width = "350px";
  chatContainer.style.maxHeight = "400px";
  chatContainer.style.overflowY = "auto";
  chatContainer.style.backgroundColor = "#ffffff";
  chatContainer.style.border = "1px solid #ccc";
  chatContainer.style.borderRadius = "10px";
  chatContainer.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
  chatContainer.style.padding = "15px";
  chatContainer.style.fontFamily = "Arial, sans-serif";
  chatContainer.style.zIndex = "9999";

  const header = document.createElement("div");
  header.innerText = "🧠 Gemini Answers";
  header.style.fontWeight = "bold";
  header.style.marginBottom = "10px";
  header.style.fontSize = "16px";
  chatContainer.appendChild(header);

  qnaPairs.forEach(({ question, answer }) => {
    const questionEl = document.createElement("div");
    questionEl.innerText = "Q: " + question;
    questionEl.style.fontWeight = "bold";
    questionEl.style.marginTop = "10px";
    questionEl.style.color = "#1a73e8";

    const answerEl = document.createElement("div");
    answerEl.innerText = "A: " + answer;
    answerEl.style.marginTop = "5px";
    answerEl.style.color = "#333";

    chatContainer.appendChild(questionEl);
    chatContainer.appendChild(answerEl);
  });

  document.body.appendChild(chatContainer);
};

const normalize = (str: string) =>
  str.trim().toLowerCase().replace(/\s+/g, " ");

// Autofill form fields with answers
const autofillAnswers = (answers: string[]) => {
  // Fill text inputs and textareas
  const textInputs = document.querySelectorAll('input[type="text"], textarea');
  let answerIdx = 0;
  textInputs.forEach((input) => {
    if (answers[answerIdx]) {
      (input as HTMLInputElement | HTMLTextAreaElement).value = answers[answerIdx];
      input.dispatchEvent(new Event("input", { bubbles: true }));
      answerIdx++;
    }
  });

  // Fill radio buttons and checkboxes
  const questionItems = document.querySelectorAll('[role="listitem"]');
  answers.forEach((answer, idx) => {
    const item = questionItems[idx];
    if (!item || !answer) return;

    const answerNorm = normalize(answer);

    // Try to match radio/option elements
    const optionLabels = item.querySelectorAll('div[role="radio"], div[role="option"], div[aria-checked]');
    let matched = false;
    optionLabels.forEach((optionEl) => {
      const optionText = optionEl.textContent?.trim();
      if (optionText && normalize(optionText) === answerNorm) {
        (optionEl as HTMLElement).click();
        matched = true;
      }
    });

    // If no exact match, try partial match
    if (!matched) {
      optionLabels.forEach((optionEl) => {
        const optionText = optionEl.textContent?.trim();
        if (
          optionText &&
          (normalize(optionText).includes(answerNorm) || answerNorm.includes(normalize(optionText)))
        ) {
          (optionEl as HTMLElement).click();
        }
      });
    }
  });
};

// Main script execution
(async () => {
  // Import API key from .env using import.meta.env (Vite or similar bundlers)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
  const resumeText = await fetchResumeText();

  const questionsWithOptions = extractQuestionsWithOptions();
  console.log("Extracted Questions and Options:", questionsWithOptions);

  const answers = await Promise.all(
    questionsWithOptions.map(q =>
      callGeminiAPI(q.question, q.options, resumeText, apiKey)
    )
  );

  const qnaPairs = questionsWithOptions.map((q, i) => ({
    question: q.question,
    answer: answers[i] || "No answer generated"
  }));

  // Autofill form fields
  autofillAnswers(answers);

  // Show floating chat box
  injectChatBox(qnaPairs);
})();
