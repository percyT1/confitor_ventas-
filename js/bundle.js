
// ==========================================
// BUNDLED APPLICATION (No Modules)
// ==========================================

// Global Helpers
const formatMoney = (amount) => {
    return '$' + Math.round(amount).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

// --- PRODUCTS MODULE ---
let productsData = JSON.parse(localStorage.getItem('products')) || [
    { id: 1, name: 'Producto Ejemplo', price: 1190, stock: 10, image: 'https://via.placeholder.com/150', isActive: true, priority: 1 }
];

// Data Migration: Ensure all products have 'price' (Final Price)
productsData = productsData.map(p => {
    if (p.price === undefined && p.priceNet !== undefined) {
        // Migrate old Net + VAT to Final Price
        const vat = p.vat || 19;
        p.price = Math.round(p.priceNet * (1 + (vat / 100)));
    }
    return p;
});

function saveProducts() {
    localStorage.setItem('products', JSON.stringify(productsData));
    renderProducts(document.getElementById('content-area'));
}

function renderProducts(container) {
    try {
        const html = `
        <div class="module-header" style="display: flex; justify-content: space-between; margin-bottom: 2rem; align-items: center;">
            <h2 style="font-size: 1.5rem; font-weight: 600;">Inventario</h2>
            <button class="btn-primary" id="btn-add-product" style="background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="plus"></i> Nuevo Producto
            </button>
        </div>

        <div class="products-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
            ${productsData.sort((a, b) => (a.priority || 0) - (b.priority || 0)).map(product => {
            const price = Number(product.price) || 0;
            const statusColor = product.isActive ? '#22c55e' : '#94a3b8';

            // Safe Image Handling
            let imgSrc = 'https://via.placeholder.com/300?text=Sin+Imagen';
            if (product.image && typeof product.image === 'string') {
                if (product.image.startsWith('http') || product.image.startsWith('data:')) {
                    imgSrc = product.image;
                } else {
                    imgSrc = 'img/' + product.image;
                }
            }

            return `
                <div class="product-card" style="background: white; padding: 0; border-radius: var(--radius); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden; display: flex; flex-direction: column; opacity: ${product.isActive ? 1 : 0.6};">
                    <div style="height: 180px; overflow: hidden; background: #f1f5f9; position: relative;">
                        <img src="${imgSrc}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
                        <div style="position: absolute; top: 0.5rem; right: 0.5rem; background: ${statusColor}; color: white; padding: 0.25rem 0.5rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600;">
                            ${product.isActive ? 'VIGENTE' : 'INACTIVO'}
                        </div>
                        <div style="position: absolute; top: 0.5rem; left: 0.5rem; background: rgba(0,0,0,0.6); color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
                            P: ${product.priority || 1}
                        </div>
                    </div>
                    <div style="padding: 1.5rem; flex: 1;">
                        <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-main);">${product.name}</h3>
                        <div class="details" style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                            <div style="grid-column: span 2;">
                                <span style="display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Precio Final</span>
                                <span style="font-weight: 700; font-size: 1.5rem; color: var(--primary);">
                                    ${formatMoney(price)}
                                </span>
                            </div>
                        </div>
                        <div class="actions" style="display: flex; gap: 0.75rem;">
                            <button onclick="window.editProduct(${product.id})" style="flex: 1; padding: 0.5rem; border: 1px solid var(--border-color); background: white; border-radius: 0.375rem; cursor: pointer; font-weight: 500; color: var(--text-main); transition: background 0.2s;">Editar</button>
                            <button onclick="window.deleteProduct(${product.id})" style="flex: 1; padding: 0.5rem; border: 1px solid #fee2e2; color: #ef4444; background: #fef2f2; border-radius: 0.375rem; cursor: pointer; font-weight: 500; transition: background 0.2s;">Eliminar</button>
                        </div>
                    </div>
                </div>
                `;
        }).join('')}
        </div>

        <!-- Modal -->
        <div id="product-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 100; align-items: center; justify-content: center;">
            <div style="background: white; padding: 2rem; border-radius: var(--radius); width: 90%; max-width: 500px; box-shadow: var(--shadow-md); max-height: 90vh; overflow-y: auto;">
                <h3 id="modal-title" style="margin-bottom: 1.5rem; font-size: 1.25rem; font-weight: 600;">Nuevo Producto</h3>
                <form id="product-form" style="display: grid; gap: 1rem;">
                    <input type="hidden" id="product-id">
                    <div>
                        <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">Nombre del Producto</label>
                        <input type="text" id="product-name" required style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.375rem;">
                    </div>
                    
                    <div>
                        <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">Precio Final (Bruto)</label>
                        <input type="number" id="product-price" required min="0" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.375rem;">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">Prioridad (Orden)</label>
                            <input type="number" id="product-priority" value="1" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.375rem;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">Estado</label>
                            <select id="product-active" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.375rem;">
                                <option value="true">Vigente</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">Imagen (URL o Nombre de archivo)</label>
                        <input type="text" id="product-image" placeholder="ej: producto.jpg o https://..." style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.375rem;">
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
                        <button type="button" id="btn-cancel" style="padding: 0.5rem 1rem; border: 1px solid var(--border-color); background: white; border-radius: 0.375rem; cursor: pointer;">Cancelar</button>
                        <button type="submit" style="padding: 0.5rem 1rem; background: var(--primary); color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
        `;

        container.innerHTML = html;
        if (window.lucide) window.lucide.createIcons();

        // Bind Events
        const modal = document.getElementById('product-modal');
        const form = document.getElementById('product-form');

        document.getElementById('btn-add-product').addEventListener('click', () => {
            form.reset();
            document.getElementById('product-id').value = '';
            document.getElementById('product-active').value = 'true';
            document.getElementById('modal-title').textContent = 'Nuevo Producto';
            modal.style.display = 'flex';
        });

        document.getElementById('btn-cancel').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('product-id').value;

            const product = {
                id: id ? parseInt(id) : Date.now(),
                name: document.getElementById('product-name').value,
                price: parseInt(document.getElementById('product-price').value),
                priority: parseInt(document.getElementById('product-priority').value) || 1,
                isActive: document.getElementById('product-active').value === 'true',
                image: document.getElementById('product-image').value
            };

            if (id) {
                const index = productsData.findIndex(p => p.id === parseInt(id));
                productsData[index] = product;
            } else {
                productsData.push(product);
            }

            saveProducts();
            modal.style.display = 'none';
        });

        // Global handlers for this module
        window.deleteProduct = (id) => {
            if (confirm('¿Estás seguro de eliminar este producto?')) {
                productsData = productsData.filter(p => p.id !== id);
                saveProducts();
            }
        };

        window.editProduct = (id) => {
            const p = productsData.find(p => p.id === id);
            if (p) {
                document.getElementById('product-id').value = p.id;
                document.getElementById('product-name').value = p.name;
                document.getElementById('product-price').value = p.price;
                document.getElementById('product-priority').value = p.priority || 1;
                document.getElementById('product-active').value = p.isActive.toString();
                document.getElementById('product-image').value = p.image || '';

                document.getElementById('modal-title').textContent = 'Editar Producto';
                modal.style.display = 'flex';
            }
        };

    } catch (error) {
        console.error('Error rendering products:', error);
        container.innerHTML = `<div style="color: red; padding: 2rem;">Error cargando productos: ${error.message}</div>`;
    }
}


