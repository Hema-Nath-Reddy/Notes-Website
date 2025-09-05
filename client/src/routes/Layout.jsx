import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { Toaster } from 'react-hot-toast'

export default function Layout() {
  return (
    <div className="min-h-screen">
      <div className="flex">
        <Navbar />
        <main className="flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}


