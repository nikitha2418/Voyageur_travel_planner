import React, { useState, useEffect } from "react";
import LocalInsights from "./LocalInsights.jsx";
import BudgetPanel from "./BudgetPanel.jsx";

// Displays a full trip and lets the user edit the title/notes and each day's
// theme, then save (PUT) back to the DB.
export default function ItineraryView({ trip, onSave, onDelete, saving }) {
  const [title, setTitle] = useState(trip.title);
  const [notes, setNotes] = useState(trip.notes || "");
  const [itinerary, setItinerary] = useState(trip.itinerary);

  // Reset local edit state whenever a different trip is loaded.
  useEffect(() => {
    setTitle(trip.title);
    setNotes(trip.notes || "");
    setItinerary(trip.itinerary);
  }, [trip.id]);

  const days = itinerary?.days || [];

  const editTheme = (dayIdx, value) => {
    setItinerary((prev) => {
      const next = structuredClone(prev);
      next.days[dayIdx].theme = value;
      return next;
    });
  };

  const editActivity = (dayIdx, actIdx, field, value) => {
    setItinerary((prev) => {
      const next = structuredClone(prev);
      next.days[dayIdx].activities[actIdx][field] = value;
      return next;
    });
  };

  const save = () => onSave(trip.id, { title, notes, itinerary });

  return (
    <div className="itinerary">
      <div className="card itinerary__head">
        <input
          className="itinerary__title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="itinerary__meta">
          <span>📍 {trip.destination}</span>
          <span>🗓 {trip.num_days} days</span>
          <span>
            💵 {trip.currency} {Number(trip.budget).toLocaleString()}
          </span>
        </div>
        <div className="itinerary__actions">
          <button className="btn btn--primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "💾 Save changes"}
          </button>
          <button className="btn btn--danger" onClick={() => onDelete(trip.id)}>
            🗑 Delete
          </button>
        </div>
      </div>

      <LocalInsights research={trip.research} />

      <section className="days">
        {days.map((day, di) => (
          <div className="card day" key={di}>
            <div className="day__head">
              <span className="day__num">Day {day.day ?? di + 1}</span>
              <input
                className="day__theme"
                value={day.theme || ""}
                onChange={(e) => editTheme(di, e.target.value)}
                placeholder="Day theme"
              />
            </div>
            <ol className="activities">
              {(day.activities || []).map((act, ai) => (
                <li className="activity" key={ai}>
                  <div className="activity__time">{act.time}</div>
                  <div className="activity__body">
                    <input
                      className="activity__title"
                      value={act.title || ""}
                      onChange={(e) =>
                        editActivity(di, ai, "title", e.target.value)
                      }
                    />
                    {act.description && (
                      <p className="activity__desc">{act.description}</p>
                    )}
                    <div className="activity__foot">
                      {act.area && <span className="tag">{act.area}</span>}
                      <span className="tag tag--cost">
                        {trip.currency} {act.est_cost ?? 0}
                      </span>
                    </div>
                    {act.local_tip && (
                      <p className="activity__tip">💡 {act.local_tip}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </section>

      <BudgetPanel
        analysis={trip.budget_analysis}
        budget={trip.budget}
        currency={trip.currency}
      />

      <section className="card notes">
        <h3>📝 Your notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add personal notes, bookings, reminders…"
          rows={4}
        />
      </section>
    </div>
  );
}
