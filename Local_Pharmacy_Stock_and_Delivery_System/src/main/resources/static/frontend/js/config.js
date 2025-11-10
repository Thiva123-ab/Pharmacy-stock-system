
const API_CONFIG = {
    BASE_URL: 'http://localhost:8080/api',
    ENDPOINTS: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        USER_PROFILE: '/users/profile',
        DELETE_USER_PROFILE: '/users/profile',
        CREATE_USER: '/users/create',
        GET_ALL_USERS: '/users/all',
        GET_DELIVERY_DRIVERS: '/users/drivers',
        DELETE_USER: '/users',
        UPDATE_USER: '/users/update',
        UPDATE_USER_STATUS: '/users/status',
        CHANGE_PASSWORD: '/users/change-password',
        GET_SETTINGS: '/settings',
        UPDATE_SETTINGS: '/settings',
        ADMIN_DASHBOARD_STATS: '/admin/dashboard-stats',
        ADMIN_ANALYTICS: '/admin/analytics',
        GENERATE_REPORT: '/reports/export',
        ADMIN_AUDIT_LOGS: '/admin/audit-logs',
        GET_MEDICINES: '/medicines',
        CREATE_MEDICINE: '/medicines',
        UPDATE_MEDICINE: '/medicines',
        DELETE_MEDICINE: '/medicines',
        GET_CUSTOMERS: '/customers',
        GET_ORDERS: '/orders',

        GET_PRESCRIPTIONS: '/prescriptions',
        CREATE_PRESCRIPTION: '/prescriptions',
        DELETE_PRESCRIPTION: '/prescriptions',
        ADMIN_DELETE_PRESCRIPTION: '/prescriptions/admin',
        UPDATE_PRESCRIPTION_STATUS: '/prescriptions',
        MY_PRESCRIPTIONS: '/prescriptions/my-prescriptions',
        MY_PRESCRIPTION_STATS: '/prescriptions/my-stats',

        GET_DELIVERIES: '/deliveries',
        CREATE_DELIVERY: '/deliveries',
        UPDATE_DELIVERY_STATUS: '/deliveries',
        GET_INVENTORY_LOGS: '/inventory',
        GET_PHARMACIST_REPORTS: '/reports/summary',
        GET_PHARMACIST_DASHBOARD: '/reports/pharmacist-dashboard',

        // CUSTOMER ENDPOINTS
        MY_ORDERS: '/orders/my-orders',
        CHECKOUT: '/orders/checkout',
        TRACK_ORDER: '/deliveries/by-order',
        CUSTOMER_DASHBOARD_STATS: '/customer/dashboard-stats',

        // DELIVERY ENDPOINTS
        GET_DELIVERY_DASHBOARD: '/deliveries/my-dashboard',
        // NOTIFICATION ENDPOINTS
        GET_NOTIFICATIONS: '/notifications',
        MARK_NOTIFICATION_READ: '/notifications',

        // CHAT ENDPOINTS
        GET_CHAT_HISTORY: '/chat/history',

        // ORDER MANAGEMENT ENDPOINTS
        CANCEL_MY_ORDER: '/orders/my-order',



        GET_FEEDBACK: '/feedback',
        POST_FEEDBACK: '/feedback'

    },
    HEADERS: {
        'Content-Type': 'application/json'
    }
};

/**
 * Creates a generic authorized header for API requests.
 @returns {HeadersInit}

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


    const headers = {
        ...getAuthHeader(),
        ...options.headers
    };


    const config = {
        method: options.method || 'GET',
        headers: headers
    };


    if (options.body) {
        if (options.body instanceof FormData) {

            config.body = options.body;
        } else if (typeof options.body !== 'string') {

            config.body = JSON.stringify(options.body);

            if (!headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }
        } else {
            config.body = options.body;
        }
    }


    if (options.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    try {
        const response = await fetch(url, config);


        const responseClone = response.clone();

        try {

            const responseData = await response.json();

            if (!response.ok) {

                const errorMessage = responseData.message || (responseData.errors ? Object.values(responseData.errors)[0] : 'HTTP Error');
                throw new Error(errorMessage || `HTTP Error: ${response.status}`);
            }

            return { success: true, data: responseData };

        } catch (jsonError) {

            try {
                const textData = await responseClone.text();
                if (!response.ok) {
                    throw new Error(textData || `HTTP Error: ${response.status} ${response.statusText}`);
                }

                return { success: true, data: textData };
            } catch (textError) {

                throw jsonError;
            }
        }
    } catch (error) {
        console.error('API Request Error:', error.message);
        return { success: false, error: error.message, data: null };
    }
}