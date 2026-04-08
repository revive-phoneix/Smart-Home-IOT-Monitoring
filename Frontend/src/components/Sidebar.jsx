import { NavLink } from "react-router-dom";
import { LayoutDashboard, Cpu, Settings, BookOpen } from "lucide-react";
import React from "react";
import "../styles/Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <NavLink to="/dashboard" className="sidebar-item">
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink to="/devices" className="sidebar-item">
        <Cpu size={20} />
        <span>Devices</span>
      </NavLink>

      <NavLink to="/settings" className="sidebar-item">
        <Settings size={20} />
        <span>Settings</span>
      </NavLink>

      <NavLink to="/manual" className="sidebar-item">
        <BookOpen size={20} />
        <span>Manual</span>
      </NavLink>
    </div>
  );
};

export default React.memo(Sidebar);