import { renderProducts } from './modules/products.js';
import { renderClients } from './modules/clients.js';
import { renderSales } from './modules/sales.js';
import { renderReports } from './modules/reports.js';

// State
const state = {
    currentModule: 'dashboard'
};

// DOM Elements
const contentArea = document.getElementById('content-area');
const pageTitle = document.getElementById('page-title');
const navItems = document.querySelectorAll('.nav-item');

// Navigation Handler
function handleNavigation(moduleName) {
    // Update State
    state.currentModule = moduleName;

    // Update UI
    navItems.forEach(item => {
        if (item.dataset.module === moduleName) {
            item.classList.add('active');
            pageTitle.textContent = item.textContent.trim();
        } else {
            item.classList.remove('active');
        }
    });

    // Load Content
    loadModuleContent(moduleName);
}

function loadModuleContent(moduleName) {
    contentArea.innerHTML = ''; // Clear current content

    switch (moduleName) {
        case 'dashboard':
            contentArea.innerHTML = `
                <div class="welcome-card">
                    <h2>Dashboard</h2>
                    <p>Resumen de ventas y estadísticas (Próximamente).</p>
                </div>
            `;
            break;
        case 'products':
            renderProducts(contentArea);
            break;
        case 'clients':
            renderClients(contentArea);
            break;
        case 'sales':
            renderSales(contentArea);
            break;
        case 'reports':
            renderReports(contentArea);
            break;
        default:
            contentArea.innerHTML = '<p>Módulo no encontrado</p>';
    }

    // Initialize Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Event Listeners
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        const module = e.currentTarget.dataset.module;
        handleNavigation(module);
    });
});

// Mobile Menu Logic
const mobileBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.querySelector('.sidebar');

// Create overlay
const overlay = document.createElement('div');
overlay.className = 'sidebar-overlay';
document.body.appendChild(overlay);

const toggleMenu = () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
};

if (mobileBtn) {
    mobileBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
}

// Close menu when clicking a nav item on mobile
navItems.forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            toggleMenu();
        }
    });
});

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    alert('SISTEMA CARGADO CORRECTAMENTE (v2.0)'); // Debug Alert
    if (window.lucide) window.lucide.createIcons();
    handleNavigation('dashboard');
});
