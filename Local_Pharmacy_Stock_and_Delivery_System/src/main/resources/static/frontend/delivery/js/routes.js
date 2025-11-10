const user = JSON.parse(localStorage.getItem('user') || '{}');
let routeMap;
let activeDeliveries = [];
let currentRouteControl = null;
const WAREHOUSE_LOCATION = { lat: 6.9271, lng: 79.8612, name: 'PharmaCare Warehouse' };

// Display user info
if (document.getElementById('user-name')) {
    document.getElementById('user-name').textContent = user.firstName ? `${user.firstName} ${user.lastName}` : 'Delivery Person';
}

// Display current date
const dateElement = document.getElementById('current-date');
if (dateElement) {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}

// Logout functionality
document.querySelector('.logout-btn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../index.html';
    }
});

// Show Alert Message
function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alertBox');
    const alertMessage = document.getElementById('alertMessage');
    const alertIcon = document.getElementById('alertIcon');

    if (!alertBox || !alertMessage || !alertIcon) {
        console.error('Alert elements not found');
        alert(message); // Fallback
        return;
    }

    alertBox.className = `alert alert-${type}`;
    if (type === 'success') {
        alertIcon.className = 'fas fa-check-circle';
        alertBox.style.background = '#e8f5e9';
        alertBox.style.color = '#1e4620';
        alertBox.style.borderColor = '#a5d6a7';
    } else { // 'error'
        alertIcon.className = 'fas fa-exclamation-circle';
        alertBox.style.background = '#f8d7da';
        alertBox.style.color = '#842029';
        alertBox.style.borderColor = '#f5c2c7';
    }

    alertMessage.textContent = message;
    alertBox.style.display = 'flex';
    alertBox.style.opacity = '1';

    setTimeout(() => {
        alertBox.style.opacity = '0';
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, 500);
    }, 5000);
}

// --- Load Active Deliveries ---
async function loadDeliveryData() {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_DELIVERY_DASHBOARD, {
            method: 'GET'
        });

        if (response.success && response.data.data) {
            activeDeliveries = response.data.data.activeDeliveries || [];
            initRouteMap();
            renderRouteTable();

            const mapLoader = document.getElementById('map-loader');
            if (mapLoader) mapLoader.style.display = 'none';

        } else {
            showAlert(response.error || 'Failed to load route data.', 'error');
            displayErrorState();
        }
    } catch (error) {
        console.error('Error loading route data:', error);
        showAlert('A connection error occurred.', 'error');
        displayErrorState();
    }
}

// --- Show error state ---
function displayErrorState() {
    document.getElementById('route-table-body').innerHTML = `
        <tr>
            <td colspan="5" style="text-align: center; padding: 40px; color: red;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                <p>Could not load route data.</p>
            </td>
        </tr>`;

    const mapLoader = document.getElementById('map-loader');
    if (mapLoader) {
        mapLoader.innerHTML = `<p style="color: red; text-align: center;">Could not load map.</p>`;
    }
}

// --- Initialize route map ---
function initRouteMap() {
    if (routeMap) {
        routeMap.remove();
    }

    routeMap = L.map('routeMap').setView([WAREHOUSE_LOCATION.lat, WAREHOUSE_LOCATION.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(routeMap);

    L.marker([WAREHOUSE_LOCATION.lat, WAREHOUSE_LOCATION.lng], {
        icon: L.icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            shadowSize: [41, 41]
        })
    })
        .addTo(routeMap)
        .bindPopup(`<strong>${WAREHOUSE_LOCATION.name}</strong><br>Your starting point.`)
        .openPopup();
}

// --- Render Route Table ---
function renderRouteTable() {
    const tbody = document.getElementById('route-table-body');
    if (!tbody) return;

    if (activeDeliveries.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-route" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                    <p>No active delivery routes for today.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = activeDeliveries.map((delivery, index) => {
        const order = delivery.order;
        const customer = order.customer;
        const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'N/A';
        const itemsCount = order.items ? order.items.length : 0;
        let statusClass = delivery.status === 'ASSIGNED' ? 'pending' : 'processing';

        const displayAddress = (delivery.deliveryAddress && delivery.deliveryAddress !== "null") ? delivery.deliveryAddress : "No Address";

        return `
            <tr>
                <td><strong>${index + 1}</strong></td>
                <td>${displayAddress}</td> 
                <td>${customerName}</td>
                <td>${itemsCount} items</td>
                <td><span class="status ${statusClass}">${delivery.status}</span></td>
            </tr>
        `;
    }).join('');
}


// Center map
function centerMap() {
    if (routeMap) {
        routeMap.setView([WAREHOUSE_LOCATION.lat, WAREHOUSE_LOCATION.lng], 13);
    }
}

// --- Optimize Route Function ---
function optimizeRoute() {

    // 1. Filter for deliveries that actually HAVE a valid address
    const routableDeliveries = activeDeliveries.filter(delivery =>
        delivery.deliveryAddress &&
        delivery.deliveryAddress.trim() !== "" &&
        delivery.deliveryAddress !== "null"
    );

    if (routableDeliveries.length === 0) {
        showAlert('No active deliveries with valid addresses to route.', 'error');
        return;
    }

    // If a route is already drawn, remove it
    if (currentRouteControl) {
        routeMap.removeControl(currentRouteControl);
        currentRouteControl = null;
    }

    // 2. Create the waypoints array.
    const waypoints = [
        // Start at the warehouse
        L.latLng(WAREHOUSE_LOCATION.lat, WAREHOUSE_LOCATION.lng)
    ];

    // 3. Add all *routable* delivery addresses
    routableDeliveries.forEach(delivery => {
        const fullAddress = `${delivery.deliveryAddress}, Sri Lanka`;
        waypoints.push(L.Routing.waypoint(null, fullAddress));
    });

    // 4. Add the warehouse as the final destination
    waypoints.push(L.latLng(WAREHOUSE_LOCATION.lat, WAREHOUSE_LOCATION.lng));

    // 5. Create the Leaflet Routing Machine control
    currentRouteControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: true,
        show: true,
        router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1'
        }),

        // This function adds popups to the markers
        createMarker: function(i, waypoint, n) {
            let markerIcon;
            let popupText;

            if (i === 0 || i === n - 1) {
                popupText = `<strong>${WAREHOUSE_LOCATION.name}</strong>`;
                markerIcon = L.icon({
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    shadowSize: [41, 41]
                });
            } else {
                const delivery = routableDeliveries[i - 1];
                const customerName = delivery.order.customer ? `${delivery.order.customer.firstName} ${delivery.order.customer.lastName}` : 'N/A';
                popupText = `<strong>Stop #${i}: ${customerName}</strong><br>${delivery.deliveryAddress}`;

                markerIcon = L.icon({
                    iconUrl: 'https_//raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                    shadowUrl: 'https_//cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });
            }

            return L.marker(waypoint.latLng, {
                icon: markerIcon
            }).bindPopup(popupText);
        }
    }).addTo(routeMap);

    showAlert(`Route calculated for ${routableDeliveries.length} stop(s)!`, 'success');
}

// Initialize map on page load
window.addEventListener('DOMContentLoaded', () => {
    loadDeliveryData(); // Load data from the backend

    // Check and apply dark mode
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});