// --- CLIENTS MODULE ---
let clientsData = JSON.parse(localStorage.getItem('clients')) || [
    { id: 1, name: 'Juan Pérez', rut: '12.345.678-9', phone: '56912345678', email: 'juan@example.com', address: 'Av. Siempre Viva 123' }
];

function saveClients() {
    localStorage.setItem('clients', JSON.stringify(clientsData));
    renderClients(document.getElementById('content-area'));
}

function renderClients(container) {
    const html = `
        <div class="module-header" style="display: flex; justify-content: space-between; margin-bottom: 2rem; align-items: center;">
            <h2 style="font-size: 1.5rem; font-weight: 600;">Gestión de Clientes</h2>
            <button class="btn-primary" id="btn-add-client" style="background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="user-plus"></i> Nuevo Cliente
            </button>
        </div>

        <div class="clients-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
            ${clientsData.map(client => `
                <div class="client-card" style="background: white; padding: 1.5rem; border-radius: var(--radius); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <div style="width: 3rem; height: 3rem; background: #e0f2fe; color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 1.25rem;">
                            ${client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 style="font-size: 1.125rem; font-weight: 600; color: var(--text-main);">${client.name}</h3>
                            <span style="font-size: 0.875rem; color: var(--text-muted);">${client.rut}</span>
                        </div>
                    </div>
                    
                    <div class="details" style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem; flex: 1;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <i data-lucide="phone" style="width: 16px; height: 16px;"></i>
                            <span>${client.phone}</span>
                            <a href="https://wa.me/${client.phone.replace(/[^0-9]/g, '')}" target="_blank" style="margin-left: auto; color: #22c55e; text-decoration: none; font-size: 0.8rem; display: flex; align-items: center; gap: 0.25rem;">
                                <i data-lucide="message-circle" style="width: 14px; height: 14px;"></i> WhatsApp
                            </a>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <i data-lucide="mail" style="width: 16px; height: 16px;"></i>
                            <span>${client.email || 'Sin email'}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <i data-lucide="map-pin" style="width: 16px; height: 16px;"></i>
                            <span>${client.address || 'Sin dirección'}</span>
                        </div>
                    </div>

                    <div class="actions" style="display: flex; gap: 0.75rem; margin-top: auto;">
                        <button onclick="window.editClient(${client.id})" style="flex: 1; padding: 0.5rem; border: 1px solid var(--border-color); background: white; border-radius: 0.375rem; cursor: pointer; font-weight: 500; color: var(--text-main); transition: background 0.2s;">Editar</button>
                        <button onclick="window.deleteClient(${client.id})" style="flex: 1; padding: 0.5rem; border: 1px solid #fee2e2; color: #ef4444; background: #fef2f2; border-radius: 0.375rem; cursor: pointer; font-weight: 500; transition: background 0.2s;">Eliminar</button>
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Modal Container -->
        <div id="client-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 100; align-items: center; justify-content: center;">
            <div style="background: white; padding: 2rem; border-radius: var(--radius); width: 90%; max-width: 500px; box-shadow: var(--shadow-md);">
                <h3 id="client-modal-title" style="margin-bottom: 1.5rem; font-size: 1.25rem; font-weight: 600;">Nuevo Cliente</h3>
                <form id="client-form" style="display: grid; gap: 1rem;">
                    <input type="hidden" id="client-id">
                    <div>
                        <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">Nombre Completo</label>
                        <input type="text" id="client-name" required style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.375rem;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">RUT / DNI</label>
                        <input type="text" id="client-rut" required style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.375rem;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">Teléfono (con código país, ej: 569...)</label>
                        <input type="tel" id="client-phone" required placeholder="56912345678" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.375rem;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">Email</label>
                        <input type="email" id="client-email" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.375rem;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">Dirección</label>
                        <input type="text" id="client-address" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.375rem;">
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
                        <button type="button" id="btn-cancel-client" style="padding: 0.5rem 1rem; border: 1px solid var(--border-color); background: white; border-radius: 0.375rem; cursor: pointer;">Cancelar</button>
                        <button type="submit" style="padding: 0.5rem 1rem; background: var(--primary); color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();

    // Bind Events
    const modal = document.getElementById('client-modal');
    const form = document.getElementById('client-form');

    document.getElementById('btn-add-client').addEventListener('click', () => {
        form.reset();
        document.getElementById('client-id').value = '';
        document.getElementById('client-modal-title').textContent = 'Nuevo Cliente';
        modal.style.display = 'flex';
    });

    document.getElementById('btn-cancel-client').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('client-id').value;
        const client = {
            id: id ? parseInt(id) : Date.now(),
            name: document.getElementById('client-name').value,
            rut: document.getElementById('client-rut').value,
            phone: document.getElementById('client-phone').value,
            email: document.getElementById('client-email').value,
            address: document.getElementById('client-address').value
        };

        if (id) {
            const index = clientsData.findIndex(c => c.id === parseInt(id));
            clientsData[index] = client;
        } else {
            clientsData.push(client);
        }

        saveClients();
        modal.style.display = 'none';
    });

    // Global handlers
    window.deleteClient = (id) => {
        if (confirm('¿Estás seguro de eliminar este cliente?')) {
            clientsData = clientsData.filter(c => c.id !== id);
            saveClients();
        }
    };

    window.editClient = (id) => {
        const c = clientsData.find(c => c.id === id);
        if (c) {
            document.getElementById('client-id').value = c.id;
            document.getElementById('client-name').value = c.name;
            document.getElementById('client-rut').value = c.rut;
            document.getElementById('client-phone').value = c.phone;
            document.getElementById('client-email').value = c.email;
            document.getElementById('client-address').value = c.address;
            document.getElementById('client-modal-title').textContent = 'Editar Cliente';
            modal.style.display = 'flex';
        }
    };
}


