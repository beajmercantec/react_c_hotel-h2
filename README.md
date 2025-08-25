# Mapper & Principper
## Mapper
src/&nbsp;
  &nbsp;&nbsp;api/  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;          # fetch-wrapper, domæne-services (auth.js, bookings.js)</br>
  &nbsp;&nbsp;components/ &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;   # genbrugelige UI-komponenter (Button, Card, Table, ...)</br>
  &nbsp;&nbsp;context/   &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;    # React Context (AuthContext, ThemeContext)</br>
  &nbsp;&nbsp;hooks/     &nbsp; &nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;  # custom hooks (useApi, useDebouncedValue, ...)</br>
  &nbsp;&nbsp;pages/     &nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;   # route-komponenter (Home.jsx, Me.jsx, Bookings.jsx, ...)</br>
  &nbsp;&nbsp;routes/    &nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;   # rute-deklarationer, ProtectedRoute/RequireAuth</br>
  &nbsp;&nbsp;styles/    &nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;   # global.css, tailwind.css, theming</br>
  &nbsp;&nbsp;utils/      &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;   # hjælpefunktioner (formatDate, money, ...)</br>
  &nbsp;&nbsp;App.jsx</br>
  &nbsp;&nbsp;main.jsx</br>

**Principper:**

- **API-kald bor i api/**, ikke spredt i komponenter.
- **Præsentationskomponenter i components/** skal være rene og testbare.
- **Side-komponenter i pages/** ejer side-specifik logik (henter data, koordinerer børn).
- **Context** kun når flere områder skal dele viden (auth, tema, sprog).





# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
