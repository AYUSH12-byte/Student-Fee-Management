import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      name: "Students",
      path: "/admin/students",
    },
    {
      name: "Fee Structures",
      path: "/admin/fee-structures",
    },
    {
      name: "Student Fees",
      path: "/admin/student-fees",
    },
    {
      name: "Payments",
      path: "/admin/payments",
    },
    {
      name: "Receipts",
      path: "/admin/receipts",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 text-white">
        {/* Logo */}
        <div className="flex h-20 items-center border-b border-slate-700 px-6">
          <div>
            <h1 className="text-lg font-bold">Fee Management</h1>

            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Management
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom */}
        <div className="absolute bottom-0 left-0 w-full border-t border-slate-700 p-4">
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-medium">
              {user?.name || "Administrator"}
            </p>

            <p className="truncate text-xs text-slate-400">
              {user?.email || ""}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Student Fee Management System
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800">
                {user?.name || "Admin"}
              </p>

              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
