# QUIZ.ME

A minimal, no-framework quiz app that runs entirely in the browser. Upload an XML file with your questions and start quizzing — no server, no build step, no dependencies.

## Features

- **Multiple-choice mode** — questions with 2+ answers are presented as selectable options. Incorrect questions are re-queued until answered correctly.
- **Flashcard mode** — questions with exactly 1 answer show a text input. Type your answer, submit, and compare it side-by-side with the correct one.
- **Timer** — tracks elapsed time throughout the session.
- **First-attempt success rate** — see how many questions you got right on the first try.
- **Repeat** — replay the same quiz or upload a new XML file at the end.
- **Keyboard support** — press Enter to submit/advance.
- **Dark mode** — automatically follows your system preference.
- **Fully offline** — no network requests, everything runs client-side.

## Getting Started

1. Open `index.html` in any modern browser.
2. Click **Upload XML** and select your quiz file (or download the included sample).
3. Answer questions and review your results at the end.

No install, no build, no server required.

## XML Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<quiz>
  <!-- Multiple-choice: 2-6 answers, at least one correct -->
  <question text="Which of the following are programming languages?">
    <answer correct="true">Python</answer>
    <answer correct="true">JavaScript</answer>
    <answer correct="false">HTML</answer>
    <answer correct="false">HTTP</answer>
  </question>

  <!-- Flashcard: exactly 1 answer — type and compare -->
  <question text="What is the capital of Japan?">
    <answer correct="true">Tokyo</answer>
  </question>
</quiz>
```

### Rules

| Answers | Mode | Behaviour |
|---------|------|-----------|
| 2+ | Multiple-choice | Select one or more options, then check. Wrong answers re-queue the question. |
| 1 | Flashcard | Type your answer, submit, and compare it to the correct one. Always moves forward. |

### Tips

- Multiple answers can be marked `correct="true"` for multi-select questions.
- The question text can be provided as a `text` attribute or as a `<text>` child element.
- Feed the `sample.xml` plus your own questions to an LLM and ask it to produce a valid file in the same structure.

## File Structure

```
├── index.html    — page markup
├── styles.css    — all styling (light/dark, responsive)
├── app.js        — quiz logic (parsing, rendering, scoring)
├── sample.xml    — example quiz file with both modes
└── README.md
```

## License

Do whatever you want with it.
