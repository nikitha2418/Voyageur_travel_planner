import React from "react";

// Categories for the allocation bar chart, mapped to budget_analysis fields.
const CATS = [
  { key: "Accommodation", field: "estimated_lodging", color: "#6366f1" },
  { key: "Dining", field: "estimated_food_extra", color: "#10b981" },
  { key: "Activities", field: "activities_total", color: "#f59e0b" },
  { key: "Transport", field: "estimated_local_transport", color: "#ef4444" },
];

export default function BudgetPanel({ analysis, budget, currency }) {
  if (!analysis) return null;
  const {
    grand_total,
    within_budget,
    remaining_or_over,
    verdict,
    suggestions = [],
  } = analysis;

  const money = (n) =>
    n === undefined || n === null ? "—" : `${currency} ${Number(n).toLocaleString()}`;

  // Build allocation rows + percentages from the four cost fields.
  const rows = CATS.map((c) => ({ ...c, value: Number(analysis[c.field]) || 0 }));
  const allocTotal = rows.reduce((s, r) => s + r.value, 0);
  const pctOf = (v) => (allocTotal > 0 ? Math.round((v / allocTotal) * 100) : 0);

  return (
    <section className={`card budget ${within_budget ? "budget--ok" : "budget--over"}`}>
      <h3>💰 Budget Check</h3>
      <div className="budget__badge">
        {within_budget ? "Within budget" : "Over budget"} ·{" "}
        {remaining_or_over >= 0 ? "Remaining " : "Over by "}
        {money(Math.abs(remaining_or_over))}
      </div>
      {verdict && <p className="budget__verdict">{verdict}</p>}

      {/* Stat tiles */}
      <div className="budget__stats">
        <div className="stat stat--accent">
          <p className="stat__label">Estimated Total</p>
          <div className="stat__value">{money(grand_total)}</div>
        </div>
        <div className="stat">
          <p className="stat__label">Your Budget</p>
          <div className="stat__value">{money(budget)}</div>
        </div>
        <div className="stat">
          <p className="stat__label">{remaining_or_over >= 0 ? "Remaining" : "Over Budget"}</p>
          <div className="stat__value" style={{ color: within_budget ? "var(--ok)" : "var(--over)" }}>
            {money(Math.abs(remaining_or_over))}
          </div>
        </div>
      </div>

      {/* Allocation bar chart */}
      <h4>Budget Allocation</h4>
      {allocTotal === 0 ? (
        <p className="muted">No cost breakdown available for this trip.</p>
      ) : (
        <div className="bars">
          {rows.map((r) => {
            const pct = pctOf(r.value);
            return (
              <div className="bar-row" key={r.key}>
                <div className="bar-row__head">
                  <span className="bar-row__label">
                    <span className="bar-dot" style={{ background: r.color }} />
                    {r.key}
                  </span>
                  <span className="bar-row__val">
                    {pct}% · {money(r.value)}
                  </span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${pct}%`, background: r.color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {suggestions.length > 0 && (
        <>
          <h4>Suggestions</h4>
          <ul className="tips-list">
            {suggestions.map((s, i) => (
              <li className="tip-item" key={i}>
                <span className="tip-num">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
