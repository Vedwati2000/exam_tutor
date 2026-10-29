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
  const [evaluating, setEvaluating] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [completed, setCompleted] = useState(false);

  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

  const buildPrompt = (userTopic) => {
    return `You are an expert exam paper generator for students. Generate a complete exam question paper strictly based on the curriculum/topic: "${userTopic}".

The exam paper MUST have exactly this structure:
- Section A: 1 question, 1 mark (short answer / one-liner)
- Section B: 1 question, 3 marks (medium answer)
- Section C: 1 question, 5 marks (long answer)

Return ONLY a valid JSON object in this exact format. Do not include any markdown, code fences, comments, or text outside the JSON:
{
  "title": "Exam Paper Title",
  "subject": "${userTopic}",
  "totalMarks": 9,
  "sectionA": [
    { "question": "Question text", "answer": "Expected short answer here" }
  ],
  "sectionB": [
    { "question": "Question text", "answer": "Expected brief answer here" }
  ],
  "sectionC": [
    { "question": "Question text", "answer": "Expected detailed answer here" }
  ]
}

Rules:
- Section A must have exactly 1 item, and "answer" must contain the expected short answer.
- Section B must have exactly 1 item, and "answer" must contain the expected brief answer.
- Section C must have exactly 1 item, and "answer" must contain the expected detailed answer.
- No "answer" field should be an empty string.
- Start your response with { and end with }. No other characters.
- Do not include any asterisk symbols in your answers.`;
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

  const callGroq = async (prompt, systemPrompt) => {
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
              systemPrompt ||
              'You are a strict exam generator. You output ONLY a valid JSON object. Never include markdown, code fences, comments, explanations, or any text before or after the JSON. Your entire response must be parseable by JSON.parse().',
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

  const resetQuizState = () => {
    setCurrentSection(null);
    setCurrentIndex(0);
    setUserAnswer('');
    setEvaluation(null);
    setCompleted(false);
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
    resetQuizState();

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
        setCurrentSection('sectionA');
        setCurrentIndex(0);
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

  const getCurrentQuestion = () => {
    if (!paper || !currentSection) return null;
    const sectionArray = paper[currentSection];
    if (!sectionArray || !sectionArray[currentIndex]) return null;
    return sectionArray[currentIndex];
  };

  const getSectionMeta = (section) => {
    if (section === 'sectionA') return { label: 'Section A', marks: 1 };
    if (section === 'sectionB') return { label: 'Section B', marks: 3 };
    if (section === 'sectionC') return { label: 'Section C', marks: 5 };
    return { label: '', marks: 0 };
  };

  const moveToNextQuestion = () => {
    if (currentSection === 'sectionA') {
      setCurrentSection('sectionB');
      setCurrentIndex(0);
    } else if (currentSection === 'sectionB') {
      setCurrentSection('sectionC');
      setCurrentIndex(0);
    } else if (currentSection === 'sectionC') {
      setCompleted(true);
    }
    setUserAnswer('');
    setEvaluation(null);
  };

  const evaluateAnswer = async () => {
    if (!userAnswer.trim()) {
      setError('Please write your answer before submitting.');
      return;
    }

    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    if (!GROQ_API_KEY) {
      setError('Groq API key is not loaded.');
      return;
    }

    setError('');
    setEvaluating(true);
    setEvaluation(null);

    const { label, marks } = getSectionMeta(currentSection);
    const evalPrompt = `You are an exam evaluator. Evaluate the student's answer for the following question.

Section: ${label} (${marks} mark${marks > 1 ? 's' : ''})
Question: ${currentQuestion.question}
Expected Answer: ${currentQuestion.answer}
Student's Answer: ${userAnswer}

Return ONLY a valid JSON object in this exact format with no markdown, no code fences, no extra text:
{
  "score": <number between 0 and ${marks}>,
  "maxScore": ${marks},
  "verdict": "<correct | partially correct | incorrect>",
  "feedback": "<concise feedback for the student without asterisk symbols>",
  "idealAnswer": "<the ideal answer without asterisk symbols>"
}

Rules:
- "score" must be an integer from 0 to ${marks}.
- "verdict" must be one of: correct, partially correct, incorrect.
- Do not use asterisk symbols anywhere.
- Start with { and end with }.`;

    try {
      const raw = await callGroq(
        evalPrompt,
        'You are a strict exam evaluator. You output ONLY a valid JSON object. Never include markdown, code fences, comments, explanations, or any text before or after the JSON. Your entire response must be parseable by JSON.parse().'
      );
      const jsonStr = cleanJsonResponse(raw);
      const parsed = JSON.parse(jsonStr);
      setEvaluation(parsed);
    } catch (err) {
      setError(err.message || 'Failed to evaluate answer. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleRestart = () => {
    setPaper(null);
    setTopic('');
    setError('');
    resetQuizState();
  };

  const currentQuestion = getCurrentQuestion();
  const { label: sectionLabel, marks: sectionMarks } = getSectionMeta(currentSection);

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
            Turn your curriculum into a focused practice session. Answer one question
            at a time and get instant AI feedback.
          </p>
        </div>

        {!paper && (
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
              One question per section. Answer, submit, and get instant feedback.
            </p>
          </div>
        )}

        {!paper && !loading && (
          <div className="exam-structure">
            <div className="exam-structure-heading">
              <span className="exam-section-eyebrow">EXAM STRUCTURE</span>
              <h3>What's Included?</h3>
              <p>Your practice paper follows this three-section format.</p>
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <div className="exam-section-card section-a">
                  <div className="exam-section-top">
                    <div className="exam-section-letter">A</div>
                    <span className="exam-section-tag">QUICK RECALL</span>
                  </div>
                  <h4>Section A</h4>
                  <p>Short-answer question to test your basics.</p>
                  <div className="exam-section-divider"></div>
                  <div className="exam-section-stats">
                    <div>
                      <strong>1</strong>
                      <span>Question</span>
                    </div>
                    <div>
                      <strong>1</strong>
                      <span>Mark</span>
                    </div>
                  </div>
                  <div className="exam-total-marks">Total: 1 mark</div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="exam-section-card section-b">
                  <div className="exam-section-top">
                    <div className="exam-section-letter">B</div>
                    <span className="exam-section-tag">UNDERSTANDING</span>
                  </div>
                  <h4>Section B</h4>
                  <p>Question to develop conceptual understanding.</p>
                  <div className="exam-section-divider"></div>
                  <div className="exam-section-stats">
                    <div>
                      <strong>1</strong>
                      <span>Question</span>
                    </div>
                    <div>
                      <strong>3</strong>
                      <span>Marks</span>
                    </div>
                  </div>
                  <div className="exam-total-marks">Total: 3 marks</div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="exam-section-card section-c">
                  <div className="exam-section-top">
                    <div className="exam-section-letter">C</div>
                    <span className="exam-section-tag">DEEP THINKING</span>
                  </div>
                  <h4>Section C</h4>
                  <p>Detailed question for deeper learning.</p>
                  <div className="exam-section-divider"></div>
                  <div className="exam-section-stats">
                    <div>
                      <strong>1</strong>
                      <span>Question</span>
                    </div>
                    <div>
                      <strong>5</strong>
                      <span>Marks</span>
                    </div>
                  </div>
                  <div className="exam-total-marks">Total: 5 marks</div>
                </div>
              </div>
            </div>

            <div className="exam-structure-footer">
              <span>✓</span>
              <p>
                <strong>Complete practice session:</strong> 3 questions, 9 total
                marks, with instant AI feedback.
              </p>
            </div>
          </div>
        )}

        {paper && !completed && currentQuestion && (
          <div className="exam-quiz-panel">
            <div className="exam-quiz-topbar">
              <span className="exam-quiz-section-tag">{sectionLabel}</span>
              <span className="exam-quiz-marks">
                {sectionMarks} mark{sectionMarks > 1 ? 's' : ''}
              </span>
            </div>

            <div className="exam-quiz-progress">
              <div
                className={`exam-quiz-step ${currentSection === 'sectionA' ? 'active' : ''} ${currentSection !== 'sectionA' ? 'done' : ''}`}
              >
                A
              </div>
              <div className="exam-quiz-line"></div>
              <div
                className={`exam-quiz-step ${currentSection === 'sectionB' ? 'active' : ''} ${currentSection === 'sectionC' ? 'done' : ''}`}
              >
                B
              </div>
              <div className="exam-quiz-line"></div>
              <div
                className={`exam-quiz-step ${currentSection === 'sectionC' ? 'active' : ''}`}
              >
                C
              </div>
            </div>

            <div className="exam-quiz-question">
              <span className="exam-quiz-qlabel">Question</span>
              <p>{currentQuestion.question}</p>
            </div>

            {error && (
              <div className="alert alert-danger exam-error" role="alert">
                {error}
              </div>
            )}

            <div className="exam-quiz-answer">
              <label htmlFor="userAnswer">Your Answer</label>
              <textarea
                id="userAnswer"
                className="form-control exam-answer-input"
                rows="5"
                placeholder="Type your answer here..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={evaluating || !!evaluation}
              />
            </div>

            {!evaluation && (
              <button
                type="button"
                className="exam-generate-button"
                onClick={evaluateAnswer}
                disabled={evaluating || !userAnswer.trim()}
              >
                {evaluating ? (
                  <>
                    <span className="exam-loader"></span>
                    Evaluating Your Answer...
                  </>
                ) : (
                  <>
                    <span className="generate-icon">✦</span>
                    Submit Answer for Evaluation
                    <span className="generate-arrow">→</span>
                  </>
                )}
              </button>
            )}

            {evaluation && (
              <div className="exam-evaluation">
                <div className="exam-eval-head">
                  <span
                    className={`exam-eval-verdict verdict-${(evaluation.verdict || '')
                      .replace(/\s+/g, '-')
                      .toLowerCase()}`}
                  >
                    {evaluation.verdict}
                  </span>
                  <span className="exam-eval-score">
                    {evaluation.score} / {evaluation.maxScore || sectionMarks}
                  </span>
                </div>

                <div className="exam-eval-block">
                  <h4>Feedback</h4>
                  <p>{evaluation.feedback}</p>
                </div>

                <div className="exam-eval-block">
                  <h4>Ideal Answer</h4>
                  <p>{evaluation.idealAnswer}</p>
                </div>

                <button
                  type="button"
                  className="exam-generate-button"
                  onClick={moveToNextQuestion}
                >
                  {currentSection === 'sectionC' ? (
                    <>
                      <span className="generate-icon">✦</span>
                      Finish Practice
                      <span className="generate-arrow">→</span>
                    </>
                  ) : (
                    <>
                      <span className="generate-icon">✦</span>
                      Next Question
                      <span className="generate-arrow">→</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {completed && (
          <div className="exam-completed-panel">
            <div className="exam-completed-icon">✓</div>
            <h3>Practice Complete</h3>
            <p>
              You answered all three questions for <strong>{paper?.subject}</strong>.
              Review your feedback above or start a new session.
            </p>
            <button
              type="button"
              className="exam-generate-button"
              onClick={handleRestart}
            >
              <span className="generate-icon">✦</span>
              Start New Session
              <span className="generate-arrow">→</span>
            </button>
          </div>
        )}

        {paper && (
          <div className="exam-paper-output">
            <QuestionPaper data={null} />
          </div>
        )}
      </div>

      <Mascot loading={loading} paper={paper} />
    </div>
  );
};

export default ExamTutor;