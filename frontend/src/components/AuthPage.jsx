import React, { useState } from "react";
import { auth, setToken } from "../auth.js";

// Single page that toggles between Log in and Sign up (email + password).
export default function AuthPage({ onAuthed }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const fn = isSignup ? auth.signup : auth.login;
      const { token, user } = await fn(email.trim(), password);
      setToken(token);
      onAuthed(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const swap = () => {
    setMode(isSignup ? "login" : "signup");
    setError("");
  };

  return (
    <div className="authwrap">
      <div className="card authcard">
        <div className="authbrand">
          <span className="brand__logo" aria-hidden="true">🧭</span>
          <span className="brand__name">Voyageur</span>
        </div>

        <h2>{isSignup ? "Create your account" : "Welcome back"}</h2>
        <p className="auth-sub">
          {isSignup
            ? "Sign up to start planning AI travel itineraries."
            : "Log in to plan and save your trips."}
        </p>

        {error && <div className="banner banner--error">⚠️ {error}</div>}

        <form onSubmit={submit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? "At least 6 characters" : "Your password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={6}
              required
            />
          </label>
          <button className="btn btn--primary" type="submit" disabled={busy}>
            {busy ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
          </button>
        </form>

        <p className="auth-toggle">
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <button type="button" className="linkbtn" onClick={swap}>
            {isSignup ? "Log in" : "Create an account"}
          </button>
        </p>
      </div>
    </div>
  );
}
