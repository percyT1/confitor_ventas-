// Product Data (Mock for now, will use LocalStorage later)
let products = JSON.parse(localStorage.getItem('products')) || [
    { id: 1, name: 'Producto Ejemplo', priceNet: 100, vat: 19, stock: 10, image: 'https://via.placeholder.com/150', isActive: true, priority: 1 }
];

function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
    renderProducts(document.getElementById('content-area')); // Re-render
}

export function renderProducts(container) {
    const html = `
    <div class="module-header" style="display: flex; justify-content: space-between; margin-bottom: 2rem; align-items: center;">
            <h2 style="font-size: 1.5rem; font-weight: 600;">Inventario</h2>
            <button class="btn-primary" id="btn-add-product" style="background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="plus"></i> Nuevo Producto
            </button>
        </div>

        <div class="products-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
            ${products.sort((a, b) => a.priority - b.priority).map(product => {
        const priceVat = product.priceNet * (product.vat / 100);
        const total = product.priceNet + priceVat;
        const statusColor = product.isActive ? '#22c55e' : '#94a3b8';
        return `
                <div class="product-card" style="background: white; padding: 0; border-radius: var(--radius); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden; display: flex; flex-direction: column; opacity: ${product.isActive ? 1 : 0.6};">
                    <div style="height: 180px; overflow: hidden; background: #f1f5f9; position: relative;">
                        <img src="${product.image || 'https://via.placeholder.com/300?text=No+Image'}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
                        <div style="position: absolute; top: 0.5rem; right: 0.5rem; background: ${statusColor}; color: white; padding: 0.25rem 0.5rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600;">
                            ${product.isActive ? 'VIGENTE' : 'INACTIVO'}
                        </div>
                        <div style="position: absolute; top: 0.5rem; left: 0.5rem; background: rgba(0,0,0,0.6); color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
                            P: ${product.priority}
                        </div>
                    </div>
                    <div style="padding: 1.5rem; flex: 1;">
                        <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-main);">${product.name}</h3>
                        <div class="details" style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                            <div>
                                <span style="display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Neto</span>
                                <span style="font-weight: 500;">$${product.priceNet.toFixed(2)}</span>
                            </div>
                            <div>
                                <span style="display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">IVA (${product.vat}%)</span>
                                <span style="font-weight: 500;">$${priceVat.toFixed(2)}</span>
                            </div>
                            <div style="grid-column: span 2; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px dashed var(--border-color);">
                                <span style="display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Precio Final</span>
                                <span style="font-weight: 700; font-size: 1.25rem; color: var(--primary);">$${total.toFixed(2)}</span>
                            </div>
                            <div style="grid-column: span 2; margin-top: 0.5rem;">
                                <span style="display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Stock</span>
                                <span style="font-weight: 600; color: ${product.stock < 5 ? '#ef4444' : 'inherit'};">${product.stock} unidades</span>
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

        <!-- Modal Container -->
    <div id="product-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 100; align-items: center; justify-content: center;">
        <div style="background: white; padding: 2rem; border-radius: var(--radius); width: 90%; max-width: 500px; box-shadow: var(--shadow-md); max-height: 90vh; overflow-y: auto;">
            <h3 id="modal-title" style="margin-bottom: 1.5rem; font-size: 1.25rem; font-weight: 600;">Nuevo Producto</h3>
            <form id="product-form" style="display: grid; gap: 1rem;">
                <input type="hidden" id="prod-id">
                    <div>
                        <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">Nombre</label>
                        <input type="text" id="prod-name" required style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.375rem;">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">Precio Neto</label>
                            <input type="number" id="prod-net" step="0.01" required style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.375rem;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">IVA (%)</label>
                            <input type="number" id="prod-vat" value="19" required style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.375rem;">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">Stock</label>
                            <input type="number" id="prod-stock" required style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.375rem;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">Prioridad (1-10)</label>
                            <input type="number" id="prod-priority" value="1" min="1" max="10" required style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.375rem;">
                        </div>
                    </div>
                    <div>
                        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; cursor: pointer;">
                            <input type="checkbox" id="prod-active" checked style="width: 1rem; height: 1rem;">
                                Producto Vigente
                        </label>
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">URL Imagen</label>
                        <input type="url" id="prod-image" placeholder="https://..." style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.375rem;">
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
        document.getElementById('prod-id').value = '';
        document.getElementById('prod-active').checked = true;
        document.getElementById('prod-priority').value = 1;
        document.getElementById('modal-title').textContent = 'Nuevo Producto';
        modal.style.display = 'flex';
    });

    document.getElementById('btn-cancel').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('prod-id').value;
        const product = {
            id: id ? parseInt(id) : Date.now(),
            name: document.getElementById('prod-name').value,
            priceNet: parseFloat(document.getElementById('prod-net').value),
            vat: parseFloat(document.getElementById('prod-vat').value),
            stock: parseInt(document.getElementById('prod-stock').value),
            priority: parseInt(document.getElementById('prod-priority').value),
            isActive: document.getElementById('prod-active').checked,
            image: document.getElementById('prod-image').value
        };

        if (id) {
            const index = products.findIndex(p => p.id === parseInt(id));
            products[index] = product;
        } else {
            products.push(product);
        }

        saveProducts();
        modal.style.display = 'none';
    });

    // Global handlers for inline buttons (simplest way in vanilla without event delegation complexity)
    window.deleteProduct = (id) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            products = products.filter(p => p.id !== id);
            saveProducts();
        }
    };

    window.editProduct = (id) => {
        const p = products.find(p => p.id === id);
        if (p) {
            document.getElementById('prod-id').value = p.id;
            document.getElementById('prod-name').value = p.name;
            document.getElementById('prod-net').value = p.priceNet;
            document.getElementById('prod-vat').value = p.vat;
            document.getElementById('prod-stock').value = p.stock;
            document.getElementById('prod-priority').value = p.priority || 1;
            document.getElementById('prod-active').checked = p.isActive !== false; // Default true
            document.getElementById('prod-image').value = p.image;
            document.getElementById('modal-title').textContent = 'Editar Producto';
            modal.style.display = 'flex';
        }
    };
}
