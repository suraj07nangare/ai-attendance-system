import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import MarkAttendance from './pages/MarkAttendance.jsx'
import Register from './pages/Register.jsx'
import Employees from './pages/Employees.jsx'
import Reports from './pages/Reports.jsx'

export default function App() {
  return (
    <div className="min-h-screen">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/attendance" element={<MarkAttendance />} />
            <Route path="/register" element={<Register />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
