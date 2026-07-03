import React, { useState, useEffect } from "react";

// A suggested packing checklist derived from the trip's own parameters
// (length + interests) — no LLM/backend call needed, works for every trip.
const BY_INTEREST = {
  Food: ["Antacids / digestive aids", "Reusable cutlery for street food"],
  History: ["Comfortable walking shoes", "Portable phone charger"],
  Art: ["Small notebook or sketchpad"],
  Nature: ["Sturdy hiking shoes", "Sunscreen & insect repellent"],
  Nightlife: ["A dressy evening outfit", "Comfortable going-out shoes"],
  Shopping: ["Foldable tote / spare bag"],
  Adventure: ["Daypack", "Quick-dry layers"],
  Relaxation: ["Swimwear", "A good book"],
  Architecture: ["Camera or wide-lens phone", "Comfortable walking shoes"],
  "Local Culture": ["Modest layers for religious sites", "Translation app offline pack"],
};

function buildPackingList(trip) {
  const days = Math.min(trip.num_days || 3, 10);
  const base = [
    "Passport & travel documents",
    "Phone + charger",
    "Universal power adapter",
    `${days} days of clothing`,
    "Toiletries & any medications",
    "Reusable water bottle",
    "Payment cards + some local cash",
  ];
  const extra = (trip.interests || []).flatMap((i) => BY_INTEREST[i] || []);
  return [...new Set([...base, ...extra])];
}

export default function PackingTips({ trip }) {
  const items = buildPackingList(trip);
  const [checked, setChecked] = useState(() => new Set());

  useEffect(() => setChecked(new Set()), [trip.id]);

  const toggle = (i) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const pct = items.length ? Math.round((checked.size / items.length) * 100) : 0;

  const tips = [
    ...((trip.research && trip.research.customs_tips) || []),
    ...((trip.budget_analysis && trip.budget_analysis.suggestions) || []),
  ];

  return (
    <div className="pt-grid">
      <section className="card">
        <div className="pt-head">
          <h3>🎒 Packing Checklist</h3>
          <span className="pack-badge">{pct}% Packed</span>
        </div>
        <p className="pack-note">
          Suggested from your {trip.num_days}-day
          {trip.interests?.length ? ` ${trip.interests.join(", ")}` : ""} trip. Check
          off items as you pack them.
        </p>
        <ul className="pack-list">
          {items.map((it, i) => (
            <li key={i}>
              <label className={`pack-item ${checked.has(i) ? "pack-item--done" : ""}`}>
                <input
                  type="checkbox"
                  checked={checked.has(i)}
                  onChange={() => toggle(i)}
                />
                {it}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3>📖 Regional Etiquette & Pro Tips</h3>
        {tips.length === 0 ? (
          <p className="muted">No tips available for this trip.</p>
        ) : (
          <ul className="tips-list">
            {tips.map((t, i) => (
              <li className="tip-item" key={i}>
                <span className="tip-num">{i + 1}</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
