import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/apiClient";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";

/** Lille debounce-hook (så vi ikke kalder API for hvert tastetryk) */
function useDebouncedValue(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return v;
}

/** Hjælpere til at læse evt. forskelligt casing fra backend */
const pick = (obj, ...keys) => keys.reduce((a,k)=> a ?? obj?.[k], undefined);
const B = (b) => ({
  id: pick(b, "id", "Id"),
  startDate: pick(b, "startDate", "StartDate"),
  endDate: pick(b, "endDate", "EndDate"),
  status: pick(b, "status", "Status") ?? "unknown",
  room: b?.Room ?? b?.room ?? null,
});

export default function BookingsPage() {
  // URL-state (så man kan dele links med søgning/side)
  const [sp, setSp] = useSearchParams();
  const pageSize = Number(sp.get("pageSize") || 10);
  const [q, setQ] = useState(sp.get("q") || "");
  const debouncedQ = useDebouncedValue(q, 400);
  const [status, setStatus] = useState(sp.get("status") || "all");
  const [sort, setSort] = useState(sp.get("sort") || "-startDate"); // "-felt" = desc
  const [from, setFrom] = useState(sp.get("from") || "");
  const [to, setTo] = useState(sp.get("to") || "");
  const [page, setPage] = useState(Number(sp.get("page") || 1));

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setL] = useState(false);
  const [err, setErr] = useState("");
  const [openId, setOpenId] = useState(null); // drawer booking id
  const mounted = useRef(true);

  // Hent liste
  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    (async () => {
      try {
        setL(true); setErr("");
        // Sync til URL
        const next = {
          page: String(page),
          pageSize: String(pageSize),
          ...(debouncedQ ? { q: debouncedQ } : {}),
          ...(status !== "all" ? { status } : {}),
          ...(sort ? { sort } : {}),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
        };
        setSp(next, { replace: true });

        // OBS: Tilpas param-navne hvis din backend bruger andre (fx StartDate/EndDate)
        const res = await api.get("/bookings", {
          auth: true,
          params: { page, pageSize, q: debouncedQ || undefined, status: status !== "all" ? status : undefined, sort, from, to },
          signal: controller.signal,
          retry: 0,
        });

        // Backend kan returnere { items, total } eller en ren liste
        const items = Array.isArray(res) ? res : (res.items ?? []);
        const t = Number(res.total ?? (Array.isArray(res) ? res.length : 0));

        if (!mounted.current) return;
        setRows(items.map(B));
        setTotal(t);
      } catch (e) {
        if (e.aborted) return;
        setErr(e?.payload?.message || e.message || "Kunne ikke hente bookinger.");
      } finally {
        if (mounted.current) setL(false);
      }
    })();
    return () => { mounted.current = false; controller.abort(); };
  }, [debouncedQ, status, sort, from, to, page, pageSize, setSp]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((total || 0) / pageSize)), [total, pageSize]);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  function resetFilters() {
    setQ(""); setStatus("all"); setFrom(""); setTo(""); setSort("-startDate"); setPage(1);
  }

  return (
    <div className="space-y-5">
      {/* Hero / header */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-6 shadow">
        <h1 className="text-2xl font-semibold">Bookinger</h1>
        <p className="text-blue-100">Søg, filtrér, sortér og få overblikket. Klik på en række for detaljer.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {/* Søg */}
          <div className="relative">
            <input
              value={q} onChange={(e)=>{ setPage(1); setQ(e.target.value); }}
              placeholder="Søg på gæst, rum, id…"
              className="w-full rounded-xl bg-white/95 text-slate-900 placeholder:text-slate-400 px-4 py-2.5 shadow focus:outline-none focus:ring-2 focus:ring-white/70"
            />
            <span className="pointer-events-none absolute right-3 top-2.5 text-blue-800/60">⌘K</span>
          </div>
          {/* Datoer */}
          <div className="flex gap-2">
            <input type="date" value={from} onChange={(e)=>{ setPage(1); setFrom(e.target.value); }}
                   className="w-full rounded-xl bg-white/95 text-slate-900 px-3 py-2.5 shadow focus:ring-2 focus:ring-white/70"/>
            <input type="date" value={to} onChange={(e)=>{ setPage(1); setTo(e.target.value); }}
                   className="w-full rounded-xl bg-white/95 text-slate-900 px-3 py-2.5 shadow focus:ring-2 focus:ring-white/70"/>
          </div>
          {/* Status + sort */}
          <div className="flex gap-2">
            <select value={status} onChange={(e)=>{ setPage(1); setStatus(e.target.value); }}
                    className="w-full rounded-xl bg-white/95 text-slate-900 px-3 py-2.5 shadow focus:ring-2 focus:ring-white/70">
              <option value="all">Alle statusser</option>
              <option value="created">Oprettet</option>
              <option value="confirmed">Bekræftet</option>
              <option value="cancelled">Annulleret</option>
              <option value="completed">Gennemført</option>
            </select>
            <select value={sort} onChange={(e)=>{ setPage(1); setSort(e.target.value); }}
                    className="w-full rounded-xl bg-white/95 text-slate-900 px-3 py-2.5 shadow focus:ring-2 focus:ring-white/70">
              <option value="-startDate">Startdato (nyeste først)</option>
              <option value="startDate">Startdato (ældste først)</option>
              <option value="-createdAt">Oprettet (nyeste først)</option>
              <option value="createdAt">Oprettet (ældste først)</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button onClick={resetFilters} className="rounded-lg bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20">
            Nulstil filtre
          </button>
          <div className="text-sm text-blue-100/90">
            Side <b>{page}</b> af <b>{totalPages || 1}</b> • {total ?? 0} resultater
          </div>
        </div>
      </div>

     {/* KORT + TABEL WRAPPER */}
<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow">
  {/* Header-række */}
  <div className="hidden md:grid grid-cols-12 items-center gap-2 bg-slate-50/80 px-6 py-3 text-sm font-medium text-slate-600">
    <div className="col-span-3">#</div>
    <div className="col-span-3">Periode</div>
    <div className="col-span-2">Rum</div>
    <div className="col-span-2">Status</div>
    <div className="col-span-2 text-right">Handling</div>
  </div>

  {/* Rækker */}
  <ul className="divide-y divide-slate-100">
    {rows.map((r, i) => (
      <li
        key={r.id}
        className={
          "grid grid-cols-12 gap-2 px-4 md:px-6 py-4 transition " +
          (i % 2 === 0 ? "bg-white" : "bg-slate-50/30") +
          " hover:bg-slate-50"
        }
      >
        {/* ID */}
        <div className="col-span-12 md:col-span-3 flex items-center">
          <span className="font-mono text-[13px] text-slate-800 truncate">{r.id}</span>
        </div>

        {/* Periode */}
        <div className="col-span-12 md:col-span-3 text-sm">
          <div className="text-slate-900">{fmtDate(r.startDate)} <span className="mx-1 text-slate-400">→</span> {fmtDate(r.endDate)}</div>
          <div className="text-slate-500">Varighed: {daysBetween(r.startDate, r.endDate) ?? "—"} nætter</div>
        </div>

        {/* Rum */}
        <div className="col-span-12 md:col-span-2 text-sm">
          {r.room ? (
            <>
              <div className="text-slate-900">Rum {r.room.Number ?? r.room.number}</div>
              <div className="text-slate-500">Kapacitet: {r.room.Capacity ?? r.room.capacity}</div>
            </>
          ) : (
            <div className="text-slate-400">—</div>
          )}
        </div>

        {/* Status */}
        <div className="col-span-6 md:col-span-2 flex items-center">
          <span
            className={
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium " +
              (r.status === "confirmed"
                ? "bg-blue-100 text-blue-800"
                : r.status === "completed"
                ? "bg-emerald-100 text-emerald-800"
                : r.status === "cancelled"
                ? "bg-rose-100 text-rose-800"
                : "bg-slate-100 text-slate-700")
            }
          >
            {r.status || "unknown"}
          </span>
        </div>

        {/* Handling */}
        <div className="col-span-6 md:col-span-2 flex items-center md:justify-end">
          <button
            onClick={() => setOpenId(r.id)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Detaljer <span aria-hidden>↗</span>
          </button>
        </div>
      </li>
    ))}
  </ul>
</div>

     


      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600">Viser {rows.length} af {total ?? 0}</div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border px-3 py-1.5 disabled:opacity-50"
            onClick={()=> setPage(p => Math.max(1, p-1))}
            disabled={!canPrev}
          >Forrige</button>
          <span className="text-sm">Side {page} / {totalPages || 1}</span>
          <button
            className="rounded-lg border px-3 py-1.5 disabled:opacity-50"
            onClick={()=> setPage(p => p+1)}
            disabled={!canNext}
          >Næste</button>
          <select
            value={pageSize}
            onChange={(e)=> setSp({ q, status, sort, from, to, page: "1", pageSize: e.target.value })}
            className="ml-2 rounded-lg border px-2 py-1.5 text-sm"
          >
            {[10,20,50].map(n=> <option key={n} value={n}>{n}/side</option>)}
          </select>
        </div>
      </div>

      {/* Drawer for detaljer */}
      {openId != null && (
        <DetailDrawer id={openId} onClose={()=> setOpenId(null)} />
      )}
    </div>
  );
}

/** Status-badge */
function StatusBadge({ status }) {
  const map = {
    created:   "bg-slate-100 text-slate-700",
    confirmed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-emerald-100 text-emerald-800",
    unknown:   "bg-slate-100 text-slate-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${map[status] || map.unknown}`}>
      {status}
    </span>
  );
}



/** Side-drawer: henter /bookings/:id og viser detaljer */
function DetailDrawer({ id, onClose }) {
  const [data, setData] = useState(null);
  const [err, setErr]   = useState("");
  const [loading, setL] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setL(true); setErr("");
        const res = await api.get(`/bookings/${id}`, { auth: true, signal: controller.signal });
        setData(res);
      } catch (e) {
        if (!e.aborted) setErr(e?.payload?.message || e.message);
      } finally { setL(false); }
    })();
    return () => controller.abort();
  }, [id]);

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      {/* panel */}
      <div className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl border-l border-slate-200 p-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Booking #{id}</h3>
          <button onClick={onClose} className="rounded-lg border px-3 py-1.5">Luk</button>
        </div>

        {loading && <p className="mt-6">Indlæser...</p>}
        {err && <p className="mt-6 text-red-600">Fejl: {err}</p>}

        {!loading && !err && data && (
          <div className="mt-6 space-y-4">
            {/* eksempel på data preview */}
            <section className="rounded-xl border p-4">
              <div className="text-sm text-slate-500">Periode</div>
              <div className="font-medium">
                {data.occupiedFrom} → {data.occupiedTill}
              </div>
            </section>

            <section className="rounded-xl border p-4">
              <div className="text-sm text-slate-500">Gæster</div>
              <div className="font-medium">
                {data.adults} voksne, {data.children} børn
              </div>
            </section>

            {/* Ny knap/link til fuld visning */}
            <div className="pt-4">
              <Link
                to={`/bookings/${id}`}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
                onClick={onClose} // luk drawer når man klikker
              >
                Åbn fuld visning ↗
              </Link>
            </div>

            {/* Raw data */}
            <section className="rounded-xl border p-4">
              <div className="text-sm text-slate-500 mb-1">Raw data</div>
              <pre className="text-xs bg-slate-50 rounded p-3 overflow-x-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
/** Små formaterings-hjælpere */
function fmtDate(d) {
  if (!d) return "—";
  try {
    const iso = typeof d === "string" ? d : String(d);
    return new Date(iso).toLocaleDateString();
  } catch { return String(d); }
}
function daysBetween(a, b) {
  try {
    const A = new Date(a), B = new Date(b);
    const ms = Math.max(0, B - A);
    return Math.round(ms / (1000*60*60*24));
  } catch { return "—"; }
}