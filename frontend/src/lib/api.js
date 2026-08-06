const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function fetchApi(endpoint, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let message = data.error || data.detail;
    if (!message && data && typeof data === "object") {
      const messages = Object.entries(data).map(([key, val]) => {
        const fieldName = key === "non_field_errors" ? "" : `${key}: `;
        const errStr = Array.isArray(val) ? val.join(", ") : String(val);
        return `${fieldName}${errStr}`;
      });
      if (messages.length > 0) {
        message = messages.join(" | ");
      }
    }
    throw new Error(message || `API Request Failed with status ${response.status}`);
  }

  return data;
}

// User Auth API
export async function loginUser(credentials) {
  const data = await fetchApi("/users/login/", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  return data;
}

export async function registerUser(userData) {
  const data = await fetchApi("/users/register/", {
    method: "POST",
    body: JSON.stringify(userData),
  });
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  return data;
}

export async function googleLoginUser(googlePayload) {
  const data = await fetchApi("/users/google/", {
    method: "POST",
    body: JSON.stringify(googlePayload),
  });
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  return data;
}


export async function getUserProfile() {
  return fetchApi("/users/me/");
}

export async function updateUserProfile(profileData) {
  return fetchApi("/users/me/", {
    method: "PATCH",
    body: JSON.stringify(profileData),
  });
}

// Dashboard Stats API
export async function getDashboardStats() {
  return fetchApi("/dashboard/stats/");
}

// Marketplace API
export async function getServices(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchApi(`/services/${query ? `?${query}` : ""}`);
}

export async function getAccounts(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchApi(`/accounts/${query ? `?${query}` : ""}`);
}

export async function placeOrder(orderData) {
  return fetchApi("/orders/", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}

export async function getOrders() {
  return fetchApi("/orders/");
}

export async function getTransactions() {
  return fetchApi("/transactions/");
}

export async function depositWallet(depositData) {
  return fetchApi("/wallet/deposit/", {
    method: "POST",
    body: JSON.stringify(depositData),
  });
}

// Referrals API
export async function getReferrals() {
  return fetchApi("/referrals/");
}

// Support Tickets API
export async function getSupportTickets() {
  return fetchApi("/support/tickets/");
}

export async function createSupportTicket(ticketData) {
  return fetchApi("/support/tickets/", {
    method: "POST",
    body: JSON.stringify(ticketData),
  });
}

export async function replySupportTicket(ticketId, replyData) {
  return fetchApi(`/support/tickets/${ticketId}/reply/`, {
    method: "POST",
    body: JSON.stringify(replyData),
  });
}

// Admin Control API
export async function getAdminOverview() {
  return fetchApi("/admin/overview/");
}

export async function getAdminUsers() {
  return fetchApi("/admin/users/");
}

export async function toggleUserBlock(userId) {
  return fetchApi(`/admin/users/${userId}/toggle-block/`, {
    method: "POST",
  });
}

export async function getAdminDeposits() {
  return fetchApi("/admin/deposits/");
}

export async function confirmAdminDeposit(depositId, action = "approve") {
  return fetchApi(`/admin/deposits/${depositId}/confirm/`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}
