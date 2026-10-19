import React from 'react';

const QuestionPaper = ({ data }) => {
  if (!data) return null;

  const renderSection = (title, questions, marks, bgClass, badgeColor) => {
    if (!questions || questions.length === 0) return null;

    return (
      <div className={`p-4 mb-4 rounded-3 ${bgClass} fade-in`}>
        <div className="d-flex align-items-center mb-3">
          <h4 className="mb-0 me-3">{title}</h4>
          <span className={`badge bg-${badgeColor} marks-badge`}>
            {marks} mark{marks > 1 ? 's' : ''} each
          </span>
        </div>
        <ol className="mb-0">
          {questions.map((q, idx) => (
            <li key={idx} className="mb-3 question-item p-2">
              <div className="fw-semibold">{q.question}</div>
              {q.answer && (
                <div className="answer-box">
                  <strong className="text-primary">Answer:</strong>{' '}
                  <span>{q.answer}</span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    );
  };

  return (
    <div className="mt-4">
      <div className="text-center mb-4">
        <h3 className="header-title">{data.title || 'Exam Question Paper'}</h3>
        <p className="text-muted mb-0">
          Subject: <strong>{data.subject}</strong> | Total Marks:{' '}
          <strong>{data.totalMarks || 90}</strong>
        </p>
        <hr />
      </div>

      {renderSection(
        'Section A — Short Answer',
        data.sectionA,
        1,
        'section-a',
        'success'
      )}
      {renderSection(
        'Section B — Medium Answer',
        data.sectionB,
        3,
        'section-b',
        'warning'
      )}
      {renderSection(
        'Section C — Long Answer',
        data.sectionC,
        5,
        'section-c',
        'danger'
      )}
    </div>
  );
};

export default QuestionPaper;