// --- SALES MODULE ---
function renderSales(container) {
    // Load Data
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];

    // State for the sales process
    // We need to persist state across renders if we want to stay on the same step
    // For simplicity in this bundled approach, we'll use a global or module-level variable if possible,
    // but since this function is re-called, we might lose state if we don't be careful.
    // However, the current architecture re-calls renderSales on navigation. 
    // We'll use a simple internal state management by re-rendering specific parts or using a closure if we were cleaner.
    // Given the existing pattern, let's try to keep it simple.

    // We will attach state to the container or window to persist it during the session if needed, 
    // but for now let's assume 'renderSales' is called once and then we handle internal re-renders.

    if (!container.dataset.salesInitialized) {
        container.dataset.step = 'client-select'; // client-select, gallery, cart
        container.dataset.selectedClientId = '';
        container.dataset.cart = '{}'; // JSON string
        container.dataset.salesInitialized = 'true';
    }

    // Helpers to get/set state
    const getStep = () => container.dataset.step;
    const setStep = (step) => { container.dataset.step = step; render(); };

    const getClient = () => {
        const id = container.dataset.selectedClientId;
        return id ? clients.find(c => c.id === parseInt(id)) : null;
    };
    const setClient = (id) => { container.dataset.selectedClientId = id; };

    const getCart = () => JSON.parse(container.dataset.cart || '{}');
    const setCart = (cart) => { container.dataset.cart = JSON.stringify(cart); };

    // Helper to calculate totals
    const calculateTotal = () => {
        const cart = getCart();
        let total = 0;
        Object.entries(cart).forEach(([pid, qty]) => {
            const p = products.find(prod => prod.id === parseInt(pid));
            if (p) {
                total += (p.price || 0) * qty;
            }
        });
        return total;
    };

    // WhatsApp Message Generator
    const sendWhatsAppNote = () => {
        const client = getClient();
        const cart = getCart();

        if (!client || !client.phone) {
            alert('El cliente no tiene un teléfono registrado para WhatsApp.');
            return;
        }

        let message = `*NOTA DE VENTA - CONFITOR*%0A`;
        message += `Cliente: ${client.name}%0A`;
        message += `Fecha: ${new Date().toLocaleDateString()}%0A`;
        message += `--------------------------------%0A`;

        let totalFinal = 0;

        Object.entries(cart).forEach(([pid, qty]) => {
            const p = products.find(prod => prod.id === parseInt(pid));
            if (p) {
                const price = p.price || 0;
                const totalItem = price * qty;
                totalFinal += totalItem;

                message += `${qty} x ${p.name} (${formatMoney(price)}) = ${formatMoney(totalItem)}%0A`;
            }
        });

        message += `--------------------------------%0A`;
        message += `*TOTAL A PAGAR: ${formatMoney(totalFinal)}*`;

        const phone = client.phone.replace(/\D/g, '');
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    // --- RENDERERS ---

    const renderClientSelection = () => {
        return `
            <div class="animate-fade-in">
                <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; color: #0f172a;">1. Seleccionar Cliente</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">
                    ${clients.map(client => `
                        <div class="client-select-card" onclick="window.salesSelectClient(${client.id})" 
                             style="background: white; padding: 1.5rem; border-radius: var(--radius); border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            <div style="font-weight: 700; color: #0ea5e9; font-size: 1.1rem; margin-bottom: 0.5rem;">${client.name}</div>
                            <div style="font-size: 0.9rem; color: #64748b; display: flex; align-items: center; gap: 0.5rem;">
                                <i data-lucide="map-pin" style="width: 16px;"></i> ${client.address || 'Sin dirección'}
                            </div>
                        </div>
                    `).join('')}
                    ${clients.length === 0 ? '<p style="color: var(--text-muted);">No hay clientes registrados.</p>' : ''}
                </div>
            </div>
        `;
    };

    const renderGallery = () => {
        const client = getClient();
        // Filter products starting with 'z_' (case insensitive)
        const galleryProducts = products.filter(p => p.image && p.image.toLowerCase().includes('z_'));

        return `
            <div class="animate-fade-in">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <div>
                        <h2 style="font-size: 1.5rem; font-weight: 600; color: #0f172a;">Galería de Productos</h2>
                        <div style="color: #64748b;">Cliente: <strong>${client ? client.name : 'Desconocido'}</strong></div>
                    </div>
                    <button onclick="window.salesGoToCart()" style="background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                        <i data-lucide="shopping-cart"></i> Ver Carrito (${Object.keys(getCart()).length})
                    </button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.25rem;">
                    ${galleryProducts.map(p => `
                        <div onclick="window.salesPromptQuantity(${p.id})" style="cursor: pointer; position: relative; aspect-ratio: 1; overflow: hidden; border-radius: var(--radius); border: 2px solid transparent; box-shadow: var(--shadow-sm); transition: transform 0.1s;">
                            <img src="${p.image.startsWith('http') || p.image.startsWith('data:') ? p.image : 'img/' + p.image}" 
                                 style="width: 100%; height: 100%; object-fit: cover; display: block;"
                                 onerror="this.src='https://via.placeholder.com/300?text=Error'">
                            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: white; padding: 0.5rem; font-size: 0.8rem; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${p.name}
                            </div>
                        </div>
                    `).join('')}
                    ${galleryProducts.length === 0 ? '<p style="grid-column: span 4; text-align: center; padding: 2rem;">No se encontraron imágenes que empiecen con "z_".</p>' : ''}
                </div>
                
                <div style="margin-top: 2rem; text-align: center;">
                    <button onclick="window.salesReset()" style="color: #ef4444; background: none; border: 1px solid #fee2e2; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer;">Cancelar Venta</button>
                </div>
            </div>
        `;
    };

    const renderCart = () => {
        const client = getClient();
        const cart = getCart();
        const total = calculateTotal();

        return `
            <div class="animate-fade-in">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="font-size: 1.5rem; font-weight: 600; color: #0f172a;">Resumen de Venta</h2>
                    <button onclick="window.salesGoToGallery()" style="background: white; border: 1px solid var(--border-color); padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                        <i data-lucide="plus"></i> Agregar más
                    </button>
                </div>

                <div style="background: white; border-radius: var(--radius); box-shadow: var(--shadow-sm); overflow: hidden; margin-bottom: 2rem;">
                    <div style="padding: 1.5rem; border-bottom: 1px solid var(--border-color); background: #f8fafc;">
                        <div style="font-size: 0.9rem; color: #64748b;">Cliente</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: #0f172a;">${client ? client.name : 'Desconocido'}</div>
                    </div>
                    
                    <div style="padding: 1.5rem;">
                        ${Object.entries(cart).map(([pid, qty]) => {
            const p = products.find(prod => prod.id === parseInt(pid));
            if (!p) return '';
            return `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid #f1f5f9;">
                                    <div style="display: flex; align-items: center; gap: 1rem;">
                                        <div style="width: 50px; height: 50px; border-radius: 0.5rem; overflow: hidden; background: #f1f5f9;">
                                            <img src="${p.image.startsWith('http') || p.image.startsWith('data:') ? p.image : 'img/' + p.image}" style="width: 100%; height: 100%; object-fit: cover;">
                                        </div>
                                        <div>
                                            <div style="font-weight: 600; color: #0f172a;">${p.name}</div>
                                            <div style="font-size: 0.875rem; color: #64748b;">${qty} x ${formatMoney(p.price)}</div>
                                        </div>
                                    </div>
                                    <div style="font-weight: 700; color: #0f172a;">${formatMoney(p.price * qty)}</div>
                                </div>
                            `;
        }).join('')}
                        ${Object.keys(cart).length === 0 ? '<p style="text-align: center; color: #94a3b8; padding: 2rem;">El carrito está vacío.</p>' : ''}
                    </div>

                    <div style="padding: 1.5rem; background: #f8fafc; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 1.1rem; font-weight: 600; color: #64748b;">Total</div>
                        <div style="font-size: 2rem; font-weight: 800; color: #0f172a;">${formatMoney(total)}</div>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button onclick="window.salesSendWhatsApp()" style="background: #25D366; color: white; border: none; padding: 1rem 2rem; border-radius: 0.75rem; font-weight: 600; font-size: 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
                        <i data-lucide="message-circle"></i> WhatsApp
                    </button>
                    <button onclick="window.salesFinish()" style="background: var(--primary); color: white; border: none; padding: 1rem 2rem; border-radius: 0.75rem; font-weight: 600; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
                        <i data-lucide="check-circle"></i> Confirmar Venta
                    </button>
                </div>
            </div>
        `;
    };

    // --- LOGIC ---

    const render = () => {
        const step = getStep();
        if (step === 'client-select') {
            container.innerHTML = renderClientSelection();
        } else if (step === 'gallery') {
            container.innerHTML = renderGallery();
        } else if (step === 'cart') {
            container.innerHTML = renderCart();
        }
        if (window.lucide) window.lucide.createIcons();
    };

    // --- GLOBAL HANDLERS (Attached to window for HTML access) ---

    window.salesSelectClient = (id) => {
        setClient(id);
        setStep('gallery');
    };

    window.salesGoToGallery = () => {
        setStep('gallery');
    };

    window.salesGoToCart = () => {
        setStep('cart');
    };

    window.salesPromptQuantity = (productId) => {
        const p = products.find(prod => prod.id === productId);
        if (!p) return;

        const cart = getCart();
        const currentQty = cart[productId] || 0;

        // Simple prompt for now as requested
        const input = prompt(`Ingresa cantidad para: ${p.name}`, currentQty > 0 ? currentQty : '');

        if (input !== null) {
            const qty = parseInt(input);
            if (!isNaN(qty)) {
                if (qty > 0) {
                    cart[productId] = qty;
                } else {
                    delete cart[productId];
                }
                setCart(cart);
                // "pasaran inmediatamente a una nueva pantalla que ira acumulando"
                // Interpretation: Go to Cart immediately after selection
                setStep('cart');
            }
        }
    };

    window.salesReset = () => {
        if (confirm('¿Cancelar venta y volver al inicio?')) {
            setClient('');
            setCart({});
            setStep('client-select');
        }
    };

    window.salesSendWhatsApp = sendWhatsAppNote;

    window.salesFinish = () => {
        const cart = getCart();
        if (Object.keys(cart).length === 0) {
            alert('El carrito está vacío');
            return;
        }
        const total = calculateTotal();
        const client = getClient();

        if (confirm(`¿Confirmar venta por ${formatMoney(total)}?`)) {
            // Save to History
            const sale = {
                id: Date.now(),
                date: new Date().toISOString(),
                clientId: client.id,
                clientName: client.name,
                total: total,
                items: Object.entries(cart).map(([pid, qty]) => {
                    const p = products.find(prod => prod.id === parseInt(pid));
                    return {
                        productId: parseInt(pid),
                        productName: p ? p.name : 'Desconocido',
                        quantity: qty,
                        price: p ? p.price : 0,
                        total: (p ? p.price : 0) * qty
                    };
                })
            };

            const history = JSON.parse(localStorage.getItem('salesHistory')) || [];
            history.push(sale);
            localStorage.setItem('salesHistory', JSON.stringify(history));

            alert('Venta guardada correctamente.');

            // Reset
            setClient('');
            setCart({});
            setStep('client-select');
        }
    };

    // Initial Render
    render();
}



