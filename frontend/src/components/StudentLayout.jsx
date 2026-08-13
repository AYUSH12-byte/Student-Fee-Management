import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function StudentLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/student/dashboard",
      icon: "📊",
    },
    {
      name: "My Fees",
      path: "/student/fees",
      icon: "💰",
    },
    {
      name: "Payment History",
      path: "/student/payments",
      icon: "💳",
    },
    {
      name: "Receipts",
      path: "/student/receipts",
      icon: "🧾",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-gray-900 text-white">
        {/* Logo */}
        <div className="border-b border-gray-700 px-6 py-5">
          <h1 className="text-xl font-bold">Student Fee</h1>

          <p className="mt-1 text-xs text-gray-400">Student Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Menu
          </p>

          <div className="space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>

                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User / Logout */}
        <div className="border-t border-gray-700 p-4">
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || "S"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {user?.name || "Student"}
              </p>

              <p className="truncate text-xs text-gray-400">
                {user?.email || ""}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-red-600 hover:text-white"
          >
            <span className="text-lg">🚪</span>

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Contents */}
      <main className="ml-64 min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Student Portal
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Welcome, {user?.name || "Student"}
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
              {user?.name?.charAt(0)?.toUpperCase() || "S"}
            </div>
          </div>
        </header>

        {/* Page Contents */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default StudentLayout;
