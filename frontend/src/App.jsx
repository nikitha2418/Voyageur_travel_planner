import React, { useEffect, useState, useCallback } from "react";
import { api } from "./api.js";
import { auth, getToken, clearToken } from "./auth.js";
import Nav from "./components/Nav.jsx";
import AuthPage from "./components/AuthPage.jsx";
import TripForm from "./components/TripForm.jsx";
import ItineraryView from "./components/ItineraryView.jsx";
import SavedTrips from "./components/SavedTrips.jsx";
import EmptyState from "./components/EmptyState.jsx";

export default function App() {
  const [trips, setTrips] = useState([]);
  const [active, setActive] = useState(null); // full trip object
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [prefill, setPrefill] = useState(null); // {destination} from inspiration
  const [view, setView] = useState("explore"); // explore | designer | trips | itinerary

  // --- Auth ---
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setAuthReady(true);
      return;
    }
    auth
      .me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setAuthReady(true));
  }, []);

  const signOut = () => {
    clearToken();
    setUser(null);
    setActive(null);
    setView("explore");
  };

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
      setView("itinerary");
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
      setView("itinerary");
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
      setView("trips");
      await refreshList();
    } catch (e) {
      setError(e.message);
    }
  };

  // Inspiration card -> prefill the designer and switch to it.
  const inspire = (destination) => {
    setPrefill({ destination });
    setView("designer");
  };

  // --- Auth gate ---
  if (!authReady) {
    return (
      <div className="app">
        <div className="content">
          <div className="card placeholder">
            <div className="spinner" />
            <p>Loading…</p>
          </div>
        </div>
      </div>
    );
  }
  if (!user) {
    return <AuthPage onAuthed={setUser} />;
  }

  return (
    <div className="app">
      <Nav view={view} onNavigate={setView} user={user} onSignOut={signOut} />

      <main className="content">
        {error && <div className="banner banner--error">⚠️ {error}</div>}

        {loading && (
          <div className="card placeholder">
            <div className="spinner" />
            <p>Running the chain: destination research → itinerary → budget check…</p>
          </div>
        )}

        {!loading && view === "explore" && (
          <EmptyState onInspire={inspire} onDesign={() => setView("designer")} />
        )}

        {!loading && view === "designer" && (
          <div className="view view--narrow">
            <div className="view__head">
              <h2>AI Trip Designer</h2>
              <p>Describe your destination and criteria — the AI researches, plans, and budgets it.</p>
            </div>
            <TripForm onGenerate={handleGenerate} loading={loading} prefill={prefill} />
          </div>
        )}

        {!loading && view === "trips" && (
          <div className="view">
            <div className="view__head">
              <h2>My Trips</h2>
              <p>Your saved itineraries. Open one to view, edit, or delete it.</p>
            </div>
            <SavedTrips trips={trips} activeId={active?.id} onOpen={openTrip} />
          </div>
        )}

        {!loading && view === "itinerary" && active && (
          <ItineraryView
            trip={active}
            onSave={saveTrip}
            onDelete={deleteTrip}
            saving={saving}
          />
        )}
      </main>
    </div>
  );
}
