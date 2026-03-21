import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";
import { HomePage } from "./pages/HomePage";
import { CalendarPage } from "./pages/CalendarPage";
import { WeatherPage } from "./pages/WeatherPage";
import { FitnessPage } from "./pages/FitnessPage";
import { EmailPage } from "./pages/EmailPage";
import { NotesPage } from "./pages/NotesPage";
import { SignInPage } from "./pages/SignInPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/notes"
          element={
            <RequireAuth>
              <NotesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/email"
          element={
            <RequireAuth>
              <EmailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/calendar"
          element={
            <RequireAuth>
              <CalendarPage />
            </RequireAuth>
          }
        />
        <Route
          path="/weather"
          element={
            <RequireAuth>
              <WeatherPage />
            </RequireAuth>
          }
        />
        <Route
          path="/fitness"
          element={
            <RequireAuth>
              <FitnessPage />
            </RequireAuth>
          }
        />
        <Route path="/workspace" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
