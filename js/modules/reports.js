
export function renderReports(container) {
    // Load Data
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];

    // State
    let activeTab = 'client-sales'; // 'client-sales', 'product-sales', 'recent-sales'
    let filters = {
        clientId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        selectedProducts: []
    };

    // Helper: Format Currency
    const formatMoney = (amount) => '$' + amount.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    // Helper: Filter Sales by Date Range
    const filterByDate = (sales) => {
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999); // Include end date fully

        return sales.filter(s => {
            const date = new Date(s.date);
            return date >= start && date <= end;
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
                    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm);">
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

    render();
}
