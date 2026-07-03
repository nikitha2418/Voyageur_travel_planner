import React from "react";

// Top navigation bar: brand on the left, view links on the right.
const LINKS = [
  { key: "explore", label: "Explore", icon: "🧭" },
  { key: "designer", label: "AI Designer", icon: "✨" },
  { key: "trips", label: "My Trips", icon: "🗂" },
];

export default function Nav({ view, onNavigate, user, onSignOut }) {
  // The itinerary detail view belongs under "My Trips" for highlighting.
  const activeKey = view === "itinerary" ? "trips" : view;

  return (
    <nav className="nav">
      <div className="nav__inner">
        <div className="brand">
          <span className="brand__logo" aria-hidden="true">🧭</span>
          <span className="brand__name">Voyageur</span>
          <span className="brand__badge">AI Planner</span>
        </div>

        <div className="nav__links">
          {LINKS.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`nav__link ${activeKey === key ? "nav__link--on" : ""}`}
              onClick={() => onNavigate(key)}
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </button>
          ))}

          {user && (
            <div className="nav__user">
              <span className="nav__email" title={user.email}>{user.email}</span>
              <button className="nav__signout" onClick={onSignOut}>Sign out</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
