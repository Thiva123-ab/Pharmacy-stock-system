

const user = JSON.parse(localStorage.getItem('user') || '{}');


const feedbackListContainer = document.getElementById('feedback-list-container');
const feedbackForm = document.getElementById('feedback-form');
const feedbackComment = document.getElementById('feedback-comment');




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
    } else {
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
        }, 5000);
    }, 5000);
}





async function loadFeedback() {
    feedbackListContainer.innerHTML = '<div class="spinner" style="margin: 40px auto;"></div>';

    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_FEEDBACK, { method: 'GET' });
        if (response.success && response.data.data) {
            renderFeedbackList(response.data.data);
        } else {
            feedbackListContainer.innerHTML = '<p style="text-align: center; color: red;">Could not load feedback.</p>';
            showAlert(response.error || 'Failed to load feedback.', 'error');
        }
    } catch (error) {
        feedbackListContainer.innerHTML = '<p style="text-align: center; color: red;">Connection error.</p>';
        showAlert('A connection error occurred.', 'error');
    }
}


function renderFeedbackList(feedbackList) {
    if (feedbackList.length === 0) {
        feedbackListContainer.innerHTML = '<p style="text-align: center; color: #666;">No feedback yet. Be the first!</p>';
        return;
    }

    feedbackListContainer.innerHTML = feedbackList.map(feedback => {
        const customerInitial = feedback.customerName ? feedback.customerName.charAt(0).toUpperCase() : 'A';
        const formattedDate = new Date(feedback.createdAt).toLocaleString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });


        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<i class="fas fa-star" style="color: ${i <= feedback.rating ? '#ffc107' : '#ccc'};"></i>`;
        }

        return `
            <div class="feedback-card">
                <div class="feedback-avatar">${customerInitial}</div>
                <div class="feedback-content">
                    <h4>${feedback.customerName}</h4>
                    <div class="date">${formattedDate}</div>
                    <div class="stars-display" style="margin-bottom: 10px;">${stars}</div>
                    <p>${feedback.comment}</p>
                </div>
            </div>
        `;
    }).join('');
}


async function handleFeedbackSubmit(event) {
    event.preventDefault();
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';


    const rating = document.querySelector('input[name="rating"]:checked');
    const comment = feedbackComment.value;

    if (!rating) {
        showAlert('Please select a star rating.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Feedback';
        return;
    }

    if (comment.trim() === "") {
        showAlert('Please enter a comment.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Feedback';
        return;
    }

    const payload = {
        rating: parseInt(rating.value),
        comment: comment
    };

    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.POST_FEEDBACK, {
            method: 'POST',
            body: payload
        });

        if (response.success) {
            showAlert('Thank you for your feedback!', 'success');
            feedbackForm.reset();
            loadFeedback();
        } else {
            showAlert(response.error || 'Failed to submit feedback.', 'error');
        }
    } catch (error) {
        showAlert('A connection error occurred.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Feedback';
    }
}





window.addEventListener('DOMContentLoaded', () => {
    loadFeedback();

    feedbackForm.addEventListener('submit', handleFeedbackSubmit);

    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});