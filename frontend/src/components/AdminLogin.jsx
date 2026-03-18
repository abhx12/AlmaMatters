import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./loginpage.css"; // Reuse the same CSS
import { loginAdmin } from "./api";

function Field({ label, name, type = "text", placeholder, value, onChange, required, disabled }) {
    return (
        <div className="field-group">
            <label htmlFor={name} className="field-label">
                {label}{required && <span className="required-star"> *</span>}
            </label>
            <input
                id={name} name={name} type={type}
                placeholder={placeholder || label}
                value={value} onChange={onChange}
                disabled={disabled}
                className="field-input"
                autoComplete={type === "password" ? "current-password" : "off"}
            />
        </div>
    );
}

export default function AdminLogin() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const clearError = () => setError("");

    const handlePasswordLogin = async () => {
        if (!username.trim()) { setError("Please enter your username."); return; }
        if (!password.trim()) { setError("Please enter your password."); return; }
        setLoading(true); clearError();
        try {
            const user = await loginAdmin(username, password);
            sessionStorage.setItem("currentUser", JSON.stringify({
                type: "admin",
                id: user.id,
                name: user.name,
                avatar: user.avatar,
            }));
            navigate("/admin-dashboard");
        } catch (e) {
            setError(e?.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card admin-theme">
                <h2 className="login-title">Admin Portal</h2>
                <p className="login-subtitle">Sign in to AlmaMatters Control Panel</p>

                {error && <div className="error-banner" role="alert">⚠️ {error}</div>}

                <div className="tab-body">
                    <Field label="Admin Username" name="username" required
                        placeholder="Your admin username"
                        value={username} onChange={e => { setUsername(e.target.value); clearError(); }} />
                    <Field label="Password" name="password" type="password" required
                        placeholder="Your password"
                        value={password} onChange={e => { setPassword(e.target.value); clearError(); }} />

                    <button className="btn-primary" onClick={handlePasswordLogin} disabled={loading}>
                        {loading ? "Signing in…" : "Sign In to Dashboard →"}
                    </button>
                    <button className="btn-link" onClick={() => navigate("/login")} style={{marginTop: "1rem"}}>
                        ← Back to Student/Alumni Login
                    </button>
                </div>
            </div>
        </div>
    );
}
