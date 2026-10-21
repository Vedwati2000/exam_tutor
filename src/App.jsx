
import { useEffect } from "react";
import ExamTutor from "./components/ExamTutor";
import FeedbackForm from "./components/FeedbackForm";
import "./App.css";

function App() {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const feedbackSubmitted =
        sessionStorage.getItem("feedbackSubmitted") === "true";

      if (!feedbackSubmitted) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="brand">
            <div className="brand-icon">AI</div>
            <div>
              <h1>Exam<span>Tutor</span></h1>
              <p>Your personal AI learning companion</p>
            </div>
          </div>

          <a href="#feedback" className="header-feedback-btn">
            Share Feedback <span>↗</span>
          </a>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-badge">
            <span className="status-dot"></span>
            YOUR LEARNING JOURNEY STARTS HERE
          </div>

          <h2>
            Learn Smarter.
            <br />
            <span>Prepare Better.</span>
          </h2>

          <p>
            Your AI-powered study partner is here to help you prepare
            for exams, practice questions, and build confidence.
          </p>

          <a href="#exam-tutor" className="hero-button">
            Start Learning <span>→</span>
          </a>

          <div className="hero-decoration decoration-one"></div>
          <div className="hero-decoration decoration-two"></div>
        </section>

        <section id="exam-tutor" className="content-section">
          <div className="section-heading">
            <span className="section-label">YOUR STUDY SPACE</span>
            <h2>AI Exam Preparation</h2>
            <p>Practice at your own pace and improve every day.</p>
          </div>

          <div className="feature-card">
            <ExamTutor />
          </div>
        </section>

        <section id="feedback" className="feedback-section">
          <div className="section-heading">
            <span className="section-label">YOUR VOICE MATTERS</span>
            <h2>Help Us Improve</h2>
            <p>
              Your feedback helps us make learning better for every student.
            </p>
          </div>

          <div className="feedback-card">
            <div className="feedback-intro">
              <div className="feedback-icon">✦</div>
              <div>
                <h3>How was your learning experience?</h3>
                <p>
                  Share your thoughts, challenges, and suggestions with us.
                </p>
              </div>
            </div>

            <FeedbackForm />
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <div className="footer-brand">ExamTutor AI</div>
        <p>Built for learners. Designed for growth.</p>
        <span>Keep learning. Keep growing.</span>
      </footer>
    </div>
  );
}

export default App;