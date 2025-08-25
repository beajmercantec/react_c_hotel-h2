import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import MePage from "../pages/Me";
import RequireAuth from "./RequireAuth";
import BookingsPage from "../pages/Bookings";
import BookingDetailsPage from "../pages/BookingsDetails";
import { Navigate } from "react-router-dom";
export default function AppRoutes() {
  return (
   <Routes>
      <Route path="/" element={<Navigate to="/bookings" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/bookings/:id" element={<BookingDetailsPage />} /> {/* <- VIGTIG */}
        <Route path="/me" element={<div>Me (valgfri)</div>} />
      </Route>

      <Route path="*" element={<div>404</div>} />
    </Routes>
  );
}