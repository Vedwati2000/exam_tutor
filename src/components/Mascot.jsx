

import { useEffect, useState } from "react";
import "./Mascot.css";

const Mascot = ({ loading, paper }) => {
  const [showSpeech, setShowSpeech] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [message, setMessage] = useState(
    "Hi! I'm Professor Owl. Ready to prepare for your exam?"
  );

  const messages = [
    "Let's learn something new today!",
    "Read every question carefully before answering.",
    "Don't forget to review your Section C answers!",
    "Take your time. Learning is a journey!",
    "You've got this! Practice makes perfect!",
    "Click Generate Exam Paper to start learning!"
  ];

  useEffect(() => {
    if (loading) {
      setMessage("Hmm... I'm thinking! Let's create your exam paper.");
      setShowSpeech(true);
    } else if (paper) {
      setMessage("Hooray! Your exam paper is ready. Let's start learning!");
      setShowSpeech(true);
    }
  }, [loading, paper]);

  const handleClick = () => {
    setShowSpeech(true);

    if (loading) {
      setMessage("I'm working hard on your exam paper. Just a moment!");
      return;
    }

    if (paper) {
      setMessage("Your exam is ready! Read the questions and try your best.");
      return;
    }

    const nextIndex = (messageIndex + 1) % messages.length;

    setMessageIndex(nextIndex);
    setMessage(messages[nextIndex]);
  };

  const mascotStatus = loading
    ? "thinking"
    : paper
      ? "success"
      : "idle";

  return (
    <div
      className={`mascot-container mascot-${mascotStatus}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Professor Owl. Click for study tips."
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      }}
    >
      {showSpeech && (
        <div className="mascot-speech">
          <div className="mascot-speech-heading">
            <span className="mascot-speech-icon">🦉</span>
            <strong>Professor Owl</strong>
            {loading && <span className="thinking-dots">...</span>}
          </div>

          <div className="mascot-speech-message">{message}</div>
        </div>
      )}

      <div className="mascot-character">
        {loading && (
          <div className="mascot-thinking-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}

        {mascotStatus === "success" && (
          <div className="mascot-success-sparkles">
            <span>✦</span>
            <span>✧</span>
            <span>✦</span>
          </div>
        )}

        <svg
          className="mascot-svg"
          width="110"
          height="110"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >

          <ellipse
            className="mascot-body"
            cx="50"
            cy="65"
            rx="30"
            ry="32"
            fill="#6c5ce7"
          />

          <ellipse cx="50" cy="72" rx="20" ry="22" fill="#a29bfe" />

          <ellipse
            className="mascot-wing mascot-wing-left"
            cx="22"
            cy="62"
            rx="8"
            ry="18"
            fill="#5f3dc4"
          />

          <ellipse
            className="mascot-wing mascot-wing-right"
            cx="78"
            cy="62"
            rx="8"
            ry="18"
            fill="#5f3dc4"
          />
          <g className="mascot-head">
            <circle cx="50" cy="35" r="28" fill="#6c5ce7" />

            <g className="mascot-eyes">
              <circle cx="38" cy="33" r="12" fill="white" />
              <circle cx="62" cy="33" r="12" fill="white" />

              <circle cx="38" cy="33" r="6" fill="#2d3436" />
              <circle cx="62" cy="33" r="6" fill="#2d3436" />

              <circle cx="40" cy="31" r="2" fill="white" />
              <circle cx="64" cy="31" r="2" fill="white" />
            </g>


            <polygon points="50,42 46,50 54,50" fill="#fdcb6e" />
            <g className="mascot-cap">
              <polygon
                points="50,2 20,14 50,24 80,14"
                fill="#2d3436"
              />

              <rect x="30" y="14" width="40" height="6" fill="#2d3436" />

              <rect x="48" y="18" width="4" height="10" fill="#fdcb6e" />

              <circle cx="50" cy="30" r="3" fill="#fdcb6e" />
            </g>
          </g>

          <g className="mascot-feet">
            <ellipse cx="40" cy="96" rx="7" ry="3" fill="#fdcb6e" />
            <ellipse cx="60" cy="96" rx="7" ry="3" fill="#fdcb6e" />
          </g>
        </svg>
      </div>

      <div className="mascot-caption">
        {loading
          ? "Thinking..."
          : paper
            ? "Exam ready!"
            : "Your study buddy"}
      </div>
    </div>
  );
};

export default Mascot;