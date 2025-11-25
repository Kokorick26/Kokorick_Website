// Mock API for contact form submissions
// In production, replace this with actual backend API calls

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  message: string;
  timestamp: string;
  status: "new" | "in-progress" | "completed" | "rejected";
}

const STORAGE_KEY = "contact_requests";

// Get all requests from localStorage
export function getRequests(): ContactRequest[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Save requests to localStorage
function saveRequests(requests: ContactRequest[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

// Create a new request
export function createRequest(data: Omit<ContactRequest, "id">): ContactRequest {
  const requests = getRequests();
  const newRequest: ContactRequest = {
    ...data,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  };
  requests.unshift(newRequest);
  saveRequests(requests);
  return newRequest;
}

// Update request status
export function updateRequest(id: string, updates: Partial<ContactRequest>): ContactRequest | null {
  const requests = getRequests();
  const index = requests.findIndex((r) => r.id === id);
  if (index === -1) return null;
  
  requests[index] = { ...requests[index], ...updates };
  saveRequests(requests);
  return requests[index];
}

// Delete a request
export function deleteRequest(id: string): boolean {
  const requests = getRequests();
  const filtered = requests.filter((r) => r.id !== id);
  if (filtered.length === requests.length) return false;
  
  saveRequests(filtered);
  return true;
}

// Mock API endpoints
export const api = {
  contact: {
    getAll: async (): Promise<ContactRequest[]> => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      return getRequests();
    },

    create: async (data: Omit<ContactRequest, "id">): Promise<ContactRequest> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return createRequest(data);
    },

    update: async (id: string, updates: Partial<ContactRequest>): Promise<ContactRequest | null> => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return updateRequest(id, updates);
    },

    delete: async (id: string): Promise<boolean> => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return deleteRequest(id);
    },
  },
};

// Setup mock fetch interceptor
export function setupMockAPI() {
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

    // Intercept API calls
    if (url.startsWith("/api/contact")) {
      const method = init?.method || "GET";

      // GET all requests
      if (method === "GET" && url === "/api/contact") {
        const data = await api.contact.getAll();
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // POST new request
      if (method === "POST" && url === "/api/contact") {
        const body = init?.body ? JSON.parse(init.body as string) : {};
        const data = await api.contact.create(body);
        return new Response(JSON.stringify(data), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      }

      // PATCH update request
      if (method === "PATCH" && url.match(/\/api\/contact\/[\w-]+$/)) {
        const id = url.split("/").pop()!;
        const body = init?.body ? JSON.parse(init.body as string) : {};
        const data = await api.contact.update(id, body);
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // DELETE request
      if (method === "DELETE" && url.match(/\/api\/contact\/[\w-]+$/)) {
        const id = url.split("/").pop()!;
        const success = await api.contact.delete(id);
        return new Response(JSON.stringify({ success }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Fall back to original fetch for other requests
    return originalFetch(input, init);
  };
}
