import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import {
  StickyNote,
  Tag,
  Star,
  PanelLeftClose,
  PanelLeftOpen,
  LogIn,
  UserPlus,
  User,
  ChevronDown,
  LogOut,
} from "lucide-react";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const [collapsed, setCollapsed] = useState(false);
  const { isLoggedIn, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } h-screen sticky top-0 left-0 glass transition-all duration-200 flex flex-col`}
    >
      <div className="flex items-center justify-between px-4 py-4">
        <Link to="/" className="font-semibold tracking-tight text-white">
          {collapsed ? "N" : "Notes"}
        </Link>
        <button
          aria-label="Toggle sidebar"
          onClick={() => setCollapsed((v) => !v)}
          className="rounded p-1 glass-button hover:bg-white/20 text-white"
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>
      <nav className="mt-2 flex-1">
        <ul className="space-y-1 px-2">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 rounded px-3 py-2 text-sm text-white transition-all ${
                  isActive ? "glass-light" : "hover:bg-white/10"
                }`
              }
            >
              <StickyNote size={16} />
              {!collapsed && <span>All Notes</span>}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/starred"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded px-3 py-2 text-sm text-white transition-all ${
                  isActive ? "glass-light" : "hover:bg-white/10"
                }`
              }
            >
              <Star size={16} />
              {!collapsed && <span>Starred</span>}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/tags"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded px-3 py-2 text-sm text-white transition-all ${
                  isActive ? "glass-light" : "hover:bg-white/10"
                }`
              }
            >
              <Tag size={16} />
              {!collapsed && <span>Tags</span>}
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="px-2 pb-4 space-y-2 border-t border-white/20 relative">
        {!isLoggedIn ? (
          <>
            <Link
              to="/login"
              className={`flex items-center gap-2 rounded px-3 py-2 text-sm glass-button-primary text-white hover:bg-blue-600/90`}
            >
              <LogIn size={16} />
              {!collapsed && <span>Log in</span>}
            </Link>
            <Link
              to="/signup"
              className={`flex items-center gap-2 rounded px-3 py-2 text-sm glass-button text-white hover:bg-white/20`}
            >
              <UserPlus size={16} />
              {!collapsed && <span>Sign up</span>}
            </Link>
          </>
        ) : (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={`flex w-full items-center justify-between gap-2 rounded px-3 py-2 text-sm glass-button text-white hover:bg-white/20`}
            >
              <div className="flex items-center gap-2">
                <User size={16} />
                {!collapsed && (
                  <span className="truncate max-w-[10rem]">
                    {user?.email || "Account"}
                  </span>
                )}
              </div>
              {!collapsed && <ChevronDown size={14} />}
            </button>
            {menuOpen && (
              <div className="absolute left-0 right-0 bottom-full mb-2 rounded-lg glass overflow-hidden z-50">
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10"
                >
                  <User size={16} />
                  <span>Account</span>
                </Link>
                <Link
                  to="/logout"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10"
                >
                  <LogOut size={16} />
                  <span>Log out</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
