<p align="center">
  <img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0b1416,55:115e59,100:2dd4bf&height=210&section=header&text=AI%20Interview%20Prep&fontSize=56&fontColor=e6f4f1&fontAlignY=36&desc=Practice%20like%20it%27s%20the%20real%20placement%20interview&descAlignY=58&descSize=18&animation=fadeIn" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=500&size=18&duration=2800&pause=700&color=2DD4BF&center=true&vCenter=true&width=660&lines=Adaptive+AI+technical+interviews;C%2B%2B+code+judge+in+Docker+%2B+BullMQ;MCQ+tests+%C2%B7+STAR+behavioral+%C2%B7+ATS+resume+score" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express%205-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis%20%2B%20BullMQ-DC382D?style=flat-square&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Groq-F55036?style=flat-square" />
  <img src="https://img.shields.io/badge/Monaco%20Editor-0078D4?style=flat-square&logo=visualstudiocode&logoColor=white" />
</p>

---

## 🎯 What is this?

Campus placement interviews test four things: **CS fundamentals**, **DSA coding**, **behavioral answers** and **your resume**. This platform lets you practise all four in one place. An AI interviewer adapts to your answers, a real C++ judge runs your code against hidden test cases, and the platform tracks which concepts you've actually mastered.

<p align="center">
  <img src="./docs/assets/pipelines.svg" width="100%" alt="AI interview loop and C++ code judge pipeline" />
</p>

---

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 🎙️ AI technical interviews
- Live, one-question-at-a-time interviews on **DBMS, OS, Computer Networks and OOPS**
- Drawn from a curated knowledge base of **248 concepts**, each with a grading rubric
- Questions **adapt to every answer**: go deeper, probe the gap, or step back
- **Concept mastery tracking** skips what you know and targets your weak spots

</td>
<td width="50%" valign="top">

### 💻 DSA practice with a code judge
- LeetCode-style split view with the **Monaco editor**
- **C++ judge** runs your code against visible and hidden test cases
- Tag-based problem list, **progress ring**, stats and a **practice calendar**
- Bulk problem upload for admins

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 📝 MCQ tests
- **50-question tests per subject** (20 easy, 20 medium, 10 hard), randomly sampled on every attempt
- Full **attempt review** of every answer after the test
- **Leaderboard** across users

</td>
<td width="50%" valign="top">

### 🧑‍💼 Behavioral & resume
- **STAR method practice**: AI scores clarity, impact and completeness, and suggests improvements
- **Resume vs job description analysis**: upload a PDF and get an ATS-style score with feedback
- Progress tracking for behavioral answers

</td>
</tr>
</table>

**Admin panel:** manage subjects, MCQs, DSA problems, STAR questions and users, with an analytics dashboard.

---

## ⚙️ Engineering highlights

<details open>
<summary><b>🧠 Adaptive interview engine</b></summary>

- Each answer is graded **0–10 against a rubric** (key points, reference answer, common mistakes) and sorted into a branch:
  - **7–10:** go one level deeper on the same concept
  - **4–6:** probe the specific gap in the answer
  - **0–3:** move to an easier, uncovered topic
- A topic gets at most **3 turns** (an opener plus two follow-ups), just like a real interviewer
- **Prompt-injection safe**: answers are treated as answers only, so "give me a 10" just scores as off-topic
- **Model fallback**: Groq Qwen3 first, GPT-OSS when rate-limited, with a time budget so slow calls never double-process an answer
- **Concept mastery** uses an exponential moving average of your scores. A concept counts as mastered only after 2+ strong attempts, and anything seen in the last 3 days is skipped.

</details>

<details>
<summary><b>⚖️ Measuring the grader (eval harness)</b></summary>

- `npm run eval:grading` runs fixed answers (strong, partial, vague, off-topic, "I don't know", prompt injection) through the **real grading path** several times each
- Reports how often each score lands in its expected range and how much repeated grades vary
- A `--compare` mode measures how much the rubric improves grading accuracy

</details>

<details>
<summary><b>🐳 Sandboxed C++ judge</b></summary>

- User code is merged with a per-problem **driver harness**, written to a temp `.cpp` file, compiled with `g++` and run against hidden test cases
- The API runs in **Docker as a non-root user**, with a **precompiled `<bits/stdc++.h>` header** to cut compile time
- Compile **timeouts kill the whole process group**, so stuck `cc1plus` and `ld` processes never pile up

</details>

<details>
<summary><b>📬 Judge queue with BullMQ</b></summary>

- Compiling is CPU-bound, so only a few runs execute at once and the rest wait in order. This prevents false TLEs under load.
- **One active run per user**, and the queue rejects new runs when it is full
- With Redis, jobs live in **BullMQ** and run in a **standalone worker process** (`npm run worker`). Without Redis it falls back to an in-memory queue.

</details>

---

## 🗂️ Project structure

```
interview-platform/
├── client/platform/          # React + Vite + Tailwind (deployed on Vercel)
│   └── src/
│       ├── pages/user/       # Interview room, DSA solve, tests, STAR, resume score, ...
│       ├── pages/admin/      # Subjects, MCQs, DSA problems, users, analytics
│       └── components/       # Code editor, problem tabs, calendar, progress ring, ...
├── server/                   # Express API (Docker on Render)
│   ├── src/
│   │   ├── services/
│   │   │   ├── interview/    # Engine, knowledge base, mastery, Groq provider
│   │   │   ├── cppRunner.js  # Compile and run C++ against test cases
│   │   │   └── judgeQueue.js # BullMQ / in-memory judge queue
│   │   ├── evals/            # Grading eval harness
│   │   ├── seeds/kb/         # Curated concept banks (DBMS, OS, CN, OOPS)
│   │   ├── models/ controllers/ routes/ middleware/
│   ├── worker.js             # Standalone judge worker
│   └── Dockerfile
└── render.yaml               # Backend deploy blueprint
```

---

<p align="center">
  Built by <a href="https://github.com/SATTURAMBOWORK"><b>Satvik Singh</b></a>
</p>

<p align="center">
  <img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:2dd4bf,45:115e59,100:0b1416&height=110&section=footer" />
</p>
