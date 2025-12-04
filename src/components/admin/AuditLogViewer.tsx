import { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Search,
  Filter,
  ChevronRight,
  Shield,
  CheckCircle2,
  XCircle,
  LogIn,
  Key,
  UserPlus,
  UserMinus,
  Edit,
  Lock
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface AuditLog {
  id: string;
  timestamp: string;
  eventType: string;
  performedBy: string;
  targetUser?: string;
  ipAddress?: string;
  details?: Record<string, unknown>;
  success: boolean;
}

interface EventType {
  id: string;
  name: string;
  description: string;
}

const API_BASE = "/api";

// Helper function to fetch with auth
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("adminToken");
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  });
}

export default function AuditLogViewer() {
  const { isSuperAdmin } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Load event types on mount
  useEffect(() => {
    if (isSuperAdmin()) {
      loadEventTypes();
    }
  }, [isSuperAdmin]);

  // Load logs when filters change
  useEffect(() => {
    if (isSuperAdmin()) {
      loadLogs(true);
    }
  }, [isSuperAdmin, startDate, endDate, eventTypeFilter, userFilter]);

  const loadEventTypes = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/audit-logs/event-types`);
      if (res.ok) {
        const data = await res.json();
        setEventTypes(data.eventTypes);
      }
    } catch (error) {
      console.error("Failed to load event types:", error);
    }
  };

  const loadLogs = async (reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", new Date(startDate).toISOString());
      if (endDate) params.append("endDate", new Date(endDate + "T23:59:59").toISOString());
      if (eventTypeFilter) params.append("eventType", eventTypeFilter);
      if (userFilter) params.append("performedBy", userFilter);
      if (!reset && lastKey) params.append("lastKey", lastKey);
      params.append("limit", "50");

      const res = await fetchWithAuth(`${API_BASE}/audit-logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs((prev) => (reset ? data.logs : [...prev, ...data.logs]));
        setLastKey(data.lastKey);
        setHasMore(!!data.lastKey);
      }
    } catch (error) {
      console.error("Failed to load audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setEventTypeFilter("");
    setUserFilter("");
  };

  if (!isSuperAdmin()) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-zinc-400">Only Super Admins can view audit logs.</p>
        </div>
      </div>
    );
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "login_success":
        return <LogIn className="w-4 h-4 text-green-500" />;
      case "login_failure":
        return <LogIn className="w-4 h-4 text-red-500" />;
      case "password_reset":
      case "password_change":
        return <Key className="w-4 h-4 text-yellow-500" />;
      case "user_created":
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case "user_deleted":
      case "user_deactivated":
        return <UserMinus className="w-4 h-4 text-red-500" />;
      case "user_updated":
      case "permissions_modified":
        return <Edit className="w-4 h-4 text-purple-500" />;
      case "role_created":
      case "role_updated":
      case "role_deleted":
        return <Lock className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4 text-zinc-500" />;
    }
  };

  const getEventBadgeColor = (eventType: string) => {
    if (eventType.includes("success") || eventType.includes("created")) {
      return "bg-green-500/10 text-green-500 border-green-500/20";
    }
    if (eventType.includes("failure") || eventType.includes("deleted") || eventType.includes("deactivated")) {
      return "bg-red-500/10 text-red-500 border-red-500/20";
    }
    if (eventType.includes("reset") || eventType.includes("change")) {
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }
    return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  };

  const formatEventType = (eventType: string) => {
    return eventType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Audit Logs</h2>
        <p className="text-zinc-400 mt-1">View all security and administrative events</p>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-zinc-500" />
          <h3 className="font-medium text-white">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="block text-sm text-zinc-400">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-zinc-400">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <label className="block text-sm text-zinc-400">Event Type</label>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">All Events</option>
              {eventTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* User Filter */}
          <div className="space-y-2">
            <label className="block text-sm text-zinc-400">User</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                placeholder="Filter by username"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        {(startDate || endDate || eventTypeFilter || userFilter) && (
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <button
              onClick={clearFilters}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900">
                <th className="text-left text-sm font-bold text-zinc-400 px-6 py-4">Timestamp</th>
                <th className="text-left text-sm font-bold text-zinc-400 px-6 py-4">Event</th>
                <th className="text-left text-sm font-bold text-zinc-400 px-6 py-4">Performed By</th>
                <th className="text-left text-sm font-bold text-zinc-400 px-6 py-4">Target</th>
                <th className="text-left text-sm font-bold text-zinc-400 px-6 py-4">Status</th>
                <th className="text-left text-sm font-bold text-zinc-400 px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-zinc-500">
                    Loading audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400 font-medium">No audit logs found</p>
                    <p className="text-zinc-500 text-sm mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-zinc-400 whitespace-nowrap">
                      <div>
                        {new Date(log.timestamp).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getEventIcon(log.eventType)}
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-medium border ${getEventBadgeColor(
                            log.eventType
                          )}`}
                        >
                          {formatEventType(log.eventType)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {log.performedBy || "System"}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {log.targetUser || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {log.success ? (
                        <span className="inline-flex items-center gap-1 text-green-500 text-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500 text-sm">
                          <XCircle className="w-4 h-4" />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500 max-w-xs truncate">
                      {(log.details?.action as string) ||
                        (log.details?.reason as string) ||
                        (log.ipAddress && `IP: ${log.ipAddress}`) ||
                        "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900 flex items-center justify-between">
          <span className="text-sm text-zinc-500">Showing {logs.length} logs</span>
          {hasMore && (
            <button
              onClick={() => loadLogs(false)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Load More
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
