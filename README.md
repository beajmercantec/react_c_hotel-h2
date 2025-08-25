# Mapper & Principper
## Mapper
src/
  api/            # fetch-wrapper, domæne-services (auth.js, bookings.js)
  components/     # genbrugelige UI-komponenter (Button, Card, Table, ...)
  context/        # React Context (AuthContext, ThemeContext)
  hooks/          # custom hooks (useApi, useDebouncedValue, ...)
  pages/          # route-komponenter (Home.jsx, Me.jsx, Bookings.jsx, ...)
  routes/         # rute-deklarationer, ProtectedRoute/RequireAuth
  styles/         # global.css, tailwind.css, theming
  utils/          # hjælpefunktioner (formatDate, money, ...)
  App.jsx
  main.jsx

**Principper:**

- **API-kald bor i api/**, ikke spredt i komponenter.
- **Præsentationskomponenter i components/** skal være rene og testbare.
- **Side-komponenter i pages/** ejer side-specifik logik (henter data, koordinerer børn).
- **Context** kun når flere områder skal dele viden (auth, tema, sprog).

# Streg tegninger




# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
