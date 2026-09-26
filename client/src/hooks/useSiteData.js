import { useEffect, useState } from 'react';
import { fallbackData } from '../data/fallbackData.js';

// In dev, this is left unset and requests just go to "/api/..." which
// Vite's proxy (see vite.config.js) forwards to the local Express server.
// In production, set VITE_API_BASE_URL only if the client and server end
// up deployed on two different domains (e.g. client on Vercel/Netlify,
// server on Railway/Render). If they're deployed together (same server
// serving both, as the root "npm start" script does), leave it unset.
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Fetches all content in one call to /api/bootstrap.
 * If the API isn't reachable (e.g. client run standalone),
 * falls back to local data so the page still renders fully.
 */
export function useSiteData() {
  const [data, setData] = useState(fallbackData);
  const [source, setSource] = useState('fallback');

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE}/api/bootstrap`)
      .then((res) => {
        if (!res.ok) throw new Error(`API responded ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setSource('api');
        }
      })
      .catch((err) => {
        console.warn('Falling back to local content:', err.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, source };
}
