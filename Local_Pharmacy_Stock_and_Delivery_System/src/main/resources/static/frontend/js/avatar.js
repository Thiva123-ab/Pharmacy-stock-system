
function initAvatar() {
    loadAvatarDisplay();
    setupAvatarUpload();
}


function loadAvatarDisplay() {
    const avatarImage = document.getElementById('avatar-image');
    const avatarIcon = document.getElementById('avatar-icon');

    if (!avatarImage) return;


    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const savedAvatar = user.avatar || localStorage.getItem('userAvatar');

    if (savedAvatar) {
        avatarImage.src = savedAvatar;
        avatarImage.style.display = 'block';
        if (avatarIcon) avatarIcon.style.display = 'none';
    }
}


function setupAvatarUpload() {
    const avatarUpload = document.getElementById('avatar-upload');
    if (!avatarUpload) return;

    avatarUpload.addEventListener('change', handleAvatarUpload);
}


document.getElementById('avatar-upload')?.addEventListener('change', function(event) {
    const file = event.target.files[0];

    if (file) {

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a valid image file (JPG, PNG, or GIF)');
            return;
        }


        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File size must be less than 5MB');
            return;
        }


        const reader = new FileReader();

        reader.onload = function(e) {
            const avatarImage = document.getElementById('avatar-image');
            const avatarIcon = document.getElementById('avatar-icon');

            if (avatarImage && avatarIcon) {
                avatarImage.src = e.target.result;
                avatarImage.style.display = 'block';
                avatarIcon.style.display = 'none';


                localStorage.setItem('userAvatar', e.target.result);


            }
        };

        reader.onerror = function() {
            alert('Error reading file. Please try again.');
        };

        reader.readAsDataURL(file);
    }
});


async function uploadAvatarToServer(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/users/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Avatar uploaded successfully:', data);


            const user = JSON.parse(localStorage.getItem('user') || '{}');
            user.avatar = data.avatarUrl;
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            console.error('Avatar upload failed');
        }
    } catch (error) {
        console.error('Error uploading avatar:', error);
    }
}


window.addEventListener('DOMContentLoaded', function() {
    const savedAvatar = localStorage.getItem('userAvatar');
    const avatarImage = document.getElementById('avatar-image');
    const avatarIcon = document.getElementById('avatar-icon');

    if (savedAvatar && avatarImage && avatarIcon) {
        avatarImage.src = savedAvatar;
        avatarImage.style.display = 'block';
        avatarIcon.style.display = 'none';
    }


    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.avatar && avatarImage && avatarIcon) {
        avatarImage.src = user.avatar;
        avatarImage.style.display = 'block';
        avatarIcon.style.display = 'none';
    }
});


function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;


    if (!file.type.startsWith('image/')) {
        showAvatarAlert('Please select an image file (JPG, PNG, GIF)', 'error');
        return;
    }


    if (file.size > 5 * 1024 * 1024) {
        showAvatarAlert('Image size should be less than 5MB', 'error');
        return;
    }


    const reader = new FileReader();
    reader.onload = function(event) {
        const imageData = event.target.result;
        updateAvatar(imageData);
    };
    reader.readAsDataURL(file);
}


function updateAvatar(imageData) {
    const avatarImage = document.getElementById('avatar-image');
    const avatarIcon = document.getElementById('avatar-icon');


    if (avatarImage) {
        avatarImage.src = imageData;
        avatarImage.style.display = 'block';
    }
    if (avatarIcon) {
        avatarIcon.style.display = 'none';
    }


    localStorage.setItem('userAvatar', imageData);


    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.avatar = imageData;
    localStorage.setItem('user', JSON.stringify(user));


    showAvatarAlert('Profile photo updated successfully!', 'success');


    uploadAvatarToServer(imageData);
}


async function uploadAvatarToServer(imageData) {
    try {

        const response = await apiRequest('/users/avatar', {
            method: 'POST',
            body: JSON.stringify({ avatar: imageData })
        });

        if (response.success) {
            console.log('Avatar uploaded to server successfully');
        }
    } catch (error) {
        console.log('Backend not connected, avatar saved locally');
    }
}


function showAvatarAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `avatar-alert avatar-alert-${type}`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)' : 'linear-gradient(135deg, #f44336 0%, #e57373 100%)'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease;
        font-size: 14px;
        font-weight: 500;
    `;

    const icon = type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>';
    alertDiv.innerHTML = `${icon} ${message}`;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(alertDiv)) {
                document.body.removeChild(alertDiv);
            }
        }, 300);
    }, 3000);
}


function removeAvatar() {
    if (!confirm('Are you sure you want to remove your profile photo?')) {
        return;
    }

    const avatarImage = document.getElementById('avatar-image');
    const avatarIcon = document.getElementById('avatar-icon');


    if (avatarImage) {
        avatarImage.style.display = 'none';
        avatarImage.src = '';
    }
    if (avatarIcon) {
        avatarIcon.style.display = 'block';
    }


    localStorage.removeItem('userAvatar');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    delete user.avatar;
    localStorage.setItem('user', JSON.stringify(user));

    showAvatarAlert('Profile photo removed', 'success');
}


const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAvatar);
} else {
    initAvatar();
}
