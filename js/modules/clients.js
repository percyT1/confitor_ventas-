// Clients Data (Mock for now, will use LocalStorage later)
let clients = JSON.parse(localStorage.getItem('clients')) || [
    { id: 1, name: 'Juan Pérez', rut: '12.345.678-9', phone: '56912345678', email: 'juan@example.com', address: 'Av. Siempre Viva 123' }
];

function saveClients() {
    localStorage.setItem('clients', JSON.stringify(clients));
    renderClients(document.getElementById('content-area')); // Re-render
}

export function renderClients(container) {
    const html = `
        <div class="module-header" style="display: flex; justify-content: space-between; margin-bottom: 2rem; align-items: center;">
            <h2 style="font-size: 1.5rem; font-weight: 600;">Gestión de Clientes</h2>
            <button class="btn-primary" id="btn-add-client" style="background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="user-plus"></i> Nuevo Cliente
            </button>
        </div>

        <div class="clients-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
            ${clients.map(client => `
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
            const index = clients.findIndex(c => c.id === parseInt(id));
            clients[index] = client;
        } else {
            clients.push(client);
        }

        saveClients();
        modal.style.display = 'none';
    });

    // Global handlers
    window.deleteClient = (id) => {
        if (confirm('¿Estás seguro de eliminar este cliente?')) {
            clients = clients.filter(c => c.id !== id);
            saveClients();
        }
    };

    window.editClient = (id) => {
        const c = clients.find(c => c.id === id);
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
