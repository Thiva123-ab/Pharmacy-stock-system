// Local_Pharmacy_Stock_and_Delivery_System/src/main/resources/static/frontend/js/config.js
// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:8080/api', // Make sure this port matches your Spring Boot app
    ENDPOINTS: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        USER_PROFILE: '/users/profile', // PUT
        DELETE_USER_PROFILE: '/users/profile', // DELETE
        CREATE_USER: '/users/create',
        GET_ALL_USERS: '/users/all',
        GET_DELIVERY_DRIVERS: '/users/drivers', // GET
        DELETE_USER: '/users', // DELETE /{id}
        UPDATE_USER: '/users/update',
        UPDATE_USER_STATUS: '/users/status',
        CHANGE_PASSWORD: '/users/change-password',
        GET_SETTINGS: '/settings',
        UPDATE_SETTINGS: '/settings',
        ADMIN_DASHBOARD_STATS: '/admin/dashboard-stats',
        ADMIN_ANALYTICS: '/admin/analytics',
        GENERATE_REPORT: '/reports/export',
        ADMIN_AUDIT_LOGS: '/admin/audit-logs',
        GET_MEDICINES: '/medicines', // GET
        CREATE_MEDICINE: '/medicines', // POST
        UPDATE_MEDICINE: '/medicines', // PUT /{id}
        DELETE_MEDICINE: '/medicines',  // DELETE /{id}
        GET_CUSTOMERS: '/customers', // GET
        GET_ORDERS: '/orders', // GET (For Pharmacist)

        GET_PRESCRIPTIONS: '/prescriptions', // GET (Pharmacist/Admin)
        CREATE_PRESCRIPTION: '/prescriptions', // POST (Customer)
        DELETE_PRESCRIPTION: '/prescriptions', // DELETE /{id} (Customer)
        ADMIN_DELETE_PRESCRIPTION: '/prescriptions/admin', // DELETE /admin/{id} (Admin)
        UPDATE_PRESCRIPTION_STATUS: '/prescriptions', // PUT /{id} (Pharmacist/Admin)
        MY_PRESCRIPTIONS: '/prescriptions/my-prescriptions', // GET (Customer)
        MY_PRESCRIPTION_STATS: '/prescriptions/my-stats', // GET (Customer)

        GET_DELIVERIES: '/deliveries', // GET
        CREATE_DELIVERY: '/deliveries', // POST
        UPDATE_DELIVERY_STATUS: '/deliveries', // PUT /{id}
        GET_INVENTORY_LOGS: '/inventory', // GET
        GET_PHARMACIST_REPORTS: '/reports/summary', // GET
        GET_PHARMACIST_DASHBOARD: '/reports/pharmacist-dashboard', // GET

        // --- CUSTOMER ENDPOINTS ---
        MY_ORDERS: '/orders/my-orders',     // For customer 'My Orders' page
        CHECKOUT: '/orders/checkout',       // For customer 'Checkout' button
        TRACK_ORDER: '/deliveries/by-order', // GET /by-order/{id} (Customer)
        CUSTOMER_DASHBOARD_STATS: '/customer/dashboard-stats', // GET (Customer Dashboard)

        // --- DELIVERY ENDPOINTS ---
        GET_DELIVERY_DASHBOARD: '/deliveries/my-dashboard', // GET (Delivery Dashboard)

        // --- NOTIFICATION ENDPOINTS ---
        GET_NOTIFICATIONS: '/notifications', // GET (Customer)
        MARK_NOTIFICATION_READ: '/notifications', // PUT /{id}/read (Customer)

        // --- CHAT ENDPOINTS ---
        GET_CHAT_HISTORY: '/chat/history', // GET /chat/history/{orderId}/{chatType}

        // --- ORDER MANAGEMENT ENDPOINTS ---
        CANCEL_MY_ORDER: '/orders/my-order' // DELETE /orders/my-order/{orderId}
        // --- THIS COMMA WAS MISSING ---
        ,
        // --- THIS COMMA WAS MISSING ---
        // --- START: NEW FEEDBACK ENDPOINTS ---
        GET_FEEDBACK: '/feedback',    // GET
        POST_FEEDBACK: '/feedback'    // POST
        // --- END: NEW FEEDBACK ENDPOINTS ---
    },
    HEADERS: {
        'Content-Type': 'application/json'
    }
};

/**
 * Creates a generic authorized header for API requests.
 * @returns {HeadersInit}
 */
function getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/**
 * A wrapper for the fetch API that handles common tasks.
 * @param {string} endpoint - The API endpoint to call (e.g., API_CONFIG.ENDPOINTS.LOGIN).
 * @param {RequestInit} options - The fetch options (method, body, etc.).
 * @returns {Promise<{success: boolean, data: any, error?: string}>}
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    // Default headers
    const headers = {
        ...getAuthHeader(),
        ...options.headers
    };

    // Default config
    const config = {
        method: options.method || 'GET',
        headers: headers
    };

    // Set body if it exists and is not a GET request
    if (options.body) {
        if (options.body instanceof FormData) {
            // Let the browser set the Content-Type for FormData
            config.body = options.body;
        } else if (typeof options.body !== 'string') {
            // Automatically stringify JSON objects
            config.body = JSON.stringify(options.body);
            // Ensure content-type is set for JSON
            if (!headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }
        } else {
            config.body = options.body;
        }
    }

    // Remove Content-Type for FormData, as browser sets it with boundary
    if (options.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    try {
        const response = await fetch(url, config);

        // Clone response to be able to read it twice (for JSON and text fallback)
        const responseClone = response.clone();

        try {
            // Try parsing as JSON
            const responseData = await response.json();

            if (!response.ok) {
                // Use the error message from the backend if available
                const errorMessage = responseData.message || (responseData.errors ? Object.values(responseData.errors)[0] : 'HTTP Error');
                throw new Error(errorMessage || `HTTP Error: ${response.status}`);
            }

            return { success: true, data: responseData };

        } catch (jsonError) {
            // If JSON parsing fails, try reading as text (for empty or non-JSON responses)
            try {
                const textData = await responseClone.text();
                if (!response.ok) {
                    throw new Error(textData || `HTTP Error: ${response.status} ${response.statusText}`);
                }
                // Handle successful but empty responses (e.g., 204 No Content)
                return { success: true, data: textData };
            } catch (textError) {
                // If both fail, throw the original JSON error
                throw jsonError;
            }
        }
    } catch (error) {
        console.error('API Request Error:', error.message);
        return { success: false, error: error.message, data: null };
    }
}