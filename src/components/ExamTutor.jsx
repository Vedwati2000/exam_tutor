import React, { useState } from 'react';
import QuestionPaper from './QuestionPaper';
import Mascot from './Mascot';
import BouncingBall from './BouncingBall';

const ExamTutor = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [paper, setPaper] = useState(null);
  const [error, setError] = useState('');

  // ✅ Vite requires VITE_ prefix
  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

  const buildPrompt = (userTopic) => {
    return `You are an expert exam paper generator for students. Generate a complete exam question paper strictly based on the curriculum/topic: "${userTopic}".

The exam paper MUST have exactly this structure:
- Section A: 10 questions, 1 mark each (short answer / one-liners)
- Section B: 10 questions, 3 marks each (medium answer)
- Section C: 10 questions, 5 marks each (long answer) - each MUST include a detailed answer

Return ONLY a valid JSON object in this exact format. Do not include any markdown, code fences, comments, or text outside the JSON:
{
  "title": "Exam Paper Title",
  "subject": "${userTopic}",
  "totalMarks": 90,
  "sectionA": [
    { "question": "Question text", "answer": "" }
  ],
  "sectionB": [
    { "question": "Question text", "answer": "" }
  ],
  "sectionC": [
    { "question": "Question text", "answer": "Detailed answer here" }
  ]
}

Rules:
- Section A must have exactly 10 items.
- Section B must have exactly 10 items.
- Section C must have exactly 10 items, and each "answer" field must contain a comprehensive answer.
- For Section A and B, "answer" can be an empty string.
- Start your response with { and end with }. No other characters.`;
  };

  // Helper: strip markdown fences and extract the JSON object
  const cleanJsonResponse = (raw) => {
    let text = (raw || '').trim();

    // Remove ```json ... ``` or ``` ... ```
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');

    // Extract from first { to last }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      throw new Error('AI did not return a JSON object.');
    }
    return text.slice(start, end + 1);
  };

  const callGroq = async (prompt) => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content:
              'You are a strict exam generator. You output ONLY a valid JSON object. Never include markdown, code fences, comments, explanations, or any text before or after the JSON and also you have to generate all questions answer. Your entire response must be parseable by JSON.parse().',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('No content returned from AI.');

    return content;
  };

  const generateExam = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic or subject first.');
      return;
    }


    if (!GROQ_API_KEY) {
      setError(
        'Groq API key is not loaded. Add VITE_GROQ_API_KEY to your .env file at the project root and restart the dev server.'
      );
      return;
    }

    setError('');
    setLoading(true);
    setPaper(null);

    const prompt = buildPrompt(topic);
    const MAX_ATTEMPTS = 3;
    let lastErr = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const raw = await callGroq(prompt);
        const jsonStr = cleanJsonResponse(raw);
        const parsed = JSON.parse(jsonStr);

        if (
          !Array.isArray(parsed.sectionA) ||
          !Array.isArray(parsed.sectionB) ||
          !Array.isArray(parsed.sectionC)
        ) {
          throw new Error('AI response is missing one or more sections.');
        }

        setPaper(parsed);
        setLoading(false);
        return;
      } catch (err) {
        console.warn(`Attempt ${attempt} failed:`, err.message);
        lastErr = err;


        if (/401|403|Invalid API Key/i.test(err.message)) break;

        if (attempt < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      }
    }

    setError(
      lastErr?.message ||
        'Failed to generate exam paper after multiple attempts. Please try again.'
    );
    setLoading(false);
  };

  return (
    <div className="container py-4">
      <div className="main-card p-4 p-md-5 mx-auto" style={{ maxWidth: '900px' }}>
        <div className="text-center mb-4">
          <div className="d-flex justify-content-center align-items-center gap-3 mb-2">
            <BouncingBall color="#764ba2" />
            <h1 className="header-title mb-0">AI Exam Preparation Tutor</h1>
            <BouncingBall color="#667eea" />
          </div>
          <p className="header-subtitle">
            Generate a full exam paper (Sections A, B, C) on any topic with answers.
          </p>
        </div>

        <div className="mb-3">
          <label htmlFor="topicInput" className="form-label fw-semibold">
            Enter your curriculum topic or subject
          </label>
          <textarea
            id="topicInput"
            className="form-control form-control-lg"
            rows="3"
            placeholder="e.g. Class 10 Science — Light: Reflection and Refraction, or 'Data Structures: Arrays and Linked Lists'"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && (
          <div className="alert alert-danger fade-in" role="alert">
            {error}
          </div>
        )}

        <div className="d-grid mb-4">
          <button
            className={`btn btn-primary btn-lg fw-semibold ${
              !loading ? 'pulse-btn' : ''
            }`}
            onClick={generateExam}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loader me-2"></span>
                Generating Exam Paper...
              </>
            ) : (
              <>Generate Exam Paper</>
            )}
          </button>
        </div>

        {!paper && !loading && (
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <div className="card section-a border-0 h-100">
                <div className="card-body">
                  <h6 className="fw-bold text-success">Section A</h6>
                  <p className="small mb-0">10 questions × 1 mark</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card section-b border-0 h-100">
                <div className="card-body">
                  <h6 className="fw-bold text-warning">Section B</h6>
                  <p className="small mb-0">10 questions × 3 marks</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card section-c border-0 h-100">
                <div className="card-body">
                  <h6 className="fw-bold text-danger">Section C</h6>
                  <p className="small mb-0">10 questions × 5 marks (with answers)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <QuestionPaper data={paper} />
      </div>

      <Mascot />
    </div>
  );
};

export default ExamTutor;