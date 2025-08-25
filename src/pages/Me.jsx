import { useEffect, useState } from "react";
import { api } from "../api/apiClient";

export default function MePage(){
  const [me,setMe] = useState(null);
  const [err,setErr] = useState(""); const [loading,setL]=useState(false);

  useEffect(()=>{ (async()=>{
    try{
      setL(true);
      const data = await api.get("/Users/me", { auth:true, retry:1 });
      setMe(data);
    }catch(e){ setErr(e?.payload?.message || e.message); }
    finally{ setL(false); }
  })(); },[]);

  if (loading) return <p>Indlæser…</p>;
  if (err) return <p className="text-red-600">Fejl: {err}</p>;
  if (!me) return null;

  return (
    <div className="space-y-6">
      <section className="bg-white border rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2">Profil</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div><b>Brugernavn:</b> {me.Username || me.username}</div>
          <div><b>Email:</b> {me.Email || me.email}</div>
          <div><b>Rolle:</b> {me.roles || me.role?.name || "FUBAR"}</div>
          <div><b>Oprettet:</b> {me.createdAt || me.lastLogin || "-"}</div>
        </div>
      </section>

      <section className="bg-white border rounded-xl p-4">
        <h3 className="font-semibold mb-2">Seneste bookinger</h3>
        {!me.Bookings?.length ? (
          <p className="text-sm text-slate-500">Ingen bookinger.</p>
        ) : (
          <ul className="divide-y">
            {me.Bookings.slice(0,5).map(b=>(
              <li key={b.Id || b.id} className="py-2 text-sm">
                #{b.Id || b.id} • {b.StartDate || b.startDate} → {b.EndDate || b.endDate}
                {b.Room && <> • Rum {b.Room.Number || b.Room.number} (kap: {b.Room.Capacity || b.Room.capacity})</>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}