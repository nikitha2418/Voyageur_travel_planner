import React, { useEffect, useState, useCallback } from "react";
import { api } from "./api.js";
import TripForm from "./components/TripForm.jsx";
import ItineraryView from "./components/ItineraryView.jsx";
import SavedTrips from "./components/SavedTrips.jsx";

export default function App() {
  const [trips, setTrips] = useState([]);
  const [active, setActive] = useState(null); // full trip object
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const refreshList = useCallback(async () => {
    try {
      setTrips(await api.listTrips());
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const handleGenerate = async (payload) => {
    setError("");
    setLoading(true);
    try {
      const trip = await api.generateTrip(payload);
      setActive(trip);
      await refreshList();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const openTrip = async (id) => {
    setError("");
    try {
      setActive(await api.getTrip(id));
    } catch (e) {
      setError(e.message);
    }
  };

  const saveTrip = async (id, patch) => {
    setError("");
    setSaving(true);
    try {
      const updated = await api.updateTrip(id, patch);
      setActive(updated);
      await refreshList();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTrip = async (id) => {
    if (!confirm("Delete this trip permanently?")) return;
    setError("");
    try {
      await api.deleteTrip(id);
      if (active?.id === id) setActive(null);
      await refreshList();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <h1>🌍 Travel Itinerary Planner</h1>
        <p>Local insights & budget-checked plans, built by AI prompt chaining.</p>
      </header>

      {error && <div className="banner banner--error">⚠️ {error}</div>}

      <main className="layout">
        <div className="left">
          <TripForm onGenerate={handleGenerate} loading={loading} />
          <SavedTrips
            trips={trips}
            activeId={active?.id}
            onOpen={openTrip}
          />
        </div>

        <div className="right">
          {loading && (
            <div className="card placeholder">
              <div className="spinner" />
              <p>
                Running the chain: destination research → itinerary → budget
                check…
              </p>
            </div>
          )}
          {!loading && active && (
            <ItineraryView
              trip={active}
              onSave={saveTrip}
              onDelete={deleteTrip}
              saving={saving}
            />
          )}
          {!loading && !active && (
            <div className="card placeholder">
              <p>
                Fill in a destination, budget, and interests to generate your
                first itinerary. Saved trips appear on the left.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
