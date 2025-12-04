import { useState, useMemo } from "react";
import {
  Eye,
  Users,
  FileText,
  TrendingDown,
  Globe,
  Filter,
  X,
  Monitor,
  Smartphone,
  BarChart3,
  MapPin,
  Clock,
} from "lucide-react";
import { WorldMap } from "./WorldMap";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

// Types
export interface Visit {
  id: string;
  timestamp: number;
  path: string;
  userAgent: string;
  referrer?: string;
  screenWidth?: number;
  ip: string;
  country?: string;
  countryCode?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
}

export interface ContactRequest {
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

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  views?: number;
  createdAt: string;
  publishedAt?: string;
}

interface AnalyticsDashboardProps {
  visits: Visit[];
  requests: ContactRequest[];
  blogs: BlogPost[];
  loading?: boolean;
}

// Utility functions
function detectBrowser(userAgent: string): string {
  if (!userAgent) return "Other";
  const ua = userAgent.toLowerCase();
  if (ua.includes("edg")) return "Edge";
  if (ua.includes("chrome") && !ua.includes("edg")) return "Chrome";
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
  if (ua.includes("firefox")) return "Firefox";
  return "Other";
}

function isMobile(screenWidth?: number): boolean {
  return typeof screenWidth === "number" && screenWidth < 768;
}

