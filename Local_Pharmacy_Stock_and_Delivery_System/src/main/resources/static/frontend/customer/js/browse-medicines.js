

const user = JSON.parse(localStorage.getItem('user') || '{}');
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let allMedicines = [];


const lkrFormatter = new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
});


if (document.getElementById('user-name')) {
    document.getElementById('user-name').textContent = user.firstName ? `${user.firstName} ${user.lastName}` : 'Customer';
}


const dateElement = document.getElementById('current-date');
if (dateElement) {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}


document.querySelector('.logout-btn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        window.location.href = '../index.html';
    }
});


function showAlert(message, type = 'success') {
    const alertBox = document.getElementById('alertBox');
    const alertMessage = document.getElementById('alertMessage');
    const alertIcon = document.getElementById('alertIcon');

    if (!alertBox || !alertMessage || !alertIcon) {
        console.error('Alert elements not found');
        alert(message);
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


function renderCartItems() {
    const cartDetails = document.getElementById('cart-details');
    const cartList = document.getElementById('cart-item-list');

    if (!cartDetails || !cartList) return;

    if (cart.length === 0) {
        cartDetails.style.display = 'none';
        return;
    }

    cartDetails.style.display = 'block';
    cartList.innerHTML = cart.map(item => {

        const safeName = item.name.replace(/'/g, "\\'");
        return `
        <li style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee;">
            <div>
                <strong>${item.name}</strong>
                <div style="font-size: 0.9em; color: #555;">
                    ${lkrFormatter.format(item.price)} x ${item.quantity} = <strong>${lkrFormatter.format(item.price * item.quantity)}</strong>
                </div>
            </div>
            <div>
                <!-- Edit buttons -->
                <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})" class="quick-action-btn" style="padding: 5px 10px; font-size: 12px; background: #ff9800;">
                    <i class="fas fa-minus"></i>
                </button>
                <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})" class="quick-action-btn" style="padding: 5px 10px; font-size: 12px; background: #4caf50; margin: 0 5px;">
                    <i class="fas fa-plus"></i>
                </button>
                <!-- Delete button -->
                <button onclick="updateCartQuantity(${item.id}, 0)" class="quick-action-btn" style="padding: 5px 10px; font-size: 12px; background: #f44336;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </li>
    `}).join('');
}


function updateCartQuantity(medicineId, newQuantity) {
    if (newQuantity <= 0) {

        cart = cart.filter(item => item.id !== medicineId);
    } else {

        const item = cart.find(item => item.id === medicineId);
        if (item) {
            item.quantity = newQuantity;
        }
    }
    updateCartDisplay();
}



function updateCartDisplay() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    const cartCountEl = document.getElementById('cart-count');
    const cartTotalEl = document.getElementById('cart-total');

    if (cartCountEl) {
        cartCountEl.textContent = cartCount;
    }
    if (cartTotalEl) {
        cartTotalEl.textContent = lkrFormatter.format(cartTotal);
    }


    localStorage.setItem('cart', JSON.stringify(cart));


    renderCartItems();
}


function addToCart(medicineId, name, price) {
    const existingItem = cart.find(item => item.id === medicineId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: medicineId,
            name: name,
            price: price,
            quantity: 1
        });
    }

    updateCartDisplay();
    showAlert(`${name} added to cart!`, 'success');
}


function uploadPrescription(medicineName) {
    alert(`Please upload your prescription for ${medicineName}. You will be redirected to the prescriptions page.`);
    window.location.href = 'prescriptions.html';
}


async function checkout() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (cart.length === 0) {
        showAlert('Your cart is empty!', 'error');
        return;
    }

    if (!checkoutBtn) {
        console.error('Checkout button not found');
        return;
    }

    checkoutBtn.disabled = true;
    checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing Order...';


    const orderItems = cart.map(item => ({
        medicineId: item.id,
        quantity: item.quantity
    }));

    const payload = {
        items: orderItems
    };

    try {

        const response = await apiRequest(API_CONFIG.ENDPOINTS.CHECKOUT, {
            method: 'POST',
            body: payload
        });

        if (response.success && response.data.success) {

            cart = [];
            localStorage.removeItem('cart');
            updateCartDisplay();

            showAlert('Order placed successfully!', 'success');

            setTimeout(() => {
                window.location.href = 'my-orders.html';
            }, 1500);

        } else {

            showAlert(response.error || 'Checkout failed.', 'error');
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = '<i class="fas fa-check"></i> Checkout';
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showAlert('A connection error occurred.', 'error');
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = '<i class="fas fa-check"></i> Checkout';
    }
}



