import { Dialog } from './Dialog.jsx';
import { CITIES } from '../data/cities.js';
import { storageAvailable } from '../lib/storage.js';

export function About({ onClose }) {
  const path = ['India', 'State', 'City', 'Who', 'Interests', 'Trip', 'Plan'];
  return (
    <Dialog title="About Xplore" titleId="about-h" onClose={onClose}>
      <div className="dlg-body">
        <p className="stamp">About</p>
        <h2 id="about-h" className="dlg-title">Why Xplore exists</h2>
        <p className="lede">A traveller who says &ldquo;I&rsquo;m visiting Jaipur&rdquo; usually has a feeling, a budget and a few days, not a plan. Xplore turns that into a day-by-day trip that fits who is coming and what they like.</p>
        <h3>The pathway</h3>
        <ol className="pathway" aria-label="How a trip comes together">
          {path.map((p, i) => <li key={p}><span aria-hidden="true">{i + 1}</span>{p}</li>)}
        </ol>
        <p>Pick a place on the illustrated map, zoom in from India to a state to a city, say who is travelling, choose interests the city can actually offer, set days, budget, pace and food, then read the plan.</p>
        <h3>Honest by design</h3>
        <ul className="plain">
          <li>The Trip Composer is a set of rules, not an AI. The same choices always give the same plan.</li>
          <li>Places, stays and food are drafted examples. Rows marked &ldquo;example&rdquo; are generic types, not businesses.</li>
          <li>Traveller notes are samples, not reviews. Cost tiers are indicative, never prices.</li>
          <li>The map is an illustration and is not to scale. Check current conditions and access before you travel.</li>
          <li>Everything runs in your browser. Nothing is sent anywhere.</li>
        </ul>
      </div>
    </Dialog>
  );
}

export function MyTrips({ trips, onOpen, onDelete, onClose }) {
  return (
    <Dialog title="My trips" titleId="trips-h" onClose={onClose}>
      <div className="dlg-body">
        <p className="stamp">Saved on this device</p>
        <h2 id="trips-h" className="dlg-title">My trips</h2>
        {!storageAvailable() && <p className="inline-note" role="status">Saving is unavailable in this browser. Trips will last only until you close the page. You can still copy a link from the itinerary.</p>}
        {trips.length === 0 ? (
          <p className="empty">Nothing saved yet. Plan a trip and press &ldquo;Save this trip&rdquo; to keep it here.</p>
        ) : (
          <ul className="trip-list">
            {trips.map((t) => (
              <li key={t.id}>
                <div>
                  <strong>{CITIES[t.prefs.cityId].name}</strong>
                  <span>{t.prefs.details.days} {t.prefs.details.days === 1 ? 'day' : 'days'} · {t.prefs.traveller} · saved {new Date(t.savedAt).toLocaleDateString()}</span>
                </div>
                <button type="button" className="btn btn-small btn-primary" onClick={() => onOpen(t)}>Open</button>
                <button type="button" className="btn btn-small" onClick={() => onDelete(t.id)} aria-label={`Delete saved trip to ${CITIES[t.prefs.cityId].name}`}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Dialog>
  );
}
