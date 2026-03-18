import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentSignup.css"; // Reuse the same card/step styling
import { registerAdminStep } from "./api";

function Field({ label, name, type = "text", placeholder, value, onChange, required }) {
    return (
        <div className="field-group">
            <label htmlFor={name} className="field-label">
                {label}{required && <span className="required-star"> *</span>}
            </label>
            <input
                id={name} name={name} type={type}
                placeholder={placeholder || label}
                value={value || ""} onChange={onChange}
                className="field-input"
            />
        </div>
    );
}

function SelectField({ label, name, options, value, onChange, required }) {
    return (
        <div className="field-group">
            <label htmlFor={name} className="field-label">
                {label}{required && <span className="required-star"> *</span>}
            </label>
            <select id={name} name={name} value={value || ""} onChange={onChange} className="field-input">
                <option value="">— Select {label} —</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );
}

const STEP_LABELS = ["Employee ID", "Personal", "Contact", "Address", "Login"];

function StepBar({ current }) {
    return (
        <div className="step-bar">
            {STEP_LABELS.map((label, i) => (
                <div key={i} className={`step-dot-wrap${i + 1 < current ? " done" : ""}${i + 1 === current ? " active" : ""}`}>
                    <div className="step-dot">{i + 1 < current ? "✓" : i + 1}</div>
                    <span className="step-dot-label">{label}</span>
                </div>
            ))}
        </div>
    );
}

export default function AdminSignup() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [adminId, setAdminId] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Using single form state based on the original structure but updated for Steps
    const [form, setForm] = useState({});

    const handleChange = (e) => {
        setError("");
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validate = () => {
        if (step === 1 && !form.employee_id) return "Employee ID is required.";
        if (step === 2 && !form.first_name) return "First name is required.";
        if (step === 3 && !form.email) return "Email address is required.";
        if (step === 5) {
            if (!form.username) return "Username is required.";
            if (!form.password) return "Password is required.";
            if (form.password.length < 8) return "Password must be at least 8 characters.";
        }
        return null;
    };

    const next = async () => {
        const err = validate();
        if (err) { setError(err); return; }
        
        setError("");
        setLoading(true);
        try {
            // Note: registerAdminStep was written as sequential API calls in original. Keeping the same logic.
            const res = await registerAdminStep(step, form, adminId);
            if (step === 1) {
                setAdminId(res.admin_id);
            }
            if (step < 5) {
                setStep(step + 1);
            } else {
                setStep(6); // Success
                setTimeout(() => navigate('/admin-login'), 2500);
            }
        } catch (e) {
            setError(e?.response?.data?.message || "Error saving step data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-card">
                <h2 className="signup-title">Admin Sign Up</h2>
                <StepBar current={step} />

                {error && <div className="error-banner" role="alert">⚠️ {error}</div>}

                <div className="step-body">
                    {/* STEP 1 */}
                    {step === 1 && (
                        <section>
                            <h3>Employment Information</h3>
                            <Field label="Employee ID" name="employee_id" required
                                placeholder="e.g. EMP-001" value={form.employee_id} onChange={handleChange} />
                        </section>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <section>
                            <h3>Personal Details</h3>
                            <Field label="First Name" name="first_name" required value={form.first_name} onChange={handleChange} />
                            <Field label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} />
                            <Field label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} />
                            <Field label="Date of Birth" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
                            <SelectField label="Gender" name="gender" 
                                options={["Male", "Female", "Other", "Prefer not to say"]}
                                value={form.gender} onChange={handleChange} />
                            <Field label="Profile Photo URL" name="profile_photo_url" placeholder="https://…" value={form.profile_photo_url} onChange={handleChange} />
                        </section>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <section>
                            <h3>Contact Details</h3>
                            <Field label="Email Address" name="email" type="email" required
                                placeholder="admin@example.com" value={form.email} onChange={handleChange} />
                            <Field label="Phone Number" name="phone_number" type="tel"
                                placeholder="+91 XXXXX XXXXX" value={form.phone_number} onChange={handleChange} />
                            <Field label="Alternate Phone" name="alternate_phone_number" type="tel"
                                placeholder="Optional" value={form.alternate_phone_number} onChange={handleChange} />
                        </section>
                    )}

                    {/* STEP 4 */}
                    {step === 4 && (
                        <section>
                            <h3>Address</h3>
                            <Field label="Address Line 1" name="address_line1" placeholder="Street / Door No." value={form.address_line1} onChange={handleChange} />
                            <Field label="Address Line 2" name="address_line2" placeholder="Area (optional)" value={form.address_line2} onChange={handleChange} />
                            <Field label="City" name="city" value={form.city} onChange={handleChange} />
                            <Field label="State" name="state" value={form.state} onChange={handleChange} />
                            <Field label="Pincode" name="pincode" placeholder="6-digit" value={form.pincode} onChange={handleChange} />
                            <Field label="Country" name="country" placeholder="e.g. India" value={form.country} onChange={handleChange} />
                        </section>
                    )}

                    {/* STEP 5 */}
                    {step === 5 && (
                        <section>
                            <h3>Create Login</h3>
                            <p className="step-hint">Your account will be finalized when you click <strong>Finish</strong>.</p>
                            <Field label="Username" name="username" required placeholder="Choose an admin username" value={form.username} onChange={handleChange} />
                            <Field label="Password" name="password" type="password" required placeholder="Min. 8 characters" value={form.password} onChange={handleChange} />
                        </section>
                    )}

                    {/* STEP 6 */}
                    {step === 6 && (
                        <section className="success-section">
                            <div className="success-icon">🎉</div>
                            <h3>Registration Complete!</h3>
                            <p>You can now log in to the admin portal. Redirecting…</p>
                        </section>
                    )}
                </div>

                {/* Navigation */}
                {step <= 5 && (
                    <div className="nav-buttons">
                        {step > 1 && (
                            <button className="btn-back" onClick={() => { setError(""); setStep(s => s - 1); }} disabled={loading}>
                                ← Back
                            </button>
                        )}
                        <button className="btn-next" onClick={next} disabled={loading}>
                            {step < 5 ? (loading ? "Saving…" : "Next →") : (loading ? "Registering…" : "Finish ✓")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}