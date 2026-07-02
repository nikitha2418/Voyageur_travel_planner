import React from "react";

export default function SavedTrips({ trips, activeId, onOpen }) {
  return (
    <aside className="card saved">
      <h3>🗂 Saved trips</h3>
      {trips.length === 0 && <p className="muted">No trips yet. Generate one!</p>}
      <ul className="saved__list">
        {trips.map((t) => (
          <li key={t.id}>
            <button
              className={`saved__item ${t.id === activeId ? "saved__item--on" : ""}`}
              onClick={() => onOpen(t.id)}
            >
              <span className="saved__title">{t.title}</span>
              <span className="saved__sub">
                {t.destination} · {t.num_days}d · {t.currency}{" "}
                {Number(t.budget).toLocaleString()}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
