import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./loginpage.css";
import { loginUnified, verifyStudentEmail } from "./api";

/* ── OTP generator (crypto-safe, frontend only) ─────────────── */
function generateOtp() {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return String(arr[0] % 1000000).padStart(6, "0");
}

/* ── Field helper ───────────────────────────────────────────── */
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

/* ── Main ───────────────────────────────────────────────────── */
export default function Login() {
    const navigate = useNavigate();
    const [tab, setTab] = useState("password"); // "password" | "otp"
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // — Password tab state
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // — OTP tab state
    const [email, setEmail]           = useState("");
    const [otpSent, setOtpSent]       = useState(false);
    const [generatedOtp, setGeneratedOtp] = useState("");
    const [enteredOtp, setEnteredOtp] = useState("");
    const [otpUserData, setOtpUserData] = useState(null); // user info returned on email verify

    const clearError = () => setError("");

    // ── Password login ──────────────────────────────────────────
    const handlePasswordLogin = async () => {
        if (!username.trim()) { setError("Please enter your username."); return; }
        if (!password.trim()) { setError("Please enter your password."); return; }
        setLoading(true); clearError();
        try {
            const user = await loginUnified(username, password);
            sessionStorage.setItem("currentUser", JSON.stringify({
                type: user.type,
                id: user.id,
                name: user.name,
                avatar: user.avatar,
            }));
            navigate("/home");
        } catch (e) {
            setError(e?.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ── OTP: Step 1 — verify email & generate OTP ─────────────
    const handleSendOtp = async () => {
        if (!email.trim()) { setError("Please enter your email address."); return; }
        setLoading(true); clearError();
        try {
            const user = await verifyStudentEmail(email);
            // Email belongs to a registered student — now generate OTP
            const otp = generateOtp();
            setGeneratedOtp(otp);
            setOtpUserData(user);
            setOtpSent(true);

            /* ── Show OTP to user in an in-page alert (no email server needed) ──
               In production you would send this via EmailJS or a backend mailer.
               For now we display it prominently so the flow can be tested. */
            setError(""); // clear first
            // Use a non-blocking notification instead of window.alert
            setOtpInfoMsg(`Your one-time password is: ${otp}`);
        } catch (e) {
            setError(e?.response?.data?.message || "Could not verify email. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // OTP info message (replaces alert)
    const [otpInfoMsg, setOtpInfoMsg] = useState("");

    // ── OTP: Step 2 — verify entered OTP ──────────────────────
    const handleVerifyOtp = () => {
        if (!enteredOtp.trim()) { setError("Please enter the OTP."); return; }
        if (enteredOtp.trim() !== generatedOtp) {
            setError("Incorrect OTP. Please check and try again.");
            return;
        }
        // OTP matched — log the user in
        sessionStorage.setItem("currentUser", JSON.stringify({
            type: "student",
            id: otpUserData.student_id,
            name: otpUserData.name,
            avatar: otpUserData.avatar,
        }));
        navigate("/home");
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h2 className="login-title">Welcome Back</h2>
                <p className="login-subtitle">Sign in to your AlmaMatters account</p>

                {/* ── Tab switcher ─────────────────────────── */}
                <div className="tab-switcher">
                    <button
                        className={`tab-btn${tab === "password" ? " active" : ""}`}
                        onClick={() => { setTab("password"); clearError(); setOtpSent(false); setOtpInfoMsg(""); }}
                    >
                        🔑 Username & Password
                    </button>
                    <button
                        className={`tab-btn${tab === "otp" ? " active" : ""}`}
                        onClick={() => { setTab("otp"); clearError(); setOtpInfoMsg(""); }}
                    >
                        📧 Email OTP
                    </button>
                </div>

                {/* ── Error banner ─────────────────────────── */}
                {error && <div className="error-banner" role="alert">⚠️ {error}</div>}

                {/* ── OTP info banner ──────────────────────── */}
                {otpInfoMsg && (
                    <div className="otp-info-banner">
                        🔢 <strong>{otpInfoMsg}</strong>
                        <br />
                        <small>Enter this code below to sign in.</small>
                    </div>
                )}

                {/* ══ TAB: Username + Password ═════════════ */}
                {tab === "password" && (
                    <div className="tab-body">
                        <Field label="Username" name="username" required
                            placeholder="Your username"
                            value={username} onChange={e => { setUsername(e.target.value); clearError(); }} />
                        <Field label="Password" name="password" type="password" required
                            placeholder="Your password"
                            value={password} onChange={e => { setPassword(e.target.value); clearError(); }} />

                        <button className="btn-primary" onClick={handlePasswordLogin} disabled={loading}>
                            {loading ? "Signing in…" : "Sign In →"}
                        </button>
                    </div>
                )}

                {/* ══ TAB: Email OTP ═══════════════════════ */}
                {tab === "otp" && (
                    <div className="tab-body">
                        {!otpSent ? (
                            <>
                                <Field label="Registered Email" name="email" type="email" required
                                    placeholder="you@example.com"
                                    value={email} onChange={e => { setEmail(e.target.value); clearError(); }} />
                                <button className="btn-primary" onClick={handleSendOtp} disabled={loading}>
                                    {loading ? "Verifying…" : "Get OTP →"}
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="otp-step-label">Enter the 6-digit OTP shown above:</p>
                                <Field label="One-Time Password" name="otp" required
                                    placeholder="6-digit OTP"
                                    value={enteredOtp} onChange={e => { setEnteredOtp(e.target.value); clearError(); }} />
                                <button className="btn-primary" onClick={handleVerifyOtp}>
                                    Verify & Sign In →
                                </button>
                                <button className="btn-link" onClick={() => {
                                    setOtpSent(false); setEnteredOtp(""); setOtpInfoMsg(""); clearError();
                                }}>
                                    ← Use a different email
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* ── Footer link ──────────────────────────── */}
                <p className="login-footer">
                    Don't have an account?{" "}
                    <button className="btn-link" onClick={() => navigate("/signup")}>Sign Up</button>
                </p>
            </div>
        </div>
    );
}