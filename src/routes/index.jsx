import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import MePage from "../pages/Me";
import RequireAuth from "./RequireAuth";
import BookingsPage from "../pages/Bookings";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
       <Route element={<RequireAuth />}>
        <Route path="/me" element={<MePage/>} />
        </Route>
      <Route element={<RequireAuth />}>
        <Route path="/bookings" element={<BookingsPage/>} />
      </Route>
      <Route path="*" element={<div>404</div>} />
    </Routes>
  );
}