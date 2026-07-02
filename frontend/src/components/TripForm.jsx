import React, { useState } from "react";

const INTEREST_OPTIONS = [
  "Food",
  "History",
  "Art",
  "Nature",
  "Nightlife",
  "Shopping",
  "Adventure",
  "Relaxation",
  "Architecture",
  "Local Culture",
];

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD"];

export default function TripForm({ onGenerate, loading }) {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState(1200);
  const [currency, setCurrency] = useState("USD");
  const [numDays, setNumDays] = useState(3);
  const [interests, setInterests] = useState(["Food", "Local Culture"]);

  const toggleInterest = (item) =>
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );

  const submit = (e) => {
    e.preventDefault();
    if (!destination.trim()) return;
    onGenerate({
      destination: destination.trim(),
      budget: Number(budget),
      currency,
      num_days: Number(numDays),
      interests,
    });
  };

  return (
    <form className="card trip-form" onSubmit={submit}>
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

      <div className="row">
        <label>
          Budget
          <input
            type="number"
            min="1"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
          />
        </label>
        <label>
          Currency
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Days
          <input
            type="number"
            min="1"
            max="30"
            value={numDays}
            onChange={(e) => setNumDays(e.target.value)}
            required
          />
        </label>
      </div>

      <fieldset className="interests">
        <legend>Interests</legend>
        <div className="chips">
          {INTEREST_OPTIONS.map((item) => (
            <button
              type="button"
              key={item}
              className={`chip ${interests.includes(item) ? "chip--on" : ""}`}
              onClick={() => toggleInterest(item)}
            >
              {item}
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