async function loadMedicines() {
    const grid = document.getElementById('medicines-grid');
    if (!grid) {
        console.error('Medicines grid not found');
        return;
    }
    grid.innerHTML = `
        <div class="spinner-container" style="grid-column: 1 / -1; display: flex; justify-content: center; padding: 50px;">
            <div class="spinner" style="border-top-color: #4fc3f7;"></div>
        </div>`;

    try {

        const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_MEDICINES + "?size=100", {
            method: 'GET'
        });

        if (response.success && response.data.data) {
            allMedicines = response.data.data;
            renderMedicineGrid(allMedicines);
        } else {
            showAlert(response.error || 'Failed to load medicines.', 'error');
            grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: red;">Error loading medicines.</p>`;
        }
    } catch (error) {
        console.error('Error fetching medicines:', error);
        showAlert('A connection error occurred.', 'error');
        grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: red;">Connection error.</p>`;
    }
}


function renderMedicineGrid(medicines) {
    const grid = document.getElementById('medicines-grid');
    if (!grid) {
        console.error('Medicines grid not found for rendering');
        return;
    }
    if (medicines.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center;">No medicines found.</p>`;
        return;
    }

    grid.innerHTML = medicines.map(med => {
        const stock = med.quantity || 0;
        let stockStatus, button;

        const safeName = med.name.replace(/'/g, "\\'");


        if (stock <= 0) {
            stockStatus = `<span class="status" style="background: #ffebee; color: #c62828;">Out of Stock</span>`;
            button = `<button class="quick-action-btn" style="width: 100%; background: #999; cursor: not-allowed;" disabled>
                        <i class="fas fa-ban"></i> Out of Stock
                      </button>`;
        } else {
            stockStatus = `<span class="status completed" style="background: rgba(76, 175, 80, 0.1); color: #4caf50;">In Stock</span>`;
            button = `<button class="quick-action-btn blue" style="width: 100%;" 
                        onclick="addToCart(${med.id}, '${safeName}', ${med.priceLKR})">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                      </button>`;
        }


        if (med.category === 'Antibiotic' || med.category === 'ANTIBIOTICS') {
            stockStatus = `<span class="status pending" style="background: rgba(255, 152, 0, 0.1); color: #ff9800;">Prescription Needed</span>`;
            button = `<button class="quick-action-btn orange" style="width: 100%;" 
                        onclick="uploadPrescription('${safeName}')">
                        <i class="fas fa-file-upload"></i> Upload Prescription
                      </button>`;
        }

        return `
        <div class="card" style="padding: 20px;">
            <div style="text-align: center; margin-bottom: 15px;">
                <!-- You can replace this icon with a real image if you add an 'imageUrl' field to your Medicine entity -->
                <i class="fas fa-pills" style="font-size: 60px; color: #4fc3f7;"></i>
            </div>
            <h3 style="color: #0288d1; margin-bottom: 10px; min-height: 44px;">${med.name}</h3>
            <p style="color: #666; margin-bottom: 10px; min-height: 36px;">${med.description || med.genericName || 'No description'}</p>
            <div style="margin-bottom: 15px;">
                ${stockStatus}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <span style="font-size: 24px; color: #0288d1; font-weight: bold;">${lkrFormatter.format(med.priceLKR || 0)}</span>
                <span style="color: #999;">Per pack</span>
            </div>
            ${button}
        </div>
        `;
    }).join('');
}



function applyFilters() {
    const searchTerm = document.getElementById('search-medicine').value.toLowerCase();
    const category = document.getElementById('category-filter').value;

    const filtered = allMedicines.filter(m =>
        (m.name.toLowerCase().includes(searchTerm) ||
            (m.genericName && m.genericName.toLowerCase().includes(searchTerm)) ||
            (m.brand && m.brand.toLowerCase().includes(searchTerm))) &&
        (category === "" || m.category === category)
    );
    renderMedicineGrid(filtered);
}


window.addEventListener('DOMContentLoaded', () => {
    loadMedicines();
    updateCartDisplay();


    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }


    const checkoutBtn = document.getElementById('checkout-btn');
    if(checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    } else {
        console.error('Checkout button not found on page load.');
    }


    document.getElementById('search-medicine')?.addEventListener('input', applyFilters);
    document.getElementById('category-filter')?.addEventListener('change', applyFilters);
});