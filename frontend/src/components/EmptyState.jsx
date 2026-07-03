import React from "react";

// The "Explore" landing view: a navy hero panel + curated destination
// samples. Clicking a sample prefills the designer; the CTA opens it empty.
const IDEAS = [
  { flag: "🇯🇵", name: "Kyoto, Japan", sub: "Temples & food" },
  { flag: "🇵🇹", name: "Lisbon, Portugal", sub: "Fado & tiles" },
  { flag: "🇮🇸", name: "Reykjavík, Iceland", sub: "Northern lights" },
  { flag: "🇲🇦", name: "Marrakech, Morocco", sub: "Souks & spice" },
  { flag: "🇮🇹", name: "Rome, Italy", sub: "History & pasta" },
  { flag: "🇹🇭", name: "Bangkok, Thailand", sub: "Street eats" },
];

export default function EmptyState({ onInspire, onDesign }) {
  return (
    <div>
      <section className="hero">
        <span className="hero__badge" aria-hidden="true">✈ Instant Inspiration</span>
        <h1 className="hero__title">Where will your next story begin?</h1>
        <p className="hero__lead">
          Explore curated sample destinations instantly, or craft a bespoke,
          AI-tailored itinerary — with local insights and a budget check — in a click.
        </p>
        <div className="hero__actions">
          <button className="btn btn--primary" onClick={onDesign}>
            ✨ Launch AI Trip Designer
          </button>
        </div>
      </section>

      <section className="curated">
        <h2>Get inspired</h2>
        <p className="section__sub">Popular destinations to start your plan from.</p>
        <div className="inspire">
          {IDEAS.map((idea) => (
            <button
              key={idea.name}
              className="inspire__card"
              onClick={() => onInspire(idea.name)}
            >
              <span className="inspire__flag" aria-hidden="true">{idea.flag}</span>
              <span>
                <span className="inspire__name">{idea.name}</span>
                <span className="inspire__sub">{idea.sub}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