function getDaysAgo(days: number): number {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

// Color palette
const BROWSER_COLORS: Record<string, string> = {
  Chrome: "#4285F4",
  Safari: "#000000",
  Firefox: "#FF7139",
  Edge: "#0078D7",
  Other: "#6B7280",
};

// Sub-components
function MetricsCards({
  totalVisits,
  uniqueVisitors,
  avgPagesPerVisitor,
  bounceRate,
}: {
  totalVisits: number;
  uniqueVisitors: number;
  avgPagesPerVisitor: number;
  bounceRate: number;
}) {
  const metrics = [
    {
      label: "Total Visits",
      value: totalVisits.toLocaleString(),
      icon: Eye,
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      label: "Unique Visitors",
      value: uniqueVisitors.toLocaleString(),
      icon: Users,
      color: "bg-green-500/20 text-green-400",
    },
    {
      label: "Avg Pages/Visit",
      value: avgPagesPerVisitor.toFixed(1),
      icon: FileText,
      color: "bg-purple-500/20 text-purple-400",
    },
    {
      label: "Bounce Rate",
      value: `${bounceRate.toFixed(1)}%`,
      icon: TrendingDown,
      color: "bg-orange-500/20 text-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, i) => (
        <div
          key={i}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${metric.color}`}>
                <metric.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-zinc-400">{metric.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{metric.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CountryRankings({
  countryData,
}: {
  countryData: { country: string; countryCode: string; visits: number; percentage: number; cities: number }[];
}) {
  if (countryData.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-zinc-400" />
          <h3 className="font-bold text-white">Top Countries</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
          <MapPin className="w-10 h-10 mb-2 opacity-50" />
          <p className="text-sm">No geographic data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-zinc-400" />
        <h3 className="font-bold text-white">Top Countries</h3>
      </div>
      <div className="space-y-3">
        {countryData.slice(0, 10).map((item, i) => (
          <div key={item.countryCode || i} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 w-5">{i + 1}.</span>
                <span className="text-white font-medium">{item.country || "Unknown"}</span>
                <span className="text-xs text-zinc-500">({item.cities} cities)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{item.visits}</span>
                <span className="text-zinc-500 text-xs">({item.percentage.toFixed(1)}%)</span>
              </div>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrafficTrendsChart({
  dailyData,
}: {
  dailyData: { date: string; desktop: number; mobile: number; total: number }[];
}) {
  if (dailyData.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-zinc-400" />
          <h3 className="font-bold text-white">Traffic Trends</h3>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
          <BarChart3 className="w-10 h-10 mb-2 opacity-50" />
          <p className="text-sm">No traffic data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-zinc-400" />
          <h3 className="font-bold text-white">Traffic Trends</h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-zinc-400">Desktop</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-green-400" />
            <span className="text-zinc-400">Mobile</span>
          </div>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
            <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Area
              type="monotone"
              dataKey="desktop"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorDesktop)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="mobile"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorMobile)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function BrowserDistribution({
  browserData,
}: {
  browserData: { name: string; visitors: number; percentage: number }[];
}) {
  const filteredData = browserData.filter((b) => b.visitors > 0);

  if (filteredData.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="font-bold text-white mb-4">Browser Distribution</h3>
        <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
          <Globe className="w-10 h-10 mb-2 opacity-50" />
          <p className="text-sm">No browser data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h3 className="font-bold text-white mb-4">Browser Distribution</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filteredData}
              dataKey="visitors"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
            >
              {filteredData.map((entry) => (
                <Cell key={entry.name} fill={BROWSER_COLORS[entry.name] || "#6B7280"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [`${value} visitors`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {filteredData.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: BROWSER_COLORS[item.name] || "#6B7280" }}
            />
            <span className="text-zinc-400">{item.name}</span>
            <span className="text-zinc-500">({item.percentage.toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactStatusDistribution({
  requests,
}: {
  requests: ContactRequest[];
}) {
  const statusData = useMemo(() => {
    const pending = requests.filter((r) => r.status === "new").length;
    const inProgress = requests.filter((r) => r.status === "in-progress").length;
    const completed = requests.filter((r) => r.status === "completed").length;
    const total = requests.length || 1;

    return [
      { name: "Pending", value: pending, percentage: (pending / total) * 100, color: "#f59e0b" },
      { name: "In Progress", value: inProgress, percentage: (inProgress / total) * 100, color: "#3b82f6" },
      { name: "Completed", value: completed, percentage: (completed / total) * 100, color: "#10b981" },
    ].filter((s) => s.value > 0);
  }, [requests]);

  if (statusData.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="font-bold text-white mb-4">Request Status</h3>
        <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
          <FileText className="w-10 h-10 mb-2 opacity-50" />
          <p className="text-sm">No contact requests yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h3 className="font-bold text-white mb-4">Request Status</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
            >
              {statusData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [`${value} requests`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {statusData.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-zinc-400">{item.name}</span>
            <span className="text-zinc-500">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityTimeline({
  requests,
  blogs,
}: {
  requests: ContactRequest[];
  blogs: BlogPost[];
}) {
  const activityData = useMemo(() => {
    const thirtyDaysAgo = getDaysAgo(30);
    const dateMap: Record<string, { date: string; contacts: number; blogs: number }> = {};

    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split("T")[0];
      dateMap[key] = {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        contacts: 0,
        blogs: 0,
      };
    }

    // Count contact requests
    requests.forEach((r) => {
      const ts = new Date(r.timestamp).getTime();
      if (ts >= thirtyDaysAgo) {
        const key = new Date(r.timestamp).toISOString().split("T")[0];
        if (dateMap[key]) {
          dateMap[key].contacts++;
        }
      }
    });

    // Count blog posts
    blogs.forEach((b) => {
      const dateStr = b.publishedAt || b.createdAt;
      if (dateStr) {
        const ts = new Date(dateStr).getTime();
        if (ts >= thirtyDaysAgo) {
          const key = new Date(dateStr).toISOString().split("T")[0];
          if (dateMap[key]) {
            dateMap[key].blogs++;
          }
        }
      }
    });

    return Object.values(dateMap);
  }, [requests, blogs]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-zinc-400" />
        <h3 className="font-bold text-white">Activity Timeline (30 days)</h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activityData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="date"
              stroke="#71717a"
              fontSize={10}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis stroke="#71717a" fontSize={11} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px" }}
              formatter={(value) => <span className="text-zinc-400">{value}</span>}
            />
            <Bar dataKey="contacts" name="Contact Requests" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            <Bar dataKey="blogs" name="Blog Posts" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TopBlogPosts({ blogs, visits }: { blogs: BlogPost[]; visits: Visit[] }) {
  const sortedBlogs = useMemo(() => {
    // Calculate views for each blog based on visits
    return blogs
      .map((blog) => {
        // Count visits that match the blog slug
        const blogVisits = visits.filter(
          (v) => v.path === `/blog/${blog.slug}` || v.path === `/blog/${blog.slug}/`
        ).length;
        return { ...blog, calculatedViews: blogVisits };
      })
      .filter((b) => b.calculatedViews > 0)
      .sort((a, b) => b.calculatedViews - a.calculatedViews)
      .slice(0, 5);
  }, [blogs, visits]);

  if (sortedBlogs.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="font-bold text-white mb-4">Top Blog Posts</h3>
        <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
          <FileText className="w-10 h-10 mb-2 opacity-50" />
          <p className="text-sm">No blog posts with views yet</p>
        </div>
      </div>
    );
  }

  const chartData = sortedBlogs.map((b) => ({
    title: b.title.length > 25 ? b.title.substring(0, 25) + "..." : b.title,
    views: b.calculatedViews,
  }));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h3 className="font-bold text-white mb-4">Top Blog Posts</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
            <XAxis type="number" stroke="#71717a" fontSize={11} tickLine={false} />
            <YAxis
              type="category"
              dataKey="title"
              stroke="#71717a"
              fontSize={10}
              tickLine={false}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value} views`, "Views"]}
            />
            <Bar dataKey="views" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TopPages({ visits }: { visits: Visit[] }) {
  const pageData = useMemo(() => {
    const pageMap: Record<string, number> = {};
    visits.forEach((v) => {
      const path = v.path || "/";
      pageMap[path] = (pageMap[path] || 0) + 1;
    });

    return Object.entries(pageMap)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [visits]);

  if (pageData.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="font-bold text-white mb-4">Top Pages</h3>
        <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
          <FileText className="w-10 h-10 mb-2 opacity-50" />
          <p className="text-sm">No page data available</p>
        </div>
      </div>
    );
  }

  const maxCount = pageData[0]?.count || 1;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h3 className="font-bold text-white mb-4">Top Pages</h3>
      <div className="space-y-2.5">
        {pageData.map((item) => (
          <div key={item.path} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-300 truncate max-w-[70%]" title={item.path}>
                {item.path}
              </span>
              <span className="text-white font-semibold">{item.count}</span>
            </div>
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function AnalyticsDashboard({
  visits,
  requests,
  blogs,
  loading = false,
}: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<number>(30);
  const [countryFilter, setCountryFilter] = useState<string>("");

  // Filter visits by time range
  const filteredVisits = useMemo(() => {
    const cutoff = getDaysAgo(timeRange);
    let result = visits.filter((v) => v.timestamp >= cutoff);

    if (countryFilter) {
      result = result.filter((v) => v.country === countryFilter);
    }

    return result;
  }, [visits, timeRange, countryFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalVisits = filteredVisits.length;
    const uniqueIps = new Set(filteredVisits.map((v) => v.ip).filter(Boolean));
    const uniqueVisitors = uniqueIps.size;
    const avgPagesPerVisitor = uniqueVisitors > 0 ? totalVisits / uniqueVisitors : 0;

    // Bounce rate
    const visitsByIp: Record<string, number> = {};
    filteredVisits.forEach((v) => {
      if (v.ip) {
        visitsByIp[v.ip] = (visitsByIp[v.ip] || 0) + 1;
      }
    });
    const singlePageVisitors = Object.values(visitsByIp).filter((c) => c === 1).length;
    const bounceRate = uniqueVisitors > 0 ? (singlePageVisitors / uniqueVisitors) * 100 : 0;

    return { totalVisits, uniqueVisitors, avgPagesPerVisitor, bounceRate };
  }, [filteredVisits]);

  // Country data
  const countryData = useMemo(() => {
    const countryMap: Record<
      string,
      { country: string; countryCode: string; visits: number; cities: Set<string> }
    > = {};

    filteredVisits.forEach((v) => {
      if (v.country) {
        if (!countryMap[v.country]) {
          countryMap[v.country] = {
            country: v.country,
            countryCode: v.countryCode || "",
            visits: 0,
            cities: new Set(),
          };
        }
        countryMap[v.country].visits++;
        if (v.city) {
          countryMap[v.country].cities.add(v.city);
        }
      }
    });

    const total = filteredVisits.length || 1;
    return Object.values(countryMap)
      .map((c) => ({
        country: c.country,
        countryCode: c.countryCode,
        visits: c.visits,
        percentage: (c.visits / total) * 100,
        cities: c.cities.size,
      }))
      .sort((a, b) => b.visits - a.visits);
  }, [filteredVisits]);

  // Get unique countries for filter dropdown
  const uniqueCountries = useMemo(() => {
    const countries = new Set<string>();
    visits.forEach((v) => {
      if (v.country) countries.add(v.country);
    });
    return Array.from(countries).sort();
  }, [visits]);

  // Daily traffic data
  const dailyData = useMemo(() => {
    const dateMap: Record<string, { date: string; desktop: number; mobile: number; total: number }> = {};

    // Initialize days in range
    for (let i = timeRange - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split("T")[0];
      dateMap[key] = {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        desktop: 0,
        mobile: 0,
        total: 0,
      };
    }

    filteredVisits.forEach((v) => {
      const key = new Date(v.timestamp).toISOString().split("T")[0];
      if (dateMap[key]) {
        dateMap[key].total++;
        if (isMobile(v.screenWidth)) {
          dateMap[key].mobile++;
        } else {
          dateMap[key].desktop++;
        }
      }
    });

    return Object.values(dateMap);
  }, [filteredVisits, timeRange]);

  // Browser data
  const browserData = useMemo(() => {
    const browserMap: Record<string, Set<string>> = {
      Chrome: new Set(),
      Safari: new Set(),
      Firefox: new Set(),
      Edge: new Set(),
      Other: new Set(),
    };

    filteredVisits.forEach((v) => {
      const browser = detectBrowser(v.userAgent);
      if (v.ip) {
        browserMap[browser].add(v.ip);
      }
    });

    const total = Object.values(browserMap).reduce((sum, set) => sum + set.size, 0) || 1;

    return Object.entries(browserMap).map(([name, ips]) => ({
      name,
      visitors: ips.size,
      percentage: (ips.size / total) * 100,
    }));
  }, [filteredVisits]);

  // Map locations data
  const mapLocations = useMemo(() => {
    const locationMap = new Map<
      string,
      { country: string; countryCode: string; city: string; lat: number; lon: number; count: number }
    >();

    filteredVisits.forEach((visit) => {
      if (!visit.latitude || !visit.longitude) return;

      const key = `${visit.city}-${visit.country}`;
      const existing = locationMap.get(key);

      if (existing) {
        existing.count++;
      } else {
        locationMap.set(key, {
          country: visit.country || "Unknown",
          countryCode: visit.countryCode || "XX",
          city: visit.city || "Unknown",
          lat: visit.latitude,
          lon: visit.longitude,
          count: 1,
        });
      }
    });

    return Array.from(locationMap.values());
  }, [filteredVisits]);

  // Time range options
  const timeRangeOptions = [
    { value: 7, label: "7 days" },
    { value: 14, label: "14 days" },
    { value: 30, label: "30 days" },
    { value: 60, label: "60 days" },
    { value: 90, label: "90 days" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <span className="text-sm text-zinc-400">Filters:</span>
          </div>

          {/* Time Range */}
          <div className="flex gap-2">
            {timeRangeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTimeRange(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${timeRange === opt.value
                    ? "bg-white text-black"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Country Filter */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Countries</option>
            {uniqueCountries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {(timeRange !== 30 || countryFilter) && (
            <button
              onClick={() => {
                setTimeRange(30);
                setCountryFilter("");
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <MetricsCards
        totalVisits={metrics.totalVisits}
        uniqueVisitors={metrics.uniqueVisitors}
        avgPagesPerVisitor={metrics.avgPagesPerVisitor}
        bounceRate={metrics.bounceRate}
      />

      {/* World Map */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-zinc-400" />
          <h3 className="font-bold text-white">Visitor Locations</h3>
        </div>
        <div className="h-80">
          <WorldMap locations={mapLocations} totalVisits={metrics.totalVisits} />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficTrendsChart dailyData={dailyData} />
        <CountryRankings countryData={countryData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BrowserDistribution browserData={browserData} />
        <ContactStatusDistribution requests={requests} />
        <TopPages visits={filteredVisits} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityTimeline requests={requests} blogs={blogs} />
        <TopBlogPosts blogs={blogs} visits={filteredVisits} />
      </div>
    </div>
  );
}
