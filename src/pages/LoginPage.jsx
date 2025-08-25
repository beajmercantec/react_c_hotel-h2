import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { api, setToken, clearToken } from "../api/apiClient"; // din helper

export default function LoginPage() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setL] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/bookings"; // send bruger retur hvor de kom fra, ellers /me

  // Ryd evt. gammel auth-tilstand når man lander på login
  useEffect(() => { clearToken(); }, []);

  function validate() {
    if (!username.trim()) return "Brugernavn er påkrævet.";
    if (!password.trim()) return "Kodeord er påkrævet.";
    if (password.length < 6) return "Kodeord skal være mindst 6 tegn.";
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) { setError(v); return; }
    setL(true);
    try {
      const res = await api.post("/Users/login", { email:username, password }, { retry: 1 });
      const token = res?.access_token || res?.token;
      if (!token) throw new Error("Login-svaret indeholdt ikke en token.");

      // Husk mig: brug localStorage ellers sessionStorage
      if (remember) {
        setToken(token); // din setToken bruger localStorage
      } else {
        // midlertidig session (du kan ændre din apiClient til at læse herfra hvis remember=false)
        sessionStorage.setItem("access_token", token);
      }

      // valgfrit: hent profil for at bekræfte login / vise navn
      // const me = await api.get("/me", { auth: true });

      navigate(redirectTo, { replace: true });
    } catch (e) {
      const msg = e?.payload?.message || e.message || "Kunne ikke logge ind.";
      setError(msg);
    } finally {
      setL(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Log ind
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Velkommen tilbage. Indtast dine oplysninger for at fortsætte.
            </p>
          </div>

          {error && (
            <div className="mx-6 mb-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <form className="px-6 pb-6 space-y-4" onSubmit={onSubmit} noValidate>
            {/* Brugernavn */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Brugernavn
              </label>
              <input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setU(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="fx beate"
              />
            </div>

            {/* Kodeord */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Kodeord
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setP(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 pr-10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  aria-label={showPw ? "Skjul kodeord" : "Vis kodeord"}
                >
                  {showPw ? (
                    // Eye-off
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeWidth="2" d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 001.42-.38M9.88 9.88A3 3 0 0115 12" />
                      <path strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c1.39 0 2.71.283 3.91.8M20.488 15.5C18.949 18.17 15.72 20 12 20c-4.477 0-8.268-2.943-9.542-7" />
                    </svg>
                  ) : (
                    // Eye
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7C20.268 16.057 16.477 19 12 19S3.732 16.057 2.458 12z" />
                      <circle cx="12" cy="12" r="3" strokeWidth="2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Husk mig + glemt kodeord */}
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Husk mig</span>
              </label>

              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                Glemt kodeord?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 font-medium shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"/>
                </svg>
              )}
              {loading ? "Logger ind…" : "Log ind"}
            </button>
          </form>
        </div>

        {/* Lidt “meta” under kortet */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
          Ingen konto?{" "}
          <Link to="/signup" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Opret bruger
          </Link>
        </p>
      </div>
    </div>
  );
}