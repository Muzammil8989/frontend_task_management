import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/auth-context";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container-fluid">
        {/* Logo on the left */}
        <a className="navbar-brand" href="#" style={{ padding: "0.5rem 0" }}>
          <div className="d-flex align-items-center gap-2">
            <CheckBadgeIcon
              className="logo-icon"
              style={{
                width: "2rem",
                height: "2rem",
                color: "#4f46e5",
                transition: "all 0.2s ease",
              }}
            />
            <span
              className="logo-text"
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#1e293b",
                letterSpacing: "-0.5px",
              }}
            >
              Task Mates
            </span>
          </div>
        </a>

        {/* Profile dropdown on the right */}
        {user && (
          <div className="position-relative" ref={dropdownRef}>
            <button
              className="btn d-flex align-items-center gap-2"
              onClick={() => setIsOpen(!isOpen)}
              style={{ background: "none", border: "none" }}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "35px",
                  height: "35px",
                  backgroundColor: "#6366f1",
                  color: "white",
                  fontSize: "1rem",
                }}
              >
                {user.user.username[0].toUpperCase()}
              </div>
              <span className="d-none d-lg-block">{user.user.username}</span>
            </button>

            <div
              className={`dropdown-menu ${isOpen ? "show" : ""}`}
              style={{
                right: 0,
                left: "auto",
                marginTop: "8px",
                border: "none",
                boxShadow: "0 2px 15px rgba(0,0,0,0.1)",
                minWidth: "200px",
                position: "absolute",
              }}
            >
              <div className="px-4 py-2">
                <small className="text-muted ">{user.user.email}</small>
              </div>
              <hr className="dropdown-divider" />
              <button
                onClick={() => {
                  logoutUser();
                  setIsOpen(false);
                }}
                className="dropdown-item d-flex align-items-center gap-2"
              >
                <i className="bi bi-box-arrow-right"></i>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
