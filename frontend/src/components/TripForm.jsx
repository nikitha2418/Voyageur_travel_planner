import React, { useState, useEffect } from "react";

// Each interest carries an icon for personality in the pill UI.
const INTEREST_OPTIONS = [
  { label: "Food", icon: "🍜" },
  { label: "History", icon: "🏛" },
  { label: "Art", icon: "🎨" },
  { label: "Nature", icon: "🌿" },
  { label: "Nightlife", icon: "🌙" },
  { label: "Shopping", icon: "🛍" },
  { label: "Adventure", icon: "🧗" },
  { label: "Relaxation", icon: "🧘" },
  { label: "Architecture", icon: "🏗" },
  { label: "Local Culture", icon: "🎎" },
];

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD"];

// Budget tiers map to a per-day spend (in USD), scaled to the chosen currency.
// Total budget sent to the API = per-day amount × number of days.
const CURRENCY_MULT = { USD: 1, EUR: 0.9, GBP: 0.8, INR: 83, JPY: 150, AUD: 1.5 };
const TIERS = [
  { key: "budget", label: "Budget", icon: "🎒", perDayUSD: 75, desc: "Hostels, street food & free sights" },
  { key: "mid", label: "Mid-range", icon: "🏨", perDayUSD: 200, desc: "Boutique stays, cafes & guided activities" },
  { key: "luxury", label: "Luxury", icon: "💎", perDayUSD: 500, desc: "Fine stays, top dining & private transport" },
];

const perDay = (tier, currency) =>
  Math.round(tier.perDayUSD * (CURRENCY_MULT[currency] || 1));

export default function TripForm({ onGenerate, loading, prefill }) {
  const [destination, setDestination] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [numDays, setNumDays] = useState(3);
  const [tierKey, setTierKey] = useState("mid");
  const [interests, setInterests] = useState(["Food", "Local Culture"]);

  // Prefill the destination when an inspiration card is clicked.
  useEffect(() => {
    if (prefill?.destination) setDestination(prefill.destination);
  }, [prefill]);

  const tier = TIERS.find((t) => t.key === tierKey) || TIERS[1];
  const totalBudget = perDay(tier, currency) * numDays;
  const fmt = (n) => `${currency} ${n.toLocaleString()}`;

  const toggleInterest = (item) =>
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );

  const submit = (e) => {
    e.preventDefault();
    if (!destination.trim()) return;
    onGenerate({
      destination: destination.trim(),
      budget: totalBudget,
      currency,
      num_days: numDays,
      interests,
    });
  };

  return (
    <form className="card card--primary trip-form" onSubmit={submit}>
      <p className="eyebrow">Plan · Research · Budget</p>
      <h2>Plan a new trip</h2>

      <label>
        Destination
        <input
          type="text"
          placeholder="e.g. Kyoto, Japan"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
        />
      </label>

      <label>
        Duration (days)
        <input
          type="number"
          className="days-input"
          min="1"
          max="30"
          value={numDays}
          onChange={(e) =>
            setNumDays(Math.max(1, Math.min(30, Number(e.target.value) || 1)))
          }
          required
        />
      </label>

      <label style={{ maxWidth: "180px" }}>
        Currency
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          {CURRENCIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>

      <div className="field">
        <span className="field__label">Daily budget level</span>
        <div className="tiers">
          {TIERS.map((t) => (
            <button
              type="button"
              key={t.key}
              className={`tier ${tierKey === t.key ? "tier--on" : ""}`}
              aria-pressed={tierKey === t.key}
              onClick={() => setTierKey(t.key)}
            >
              <span className="tier__name">
                <span aria-hidden="true">{t.icon}</span> {t.label}
              </span>
              <span className="tier__price">{fmt(perDay(t, currency))}/day</span>
              <span className="tier__desc">{t.desc}</span>
            </button>
          ))}
        </div>
        <p className="budget-total">
          ≈ <strong>{fmt(totalBudget)}</strong> total for {numDays}{" "}
          {numDays === 1 ? "day" : "days"}
        </p>
      </div>

      <fieldset className="interests">
        <legend>Interests</legend>
        <div className="chips">
          {INTEREST_OPTIONS.map(({ label, icon }) => (
            <button
              type="button"
              key={label}
              className={`chip ${interests.includes(label) ? "chip--on" : ""}`}
              onClick={() => toggleInterest(label)}
            >
              <span className="chip__icon" aria-hidden="true">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <button className="btn btn--primary" type="submit" disabled={loading}>
        {loading ? "Building your itinerary…" : "Generate itinerary ✨"}
      </button>
    </form>
  );
}
