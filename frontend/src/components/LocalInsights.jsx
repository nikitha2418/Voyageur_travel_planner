import React from "react";

// Renders the STEP-1 destination research (local insights) defensively —
// the LLM schema is guided but we never assume a field exists.
export default function LocalInsights({ research }) {
  if (!research) return null;

  const {
    overview,
    best_areas = [],
    local_food = [],
    hidden_gems = [],
    customs_tips = [],
    getting_around,
    best_time_of_day,
  } = research;

  return (
    <section className="card insights">
      <h3>🧭 Local Insights</h3>
      {overview && <p className="insights__overview">{overview}</p>}

      <div className="insights__grid">
        {best_areas.length > 0 && (
          <div>
            <h4>Best areas</h4>
            <ul>
              {best_areas.map((a, i) => (
                <li key={i}>
                  <strong>{a.name}</strong>
                  {a.why ? ` — ${a.why}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        {local_food.length > 0 && (
          <div>
            <h4>Local food</h4>
            <ul>
              {local_food.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        {hidden_gems.length > 0 && (
          <div>
            <h4>Hidden gems</h4>
            <ul>
              {hidden_gems.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </div>
        )}

        {customs_tips.length > 0 && (
          <div>
            <h4>Customs & tips</h4>
            <ul>
              {customs_tips.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {getting_around && (
        <p className="insights__foot">
          <strong>Getting around:</strong> {getting_around}
        </p>
      )}
      {best_time_of_day && (
        <p className="insights__foot">
          <strong>Rhythm:</strong> morning — {best_time_of_day.morning};
          afternoon — {best_time_of_day.afternoon}; evening —{" "}
          {best_time_of_day.evening}
        </p>
      )}
    </section>
  );
}
