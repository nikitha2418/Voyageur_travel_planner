import React from "react";

// First letter of the destination, for the gradient avatar tile.
const initial = (t) =>
  (t.destination || t.title || "?").trim().charAt(0).toUpperCase() || "?";

export default function SavedTrips({ trips, activeId, onOpen }) {
  if (trips.length === 0) {
    return <p className="muted">No trips yet — head to the AI Designer to create one!</p>;
  }

  return (
    <ul className="saved__list">
      {trips.map((t) => (
        <li key={t.id}>
          <button
            className={`saved__item ${t.id === activeId ? "saved__item--on" : ""}`}
            onClick={() => onOpen(t.id)}
          >
            <span className="saved__avatar" aria-hidden="true">{initial(t)}</span>
            <span className="saved__body">
              <span className="saved__title">{t.title}</span>
              <span className="saved__sub">
                {t.destination} · {t.num_days}d · {t.currency}{" "}
                {Number(t.budget).toLocaleString()}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
