
import AppRoutes from "./routes";
import Navbar from "./components/Navbar";
import './App.css'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl p-6">
          <AppRoutes />
        </div>
      </main>
    </div>
  );
}
export default App
