import React, { useState } from 'react';

const Mascot = () => {
  const [showSpeech, setShowSpeech] = useState(false);

  const messages = [
    "Hi! I'm Professor Owl. Ready to prep for your exam?",
    "Enter your subject and I'll create a custom exam paper!",
    "Don't forget to review Section C answers carefully!",
    "You've got this! Practice makes perfect.",
    "Click me again for more tips!"
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  const handleClick = () => {
    if (showSpeech) {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    } else {
      setShowSpeech(true);
    }
  };

  return (
    <div className="mascot-container" onClick={handleClick}>
      {showSpeech && (
        <div className="mascot-speech">
          <strong>Professor Owl:</strong>
          <div className="mt-1">{messages[messageIndex]}</div>
        </div>
      )}
      <svg
        className="mascot-svg"
        width="90"
        height="90"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="50" cy="65" rx="30" ry="32" fill="#6c5ce7" />
  
        <ellipse cx="50" cy="72" rx="20" ry="22" fill="#a29bfe" />

        <ellipse cx="22" cy="62" rx="8" ry="18" fill="#5f3dc4" />
        <ellipse cx="78" cy="62" rx="8" ry="18" fill="#5f3dc4" />

        <circle cx="50" cy="35" r="28" fill="#6c5ce7" />
        <circle cx="38" cy="33" r="12" fill="white" />
        <circle cx="62" cy="33" r="12" fill="white" />
        <circle cx="38" cy="33" r="6" fill="#2d3436" />
        <circle cx="62" cy="33" r="6" fill="#2d3436" />
   
        <circle cx="40" cy="31" r="2" fill="white" />
        <circle cx="64" cy="31" r="2" fill="white" />
        <polygon points="50,42 46,50 54,50" fill="#fdcb6e" />
      
        <polygon points="50,2 20,14 50,24 80,14" fill="#2d3436" />
        <rect x="30" y="14" width="40" height="6" fill="#2d3436" />
        <rect x="48" y="18" width="4" height="10" fill="#fdcb6e" />
        <circle cx="50" cy="30" r="3" fill="#fdcb6e" />

        <ellipse cx="40" cy="96" rx="7" ry="3" fill="#fdcb6e" />
        <ellipse cx="60" cy="96" rx="7" ry="3" fill="#fdcb6e" />
      </svg>
    </div>
  );
};

export default Mascot;