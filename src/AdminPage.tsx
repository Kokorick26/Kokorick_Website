import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Inbox,
  LogOut,
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Search,
  Trash2,
  Copy,
  MessageSquareQuote,
  FolderKanban,
  FileText,
  BookOpen,
  Mail,
  Users,
  BarChart3
} from "lucide-react";
import logo from "./assets/logo.png";
import TestimonialsManager from "./components/admin/TestimonialsManager";
import ProjectsManager from "./components/admin/ProjectsManager";
import BlogsManager from "./components/admin/BlogsManager";
import WhitepapersManager from "./components/admin/WhitepapersManager";
import NewsletterManager from "./components/admin/NewsletterManager";
import TeamManager from "./components/admin/TeamManager";
import AnalyticsDashboard, { Visit, BlogPost } from "./components/admin/AnalyticsDashboard";
import { StatusDropdown } from "./components/admin/StatusDropdown";

// Types
interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service: string;

  message: string;
  status: "new" | "in-progress" | "completed";
  timestamp: string;
}

interface User {
  username: string;
}

// API Functions
const API_BASE = "/api";

async function fetchRequests(): Promise<ContactRequest[]> {
  const token = localStorage.getItem("adminToken");
  const res = await fetch(`${API_BASE}/contact`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.requests || []);
}

