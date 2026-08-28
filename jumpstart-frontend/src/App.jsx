import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MarkAttendance from "./pages/MarkAttendance.jsx";
import Register from "./pages/Register.jsx";
import Employees from "./pages/Employees.jsx";
import Reports from "./pages/Reports.jsx";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/attendance" element={<MarkAttendance />} />
          <Route path="/register" element={<Register />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
