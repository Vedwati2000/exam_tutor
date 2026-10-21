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
        <div className="container py-4">
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">
                    <h2 className="mb-2">Student Feedback</h2>

                    <p className="text-secondary">
                        Share your experience with our AI Exam Tutor.
                    </p>

                    {message && (
                        <div className="alert alert-success" role="status">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Student Name</label>

                            <input
                                type="text"
                                name="studentName"
                                className="form-control"
                                value={form.studentName}
                                onChange={handleChange}
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Batch / Class</label>

                            <input
                                type="text"
                                name="batch"
                                className="form-control"
                                placeholder="Example: BCA Semester 3"
                                value={form.batch}
                                onChange={handleChange}
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                Rate Your Exam Preparation Experience
                            </label>

                            <select
                                name="rating"
                                className="form-select"
                                value={form.rating}
                                onChange={handleChange}
                                required
                            >
                                <option value="5">5 - Excellent</option>
                                <option value="4">4 - Very Good</option>
                                <option value="3">3 - Good</option>
                                <option value="2">2 - Needs Improvement</option>
                                <option value="1">1 - Poor</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">What Worked Well?</label>

                            <textarea
                                name="whatWentWell"
                                className="form-control"
                                rows="3"
                                placeholder="Was the AI-generated exam paper helpful?"
                                value={form.whatWentWell}
                                onChange={handleChange}
                                maxLength={2000}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Challenges</label>

                            <textarea
                                name="challenges"
                                className="form-control"
                                rows="3"
                                placeholder="What difficulties did you face?"
                                value={form.challenges}
                                onChange={handleChange}
                                maxLength={2000}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Suggestions</label>

                            <textarea
                                name="suggestions"
                                className="form-control"
                                rows="3"
                                placeholder="How can we improve the AI Exam Tutor?"
                                value={form.suggestions}
                                onChange={handleChange}
                                maxLength={2000}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary">
                            {editingId ? "Update Feedback" : "Submit Feedback"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                className="btn btn-secondary ms-2"
                                onClick={cancelEdit}
                            >
                                Cancel
                            </button>
                        )}
                    </form>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Submitted Feedback</h3>

                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={fetchFeedback}
                    disabled={loading}
                >
                    Refresh
                </button>
            </div>

            {loading && <p>Loading feedback...</p>}

            {!loading && feedbackList.length === 0 && !error && (
                <p>No feedback submitted yet.</p>
            )}

            <div className="row g-3">
                {feedbackList.map((feedback) => (
                    <div className="col-md-6 col-lg-4" key={feedback._id}>
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <h5>{feedback.studentName}</h5>

                                <p className="text-secondary">{feedback.batch}</p>

                                <p>
                                    <strong>Rating:</strong> {feedback.rating}/5
                                </p>

                                <p>
                                    <strong>What worked well:</strong>
                                    <br />
                                    {feedback.whatWentWell}
                                </p>

                                <p>
                                    <strong>Challenges:</strong>
                                    <br />
                                    {feedback.challenges || "Not provided"}
                                </p>

                                <p>
                                    <strong>Suggestions:</strong>
                                    <br />
                                    {feedback.suggestions || "Not provided"}
                                </p>

                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => handleEdit(feedback)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(feedback._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FeedbackForm;