// --- REPORTS MODULE ---
function renderReports(container) {
    // Load Data
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];

    // State
    // Fix: Use Local Date for default filters to avoid Timezone issues
    const getLocalDateString = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offset).toISOString().split('T')[0];
    };

    let activeTab = 'client-sales'; // 'client-sales', 'product-sales', 'recent-sales'
    let filters = {
        clientId: '',
        startDate: getLocalDateString(),
        endDate: getLocalDateString(),
        selectedProducts: []
    };

    // Helper: Format Currency
    const formatMoney = (amount) => '$' + Math.round(amount).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    // Helper: Filter Sales by Date Range (Local Time Comparison)
    const filterByDate = (sales) => {
        return sales.filter(s => {
            const saleDate = new Date(s.date);
            // Convert sale date to Local YYYY-MM-DD string
            // We manually construct it to ensure we use the browser's local time interpretation
            const year = saleDate.getFullYear();
            const month = String(saleDate.getMonth() + 1).padStart(2, '0');
            const day = String(saleDate.getDate()).padStart(2, '0');
            const saleDateString = `${year}-${month}-${day}`;

            return saleDateString >= filters.startDate && saleDateString <= filters.endDate;
        });
    };

    // --- REPORT 1: Sales by Client (Total per Product) ---
    const renderClientSalesReport = () => {
        const filteredSales = filterByDate(salesHistory).filter(s =>
            filters.clientId ? s.clientId === parseInt(filters.clientId) : true
        );

        // Aggregate by Product
        const productTotals = {};
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productTotals[item.productId]) {
                    productTotals[item.productId] = {
                        name: item.productName,
                        quantity: 0,
                        total: 0
                    };
                }
                productTotals[item.productId].quantity += item.quantity;
                productTotals[item.productId].total += item.total;
            });
        });

        return `
            <div class="report-section">
                <div class="filters" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                    <select onchange="window.updateReportFilter('clientId', this.value)" style="padding: 0.5rem; border-radius: 0.375rem; border: 1px solid var(--border-color);">
                        <option value="">Todos los Clientes</option>
                        ${clients.map(c => `<option value="${c.id}" ${filters.clientId == c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                    </select>
                    <input type="date" value="${filters.startDate}" onchange="window.updateReportFilter('startDate', this.value)" style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.375rem;">
                    <input type="date" value="${filters.endDate}" onchange="window.updateReportFilter('endDate', this.value)" style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.375rem;">
                </div>

                <div class="report-results">
                    <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; color: #0f172a;">Resumen por Producto</h3>
                    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); margin-bottom: 2rem;">
                        <thead style="background: #f1f5f9;">
                            <tr>
                                <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Producto</th>
                                <th style="padding: 0.75rem; text-align: right; font-weight: 600;">Cantidad Total</th>
                                <th style="padding: 0.75rem; text-align: right; font-weight: 600;">Venta Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.values(productTotals).map(p => `
                                <tr style="border-bottom: 1px solid #e2e8f0;">
                                    <td style="padding: 0.75rem;">${p.name}</td>
                                    <td style="padding: 0.75rem; text-align: right;">${p.quantity}</td>
                                    <td style="padding: 0.75rem; text-align: right; font-weight: 500;">${formatMoney(p.total)}</td>
                                </tr>
                            `).join('')}
                            ${Object.keys(productTotals).length === 0 ? '<tr><td colspan="3" style="padding: 1rem; text-align: center; color: var(--text-muted);">No hay datos para mostrar</td></tr>' : ''}
                        </tbody>
                    </table>

                    <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; color: #0f172a;">Historial de Ventas (Detalle)</h3>
                    <div style="display: grid; gap: 1rem;">
                        ${filteredSales.sort((a, b) => new Date(b.date) - new Date(a.date)).map(sale => `
                            <div style="background: white; padding: 1rem; border-radius: var(--radius); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: 600; color: #0f172a;">${sale.clientName}</div>
                                    <div style="font-size: 0.85rem; color: #64748b;">${new Date(sale.date).toLocaleString()}</div>
                                    <div style="font-size: 0.85rem; color: #64748b; margin-top: 0.25rem;">${sale.items.length} items</div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-weight: 700; font-size: 1.1rem; color: #0f172a; margin-bottom: 0.5rem;">${formatMoney(sale.total)}</div>
                                    <button onclick="window.deleteSale(${sale.id})" style="background: #fee2e2; color: #ef4444; border: 1px solid #fecaca; padding: 0.25rem 0.75rem; border-radius: 0.375rem; font-size: 0.8rem; font-weight: 600; cursor: pointer;">
                                        <i data-lucide="trash-2" style="width: 14px; height: 14px; vertical-align: middle;"></i> Eliminar
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                        ${filteredSales.length === 0 ? '<p style="color: var(--text-muted);">No hay ventas en este periodo.</p>' : ''}
                    </div>
                </div>
            </div>
        `;
    };

    // --- REPORT 2: Product Sales (Multi-select) ---
    const renderProductSalesReport = () => {
        const filteredSales = filterByDate(salesHistory);

        // Aggregate selected products
        const productStats = {};
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                // If no products selected, show all. Else show only selected.
                if (filters.selectedProducts.length === 0 || filters.selectedProducts.includes(item.productId.toString())) {
                    if (!productStats[item.productId]) {
                        productStats[item.productId] = {
                            name: item.productName,
                            quantity: 0,
                            total: 0,
                            salesCount: 0
                        };
                    }
                    productStats[item.productId].quantity += item.quantity;
                    productStats[item.productId].total += item.total;
                    productStats[item.productId].salesCount++;
                }
            });
        });

        return `
            <div class="report-section">
                <div class="filters" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                    <select multiple onchange="window.updateReportFilter('selectedProducts', Array.from(this.selectedOptions, option => option.value))" style="padding: 0.5rem; border-radius: 0.375rem; border: 1px solid var(--border-color); min-width: 200px; height: 100px;">
                        ${products.map(p => `<option value="${p.id}" ${filters.selectedProducts.includes(p.id.toString()) ? 'selected' : ''}>${p.name}</option>`).join('')}
                    </select>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <input type="date" value="${filters.startDate}" onchange="window.updateReportFilter('startDate', this.value)" style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.375rem;">
                        <input type="date" value="${filters.endDate}" onchange="window.updateReportFilter('endDate', this.value)" style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.375rem;">
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); align-self: center;">* Mantén Ctrl/Cmd para seleccionar varios productos</div>
                </div>

                <div class="report-results">
                    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm);">
                        <thead style="background: #f1f5f9;">
                            <tr>
                                <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Producto</th>
                                <th style="padding: 0.75rem; text-align: right; font-weight: 600;">Veces Vendido</th>
                                <th style="padding: 0.75rem; text-align: right; font-weight: 600;">Unidades</th>
                                <th style="padding: 0.75rem; text-align: right; font-weight: 600;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.values(productStats).map(p => `
                                <tr style="border-bottom: 1px solid #e2e8f0;">
                                    <td style="padding: 0.75rem;">${p.name}</td>
                                    <td style="padding: 0.75rem; text-align: right;">${p.salesCount}</td>
                                    <td style="padding: 0.75rem; text-align: right;">${p.quantity}</td>
                                    <td style="padding: 0.75rem; text-align: right; font-weight: 500;">${formatMoney(p.total)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    };

    // --- REPORT 3: Recent Sales by Client ---
    const renderRecentSalesReport = () => {
        let filteredSales = salesHistory.sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first

        if (filters.clientId) {
            filteredSales = filteredSales.filter(s => s.clientId === parseInt(filters.clientId));
        }

        // Limit to last 10 by default or allow "load more" (simplified here)
        const displaySales = filteredSales.slice(0, 20);

        return `
            <div class="report-section">
                <div class="filters" style="margin-bottom: 1.5rem;">
                    <select onchange="window.updateReportFilter('clientId', this.value)" style="padding: 0.5rem; border-radius: 0.375rem; border: 1px solid var(--border-color);">
                        <option value="">Todos los Clientes</option>
                        ${clients.map(c => `<option value="${c.id}" ${filters.clientId == c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                    </select>
                </div>

                <div class="sales-list" style="display: grid; gap: 1rem;">
                    ${displaySales.map(sale => `
                        <div class="sale-card" style="background: white; padding: 1rem; border-radius: var(--radius); border: 1px solid var(--border-color);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <div>
                                    <span style="font-weight: 600; color: var(--primary);">${sale.clientName}</span>
                                    <span style="color: var(--text-muted); font-size: 0.875rem; margin-left: 0.5rem;">${new Date(sale.date).toLocaleString()}</span>
                                </div>
                                <div style="font-weight: 700;">${formatMoney(sale.total)}</div>
                            </div>
                            <div style="background: #f8fafc; padding: 0.5rem; border-radius: 0.25rem; font-size: 0.875rem;">
                                ${sale.items.map(item => `
                                    <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding: 0.25rem 0;">
                                        <span>${item.quantity} x ${item.productName}</span>
                                        <span>${formatMoney(item.total)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                    ${displaySales.length === 0 ? '<p>No hay ventas recientes.</p>' : ''}
                </div>
            </div>
        `;
    };

    // Main Render
    const render = () => {
        container.innerHTML = `
            <div class="animate-fade-in">
                <div class="tabs" style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color);">
                    <button onclick="window.setReportTab('client-sales')" style="padding: 0.75rem 1rem; background: none; border: none; border-bottom: 2px solid ${activeTab === 'client-sales' ? 'var(--primary)' : 'transparent'}; color: ${activeTab === 'client-sales' ? 'var(--primary)' : 'var(--text-muted)'}; font-weight: 600; cursor: pointer;">Ventas por Cliente</button>
                    <button onclick="window.setReportTab('product-sales')" style="padding: 0.75rem 1rem; background: none; border: none; border-bottom: 2px solid ${activeTab === 'product-sales' ? 'var(--primary)' : 'transparent'}; color: ${activeTab === 'product-sales' ? 'var(--primary)' : 'var(--text-muted)'}; font-weight: 600; cursor: pointer;">Ventas por Producto</button>
                    <button onclick="window.setReportTab('recent-sales')" style="padding: 0.75rem 1rem; background: none; border: none; border-bottom: 2px solid ${activeTab === 'recent-sales' ? 'var(--primary)' : 'transparent'}; color: ${activeTab === 'recent-sales' ? 'var(--primary)' : 'var(--text-muted)'}; font-weight: 600; cursor: pointer;">Últimas Ventas</button>
                </div>

                <div id="report-content">
                    ${activeTab === 'client-sales' ? renderClientSalesReport() : ''}
                    ${activeTab === 'product-sales' ? renderProductSalesReport() : ''}
                    ${activeTab === 'recent-sales' ? renderRecentSalesReport() : ''}
                </div>
            </div>
        `;
    };

    // Global Handlers
    window.setReportTab = (tab) => {
        activeTab = tab;
        render();
    };

    window.updateReportFilter = (key, value) => {
        filters[key] = value;
        render();
    };

    window.deleteSale = (id) => {
        if (confirm('¿Estás seguro de eliminar esta venta? Esta acción no se puede deshacer.')) {
            const index = salesHistory.findIndex(s => s.id === id);
            if (index !== -1) {
                salesHistory.splice(index, 1);
                localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
                render();
            }
        }
    };

    render();
}


// --- MAIN APP LOGIC ---

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
            const productsCount = (JSON.parse(localStorage.getItem('products')) || []).length;
            const clientsCount = (JSON.parse(localStorage.getItem('clients')) || []).length;
            const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
            const totalSales = salesHistory.reduce((sum, sale) => sum + (sale.total || 0), 0);

            contentArea.innerHTML = `
                <div class="animate-fade-in">
                    <div class="welcome-card" style="margin-bottom: 2rem;">
                        <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-main);">Bienvenido al Sistema</h2>
                        <p style="color: var(--text-muted);">Resumen general de tu negocio.</p>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
                        <!-- Card 1 -->
                        <div style="background: white; padding: 1.5rem; border-radius: var(--radius); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                                <div style="background: #eff6ff; p-2; border-radius: 0.5rem; padding: 0.75rem; color: var(--primary);">
                                    <i data-lucide="package"></i>
                                </div>
                                <span style="font-size: 0.875rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Productos</span>
                            </div>
                            <div style="font-size: 2rem; font-weight: 700; color: var(--text-main);">${productsCount}</div>
                        </div>

                        <!-- Card 2 -->
                        <div style="background: white; padding: 1.5rem; border-radius: var(--radius); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                                <div style="background: #f0fdf4; p-2; border-radius: 0.5rem; padding: 0.75rem; color: #16a34a;">
                                    <i data-lucide="users"></i>
                                </div>
                                <span style="font-size: 0.875rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Clientes</span>
                            </div>
                            <div style="font-size: 2rem; font-weight: 700; color: var(--text-main);">${clientsCount}</div>
                        </div>

                        <!-- Card 3 -->
                        <div style="background: white; padding: 1.5rem; border-radius: var(--radius); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                                <div style="background: #fff7ed; p-2; border-radius: 0.5rem; padding: 0.75rem; color: #ea580c;">
                                    <i data-lucide="trending-up"></i>
                                </div>
                                <span style="font-size: 0.875rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Ventas Totales</span>
                            </div>
                            <div style="font-size: 2rem; font-weight: 700; color: var(--text-main);">${formatMoney(totalSales)}</div>
                        </div>
                    </div>
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
    if (window.lucide) window.lucide.createIcons();
    handleNavigation('dashboard');
});
