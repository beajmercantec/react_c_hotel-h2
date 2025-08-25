import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { api, clearToken } from "../api/apiClient";

/**
 *      Navbar komponent
 * - viser bruger info (hentet fra /Users/me)
 * - log ud knap (ryd token + redirect til /login)
 * - responsive (hamburger menu på mobil)   
 * @returns jsx
 */
export default function Navbar() {
  const [me, setMe] = useState(null);
  const [open, setOpen] = useState(false); // mobil-menu
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get("/Users/me", { auth: true });
        setMe(data);
      } catch (e) {
        // Hvis token mangler/er udløbet, kan du evt. redirecte til login
        console.warn("Kunne ikke hente /Users/me", e);
      }
    })();
  }, []);

  function handleLogout() {
    clearToken();
    setOpen(false);
    nav("/login", { replace: true });
  }

  const linkBase =
    "inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium";
  const linkActive =
    "text-white bg-blue-600 hover:bg-blue-700";
  const linkInactive =
    "text-slate-700 hover:text-blue-700 hover:bg-blue-50";

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: brand + desktop nav */}
          <div className="flex items-center gap-6">
            <Link
              to="/bookings"
              className="text-lg font-bold text-blue-700 hover:text-blue-800"
              onClick={() => setOpen(false)}
            >
              HotelBooking
            </Link>

            {/* Desktop links */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                to="/bookings"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
                onClick={() => setOpen(false)}
              >
                Bookinger
              </NavLink>
              {/* Tilføj flere links her efter behov */}
            </nav>
          </div>

          {/* Right: user + logout (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {me ? (
              <div className="flex items-center gap-2">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    me.username ?? me.email ?? "U"
                  )}&background=E5E7EB&color=111827`}
                  alt="avatar"
                  className="h-8 w-8 rounded-full border border-slate-300"
                />
                <span className="text-sm text-slate-700">
                  {me.username ?? me.email}
                </span>
              </div>
            ) : (
              <span className="text-sm text-slate-400">Ikke logget ind</span>
            )}

            <button
              onClick={handleLogout}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Log ud
            </button>
          </div>

          {/* Hamburger (mobile) */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Åbn menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <svg
              className={`h-6 w-6 transition ${open ? "rotate-90" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              {open ? (
                <path strokeWidth="2" strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeWidth="2" strokeLinecap="round" d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`md:hidden border-t border-slate-200 bg-white transition-[max-height,opacity] duration-200 overflow-hidden ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 space-y-3">
          <nav className="flex flex-col gap-2">
            <NavLink
              to="/bookings"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
              onClick={() => setOpen(false)}
            >
              Bookinger
            </NavLink>
          </nav>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
            <div className="flex items-center gap-3">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  me?.username ?? me?.email ?? "U"
                )}&background=E5E7EB&color=111827`}
                alt="avatar"
                className="h-9 w-9 rounded-full border border-slate-300"
              />
              <div>
                <div className="text-sm font-medium text-slate-800">
                  {me?.username ?? me?.email ?? "—"}
                </div>
                <div className="text-xs text-slate-500">Logget ind</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Log ud
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}