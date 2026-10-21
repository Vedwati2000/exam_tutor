import React, { useState } from 'react';
import QuestionPaper from './QuestionPaper';
import Mascot from './Mascot';
import BouncingBall from './BouncingBall';
import './ExamTutor.css';

const ExamTutor = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [paper, setPaper] = useState(null);
  const [error, setError] = useState('');


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
- Section A must have exactly 10 items, and each "answer" field must be contained as short answer.
- Section B must have exactly 10 items, and each "answer" field must contain a brief answer.
- Section C must have exactly 10 items, and each "answer" field must contain a comprehensive answer.
- For Section A and B, "answer" should not be an empty string.
- Start your response with { and end with }. No other characters.
- Also provide a input box for the user to enter their topic, and a button to generate the exam paper. The button should be disabled while loading, and show a loading indicator when generating. also in the answer don't includes any asterisk symbols.`;

  };

  const cleanJsonResponse = (raw) => {
    let text = (raw || '').trim();


    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');

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
    <div className="exam-tutor-page">
        <div className="exam-tutor-card">
            <div className="exam-tutor-header">
                <div className="exam-tutor-badge">
                    <span className="exam-status-dot"></span>
                    YOUR PERSONAL AI STUDY PARTNER
                </div>

                <div className="exam-tutor-title">
                    <BouncingBall color="#6554e8" />

                    <h1>
                        AI Exam <span>Preparation Tutor</span>
                    </h1>

                    <BouncingBall color="#a092ff" />
                </div>

                <p className="exam-tutor-subtitle">
                    Turn your curriculum into a complete exam paper.
                    Practice smarter, understand concepts, and prepare with confidence.
                </p>
            </div>

            <div className="exam-generator-panel">
                <div className="exam-panel-heading">
                    <div className="exam-panel-icon">✦</div>

                    <div>
                        <h3>Create Your Exam Paper</h3>
                        <p>Start by entering a subject or curriculum topic.</p>
                    </div>
                </div>

                <div className="exam-topic-field">
                    <label htmlFor="topicInput">
                        Curriculum Topic or Subject
                        <span className="required-mark"> *</span>
                    </label>

                    <textarea
                        id="topicInput"
                        className="form-control exam-topic-input"
                        rows="4"
                        placeholder="For example: Data Structures, Operating Systems, JavaScript..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        disabled={loading}
                        required
                    />

                    <div className="exam-input-hint">
                        <span>✎</span>
                        Be specific about your topic for more relevant practice questions.
                    </div>
                </div>

                {error && (
                    <div className="alert alert-danger exam-error" role="alert">
                        <strong>Unable to generate exam.</strong>
                        <br />
                        {error}
                    </div>
                )}

                <button
                    type="button"
                    className="exam-generate-button"
                    onClick={generateExam}
                    disabled={loading || !topic.trim()}
                >
                    {loading ? (
                        <>
                            <span className="exam-loader"></span>
                            Generating Your Exam...
                        </>
                    ) : (
                        <>
                            <span className="generate-icon">✦</span>
                            Generate Exam Paper
                            <span className="generate-arrow">→</span>
                        </>
                    )}
                </button>

                <p className="exam-button-note">
                    Your practice paper includes three sections with answers.
                </p>
            </div>

            {!paper && !loading && (
                <div className="exam-structure">
                    <div className="exam-structure-heading">
                        <span className="exam-section-eyebrow">
                            EXAM STRUCTURE
                        </span>

                        <h3>What's Included?</h3>

                        <p>
                            Your practice paper follows this three-section format.
                        </p>
                    </div>

                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="exam-section-card section-a">
                                <div className="exam-section-top">
                                    <div className="exam-section-letter">A</div>
                                    <span className="exam-section-tag">
                                        QUICK RECALL
                                    </span>
                                </div>

                                <h4>Section A</h4>

                                <p>Short-answer questions to test your basics.</p>

                                <div className="exam-section-divider"></div>

                                <div className="exam-section-stats">
                                    <div>
                                        <strong>10</strong>
                                        <span>Questions</span>
                                    </div>

                                    <div>
                                        <strong>1</strong>
                                        <span>Mark each</span>
                                    </div>
                                </div>

                                <div className="exam-total-marks">
                                    Total: 10 marks
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="exam-section-card section-b">
                                <div className="exam-section-top">
                                    <div className="exam-section-letter">B</div>
                                    <span className="exam-section-tag">
                                        UNDERSTANDING
                                    </span>
                                </div>

                                <h4>Section B</h4>

                                <p>Questions to develop conceptual understanding.</p>

                                <div className="exam-section-divider"></div>

                                <div className="exam-section-stats">
                                    <div>
                                        <strong>10</strong>
                                        <span>Questions</span>
                                    </div>

                                    <div>
                                        <strong>3</strong>
                                        <span>Marks each</span>
                                    </div>
                                </div>

                                <div className="exam-total-marks">
                                    Total: 30 marks
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="exam-section-card section-c">
                                <div className="exam-section-top">
                                    <div className="exam-section-letter">C</div>
                                    <span className="exam-section-tag">
                                        DEEP THINKING
                                    </span>
                                </div>

                                <h4>Section C</h4>

                                <p>Detailed questions for deeper learning.</p>

                                <div className="exam-section-divider"></div>

                                <div className="exam-section-stats">
                                    <div>
                                        <strong>10</strong>
                                        <span>Questions</span>
                                    </div>

                                    <div>
                                        <strong>5</strong>
                                        <span>Marks each</span>
                                    </div>
                                </div>

                                <div className="exam-total-marks">
                                    Total: 50 marks
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="exam-structure-footer">
                        <span>✓</span>
                        <p>
                            <strong>Complete practice paper:</strong> 30 questions,
                            90 total marks, with answers.
                        </p>
                    </div>
                </div>
            )}

            <div className="exam-paper-output">
                <QuestionPaper data={paper} />
            </div>
        </div>

        <Mascot loading={loading} paper={paper} />
    </div>
);
};

export default ExamTutor;