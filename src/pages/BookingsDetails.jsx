// src/pages/BookingDetails.jsx
import { useEffect, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/apiClient";

/**
 *  Booking detaljer side
 * - bruger /bookings/:id endpoint
 * - viser JSON data (råt)
 * - fejl håndteres pænt  
 * @returns jsx
 */
export default function BookingDetailsPage() {
  const { id } = useParams();              // <- param
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setL] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setL(true); setErr("");
        const res = await api.get(`/Bookings/${id}`, { auth: true, signal: controller.signal });
        setData(res);
      } catch (e) {
        if (!e.aborted) setErr(e?.payload?.message || e.message);
      } finally {
        setL(false);
      }
    })();
    return () => controller.abort();
  }, [id]);

  if (loading) return <p>Indlæser…</p>;
  if (err) return (
    <div className="p-4 border rounded text-red-700 bg-red-50">
      Fejl: {err} <button className="ml-2 underline" onClick={() => nav(-1)}>Tilbage</button>
    </div>
  );
  if (!data) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Booking #{id}</h1>
      <pre className="text-xs bg-slate-50 p-3 rounded">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}