
export function renderSales(container) {
    // Load Data
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];

    // State for the sales process
    let selectedClient = null;
    let cart = {}; // { productId: quantity }

    // Helper to calculate totals
    const calculateTotal = () => {
        let total = 0;
        Object.entries(cart).forEach(([pid, qty]) => {
            const p = products.find(prod => prod.id === parseInt(pid));
            if (p) {
                const priceVat = p.priceNet * (1 + (p.vat / 100));
                total += priceVat * qty;
            }
        });
        return total;
    };

    // Helper to format currency
    const formatMoney = (amount) => {
        return '$' + amount.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    // WhatsApp Message Generator
    const sendWhatsAppNote = () => {
        if (!selectedClient || !selectedClient.phone) {
            alert('El cliente no tiene un teléfono registrado para WhatsApp.');
            return;
        }

        let message = `*NOTA DE VENTA - CONFITOR*%0A`;
        message += `Cliente: ${selectedClient.name}%0A`;
        message += `Fecha: ${new Date().toLocaleDateString()}%0A`;
        message += `--------------------------------%0A`;

        let totalFinal = 0;

        Object.entries(cart).forEach(([pid, qty]) => {
            const p = products.find(prod => prod.id === parseInt(pid));
            if (p) {
                const priceVat = p.priceNet * (1 + (p.vat / 100));
                const totalItem = priceVat * qty;
                totalFinal += totalItem;

                // Format: Qty x Name (Price) = Total (One line)
                message += `${qty} x ${p.name} (${formatMoney(priceVat)}) = ${formatMoney(totalItem)}%0A`;
            }
        });

        message += `--------------------------------%0A`;
        message += `*TOTAL A PAGAR: ${formatMoney(totalFinal)}*`;

        // Clean phone number (remove non-digits)
        const phone = selectedClient.phone.replace(/\D/g, '');
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    // Render Functions
    const renderClientSelection = () => {
        return `
            <div class="animate-fade-in">
                <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; color: #0f172a;">1. Seleccionar Cliente</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">
                    ${clients.map(client => `
                        <div class="client-select-card" onclick="window.selectClient(${client.id})" 
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

    const renderProductSelection = () => {
        // Filter Active and Sort by Priority
        const activeProducts = products
            .filter(p => p.isActive !== false) // Default to true if undefined
            .sort((a, b) => (a.priority || 1) - (b.priority || 1));

        return `
            <div class="animate-fade-in" style="background: linear-gradient(180deg, #f0f9ff 0%, #ccfbf1 100%); min-height: 100%; padding: 1rem; border-radius: var(--radius);">
                <!-- Header Section -->
                <div style="background: white; padding: 1rem 1.5rem; border-radius: var(--radius); box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 1.5rem; border-left: 5px solid #0ea5e9; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0;">Nueva Venta</h2>
                        <div style="font-size: 0.9rem; color: #64748b; margin-top: 0.25rem;">Cliente: <strong style="color: #0ea5e9;">${selectedClient.name}</strong></div>
                    </div>
                    <button onclick="window.resetSale()" style="color: #ef4444; background: white; border: 1px solid #fee2e2; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem; font-weight: 500; transition: all 0.2s;">
                        Cambiar Cliente
                    </button>
                </div>

                <!-- Products Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; margin-bottom: 80px;">
                    ${activeProducts.map(p => {
            const priceWithVat = p.priceNet * (1 + (p.vat / 100));
            const qty = cart[p.id] || 0;
            const isSelected = qty > 0;

            return `
                        <div style="background: white; border-radius: 1rem; border: 2px solid ${isSelected ? '#0ea5e9' : 'transparent'}; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s;">
                            <div style="height: 160px; overflow: hidden; background: #f8fafc; position: relative;">
                                <img src="${p.image || 'https://via.placeholder.com/300?text=No+Image'}" style="width: 100%; height: 100%; object-fit: cover;">
                                ${isSelected ? '<div style="position: absolute; top: 0.5rem; right: 0.5rem; background: #0ea5e9; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;"><i data-lucide="check" style="width: 16px;"></i></div>' : ''}
                            </div>
                            
                            <div style="padding: 1.25rem; flex: 1; display: flex; flex-direction: column;">
                                <h3 style="font-weight: 700; font-size: 1.1rem; color: #1e293b; margin-bottom: 0.5rem; line-height: 1.3;">${p.name}</h3>
                                
                                <div style="margin-top: auto;">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1rem;">
                                        <div>
                                            <div style="font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 600;">Precio</div>
                                            <div style="font-size: 1.5rem; font-weight: 800; color: #0ea5e9;">
                                                ${formatMoney(priceWithVat)}
                                            </div>
                                        </div>
                                    </div>

                                    <div style="background: #f0f9ff; padding: 0.75rem; border-radius: 0.75rem; display: flex; align-items: center; justify-content: space-between; border: 1px solid #bae6fd;">
                                        <label style="font-size: 0.875rem; font-weight: 600; color: #0369a1;">Unidades:</label>
                                        <input type="number" min="0" value="${qty}" 
                                            onchange="window.updateCart(${p.id}, this.value)"
                                            style="width: 80px; padding: 0.25rem; border: none; background: transparent; font-size: 1.75rem; font-weight: 800; color: #0369a1; text-align: right; outline: none; font-family: inherit;">
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
        }).join('')}
                </div>

                <!-- Footer / Checkout Bar -->
                <div style="position: fixed; bottom: 0; left: 260px; right: 0; background: white; padding: 1rem 2rem; box-shadow: 0 -4px 20px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; z-index: 50; border-top: 1px solid #e2e8f0;">
                    <div style="display: flex; align-items: center; gap: 2rem;">
                        <div>
                            <div style="font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">Total a Pagar</div>
                            <div id="sale-total" style="font-size: 2.5rem; font-weight: 800; color: #0f172a; line-height: 1;">${formatMoney(calculateTotal())}</div>
                        </div>
                        <div style="height: 40px; width: 1px; background: #e2e8f0;"></div>
                        <div style="font-size: 0.9rem; color: #64748b;">
                            Items: <strong style="color: #0f172a;">${Object.keys(cart).length}</strong>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1rem;">
                        <button onclick="window.sendWhatsAppNote()" style="background: #25D366; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 600; font-size: 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: transform 0.1s; box-shadow: 0 4px 6px -1px rgba(37, 211, 102, 0.3);">
                            <i data-lucide="message-circle"></i> Enviar Nota WhatsApp
                        </button>
                        <button onclick="window.finishSale()" style="background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); color: white; border: none; padding: 0.75rem 2rem; border-radius: 0.75rem; font-weight: 600; font-size: 1.125rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                            <i data-lucide="check-circle"></i> Finalizar
                        </button>
                    </div>
                </div>
            </div>
        `;
    };

    // Main Render Logic
    const render = () => {
        if (!selectedClient) {
            container.innerHTML = renderClientSelection();
        } else {
            container.innerHTML = renderProductSelection();
        }
        if (window.lucide) window.lucide.createIcons();
    };

    // Global Handlers
    window.selectClient = (id) => {
        selectedClient = clients.find(c => c.id === id);
        render();
    };

    window.resetSale = () => {
        selectedClient = null;
        cart = {};
        render();
    };

    window.updateCart = (productId, quantity) => {
        const qty = parseInt(quantity);
        if (qty <= 0) {
            delete cart[productId];
        } else {
            cart[productId] = qty;
        }
        // Update total without full re-render for better UX
        const totalEl = document.getElementById('sale-total');
        if (totalEl) totalEl.textContent = formatMoney(calculateTotal());

        // Visual feedback on card border
        render();
    };

    window.sendWhatsAppNote = sendWhatsAppNote;

    window.finishSale = () => {
        if (Object.keys(cart).length === 0) {
            alert('El carrito está vacío');
            return;
        }
        const total = calculateTotal();
        if (confirm(`¿Confirmar venta por ${formatMoney(total)} para ${selectedClient.name}?`)) {

            // Save Sale to History
            const sale = {
                id: Date.now(),
                date: new Date().toISOString(),
                clientId: selectedClient.id,
                clientName: selectedClient.name,
                total: total,
                items: Object.entries(cart).map(([pid, qty]) => {
                    const p = products.find(prod => prod.id === parseInt(pid));
                    return {
                        productId: p.id,
                        productName: p.name,
                        quantity: qty,
                        priceNet: p.priceNet,
                        vat: p.vat,
                        total: p.priceNet * (1 + (p.vat / 100)) * qty
                    };
                })
            };

            const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
            salesHistory.push(sale);
            localStorage.setItem('salesHistory', JSON.stringify(salesHistory));

            alert('¡Venta registrada con éxito!');
            window.resetSale();
        }
    };

    // Initial Render
    render();
}
