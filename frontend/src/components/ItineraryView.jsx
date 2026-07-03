import React, { useState, useEffect } from "react";
import LocalInsights from "./LocalInsights.jsx";
import BudgetPanel from "./BudgetPanel.jsx";
import PackingTips from "./PackingTips.jsx";

const TABS = [
  { key: "timeline", label: "Day Timeline", icon: "📅" },
  { key: "budget", label: "Cost & Budget", icon: "💰" },
  { key: "tips", label: "Packing & Tips", icon: "🎒" },
];

// The LLM data has no explicit category, so derive one from keywords in the
// activity's title/description/area. First match wins; falls back to Sightseeing.
const CATEGORIES = [
  { key: "Dining", kw: ["lunch", "dinner", "breakfast", "restaurant", "food", "cuisine", "bistro", "cafe", "tasting", "meal", "eat", "dining", "brunch", "snack"] },
  { key: "Nature", kw: ["park", "garden", "forest", "hike", "hiking", "mountain", "beach", "lake", "river", "nature", "bamboo", "falls", "trail", "onsen", "hot spring", "wildlife", "island"] },
  { key: "Culture", kw: ["museum", "temple", "shrine", "palace", "history", "historic", "gallery", "art", "heritage", "monument", "castle", "church", "cathedral", "fort", "ceremony", "tea", "mosque", "ruins", "cultural"] },
  { key: "Nightlife", kw: ["nightlife", "bar", "club", "night", "pub", "drinks", "cocktail", "live music"] },
  { key: "Shopping", kw: ["shop", "shopping", "market", "bazaar", "souk", "store", "boutique", "mall"] },
  { key: "Sightseeing", kw: ["tower", "view", "cruise", "sightsee", "landmark", "square", "bridge", "walk", "stroll", "explore", "district", "old town", "viewpoint", "cityscape"] },
];

function categorize(act) {
  const text = `${act.title || ""} ${act.description || ""} ${act.area || ""}`.toLowerCase();
  // Whole-word set so short keywords ("eat", "bar", "art") don't match inside
  // longer words ("great", "barracks", "depart"). Multi-word keywords use includes.
  const words = new Set(text.split(/[^a-z]+/).filter(Boolean));
  for (const c of CATEGORIES) {
    for (const k of c.kw) {
      const hit = k.includes(" ") ? text.includes(k) : words.has(k);
      if (hit) return c.key;
    }
  }
  return "Sightseeing";
}

// Displays a full trip and lets the user edit the title/notes and each day's
// theme, then save (PUT) back to the DB.
// Build a destination-keyed hero image URL. LoremFlickr returns a
// Creative-Commons photo matching the tags; `lock` keeps it stable per
// destination. Picsum (seeded) is a guaranteed-loading fallback.
function heroSources(destination) {
  const city = (destination || "travel").split(",")[0].trim() || "travel";
  const tags = [city, "travel", "cityscape"].map(encodeURIComponent).join(",");
  const lock =
    Math.abs([...(destination || "")].reduce((h, c) => ((h * 31 + c.charCodeAt(0)) | 0), 7)) % 1000;
  return {
    primary: `https://loremflickr.com/1600/600/${tags}?lock=${lock}`,
    fallback: `https://picsum.photos/seed/${encodeURIComponent(city)}/1600/600`,
  };
}

export default function ItineraryView({ trip, onSave, onDelete, saving }) {
  const [title, setTitle] = useState(trip.title);
  const [notes, setNotes] = useState(trip.notes || "");
  const [itinerary, setItinerary] = useState(trip.itinerary);

  const { primary, fallback } = heroSources(trip.destination);
  const [heroSrc, setHeroSrc] = useState(primary);
  const [heroOk, setHeroOk] = useState(true);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [tab, setTab] = useState("timeline");

  // Reset local edit state whenever a different trip is loaded.
  useEffect(() => {
    setTitle(trip.title);
    setNotes(trip.notes || "");
    setItinerary(trip.itinerary);
    setHeroSrc(primary);
    setHeroOk(true);
    setHeroLoaded(false);
    setTab("timeline");
  }, [trip.id]);

  // Cascade: LoremFlickr -> Picsum -> navy gradient (no image).
  const onHeroError = () => {
    if (heroSrc !== fallback) setHeroSrc(fallback);
    else setHeroOk(false);
  };

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
      <div className="itinerary__hero">
        {heroOk && (
          <img
            className={`itinerary__hero-img ${heroLoaded ? "is-loaded" : ""}`}
            src={heroSrc}
            alt=""
            aria-hidden="true"
            onLoad={() => setHeroLoaded(true)}
            onError={onHeroError}
          />
        )}
        <div className="itinerary__hero-overlay" />
        <div className="itinerary__hero-content">
          <span className="itinerary__badge">{trip.num_days} Days Itinerary</span>
          <p className="itinerary__eyebrow">Active Itinerary Planner</p>
          <input
            className="itinerary__title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Trip title"
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
      </div>

      <div className="tabs" role="tablist">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            className={`tab ${tab === key ? "tab--on" : ""}`}
            onClick={() => setTab(key)}
          >
            <span aria-hidden="true">{icon}</span> {label}
          </button>
        ))}
      </div>

      <div className="tab-panel">
        {tab === "timeline" && (
          <>
            <LocalInsights research={trip.research} hideCustoms />
            <section className="days">
              {days.map((day, di) => (
                <div className="day" key={di}>
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
                    {(day.activities || []).map((act, ai) => {
                      const cat = categorize(act);
                      return (
                        <li className="activity" key={ai}>
                          <div className="activity__top">
                            <span className={`atag atag--${cat.toLowerCase()}`}>{cat}</span>
                            <div className="activity__meta">
                              {act.time && <span className="activity__when">🕐 {act.time}</span>}
                              <span className="activity__cost">
                                {trip.currency} {act.est_cost ?? 0}
                              </span>
                            </div>
                          </div>
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
                          {act.area && <p className="activity__loc">📍 {act.area}</p>}
                          {act.local_tip && (
                            <p className="activity__tip">💡 {act.local_tip}</p>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
            </section>
          </>
        )}

        {tab === "budget" && (
          <BudgetPanel
            analysis={trip.budget_analysis}
            budget={trip.budget}
            currency={trip.currency}
          />
        )}

        {tab === "tips" && <PackingTips trip={trip} />}
      </div>

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
