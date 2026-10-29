
import { useState, useCallback } from "react";
import { callGroq, extractJson } from "./ExamTutor";

export default function useAIAnswerCheck() {
  const [checking, setChecking] = useState(false);

  const checkAnswer = useCallback(async ({ question, studentAnswer, expectedAnswer }) => {
    if (!studentAnswer?.trim()) {
      return { type: "warning", message: "Please enter your answer first.", correct: false };
    }
    setChecking(true);
    try {
      const prompt = `You are a friendly exam tutor. Evaluate the student's answer.

Question: ${question}
Official answer: ${expectedAnswer || "(none provided)"}
Student's answer: ${studentAnswer}

Return ONLY this JSON, no markdown, no extra text:
{
  "correct": true or false,
  "score": 0 to 1 (fraction of marks earned),
  "message": "An encouraging, warm, personalised 1–2 sentence feedback. If correct, celebrate the student by name of the concept. If partly correct, gently point out what was missing. If wrong, encourage them to try again and hint at the key idea.",
  "followUpHint": "A short optional hint if incorrect, else empty string"
}

Rules:
- Do not use asterisk (*) symbols anywhere.
- Be warm and motivational. Never insult the student.
- Accept semantically equivalent answers.`;

      const raw = await callGroq(
        [
          { role: "system", content: "You output ONLY valid JSON. No markdown, no explanations." },
          { role: "user", content: prompt },
        ],
        { temperature: 0.2, max_tokens: 5000 }
      );

      const result = extractJson(raw);
      return {
        type: result.correct ? "success" : "danger",
        message: result.followUpHint
          ? `${result.message} (Hint: ${result.followUpHint})`
          : result.message,
        correct: !!result.correct,
      };
    } catch (e) {
      return { type: "warning", message: "Could not check answer right now. Try again.", correct: false };
    } finally {
      setChecking(false);
    }
  }, []);

  return { checkAnswer, checking };
}