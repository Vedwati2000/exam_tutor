import { useEffect, useState } from "react";
import "./FeedbackForm.css"
const API_URL = "https://exam-tutorbackend.onrender.com/api/feedback";
const initialForm = {
    studentName: "",
    batch: "",
    rating: "5",
    whatWentWell: "",
    challenges: "",
    suggestions: ""
};

function FeedbackForm() {
    const [form, setForm] = useState(initialForm);
    const [feedbackList, setFeedbackList] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const fetchFeedback = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(API_URL);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load feedback");
            }

            setFeedbackList(data.feedback || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        const isEditing = Boolean(editingId);

        const url = isEditing
            ? `${API_URL}/${editingId}`
            : `${API_URL}/submit`;

        try {
            const response = await fetch(
                `https://exam-tutorbackend.onrender.com/api/feedback/submit`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        studentName: form.studentName,
                        batch: form.batch,
                        rating: Number(form.rating),
                        whatWentWell: form.whatWentWell,
                        challenges: form.challenges,
                        suggestions: form.suggestions
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to submit feedback");
            }
        } catch (err) {
            setError(err.message);
        }
    };



    const handleEdit = (feedback) => {
        setForm({
            studentName: feedback.studentName || "",
            batch: feedback.batch || "",
            rating: String(feedback.rating ?? 5),
            whatWentWell: feedback.whatWentWell || "",
            challenges: feedback.challenges || "",
            suggestions: feedback.suggestions || ""
        });

        setEditingId(feedback._id);
        setMessage("");
        setError("");

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this feedback?"
        );

        if (!confirmed) return;

        setMessage("");
        setError("");

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to delete feedback");
            }

            if (editingId === id) {
                setEditingId(null);
                setForm(initialForm);
            }

            setMessage(data.message);

            await fetchFeedback();
        } catch (err) {
            setError(err.message);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm(initialForm);
        setMessage("");
        setError("");
    };

    return (
    <div className="feedback-page">
        <div className="feedback-form-card">
            <div className="feedback-top">
                <div className="feedback-top-icon">✦</div>

                <div>
                    <span className="feedback-eyebrow">
                        STUDENT EXPERIENCE
                    </span>
                    <h2>Student Feedback</h2>
                    <p>
                        Help us make your AI learning experience even better.
                    </p>
                </div>
            </div>

            {message && (
                <div className="alert alert-success feedback-alert" role="status">
                    <span>✓</span> {message}
                </div>
            )}

            {error && (
                <div className="alert alert-danger feedback-alert" role="alert">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="feedback-form-grid">
                    <div className="feedback-field">
                        <label htmlFor="studentName">
                            Student Name <span>*</span>
                        </label>

                        <input
                            id="studentName"
                            type="text"
                            name="studentName"
                            className="form-control"
                            placeholder="Enter your full name"
                            value={form.studentName}
                            onChange={handleChange}
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="feedback-field">
                        <label htmlFor="batch">
                            Batch / Class <span>*</span>
                        </label>

                        <input
                            id="batch"
                            type="text"
                            name="batch"
                            className="form-control"
                            placeholder="e.g. BCA Semester 3"
                            value={form.batch}
                            onChange={handleChange}
                            maxLength={100}
                            required
                        />
                    </div>
                </div>

                <div className="feedback-field rating-field">
                    <label htmlFor="rating">
                        How would you rate your experience?
                    </label>

                    <select
                        id="rating"
                        name="rating"
                        className="form-select"
                        value={form.rating}
                        onChange={handleChange}
                        required
                    >
                        <option value="5">★★★★★ — Excellent</option>
                        <option value="4">★★★★☆ — Very Good</option>
                        <option value="3">★★★☆☆ — Good</option>
                        <option value="2">★★☆☆☆ — Needs Improvement</option>
                        <option value="1">★☆☆☆☆ — Poor</option>
                    </select>
                </div>

                <div className="feedback-field">
                    <label htmlFor="whatWentWell">
                        What Worked Well? <span>*</span>
                    </label>

                    <textarea
                        id="whatWentWell"
                        name="whatWentWell"
                        className="form-control"
                        rows="3"
                        placeholder="What did you like about the AI-generated exam papers?"
                        value={form.whatWentWell}
                        onChange={handleChange}
                        maxLength={2000}
                        required
                    />

                    <small>Share what helped you learn better.</small>
                </div>

                <div className="feedback-field">
                    <label htmlFor="challenges">
                        What Challenges Did You Face?
                    </label>

                    <textarea
                        id="challenges"
                        name="challenges"
                        className="form-control"
                        rows="3"
                        placeholder="Tell us about any difficulties you experienced."
                        value={form.challenges}
                        onChange={handleChange}
                        maxLength={2000}
                    />
                </div>

                <div className="feedback-field">
                    <label htmlFor="suggestions">
                        Your Suggestions
                    </label>

                    <textarea
                        id="suggestions"
                        name="suggestions"
                        className="form-control"
                        rows="3"
                        placeholder="What features or improvements would you like to see?"
                        value={form.suggestions}
                        onChange={handleChange}
                        maxLength={2000}
                    />
                </div>

                <div className="feedback-form-footer">
                    <p>
                        <span>*</span> Required fields
                    </p>

                    <div className="feedback-form-actions">
                        {editingId && (
                            <button
                                type="button"
                                className="btn-cancel-feedback"
                                onClick={cancelEdit}
                            >
                                Cancel
                            </button>
                        )}

                        <button
                            type="submit"
                            className="btn-submit-feedback"
                        >
                            {editingId ? "Update Feedback" : "Submit Feedback"}
                            <span>→</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>

        <div className="submitted-feedback-section">
            <div className="submitted-feedback-heading">
                <div>
                    <span className="feedback-eyebrow">
                        STUDENT VOICES
                    </span>
                    <h3>Submitted Feedback</h3>
                    <p>Experiences and ideas shared by our students.</p>
                </div>

                <button
                    type="button"
                    className="btn-refresh-feedback"
                    onClick={fetchFeedback}
                    disabled={loading}
                >
                    <span className={loading ? "refresh-spinning" : ""}>
                        ↻
                    </span>
                    {loading ? "Loading..." : "Refresh"}
                </button>
            </div>

            {loading && (
                <div className="feedback-loading">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading student feedback...</p>
                </div>
            )}

            {!loading && feedbackList.length === 0 && !error && (
                <div className="feedback-empty-state">
                    <div className="empty-feedback-icon">✧</div>
                    <h4>No feedback yet</h4>
                    <p>
                        Be the first to share your learning experience!
                    </p>
                </div>
            )}

            <div className="row g-4">
                {feedbackList.map((feedback) => (
                    <div
                        className="col-md-6 col-lg-4"
                        key={feedback._id}
                    >
                        <article className="student-feedback-card">
                            <div className="student-feedback-header">
                                <div className="student-avatar">
                                    {feedback.studentName
                                        ?.trim()
                                        .charAt(0)
                                        .toUpperCase() || "S"}
                                </div>

                                <div className="student-details">
                                    <h5>{feedback.studentName}</h5>
                                    <p>{feedback.batch}</p>
                                </div>
                            </div>

                            <div className="student-rating">
                                <span className="rating-stars">
                                    {"★".repeat(
                                        Math.max(
                                            0,
                                            Math.min(
                                                5,
                                                Number(feedback.rating) || 0
                                            )
                                        )
                                    )}
                                    <span className="rating-empty-stars">
                                        {"★".repeat(
                                            5 -
                                            Math.max(
                                                0,
                                                Math.min(
                                                    5,
                                                    Number(feedback.rating) || 0
                                                )
                                            )
                                        )}
                                    </span>
                                </span>

                                <span className="rating-number">
                                    {feedback.rating}/5
                                </span>
                            </div>

                            <div className="student-feedback-content">
                                <div className="feedback-response">
                                    <h6>What worked well</h6>
                                    <p>{feedback.whatWentWell}</p>
                                </div>

                                <div className="feedback-response">
                                    <h6>Challenges</h6>
                                    <p>
                                        {feedback.challenges || "Not provided"}
                                    </p>
                                </div>

                                <div className="feedback-response">
                                    <h6>Suggestions</h6>
                                    <p>
                                        {feedback.suggestions || "Not provided"}
                                    </p>
                                </div>
                            </div>

                            <div className="student-feedback-actions">
                                <button
                                    type="button"
                                    className="btn-edit-feedback"
                                    onClick={() => handleEdit(feedback)}
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    className="btn-delete-feedback"
                                    onClick={() => handleDelete(feedback._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </article>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
    
}

export default FeedbackForm;