
window.addEventListener('DOMContentLoaded', function() {
    const bgAnimation = document.getElementById('bgAnimation');
    const elements = ['pill', 'capsule', 'circle', 'plus'];
    const colors = ['#4fc3f7', '#66bb6a', '#29b6f6', '#0288d1'];


    for (let i = 0; i < 40; i++) {
        const element = document.createElement('div');
        const randomElement = elements[Math.floor(Math.random() * elements.length)];
        element.className = `floating-element ${randomElement}`;


        element.style.left = Math.random() * 100 + '%';
        element.style.top = Math.random() * 100 + '%';


        element.style.animationDelay = Math.random() * 20 + 's';
        element.style.animationDuration = (15 + Math.random() * 15) + 's';

        element.style.boxShadow = `0 0 10px rgba(${getShadowColor(randomElement)}, 0.5)`;

        bgAnimation.appendChild(element);
    }
});


function getShadowColor(elementType) {
    switch(elementType) {
        case 'pill':
            return '79, 195, 247'; // #4fc3f7
        case 'capsule':
            return '102, 187, 106'; // #66bb6a
        case 'circle':
            return '41, 182, 246'; // #29b6f6
        case 'plus':
            return '102, 187, 106'; // #66bb6a
        default:
            return '79, 195, 247'; // #4fc3f7
    }
}


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});


window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 5px 30px rgba(41, 182, 246, 0.4)';
        navbar.style.background = 'linear-gradient(135deg, rgba(41, 182, 246, 0.95) 0%, rgba(2, 136, 209, 0.95) 100%)';
    } else {
        navbar.style.boxShadow = '0 2px 20px rgba(41, 182, 246, 0.3)';
        navbar.style.background = 'linear-gradient(135deg, #29b6f6 0%, #0288d1 100%)';
    }
});


const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger?.addEventListener('click', function() {
    navMenu.classList.toggle('active');


    const spans = this.querySelectorAll('span');
    spans[0].style.transform = navMenu.classList.contains('active') ? 'rotate(45deg) translate(5px, 5px)' : 'none';
    spans[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
    spans[2].style.transform = navMenu.classList.contains('active') ? 'rotate(-45deg) translate(7px, -6px)' : 'none';
});


document.getElementById('contactForm')?.addEventListener('submit', function(e) {
    e.preventDefault();


    const formData = new FormData(this);
    const data = Object.fromEntries(formData);


    alert('Thank you for your message! We will get back to you soon.');


    this.reset();


    console.log('Form submitted:', data);
});


const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);


document.querySelectorAll('.service-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
});


window.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (token) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');


        const navButtons = document.querySelector('.nav-buttons');
        if (navButtons) {
            let dashboardUrl = 'login.html';

            switch(user.role) {
                case 'CUSTOMER':
                    dashboardUrl = 'customer/dashboard.html';
                    break;
                case 'DELIVERY':
                    dashboardUrl = 'delivery/dashboard.html';
                    break;
                case 'ADMIN':
                    dashboardUrl = 'admin/dashboard.html';
                    break;
                case 'PHARMACIST':
                    dashboardUrl = 'pharmacist/dashboard.html';
                    break;
            }

            navButtons.innerHTML = `
                <a href="${dashboardUrl}" class="btn-login">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </a>
                <button onclick="logout()" class="btn-register">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            `;
        }
    }
});


function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    }
}


window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (window.scrollY >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});
