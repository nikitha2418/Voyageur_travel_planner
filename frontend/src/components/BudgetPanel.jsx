import React from "react";

export default function BudgetPanel({ analysis, budget, currency }) {
  if (!analysis) return null;
  const {
    activities_total,
    estimated_lodging,
    estimated_food_extra,
    estimated_local_transport,
    grand_total,
    within_budget,
    remaining_or_over,
    verdict,
    suggestions = [],
  } = analysis;

  const money = (n) =>
    n === undefined || n === null ? "—" : `${currency} ${Number(n).toLocaleString()}`;

  return (
    <section className={`card budget ${within_budget ? "budget--ok" : "budget--over"}`}>
      <h3>💰 Budget Check</h3>
      <div className="budget__badge">
        {within_budget ? "Within budget" : "Over budget"} ·{" "}
        {remaining_or_over >= 0 ? "Remaining " : "Over by "}
        {money(Math.abs(remaining_or_over))}
      </div>

      {verdict && <p className="budget__verdict">{verdict}</p>}

      <table className="budget__table">
        <tbody>
          <tr><td>Activities</td><td>{money(activities_total)}</td></tr>
          <tr><td>Lodging (est.)</td><td>{money(estimated_lodging)}</td></tr>
          <tr><td>Food extra (est.)</td><td>{money(estimated_food_extra)}</td></tr>
          <tr><td>Local transport (est.)</td><td>{money(estimated_local_transport)}</td></tr>
          <tr className="budget__total">
            <td>Grand total</td><td>{money(grand_total)}</td>
          </tr>
          <tr><td>Your budget</td><td>{money(budget)}</td></tr>
        </tbody>
      </table>

      {suggestions.length > 0 && (
        <>
          <h4>Suggestions</h4>
          <ul>
            {suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
