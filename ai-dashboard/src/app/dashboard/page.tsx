"use client";

import { useState } from "react";
import { Home, BarChart, MessageSquare, Settings, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import DashboardTable from "../components/DashboardTable";
import HeatmapOverview from "../components/HeatmapOverview";

//Tyescrip error handling
type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

//Dasboard function with navigation links around the page - currently set to overview
export default function DashboardPage() {
  const [active, setActive] = useState<string>("overview");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();

  //Navigation
  const navItems: NavItem[] = [
    { id: "overview", label: "Overview", icon: <Home size={20} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart size={20} /> },
    { id: "chat", label: "AI Chat", icon: <MessageSquare size={20} /> },
    { id: "settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow p-4 flex items-center justify-between z-20">
        <span className="text-lg font-bold text-gray-800 dark:text-gray-100">AI Dashboard</span>
        <div className="flex items-center gap-2">
          {/*Dark Theme */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col transform transition-transform duration-300 z-30
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-4 text-xl font-bold text-gray-800 dark:text-gray-100 hidden md:flex justify-between items-center">
          AI Dashboard
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Mapped Item Navigation Button */}
        <nav className="flex-1 px-2 space-y-2 mt-16 md:mt-0">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`flex items-center w-full px-3 py-2 rounded-lg transition
                ${active === item.id
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500">
          © 2025 Reakt Web Design
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto md:ml-0 mt-16 md:mt-0">
        <h1 className="text-2xl font-semibold mb-4 capitalize">{active}</h1>
        <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6 min-h-[400px]">
          <p>Welcome to the {active} section 🚀</p>

          <HeatmapOverview url="https://www.reaktwebdesign.co.uk" />

         {/*} <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <DashboardTable />
          </div> */}
          
        </div>
      </main>
    </div>
  );
}