async function updateRequestStatus(id: string, status: string): Promise<void> {
  const token = localStorage.getItem("adminToken");
  await fetch(`${API_BASE}/contact/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
}

async function deleteRequestApi(id: string): Promise<void> {
  const token = localStorage.getItem("adminToken");
  await fetch(`${API_BASE}/contact/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
}

async function fetchVisits(): Promise<Visit[]> {
  const token = localStorage.getItem("adminToken");
  const res = await fetch(`${API_BASE}/analytics/visits`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch visits");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function fetchBlogs(): Promise<BlogPost[]> {
  const token = localStorage.getItem("adminToken");
  const res = await fetch(`${API_BASE}/blogs`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch blogs");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function loginApi(username: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Login failed");
  }
  return res.json();
}

// Login Component
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token, user } = await loginApi(username, password);
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(user));
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-8">
            <img src={logo} alt="Kokorick" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-zinc-400 mt-2">Sign in to access the admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="Enter username"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/10 mt-2"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Main Admin Page
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<"dashboard" | "requests" | "testimonials" | "team" | "projects" | "blogs" | "whitepapers" | "newsletter" | "analytics">("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const userStr = localStorage.getItem("adminUser");
    if (token && userStr) {
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(userStr));
      } catch { }
    }
  }, []);

  // Fetch requests when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadRequests();
      loadAnalyticsData();
    }
  }, [isAuthenticated]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      const [visitsData, blogsData] = await Promise.all([
        fetchVisits().catch(() => []),
        fetchBlogs().catch(() => []),
      ]);
      setVisits(visitsData);
      setBlogs(blogsData);
    } catch (err) {
      console.error("Failed to load analytics data:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleLogin = () => {
    const userStr = localStorage.getItem("adminUser");
    if (userStr) setUser(JSON.parse(userStr));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateRequestStatus(id, status);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: status as ContactRequest["status"] } : r));
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest(prev => prev ? { ...prev, status: status as ContactRequest["status"] } : null);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;
    try {
      await deleteRequestApi(id);
      setRequests(prev => prev.filter(r => r.id !== id));
      setSelectedRequest(null);
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "new").length,
    inProgress: requests.filter(r => r.status === "in-progress").length,
    completed: requests.filter(r => r.status === "completed").length
  };

  const filteredRequests = requests.filter(r => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesStatus;
  });

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "requests", label: "Requests", icon: Inbox },
    { id: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
    { id: "team", label: "Team", icon: Users },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "blogs", label: "Blog Posts", icon: FileText },
    { id: "whitepapers", label: "Whitepapers", icon: BookOpen },
    { id: "newsletter", label: "Newsletter", icon: Mail }
  ];

  return (
    <div className="admin-panel">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-zinc-800">
          <img src={logo} alt="Kokorick" className="w-8 h-8 object-contain" />
          <span className="font-bold text-lg text-white">Kokorick</span>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto overscroll-contain">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setCurrentPage(item.id as "dashboard" | "requests" | "testimonials" | "projects" | "blogs" | "whitepapers"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${currentPage === item.id
                ? "bg-white text-black shadow-lg shadow-white/10"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                }`}
            >
              <item.icon className={`w-5 h-5 ${currentPage === item.id ? "text-black" : "text-zinc-500 group-hover:text-white"}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-xs font-bold text-black">
              {user?.username?.substring(0, 2).toUpperCase() || "AD"}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.username || "Admin"}</p>
              <p className="text-xs text-zinc-500">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Header */}
        <header className="h-16 bg-black border-b border-zinc-800 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold capitalize text-white">{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</h1>
          </div>
          <div className="text-sm text-zinc-500">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8 text-white">
          {currentPage === "dashboard" ? (
            /* DASHBOARD */
            <div className="space-y-8 animate-fade-in-up">

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Requests", value: stats.total, icon: Inbox, color: "text-black", bg: "bg-white", border: "border-zinc-800" },
                  { label: "Pending", value: stats.pending, icon: AlertCircle, color: "text-black", bg: "bg-white", border: "border-zinc-800" },
                  { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-black", bg: "bg-white", border: "border-zinc-800" },
                  { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-black", bg: "bg-white", border: "border-zinc-800" }
                ].map((stat, i) => (
                  <div key={i} className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all duration-300 group shadow-sm`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shadow-lg flex-shrink-0`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-zinc-400">{stat.label}</span>
                      </div>
                      <div className="text-4xl font-bold text-white">{stat.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Requests & Quick Actions */}
              <div className="grid grid-cols-1 gap-8">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-sm">
                  <div className="px-8 py-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
                    <div>
                      <h3 className="font-bold text-xl text-white">Recent Requests</h3>
                      <p className="text-sm text-zinc-400 mt-1">Latest inquiries from clients</p>
                    </div>
                    <button onClick={() => setCurrentPage("requests")} className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors px-4 py-2 hover:bg-zinc-800 rounded-xl">
                      View All <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="divide-y divide-zinc-800 flex-1">
                    {loading ? (
                      <div className="py-12 text-center text-zinc-500">Loading...</div>
                    ) : requests.length === 0 ? (
                      <div className="py-16 text-center">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Inbox className="w-8 h-8 text-zinc-600" />
                        </div>
                        <p className="text-zinc-400 font-medium">No requests found yet</p>
                        <p className="text-sm text-zinc-600 mt-1">New requests will appear here</p>
                      </div>
                    ) : (
                      requests.slice(0, 5).map(request => (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ backgroundColor: "rgba(39, 39, 42, 0.5)" }}
                          transition={{ duration: 0.2 }}
                          className="px-8 py-6 flex items-center justify-between border-l-2 border-transparent hover:border-blue-500 transition-all cursor-pointer group"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold shadow-lg ${request.status === "new" ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30" :
                              request.status === "in-progress" ? "bg-blue-500/20 text-blue-500 border border-blue-500/30" :
                                "bg-green-500/20 text-green-500 border border-green-500/30"
                              }`}>
                              {request.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex items-center gap-4">
                              <p className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors">{request.name}</p>
                              <span className="text-zinc-600">•</span>
                              <p className="text-sm text-zinc-500">{request.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-1.5 ${request.status === "new" ? "bg-yellow-500/10 text-yellow-500" :
                              request.status === "in-progress" ? "bg-blue-500/10 text-blue-500" :
                                "bg-green-500/10 text-green-500"
                              }`}>
                              {request.status === "new" ? "Pending" : request.status === "in-progress" ? "In Progress" : "Completed"}
                            </div>
                            <p className="text-xs text-zinc-500">{new Date(request.timestamp).toLocaleDateString()}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : currentPage === "requests" ? (
            /* REQUESTS PAGE */
            <div className="space-y-6 animate-fade-in-up">


              {/* Filters */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex gap-3 flex-wrap w-full">
                    {[
                      { id: "all", label: "All Requests" },
                      { id: "new", label: "Pending" },
                      { id: "in-progress", label: "In Progress" },
                      { id: "completed", label: "Completed" }
                    ].map(status => (
                      <button
                        key={status.id}
                        onClick={() => setStatusFilter(status.id)}
                        className={`px-6 py-4 rounded-2xl text-sm font-semibold transition-all border ${statusFilter === status.id
                          ? "bg-white text-black border-white shadow-lg shadow-white/10 scale-105"
                          : "bg-zinc-950/50 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-white hover:border-zinc-700"
                          }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl  shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900">
                        <th className="text-center text-sm font-bold text-zinc-400 px-6 py-6 w-[15%]">Date</th>
                        <th className="text-center text-sm font-bold text-zinc-400 px-6 py-6 w-[40%]">Client</th>
                        <th className="text-center text-sm font-bold text-zinc-400 px-6 py-6 w-[15%]">Service</th>
                        <th className="text-center text-sm font-bold text-zinc-400 px-6 py-6 w-[15%]">Status</th>
                        <th className="text-center text-sm font-bold text-zinc-400 px-6 py-6 w-[15%]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {loading ? (
                        <tr><td colSpan={5} className="px-8 py-16 text-left text-zinc-50">Loading...</td></tr>
                      ) : filteredRequests.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-8 py-24 text-left">
                            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                              <Search className="w-10 h-10 text-zinc-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">No requests found</h3>
                            <p className="text-zinc-500">We couldn't find any requests matching your search.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredRequests.map(request => (
                          <tr key={request.id} className="hover:bg-zinc-800/50 transition-colors cursor-pointer group" onClick={() => setSelectedRequest(request)}>
                            <td className="px-6 py-8 text-sm text-zinc-400 whitespace-nowrap font-medium text-center">
                              {new Date(request.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-8">
                              <div className="flex items-center justify-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg flex-shrink-0 ${request.status === "new" ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30" :
                                  request.status === "in-progress" ? "bg-blue-500/20 text-blue-500 border border-blue-500/30" :
                                    "bg-green-500/20 text-green-500 border border-green-500/30"
                                  }`}>
                                  {request.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors mb-1">{request.name}</p>
                                  <p className="text-sm text-zinc-500 truncate">{request.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-8 text-center">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 capitalize">
                                {request.service}
                              </span>
                            </td>
                            <td className="px-6 py-8 text-center">
                              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wide ${request.status === "new" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                request.status === "in-progress" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                  "bg-green-500/10 text-green-500 border-green-500/20"
                                }`}>
                                <span className={`w-2 h-2 rounded-full ${request.status === "new" ? "bg-yellow-500" :
                                  request.status === "in-progress" ? "bg-blue-500" :
                                    "bg-green-500"
                                  }`} />
                                {request.status === "new" ? "Pending" : request.status === "in-progress" ? "In Progress" : "Completed"}
                              </span>
                            </td>
                            <td className="px-6 py-8 text-center" onClick={e => e.stopPropagation()}>
                              <StatusDropdown
                                value={request.status}
                                onChange={(status) => handleUpdateStatus(request.id, status)}
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-8 py-6 border-t border-zinc-800 bg-zinc-900 text-sm text-zinc-500 flex justify-between items-center">
                  <span className="font-medium">Showing {filteredRequests.length} of {requests.length} requests</span>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>Previous</button>
                    <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>Next</button>
                  </div>
                </div>
              </div>
            </div>
          ) : currentPage === "analytics" ? (
            <AnalyticsDashboard
              visits={visits}
              requests={requests}
              blogs={blogs}
              loading={analyticsLoading}
            />
          ) : currentPage === "testimonials" ? (
            <TestimonialsManager />
          ) : currentPage === "team" ? (
            <TeamManager />
          ) : currentPage === "projects" ? (
            <ProjectsManager />
          ) : currentPage === "blogs" ? (
            <BlogsManager />
          ) : currentPage === "whitepapers" ? (
            <WhitepapersManager />
          ) : currentPage === "newsletter" ? (
            <NewsletterManager />
          ) : null}
        </main>
      </div>

      {/* Request Detail Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedRequest(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-white shadow-2xl shadow-black/50"
            >
              <div className="sticky top-0 bg-zinc-900/95 backdrop-blur px-6 py-4 border-b border-zinc-800 flex items-center justify-between z-10">
                <div>
                  <h3 className="text-xl font-bold">Request Details</h3>
                  <div className="flex items-center gap-2 group">
                    <p className="text-xs text-zinc-500">ID: {selectedRequest.id}</p>
                    <button
                      onClick={() => copyToClipboard(selectedRequest.id, 'id')}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 rounded transition-all"
                      title={copiedField === 'id' ? 'Copied!' : 'Copy'}
                    >
                      <Copy className="w-3 h-3 text-zinc-500" />
                    </button>
                  </div>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-8">
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-lg ${selectedRequest.status === "new" ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30" :
                    selectedRequest.status === "in-progress" ? "bg-blue-500/20 text-blue-500 border border-blue-500/30" :
                      "bg-green-500/20 text-green-500 border border-green-500/30"
                    }`}>
                    {selectedRequest.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 group">
                      <h4 className="text-2xl font-bold truncate">{selectedRequest.name}</h4>
                      <button
                        onClick={() => copyToClipboard(selectedRequest.name, 'name')}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-zinc-800 rounded transition-all"
                        title={copiedField === 'name' ? 'Copied!' : 'Copy'}
                      >
                        <Copy className="w-4 h-4 text-zinc-400" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 group">
                      <p className="text-zinc-400 truncate">{selectedRequest.email}</p>
                      <button
                        onClick={() => copyToClipboard(selectedRequest.email, 'email')}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-zinc-800 rounded transition-all"
                        title={copiedField === 'email' ? 'Copied!' : 'Copy'}
                      >
                        <Copy className="w-4 h-4 text-zinc-400" />
                      </button>
                    </div>
                    {selectedRequest.company && (
                      <div className="text-sm text-zinc-500 mt-1 flex items-center gap-1 group">
                        <span className="w-1 h-1 rounded-full bg-zinc-500 flex-shrink-0" />
                        <span className="truncate">{selectedRequest.company}</span>
                        <button
                          onClick={() => copyToClipboard(selectedRequest.company!, 'company')}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 rounded transition-all"
                          title={copiedField === 'company' ? 'Copied!' : 'Copy'}
                        >
                          <Copy className="w-3 h-3 text-zinc-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 p-4 rounded-xl border border-zinc-800/60 hover:border-zinc-700/60 transition-colors min-w-0 group">
                    <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-semibold group-hover:text-zinc-400 transition-colors">Service Type</p>
                    <p className="font-semibold capitalize text-sm truncate text-white group-hover:text-blue-300 transition-colors">{selectedRequest.service}</p>
                  </div>
                  <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 p-4 rounded-xl border border-zinc-800/60 hover:border-zinc-700/60 transition-colors min-w-0 group">
                    <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-semibold group-hover:text-zinc-400 transition-colors">Submitted Date</p>
                    <p className="font-semibold text-sm text-white group-hover:text-blue-300 transition-colors">{new Date(selectedRequest.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 p-4 rounded-xl border border-zinc-800/60 hover:border-zinc-700/60 transition-colors min-w-0 group">
                    <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-semibold group-hover:text-zinc-400 transition-colors">Phone</p>
                    <p className="font-semibold text-sm truncate text-white group-hover:text-blue-300 transition-colors">{selectedRequest.phone || "N/A"}</p>
                  </div>

                </div>

                <div className="w-full min-w-0">
                  <p className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Message Content</p>
                  <div className="w-full text-sm text-zinc-100 bg-zinc-800/40 border border-zinc-800/80 rounded-xl p-6 leading-relaxed shadow-inner" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {selectedRequest.message}
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-6">
                  <p className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Update Status</p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: "new", label: "Pending", color: "yellow" },
                      { value: "in-progress", label: "In Progress", color: "blue" },
                      { value: "completed", label: "Completed", color: "green" }
                    ].map(s => (
                      <motion.button
                        key={s.value}
                        onClick={() => handleUpdateStatus(selectedRequest.id, s.value)}
                        className={`relative px-4 py-3 rounded-xl text-sm font-medium transition-all flex-1 sm:flex-none flex items-center justify-center gap-2 ${selectedRequest.status === s.value
                          ? "bg-white text-black shadow-lg shadow-white/10"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                          }`}
                      >
                        {s.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => handleDelete(selectedRequest.id)}
                    className="flex items-center gap-2 px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Request
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
