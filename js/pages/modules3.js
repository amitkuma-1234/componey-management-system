/* Analytics & BI Page */
pages.analytics = function (container) {
  container.innerHTML = `
    <div class="module-hero">
      <h2><i class="fas fa-chart-line" style="color:var(--info)"></i> Analytics & Business Intelligence</h2>
      <p>Interactive dashboards, KPI tracking, drill-down analytics, scheduled reports, and AI-generated natural language insights.</p>
      <div class="page-actions" style="margin-top:16px">
        <button class="btn btn-primary btn-sm" id="analytics-new-dashboard"><i class="fas fa-plus"></i> New Dashboard</button>
        <button class="btn btn-secondary btn-sm" id="analytics-export-pdf"><i class="fas fa-file-pdf"></i> Export PDF</button>
        <button class="btn btn-secondary btn-sm" id="analytics-export-excel"><i class="fas fa-file-excel"></i> Export Excel</button>
      </div>
    </div>
    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr) !important;">
      <div class="stat-card" id="analytics-stat-dashboards"><div class="stat-card-header"><div class="stat-icon blue"><i class="fas fa-chart-pie"></i></div></div><div class="stat-value" id="analytics-dashboards">12</div><div class="stat-label">Active Dashboards</div></div>
      <div class="stat-card" id="analytics-stat-reports"><div class="stat-card-header"><div class="stat-icon green"><i class="fas fa-file-lines"></i></div></div><div class="stat-value" id="analytics-reports">248</div><div class="stat-label">Reports Generated</div></div>
      <div class="stat-card" id="analytics-stat-data"><div class="stat-card-header"><div class="stat-icon purple"><i class="fas fa-database"></i></div></div><div class="stat-value">1.2TB</div><div class="stat-label">Data Processed</div></div>
      <div class="stat-card" id="analytics-stat-query"><div class="stat-card-header"><div class="stat-icon cyan"><i class="fas fa-clock-rotate-left"></i></div></div><div class="stat-value">45ms</div><div class="stat-label">Avg Query Time</div></div>
    </div>
    <div class="grid-2" style="grid-template-columns: repeat(2, 1fr);">
      <div class="card"><div class="card-header"><span class="card-title">Revenue Trends</span></div><div class="chart-container"><canvas data-chart="revenue"></canvas></div></div>
      <div class="card"><div class="card-header"><span class="card-title">Department Performance</span></div><div class="chart-container"><canvas data-chart="bar"></canvas></div></div>
    </div>
    <div class="grid-2" style="grid-template-columns: repeat(2, 1fr);">
      <div class="card"><div class="card-header"><span class="card-title">Resource Allocation</span></div><div class="chart-container"><canvas data-chart="doughnut"></canvas></div></div>
      <div class="card">
        <div class="card-header"><span class="card-title">Scheduled Reports</span></div>
        <div class="activity-list" id="analytics-scheduled-reports">
          <div class="list-item"><div class="list-icon" style="background:rgba(59,130,246,0.12);color:var(--info)"><i class="fas fa-file-pdf"></i></div><div class="list-content"><div class="list-title">Monthly Financial Summary</div><div class="list-subtitle">Every 1st · PDF · 12 recipients</div></div><span class="badge badge-success">Active</span></div>
          <div class="list-item"><div class="list-icon" style="background:rgba(34,197,94,0.12);color:var(--success)"><i class="fas fa-file-excel"></i></div><div class="list-content"><div class="list-title">Weekly HR Report</div><div class="list-subtitle">Every Monday · Excel · 5 recipients</div></div><span class="badge badge-success">Active</span></div>
          <div class="list-item"><div class="list-icon" style="background:rgba(168,85,247,0.12);color:var(--purple)"><i class="fas fa-chart-bar"></i></div><div class="list-content"><div class="list-title">Sales Pipeline Report</div><div class="list-subtitle">Daily · Dashboard · 8 recipients</div></div><span class="badge badge-success">Active</span></div>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:24px">
      <div class="card-header">
        <span class="card-title">Custom Dashboards</span>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Dashboard Name</th>
              <th>Dashboard Type</th>
              <th>Auto-Refresh</th>
              <th>Sharing</th>
              <th>Created Date</th>
              <th style="width:100px">Actions</th>
            </tr>
          </thead>
          <tbody id="custom-dashboards-tbody">
            <!-- Custom dashboards populated here -->
          </tbody>
        </table>
      </div>
    </div>`;

  // ── localStorage helpers for custom dashboards ──
  const LS_DASH_KEY = 'amdox_dashboards';
  function getDashboards() {
    try { return JSON.parse(localStorage.getItem(LS_DASH_KEY)) || []; } catch { return []; }
  }
  function saveDashboards(list) {
    try { localStorage.setItem(LS_DASH_KEY, JSON.stringify(list)); } catch { }
  }

  // Update dashboard count
  const dashEl = document.getElementById('analytics-dashboards');
  if (dashEl) dashEl.textContent = 12 + getDashboards().length;

  // ── New Dashboard ──
  document.getElementById('analytics-new-dashboard')?.addEventListener('click', () => {
    showModal({
      title: '<i class="fas fa-chart-pie" style="color:var(--info)"></i> Create New Dashboard',
      submitLabel: 'Create Dashboard',
      fields: [
        { name: 'name', label: 'Dashboard Name', required: true, placeholder: 'e.g. Sales Overview Q3' },
        { name: 'type', label: 'Dashboard Type', type: 'select', options: ['KPI Dashboard', 'Revenue Analytics', 'HR Insights', 'Inventory Tracker', 'Custom Report'], default: 'KPI Dashboard' },
        { name: 'refresh', label: 'Auto-Refresh', type: 'select', options: ['Real-time', 'Every 5 min', 'Every 15 min', 'Hourly', 'Manual'], default: 'Every 15 min' },
        { name: 'sharing', label: 'Share With', type: 'select', options: ['Only Me', 'My Team', 'All Managers', 'Organization'], default: 'Only Me' }
      ],
      onSubmit(data, close) {
        const dashboards = getDashboards();
        dashboards.push({ ...data, id: Date.now(), created: new Date().toLocaleDateString('en-IN') });
        saveDashboards(dashboards);
        showToast(`✅ Dashboard "${data.name}" created successfully!`, 'success');
        // Update count
        const el = document.getElementById('analytics-dashboards');
        if (el) el.textContent = 12 + dashboards.length;
        // Update reports count
        const rEl = document.getElementById('analytics-reports');
        if (rEl) rEl.textContent = parseInt(rEl.textContent) + 1;
        close();
        renderDashboards();
      }
    });
  });

  // ── Helper: read live data from localStorage ──
  const SEED_EMP = [
    { id: 1, name: 'Arjun Mehta', email: 'arjun@amdox.com', department: 'Engineering', role: 'Software Engineer', status: 'Active', joined: 'Jan 2024' },
    { id: 2, name: 'Priya Sharma', email: 'priya@amdox.com', department: 'HR & Admin', role: 'HR Manager', status: 'Active', joined: 'Mar 2023' },
    { id: 3, name: 'Rahul Desai', email: 'rahul@amdox.com', department: 'Sales & Marketing', role: 'Sales Executive', status: 'Probation', joined: 'May 2026' }
  ];
  const SEED_INV = [
    { id: 1, invoice_no: 'INV-2847', client: 'Infosys Ltd', amount: 875000, due_date: 'May 25, 2026', status: 'Pending' },
    { id: 2, invoice_no: 'INV-2846', client: 'Reliance Industries', amount: 1240000, due_date: 'May 20, 2026', status: 'Sent' },
    { id: 3, invoice_no: 'INV-2845', client: 'Tata Motors', amount: 450000, due_date: 'May 15, 2026', status: 'Paid' },
    { id: 4, invoice_no: 'INV-2844', client: 'HCL Technologies', amount: 680000, due_date: 'May 10, 2026', status: 'Paid' }
  ];
  const SEED_PROD = [
    { id: 1, sku: 'SKU-0010', name: 'MacBook Pro 16"', category: 'Electronics', stock: 12, reorder_level: 10, warehouse: 'Warehouse A' },
    { id: 2, sku: 'SKU-0021', name: 'Ergonomic Chair', category: 'Furniture', stock: 45, reorder_level: 20, warehouse: 'Warehouse B' },
    { id: 3, sku: 'SKU-0033', name: 'Printer Ink Black', category: 'Supplies', stock: 5, reorder_level: 15, warehouse: 'Warehouse A' },
    { id: 4, sku: 'SKU-0045', name: 'Logitech MX Master 3', category: 'Accessories', stock: 30, reorder_level: 15, warehouse: 'Warehouse C' }
  ];

  function getLiveData() {
    let employees, invoices, expenses, products;
    try { employees = JSON.parse(localStorage.getItem('amdox_employees')) || SEED_EMP; } catch { employees = SEED_EMP; }
    try { invoices = JSON.parse(localStorage.getItem('amdox_invoices')) || SEED_INV; } catch { invoices = SEED_INV; }
    try {
      const raw = JSON.parse(localStorage.getItem('amdox_expenses'));
      expenses = raw ? raw.map(item => typeof item === 'number' ? { amount: item, vendor: 'Expense', category: 'General', date: '-' } : item) : [{ amount: 5820000, vendor: 'Base Historical', category: 'General', date: 'Prior' }];
    } catch { expenses = [{ amount: 5820000, vendor: 'Base Historical', category: 'General', date: 'Prior' }]; }
    try { products = JSON.parse(localStorage.getItem('amdox_products')) || SEED_PROD; } catch { products = SEED_PROD; }
    return { employees, invoices, expenses, products };
  }

  function fmtAmt(a) {
    return 'Rs.' + Number(a).toLocaleString('en-IN');
  }

  // ── Export PDF ──
  document.getElementById('analytics-export-pdf')?.addEventListener('click', () => {
    if (!window.jspdf) {
      showToast('PDF library is still loading. Please wait a moment and try again.', 'error');
      return;
    }
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const data = getLiveData();

      // ── Page 1: Header ──
      doc.setFillColor(30, 27, 75);
      doc.rect(0, 0, 210, 38, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Amdox Technologies Pvt Ltd', 14, 18);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('ERP System - Complete Report', 14, 28);
      doc.setFontSize(9);
      doc.text('Generated: ' + dateStr + ' at ' + timeStr, 196, 28, { align: 'right' });

      // ── Summary ──
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Organization Summary', 14, 50);

      const totalRev = data.invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
      const totalExp = data.expenses.reduce((s, i) => s + (i.amount || 0), 0);
      doc.autoTable({
        startY: 55,
        head: [['Metric', 'Value']],
        body: [
          ['Total Employees', String(data.employees.length)],
          ['Active Employees', String(data.employees.filter(e => e.status === 'Active').length)],
          ['Total Invoices', String(data.invoices.length)],
          ['Pending Invoices', String(data.invoices.filter(i => i.status === 'Pending').length)],
          ['Revenue (Paid)', fmtAmt(totalRev)],
          ['Total Expenses', fmtAmt(totalExp)],
          ['Net Profit', fmtAmt(totalRev - totalExp)],
          ['Total Products', String(data.products.length)],
          ['Low Stock Items', String(data.products.filter(p => p.stock < p.reorder_level).length)]
        ],
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 4 },
        alternateRowStyles: { fillColor: [245, 245, 255] }
      });

      // ── Page 2: Employee Directory ──
      doc.addPage();
      doc.setFillColor(30, 27, 75);
      doc.rect(0, 0, 210, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Employee Directory (' + data.employees.length + ' employees)', 14, 14);

      doc.autoTable({
        startY: 28,
        head: [['Name', 'Email', 'Department', 'Role', 'Status', 'Joined']],
        body: data.employees.map(e => [e.name, e.email, e.department, e.role, e.status, e.joined]),
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 38 }, 2: { cellWidth: 28 }, 3: { cellWidth: 30 }, 4: { cellWidth: 18 }, 5: { cellWidth: 20 } }
      });

      // ── Page 3: Invoices ──
      doc.addPage();
      doc.setFillColor(30, 27, 75);
      doc.rect(0, 0, 210, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.text('Finance - Invoices (' + data.invoices.length + ' invoices)', 14, 14);

      doc.autoTable({
        startY: 28,
        head: [['Invoice No', 'Client', 'Amount', 'Due Date', 'Status']],
        body: data.invoices.map(i => [i.invoice_no, i.client, fmtAmt(i.amount), i.due_date, i.status]),
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 }
      });

      // Invoice totals
      let invY = doc.lastAutoTable.finalY + 10;
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Paid: ' + fmtAmt(data.invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)), 14, invY);
      doc.text('Pending: ' + fmtAmt(data.invoices.filter(i => i.status === 'Pending').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)), 80, invY);
      doc.text('Total: ' + fmtAmt(data.invoices.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)), 150, invY);

      // ── Expenses ──
      if (data.expenses.length > 0) {
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('Expenses & Taxes (' + data.expenses.length + ' records)', 14, invY + 15);
        doc.autoTable({
          startY: invY + 20,
          head: [['Vendor / Payee', 'Category', 'Amount', 'Date']],
          body: data.expenses.map(e => [e.vendor || '-', e.category || '-', fmtAmt(e.amount), e.date || '-']),
          theme: 'striped',
          headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 4 }
        });
        let expY = doc.lastAutoTable.finalY + 8;
        doc.setFontSize(10);
        doc.text('Total Expenses: ' + fmtAmt(totalExp), 14, expY);
      }

      // ── Page 4: Products / Inventory ──
      doc.addPage();
      doc.setFillColor(30, 27, 75);
      doc.rect(0, 0, 210, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.text('Inventory - Products (' + data.products.length + ' items)', 14, 14);

      doc.autoTable({
        startY: 28,
        head: [['SKU', 'Product Name', 'Category', 'Stock', 'Reorder Level', 'Warehouse']],
        body: data.products.map(p => [p.sku, p.name, p.category, String(p.stock), String(p.reorder_level), p.warehouse]),
        theme: 'striped',
        headStyles: { fillColor: [168, 85, 247], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 },
        didParseCell: function (hookData) {
          // Highlight low stock rows in red
          if (hookData.section === 'body') {
            const rowData = hookData.row.raw;
            if (rowData && parseInt(rowData[3]) < parseInt(rowData[4])) {
              hookData.cell.styles.textColor = [220, 50, 50];
              hookData.cell.styles.fontStyle = 'bold';
            }
          }
        }
      });

      // Low stock summary
      const lowStock = data.products.filter(p => p.stock < p.reorder_level);
      if (lowStock.length) {
        let lsY = doc.lastAutoTable.finalY + 10;
        doc.setTextColor(220, 50, 50);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('LOW STOCK ALERT: ' + lowStock.map(p => p.name + ' (' + p.stock + ' left)').join(', '), 14, lsY);
      }

      // ── Footer on all pages ──
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Amdox ERP - Confidential | Page ' + i + ' of ' + pageCount + ' | ' + dateStr, 105, 290, { align: 'center' });
      }

      doc.save('Amdox_ERP_Report_' + dateStr.replace(/ /g, '_') + '.pdf');
      showToast('PDF report exported with all module data!', 'success');
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('Failed to export PDF: ' + err.message, 'error');
    }
  });

  // ── Export Excel ──
  document.getElementById('analytics-export-excel')?.addEventListener('click', () => {
    try {
      if (typeof XLSX === 'undefined') {
        showToast('Excel library is still loading. Please wait and try again.', 'error');
        return;
      }
      const wb = XLSX.utils.book_new();
      const data = getLiveData();

      // Sheet 1: Summary
      const totalRev = data.invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
      const totalExp = data.expenses.reduce((s, i) => s + (i.amount || 0), 0);
      const summaryRows = [
        ['Amdox Technologies Pvt Ltd - ERP Report'],
        ['Generated', new Date().toLocaleString('en-IN')],
        [],
        ['Metric', 'Value'],
        ['Total Employees', data.employees.length],
        ['Active Employees', data.employees.filter(e => e.status === 'Active').length],
        ['Total Invoices', data.invoices.length],
        ['Pending Invoices', data.invoices.filter(i => i.status === 'Pending').length],
        ['Revenue (Paid Invoices)', totalRev],
        ['Total Expenses & Taxes', totalExp],
        ['Net Profit', totalRev - totalExp],
        ['Total Products', data.products.length],
        ['Low Stock Items', data.products.filter(p => p.stock < p.reorder_level).length]
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(summaryRows);
      ws1['!cols'] = [{ wch: 28 }, { wch: 22 }];
      XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

      // Sheet 2: Employees
      const empRows = [['ID', 'Name', 'Email', 'Department', 'Role', 'Status', 'Joined']];
      data.employees.forEach(e => empRows.push([e.id, e.name, e.email, e.department, e.role, e.status, e.joined]));
      const ws2 = XLSX.utils.aoa_to_sheet(empRows);
      ws2['!cols'] = [{ wch: 5 }, { wch: 20 }, { wch: 25 }, { wch: 18 }, { wch: 22 }, { wch: 10 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws2, 'Employees');

      // Sheet 3: Invoices
      const invRows = [['Invoice No', 'Client', 'Amount (Rs.)', 'Due Date', 'Status']];
      data.invoices.forEach(i => invRows.push([i.invoice_no, i.client, parseFloat(i.amount), i.due_date, i.status]));
      invRows.push([]);
      invRows.push(['', 'TOTAL', data.invoices.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0), '', '']);
      invRows.push(['', 'Paid Total', data.invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0), '', '']);
      invRows.push(['', 'Pending Total', data.invoices.filter(i => i.status === 'Pending').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0), '', '']);
      const ws3 = XLSX.utils.aoa_to_sheet(invRows);
      ws3['!cols'] = [{ wch: 12 }, { wch: 22 }, { wch: 15 }, { wch: 18 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, ws3, 'Invoices');

      // Sheet 4: Expenses
      const expRows = [['Vendor / Payee', 'Category', 'Amount (Rs.)', 'Date']];
      data.expenses.forEach(e => expRows.push([e.vendor || '-', e.category || '-', e.amount, e.date || '-']));
      expRows.push([]);
      expRows.push(['TOTAL', '', data.expenses.reduce((s, i) => s + (i.amount || 0), 0), '']);
      const ws4 = XLSX.utils.aoa_to_sheet(expRows);
      ws4['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 15 }, { wch: 16 }];
      XLSX.utils.book_append_sheet(wb, ws4, 'Expenses');

      // Sheet 5: Products / Inventory
      const prodRows = [['SKU', 'Product Name', 'Category', 'Stock', 'Reorder Level', 'Warehouse', 'Stock Status']];
      data.products.forEach(p => prodRows.push([p.sku, p.name, p.category, p.stock, p.reorder_level, p.warehouse, p.stock < p.reorder_level ? 'LOW STOCK' : 'OK']));
      const ws5 = XLSX.utils.aoa_to_sheet(prodRows);
      ws5['!cols'] = [{ wch: 12 }, { wch: 22 }, { wch: 14 }, { wch: 8 }, { wch: 14 }, { wch: 14 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws5, 'Inventory');

      // Sheet 6: Custom Dashboards
      const customDash = getDashboards();
      if (customDash.length) {
        const dashRows = [['Dashboard Name', 'Type', 'Auto-Refresh', 'Shared With', 'Created']];
        customDash.forEach(d => dashRows.push([d.name, d.type, d.refresh, d.sharing, d.created]));
        const ws6 = XLSX.utils.aoa_to_sheet(dashRows);
        ws6['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 18 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, ws6, 'Dashboards');
      }

      const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '_');
      XLSX.writeFile(wb, 'Amdox_ERP_Report_' + dateStr + '.xlsx');
      showToast('Excel report exported with all module data!', 'success');
    } catch (err) {
      console.error('Excel export error:', err);
      showToast('Failed to export Excel: ' + err.message, 'error');
    }
  });

  function renderDashboards() {
    const tbody = document.getElementById('custom-dashboards-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const list = getDashboards();

    // Update count stats
    const dashEl = document.getElementById('analytics-dashboards');
    if (dashEl) dashEl.textContent = 12 + list.length;

    if (list.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 6;
      td.style.cssText = 'text-align:center;padding:24px;color:var(--text-muted);font-style:italic;';
      td.textContent = 'No custom dashboards created yet. Click "New Dashboard" to create one.';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    list.forEach(d => {
      const tr = document.createElement('tr');

      const tdName = document.createElement('td');
      tdName.textContent = d.name;
      tdName.style.fontWeight = '600';
      tr.appendChild(tdName);

      const tdType = document.createElement('td');
      tdType.textContent = d.type;
      tr.appendChild(tdType);

      const tdRefresh = document.createElement('td');
      tdRefresh.textContent = d.refresh;
      tr.appendChild(tdRefresh);

      const tdSharing = document.createElement('td');
      const shareBadge = document.createElement('span');
      shareBadge.className = 'badge ' + (d.sharing === 'Organization' ? 'badge-success' : 'badge-info');
      shareBadge.textContent = d.sharing;
      tdSharing.appendChild(shareBadge);
      tr.appendChild(tdSharing);

      const tdCreated = document.createElement('td');
      tdCreated.textContent = d.created || '-';
      tr.appendChild(tdCreated);

      const tdAct = document.createElement('td');
      const actWrap = document.createElement('div');
      actWrap.style.cssText = 'display:flex;gap:6px';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-secondary btn-sm';
      editBtn.style.cssText = 'padding:4px 10px;font-size:11px';
      editBtn.title = 'Edit';
      editBtn.innerHTML = '<i class="fas fa-pen"></i>';
      editBtn.addEventListener('click', () => handleEditDashboard(d.id));
      actWrap.appendChild(editBtn);

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-secondary btn-sm';
      delBtn.style.cssText = 'padding:4px 10px;font-size:11px;color:var(--danger)';
      delBtn.title = 'Delete';
      delBtn.innerHTML = '<i class="fas fa-trash"></i>';
      delBtn.addEventListener('click', () => handleDeleteDashboard(d.id));
      actWrap.appendChild(delBtn);

      tdAct.appendChild(actWrap);
      tr.appendChild(tdAct);

      tbody.appendChild(tr);
    });
  }

  function handleEditDashboard(id) {
    const list = getDashboards();
    const d = list.find(item => item.id === id);
    if (!d) return;

    showModal({
      title: '<i class="fas fa-pen" style="color:var(--info)"></i> Edit Dashboard',
      submitLabel: 'Update Dashboard',
      fields: [
        { name: 'name', label: 'Dashboard Name', required: true, default: d.name },
        { name: 'type', label: 'Dashboard Type', type: 'select', options: ['KPI Dashboard', 'Revenue Analytics', 'HR Insights', 'Inventory Tracker', 'Custom Report'], default: d.type },
        { name: 'refresh', label: 'Auto-Refresh', type: 'select', options: ['Real-time', 'Every 5 min', 'Every 15 min', 'Hourly', 'Manual'], default: d.refresh },
        { name: 'sharing', label: 'Share With', type: 'select', options: ['Only Me', 'My Team', 'All Managers', 'Organization'], default: d.sharing }
      ],
      onSubmit(data, close) {
        const dashboards = getDashboards();
        const idx = dashboards.findIndex(item => item.id === id);
        if (idx !== -1) {
          dashboards[idx] = { ...dashboards[idx], name: data.name, type: data.type, refresh: data.refresh, sharing: data.sharing };
          saveDashboards(dashboards);
          showToast('Dashboard updated successfully!', 'success');
        }
        close();
        renderDashboards();
      }
    });
  }

  function handleDeleteDashboard(id) {
    const list = getDashboards();
    const d = list.find(item => item.id === id);
    if (!d) return;

    showConfirm(`Are you sure you want to delete dashboard <strong>${d.name}</strong>?`, () => {
      const dashboards = getDashboards().filter(item => item.id !== id);
      saveDashboards(dashboards);
      showToast('Dashboard deleted successfully!', 'success');
      renderDashboards();
    });
  }

  renderDashboards();

  // ── Stat Card Click Handlers ──
  document.getElementById('analytics-stat-dashboards')?.addEventListener('click', () => {
    showModal({
      title: '<i class="fas fa-chart-pie" style="color:var(--info)"></i> Active Dashboards Overview',
      submitLabel: 'Create New Dashboard',
      fields: [
        { label: 'System Dashboards', default: '8 (Built-in)', readonly: true },
        { label: 'Custom Dashboards', default: String(getDashboards().length + 4), readonly: true },
        { label: 'Most Viewed', default: 'Revenue Analytics (342 views)', readonly: true },
        { label: 'Last Updated', default: new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' }), readonly: true }
      ],
      onSubmit(data, close) {
        close();
        document.getElementById('analytics-new-dashboard')?.click();
      }
    });
  });

  document.getElementById('analytics-stat-reports')?.addEventListener('click', () => {
    showModal({
      title: '<i class="fas fa-file-lines" style="color:var(--success)"></i> Reports Generated — Breakdown',
      submitLabel: 'Generate New Report',
      fields: [
        { label: 'Total Reports', default: '248', readonly: true },
        { label: 'PDF Reports', default: '112 (45%)', readonly: true },
        { label: 'Excel Reports', default: '89 (36%)', readonly: true },
        { label: 'Dashboard Reports', default: '47 (19%)', readonly: true },
        { label: 'Top Requester', default: 'Finance Team (68 reports)', readonly: true }
      ],
      onSubmit(data, close) {
        close();
        showToast('📊 Generating a new summary report...', 'info');
        setTimeout(() => {
          const rEl = document.getElementById('analytics-reports');
          if (rEl) rEl.textContent = parseInt(rEl.textContent) + 1;
          showToast('✅ Report #' + (249 + Math.floor(Math.random() * 50)) + ' generated successfully!', 'success');
        }, 1500);
      }
    });
  });

  document.getElementById('analytics-stat-data')?.addEventListener('click', () => {
    showModal({
      title: '<i class="fas fa-database" style="color:var(--purple)"></i> Data Processing Insights',
      submitLabel: 'Close',
      submitClass: 'btn-secondary',
      fields: [
        { label: 'Total Processed', default: '1.2 TB', readonly: true },
        { label: 'This Month', default: '184 GB (+12%)', readonly: true },
        { label: 'Data Sources', default: 'ERP DB, CRM API, Shopify, HR System', readonly: true },
        { label: 'Storage Used', default: '234 GB / 300 GB (78%)', readonly: true },
        { label: 'ETL Pipeline', default: 'Healthy — Last run: 15 min ago', readonly: true }
      ],
      onSubmit(data, close) { close(); }
    });
  });

  document.getElementById('analytics-stat-query')?.addEventListener('click', () => {
    showModal({
      title: '<i class="fas fa-clock-rotate-left" style="color:var(--cyan)"></i> Query Performance Metrics',
      submitLabel: 'Run Benchmark',
      fields: [
        { label: 'Avg Response Time', default: '45ms', readonly: true },
        { label: 'P95 Latency', default: '120ms', readonly: true },
        { label: 'P99 Latency', default: '280ms', readonly: true },
        { label: 'Queries/sec', default: '1,240 QPS', readonly: true },
        { label: 'Slow Queries (>500ms)', default: '3 in last 24h', readonly: true },
        { label: 'Cache Hit Rate', default: '94.6%', readonly: true }
      ],
      onSubmit(data, close) {
        close();
        showToast('⚡ Running performance benchmark...', 'info');
        setTimeout(() => {
          const newTime = 38 + Math.floor(Math.random() * 15);
          showToast('✅ Benchmark complete — Avg: ' + newTime + 'ms, P95: ' + (newTime * 2.5).toFixed(0) + 'ms', 'success');
        }, 2000);
      }
    });
  });
};

/* Auth & Security Page */
/* Auth & Security Page */
pages.auth = function (container) {
  const getMFAState = () => {
    return localStorage.getItem('amdox_mfa_enabled') !== 'false';
  };

  const toggleMFA = () => {
    const current = getMFAState();
    localStorage.setItem('amdox_mfa_enabled', !current);
    showToast(`MFA ${!current ? 'Enabled' : 'Disabled'} successfully!`, !current ? 'success' : 'info');
    renderAuthPage();
  };

  const generateApiKey = () => {
    const key = 'amdox_key_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    showToast(`🔑 New API Key generated: ${key.substring(0, 15)}... (copied to clipboard)`, 'success');
    navigator.clipboard.writeText(key).catch(() => { });
  };

  const renderAuthPage = () => {
    const mfaEnabled = getMFAState();
    const userJson = localStorage.getItem('amdox_auth_user');
    let currentUser = { name: 'Amit Kumar', email: 'amit@amdox.com', role: 'Super Admin' };
    if (userJson) {
      try { currentUser = JSON.parse(userJson); } catch (e) { }
    }

    // Extract simple browser name
    const ua = navigator.userAgent;
    let browser = 'Unknown Browser';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    container.innerHTML = `
      <div class="module-hero">
        <h2><i class="fas fa-shield-halved" style="color:var(--success)"></i> Authentication & Security</h2>
        <p>Multi-tenant RBAC, MFA/SSO, JWT security, OWASP protection, audit logging, and AI threat detection.</p>
      </div>
      <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr) !important;">
        <div class="stat-card" id="sec-stat-score" style="cursor:pointer;"><div class="stat-card-header"><div class="stat-icon green"><i class="fas fa-shield-check"></i></div></div><div class="stat-value">99.9%</div><div class="stat-label">Security Score</div></div>
        <div class="stat-card" id="sec-stat-users" style="cursor:pointer;"><div class="stat-card-header"><div class="stat-icon blue"><i class="fas fa-users"></i></div></div><div class="stat-value">162</div><div class="stat-label">Active Users</div></div>
        <div class="stat-card" id="sec-stat-threats" style="cursor:pointer;"><div class="stat-card-header"><div class="stat-icon red"><i class="fas fa-ban"></i></div></div><div class="stat-value">47</div><div class="stat-label">Threats Blocked</div></div>
        <div class="stat-card" id="btn-toggle-mfa-stat" style="cursor:pointer;"><div class="stat-card-header"><div class="stat-icon purple"><i class="fas fa-key"></i></div></div><div class="stat-value">${mfaEnabled ? 'MFA' : 'SMS'}</div><div class="stat-label">Auth Method</div></div>
      </div>
      <div class="grid-2" style="margin-bottom:24px">
        <div class="card">
          <div class="card-header"><span class="card-title">Security Features</span></div>
          <div class="activity-list">
            <div class="list-item">
              <div class="list-icon" style="background:rgba(34,197,94,0.12);color:var(--success)"><i class="fas fa-check"></i></div>
              <div class="list-content"><div class="list-title">Multi-Factor Authentication</div><div class="list-subtitle">TOTP, SMS, Email verification</div></div>
              <button class="badge ${mfaEnabled ? 'badge-success' : 'badge-danger'}" id="auth-mfa-btn" style="border:none; cursor:pointer; font-family:inherit; font-weight:600;">${mfaEnabled ? 'Enabled' : 'Disabled'}</button>
            </div>
            <div class="list-item">
              <div class="list-icon" style="background:rgba(34,197,94,0.12);color:var(--success)"><i class="fas fa-check"></i></div>
              <div class="list-content"><div class="list-title">SSO / OIDC / SAML</div><div class="list-subtitle">Google, Microsoft, Keycloak</div></div>
              <span class="badge badge-success">Active</span>
            </div>
            <div class="list-item">
              <div class="list-icon" style="background:rgba(34,197,94,0.12);color:var(--success)"><i class="fas fa-check"></i></div>
              <div class="list-content"><div class="list-title">Role-Based Access Control</div><div class="list-subtitle">Current Role: ${escHtml(currentUser.role)}</div></div>
              <span class="badge badge-purple">Active</span>
            </div>
            <div class="list-item">
              <div class="list-icon" style="background:rgba(34,197,94,0.12);color:var(--success)"><i class="fas fa-check"></i></div>
              <div class="list-content"><div class="list-title">Developer API Keys</div><div class="list-subtitle">Secure programmatic tokens</div></div>
              <button class="btn btn-secondary btn-xs" id="auth-apikey-btn" style="padding:4px 8px; font-size:11px;">Generate Key</button>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Your Current Session</span></div>
          <div class="table-container">
            <table>
              <tbody>
                <tr><td style="font-weight:600; width:150px;">Logged In User</td><td>${escHtml(currentUser.name)}</td></tr>
                <tr><td style="font-weight:600">Email Address</td><td>${escHtml(currentUser.email)}</td></tr>
                <tr><td style="font-weight:600">Role Assigned</td><td><span class="badge badge-purple">${escHtml(currentUser.role)}</span></td></tr>
                <tr><td style="font-weight:600">IP Address</td><td>127.0.0.1 (Localhost)</td></tr>
                <tr><td style="font-weight:600">Client Agent</td><td>${browser} on Windows</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Recent Audit Logs</span></div>
        <div class="activity-list" id="security-audit-logs">
          <div style="padding:20px; text-align:center; color:var(--text-muted)"><i class="fas fa-spinner fa-spin"></i> Loading audit trail...</div>
        </div>
      </div>`;

    document.getElementById('auth-mfa-btn').addEventListener('click', toggleMFA);
    document.getElementById('btn-toggle-mfa-stat').addEventListener('click', toggleMFA);
    document.getElementById('auth-apikey-btn').addEventListener('click', generateApiKey);

    // ── Security Stat Card Click Handlers ──
    document.getElementById('sec-stat-score')?.addEventListener('click', () => {
      showModal({
        title: '<i class="fas fa-shield-check" style="color:var(--success)"></i> Security Posture Analysis',
        submitLabel: 'Run Audit',
        fields: [
          { label: 'Integrity Score', default: '99.9%', readonly: true },
          { label: 'SSL Expiry', default: '284 Days Left', readonly: true },
          { label: 'SQLi Protection', default: 'Level 5 (Max)', readonly: true },
          { label: 'DDoS Defense', default: 'Cloudflare active', readonly: true }
        ],
        onSubmit(data, close) {
          showToast('🛡️ Deep security audit triggered. System integrity confirmed.', 'success');
          close();
        }
      });
    });

    document.getElementById('sec-stat-users')?.addEventListener('click', () => {
      const names = ['Arjun Mehta', 'Priya Sharma', 'Rahul Desai', 'Anita Patel', 'Sneha Reddy', 'Karan Mehta', 'Rajesh Gupta', 'Deepak Verma', 'Sonia Gill', 'Vikram Singh', 'Meera Iyer', 'Amit Kumar', 'Pooja Hegde', 'Suresh Raina', 'Ishani Bose'];
      const depts = ['Engineering', 'HR', 'Sales', 'Finance', 'Marketing', 'Legal', 'Operations'];
      const roles = ['Software Engineer', 'Manager', 'Lead Designer', 'Analyst', 'Executive', 'Director', 'Super Admin'];

      const users = [];
      for (let i = 1; i <= 162; i++) {
        const name = names[i % names.length] + ' ' + (i > 15 ? '#' + i : '');
        users.push({
          id: i,
          name: name,
          role: roles[i % roles.length],
          status: i % 15 === 0 ? 'Idle' : 'Active',
          lastLogin: i % 5 === 0 ? '5 mins ago' : (i % 3 === 0 ? '1 hour ago' : 'Just now'),
          ip: `192.168.1.${10 + i}`,
          mfa: i % 4 === 0 ? 'Enabled' : 'Disabled'
        });
      }

      const buildRows = (list) => {
        return list.map(u => `
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:12px 10px"><div style="display:flex;align-items:center;gap:8px"><div style="width:28px;height:28px;border-radius:6px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff">${u.name.substring(0, 2).toUpperCase()}</div><div style="font-weight:600">${u.name}</div></div></td>
            <td><span class="badge badge-purple">${u.role}</span></td>
            <td><span class="badge ${u.status === 'Active' ? 'badge-success' : 'badge-warning'}">${u.status}</span></td>
            <td style="font-size:12px;color:var(--text-muted)">${u.lastLogin}</td>
            <td style="font-family:var(--font-mono);font-size:11px">${u.ip}</td>
            <td><span class="badge ${u.mfa === 'Enabled' ? 'badge-success' : 'badge-danger'}">${u.mfa}</span></td>
          </tr>`).join('');
      };

      const html = `
        <div style="padding:5px">
          <div style="margin-bottom:15px; display:flex; gap:10px; align-items:center">
            <div style="position:relative; flex:1">
              <i class="fas fa-search" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-muted)"></i>
              <input type="text" id="sec-user-search" class="form-input" placeholder="Search by name, role or IP..." style="padding-left:35px; width:100%">
            </div>
            <div style="font-size:13px; color:var(--text-muted)">Total: <strong>162</strong> Active Sessions</div>
          </div>
          <div class="table-container" style="max-height:450px; overflow-y:auto">
            <table style="width:100%; border-collapse:collapse">
              <thead style="position:sticky; top:0; background:var(--bg-card); z-index:1">
                <tr style="text-align:left; border-bottom:1px solid var(--border)">
                  <th style="padding:10px">User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Activity</th>
                  <th>Source IP</th>
                  <th>MFA</th>
                </tr>
              </thead>
              <tbody id="sec-user-tbody">${buildRows(users)}</tbody>
            </table>
          </div>
        </div>`;

      showContentModal({
        title: '<i class="fas fa-users" style="color:var(--info)"></i> System Access Directory',
        content: html,
        maxWidth: '850px'
      });

      const searchInput = document.getElementById('sec-user-search');
      const tbody = document.getElementById('sec-user-tbody');
      if (searchInput && tbody) {
        searchInput.addEventListener('input', (e) => {
          const q = e.target.value.toLowerCase();
          const filtered = users.filter(u => u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q) || u.ip.includes(q));
          tbody.innerHTML = buildRows(filtered);
        });
      }
    });

    document.getElementById('sec-stat-threats')?.addEventListener('click', () => {
      showModal({
        title: '<i class="fas fa-ban" style="color:var(--danger)"></i> Threat Intelligence',
        submitLabel: 'View Audit Logs',
        fields: [
          { label: 'Blocked Attacks', default: '47', readonly: true },
          { label: 'Latest IP Blocked', default: '103.45.67.89', readonly: true },
          { label: 'Vulnerability Scan', default: 'Passed (0 issues)', readonly: true }
        ],
        onSubmit(data, close) {
          close();
          const logs = document.getElementById('security-audit-logs');
          if (logs) logs.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    loadAuditLogs();
  };

  async function loadAuditLogs() {
    const logsContainer = document.getElementById('security-audit-logs');
    if (!logsContainer) return;
    try {
      const res = await Promise.race([
        fetch(`${API_BASE}/activity-log?limit=8`),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1500))
      ]);
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        logsContainer.innerHTML = json.data.map(log => {
          let dotColor = 'green';
          if (log.action === 'DELETE' || log.action === 'BLOCKED') dotColor = 'red';
          else if (log.action === 'UPDATE') dotColor = 'blue';
          else if (log.action === 'CREATE') dotColor = 'green';
          else if (log.action === 'LOGIN') dotColor = 'purple';

          let dateStr = log.created_at;
          try {
            const date = new Date(log.created_at);
            dateStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' · ' + date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
          } catch (e) { }

          return `
            <div class="activity-item">
              <div class="activity-dot ${dotColor}"></div>
              <div>
                <div class="activity-text"><strong>${escHtml(log.module)}:</strong> ${escHtml(log.description)}</div>
                <div class="activity-time">${dateStr}</div>
              </div>
            </div>`;
        }).join('');
      } else {
        logsContainer.innerHTML = `<div style="padding:20px; text-align:center; color:var(--text-muted)">No recent activity logs found.</div>`;
      }
    } catch (e) {
      logsContainer.innerHTML = `
        <div class="activity-item"><div class="activity-dot green"></div><div><div class="activity-text"><strong>Login:</strong> Current User logged in successfully</div><div class="activity-time">Just now · 127.0.0.1</div></div></div>
        <div class="activity-item"><div class="activity-dot blue"></div><div><div class="activity-text"><strong>CRM:</strong> Sync completed</div><div class="activity-time">5 mins ago</div></div></div>
        <div class="activity-item"><div class="activity-dot red"></div><div><div class="activity-text"><strong>Blocked:</strong> Failed login from 103.45.67.89</div><div class="activity-time">1 hour ago</div></div></div>
      `;
    }
  }

  renderAuthPage();
};

/* Notifications Page */
/* Notifications Page */
const MOCK_SENT_MESSAGES = (function () {
  const base = [
    { id: 4000, type: 'Email', recipient: 'infosys_accounts@example.com', subject: 'Invoice #INV-2847', time: '2 min ago', content: 'Dear Infosys Accounts Team,\n\nPlease find the attached invoice #INV-2847 for the professional services rendered in May 2026. The total amount due is Rs. 8,75,000.\n\nPayment Link: https://pay.amdox.com/inv-2847\nDue Date: 25th May 2026.\n\nThank you for your business.\n\nBest Regards,\nBilling Department\nAmdox Technologies', status: 'Delivered' },
    { id: 3999, type: 'SMS', recipient: '+91-9876543210', subject: 'OTP Verification', time: '10 min ago', content: 'Your Amdox ERP secure login OTP is 482910. This code is valid for 5 minutes. Please do not share it with anyone.', status: 'Delivered' },
    { id: 3998, type: 'WhatsApp', recipient: '+91-9876500112', subject: 'Leave Approval', time: '30 min ago', content: 'Hello Priya,\n\nYour leave request for June 12-14 (3 days) has been APPROVED by your manager. \n\nEnjoy your time off!\n— HR Bot', status: 'Read' },
    { id: 3997, type: 'Webhook', recipient: 'https://hooks.slack.com/inv-alert', subject: 'inventory.stock.low', time: '1 hour ago', content: '{"event": "inventory.stock.low", "timestamp": "2026-06-09T20:51:00Z", "sku": "SKU-0033", "product": "Printer Ink Black", "current_stock": 5, "reorder_level": 15}', status: '200 OK' }
  ];

  const clients = ['Wipro Cloud', 'Tata Motors', 'HCL Tech', 'Reliance Industries', 'ICICI Bank', 'Amazon India', 'Flipkart', 'Zomato', 'Freshworks', 'Swiggy', 'Infosys', 'Tech Mahindra', 'LTIMindtree', 'Adani Group', 'Vedanta', 'Bajaj Finance', 'Mahindra Group', 'HDFC Bank', 'Cipla Ltd', 'Godrej Industries', 'Larsen & Toubro', 'Bharti Airtel', 'ITC Limited', 'Sun Pharma', 'Kotak Mahindra'];
  const subjects = ['Monthly Subscription Invoice', 'Project Milestone Achieved', 'New Quotation Received', 'Account Security Warning', 'Newsletter: ERP Updates', 'Performance Report May 2026', 'Meeting Summary: Q3 Planning', 'Contract Renewal Notice', 'Compliance Audit Request', 'System Downtime Notification', 'Payment Receipt Confirmation', 'Quarterly Business Review', 'Service Level Agreement Update', 'Data Migration Status', 'API Integration Report', 'License Renewal Reminder', 'Onboarding Confirmation', 'Support Ticket Resolution', 'Inventory Restock Order', 'Employee Training Schedule', 'Budget Approval Request', 'Vendor Payment Processing', 'Annual Audit Summary', 'Customer Feedback Report', 'Server Health Dashboard'];
  const statuses = ['Delivered', 'Opened', 'Delivered', 'Delivered', 'Bounced', 'Read'];
  const depts = ['Billing Department', 'HR Operations', 'IT Support', 'Sales Team', 'Finance Division', 'Procurement', 'Legal & Compliance', 'Customer Success', 'Engineering Team', 'Operations'];

  const emailTemplates = [
    (client, subject, ref, ts) => `Dear ${client} Team,\n\nWe are writing to inform you about ${subject}.\n\nReference Number: ${ref}\nDate & Time: ${ts}\n\nPlease find the detailed report attached. If you have any questions, please do not hesitate to reach out to our support team at support@amdox.com.\n\nWe value your partnership and look forward to continued collaboration.\n\nBest Regards,\nAmdox Technologies Pvt Ltd`,
    (client, subject, ref, ts) => `Hello ${client},\n\nThis is to confirm that ${subject} has been processed successfully.\n\nTransaction ID: ${ref}\nProcessed On: ${ts}\nStatus: Completed\n\nA copy of this confirmation has been saved to your Amdox portal dashboard for your records.\n\nThank you for choosing Amdox ERP Suite.\n\nWarm Regards,\nAmdox Billing`,
    (client, subject, ref, ts) => `Hi Team,\n\nAction Required: ${subject}\n\nRef: ${ref}\nDeadline: Within 48 hours\nPriority: High\n\nPlease review and take necessary action at your earliest convenience. You can access the full details through your ERP dashboard.\n\nFor urgent matters, contact us at +91-1800-AMDOX-00.\n\nRegards,\nAmdox Operations`,
    (client, subject, ref, ts) => `Dear ${client},\n\nGreetings from Amdox Technologies!\n\nWe would like to bring to your attention: ${subject}.\n\nDetails:\n- Reference: ${ref}\n- Generated: ${ts}\n- Module: Enterprise Resource Planning\n- Impact: Low\n\nNo immediate action is required from your end. This is for your records.\n\nBest,\nAmdox Notifications`,
    (client, subject, ref, ts) => `To: ${client} Administration\n\nSubject: ${subject}\n\nDear Sir/Madam,\n\nThis automated notification is generated by the Amdox ERP system.\n\nTicket: ${ref}\nTimestamp: ${ts}\n\nSummary: The above referenced item has been updated in your account. Please log in to your portal for complete details.\n\nThis is a system-generated email. Please do not reply directly.\n\nAmdox Technologies Pvt Ltd\nCIN: U72900TG2024PTC123456`,
    (client, subject, ref, ts) => `Hi ${client},\n\nYour monthly report for ${subject} is now available.\n\nReport ID: ${ref}\nPeriod: May 2026\nGenerated: ${ts}\n\nKey Highlights:\n• Revenue grew by 12% compared to last month\n• 3 new contracts signed\n• Customer satisfaction score: 4.7/5\n\nDownload the full report from your dashboard.\n\nCheers,\nAmdox Analytics Team`,
    (client, subject, ref, ts) => `Dear ${client} Finance Team,\n\nPayment Reminder: ${subject}\n\nInvoice Ref: ${ref}\nDue Date: ${ts}\nAmount: Rs. ${(Math.floor(Math.random() * 50) + 1) * 25000}\n\nPlease ensure timely payment to avoid any service disruption. You can pay online via our secure payment portal.\n\nPayment Link: https://pay.amdox.com/${ref}\n\nRegards,\nAccounts Receivable\nAmdox Technologies`,
    (client, subject, ref, ts) => `Hello ${client},\n\nWelcome aboard! ${subject}\n\nYour account has been activated:\n- Account ID: ${ref}\n- Activation Date: ${ts}\n- Plan: Enterprise Premium\n- Users: Unlimited\n\nGetting Started:\n1. Log in at erp.amdox.com\n2. Complete your company profile\n3. Invite your team members\n4. Explore modules\n\nNeed help? Visit docs.amdox.com\n\nBest,\nAmdox Onboarding Team`,
    (client, subject, ref, ts) => `URGENT: ${subject}\n\nDear ${client},\n\nWe detected unusual activity on your account.\n\nAlert ID: ${ref}\nDetected: ${ts}\nSeverity: Medium\n\nAction Taken: Access temporarily restricted as a precaution.\n\nTo restore full access:\n1. Verify your identity via MFA\n2. Review recent activity log\n3. Update your password\n\nIf this was you, no further action is needed.\n\nSecurity Team\nAmdox Technologies`,
    (client, subject, ref, ts) => `Dear ${client},\n\n${subject} - Completion Update\n\nProject Ref: ${ref}\nCompleted: ${ts}\nDeliverables: All milestones achieved\n\nProject Summary:\n- Total tasks completed: ${Math.floor(Math.random() * 50) + 20}\n- Team members involved: ${Math.floor(Math.random() * 10) + 5}\n- Client satisfaction: Excellent\n- Budget utilization: 94%\n\nFinal documentation will be shared within 3 business days.\n\nThank you for your trust.\n\nProject Management Office\nAmdox Technologies`,
    (client, subject, ref, ts) => `Hi ${client},\n\nScheduled Maintenance Notice: ${subject}\n\nMaintenance Window:\n- Start: ${ts}\n- Duration: 2 hours\n- Affected: ERP Portal, API Gateway\n- Ref: ${ref}\n\nDuring this time, read-only access will be available. All data will be preserved.\n\nWe apologize for any inconvenience.\n\nDevOps Team\nAmdox Technologies`,
    (client, subject, ref, ts) => `Dear ${client} HR Department,\n\n${subject}\n\nEmployee Update Ref: ${ref}\nProcessed On: ${ts}\n\nThe following HR actions have been completed:\n- Payroll processed for current cycle\n- Leave balances updated\n- Attendance records synced\n- Compliance documents verified\n\nPlease review the HR dashboard for detailed reports.\n\nHR Automation\nAmdox ERP Suite`,
    (client, subject, ref, ts) => `Hello ${client},\n\nInventory Alert: ${subject}\n\nAlert Ref: ${ref}\nGenerated: ${ts}\n\nLow Stock Items:\n- Printer Ink Black (SKU-0033): 5 units remaining\n- A4 Paper Ream (SKU-0089): 12 units remaining\n- USB-C Cables (SKU-0156): 3 units remaining\n\nRecommended Action: Place restock orders immediately.\n\nAuto-purchase orders have been drafted in your Procurement module.\n\nInventory Management\nAmdox ERP`,
    (client, subject, ref, ts) => `Dear ${client},\n\nCongratulations! ${subject}\n\nAchievement Ref: ${ref}\nDate: ${ts}\n\nYour team has successfully:\n✅ Exceeded quarterly targets by 18%\n✅ Maintained 99.9% system uptime\n✅ Onboarded 15 new team members\n✅ Reduced operational costs by 7%\n\nKeep up the excellent work!\n\nLeadership Team\nAmdox Technologies`,
    (client, subject, ref, ts) => `To: ${client} Compliance Officer\n\nRe: ${subject}\n\nRef: ${ref}\nDate: ${ts}\n\nDear Compliance Team,\n\nAs part of our quarterly compliance review, please find below the summary:\n\n- GDPR Compliance: ✅ Passed\n- Data Retention Policy: ✅ Current\n- Access Controls: ✅ Verified\n- Audit Trail: ✅ Complete\n- ISO 27001: ✅ Maintained\n\nFull audit report is available in the Legal & Compliance module.\n\nCompliance Automation\nAmdox ERP`,
    (client, subject, ref, ts) => `Hi ${client},\n\nYour support ticket has been resolved: ${subject}\n\nTicket: ${ref}\nResolved: ${ts}\nResolution Time: ${Math.floor(Math.random() * 24) + 1} hours\n\nResolution Summary:\nOur engineering team identified and fixed the issue. The root cause was a configuration mismatch that has been corrected.\n\nIf you experience any further issues, please reopen this ticket or create a new one.\n\nCustomer Support\nAmdox Technologies`,
    (client, subject, ref, ts) => `Dear ${client},\n\nTraining Invitation: ${subject}\n\nSession Ref: ${ref}\nScheduled: ${ts}\n\nTraining Details:\n- Topic: Advanced ERP Analytics & Reporting\n- Duration: 2 hours\n- Mode: Virtual (Microsoft Teams)\n- Trainer: Amdox Academy\n\nPrerequisites:\n- Basic ERP knowledge\n- Access to Analytics module\n\nRegister now through the Training portal.\n\nLearning & Development\nAmdox Technologies`,
    (client, subject, ref, ts) => `Dear ${client} Procurement,\n\nPurchase Order Update: ${subject}\n\nPO Ref: ${ref}\nDate: ${ts}\nStatus: Approved & Dispatched\n\nOrder Details:\n- Vendor: Amdox Supply Chain\n- Items: ${Math.floor(Math.random() * 20) + 5} line items\n- Total Value: Rs. ${((Math.floor(Math.random() * 100) + 10) * 5000).toLocaleString('en-IN')}\n- Expected Delivery: 5-7 business days\n\nTrack your order in the Supply Chain module.\n\nProcurement Team\nAmdox ERP`,
    (client, subject, ref, ts) => `Hello ${client},\n\nAPI Integration Report: ${subject}\n\nReport ID: ${ref}\nPeriod: Last 24 hours\nGenerated: ${ts}\n\nAPI Performance:\n- Total Requests: ${(Math.floor(Math.random() * 50000) + 10000).toLocaleString()}\n- Success Rate: 99.${Math.floor(Math.random() * 9) + 1}%\n- Avg Response Time: ${Math.floor(Math.random() * 50) + 20}ms\n- Errors: ${Math.floor(Math.random() * 10)}\n\nAll endpoints are operating within SLA parameters.\n\nDevOps Monitoring\nAmdox Technologies`,
    (client, subject, ref, ts) => `Dear ${client},\n\nContract Update: ${subject}\n\nContract Ref: ${ref}\nEffective: ${ts}\n\nChanges Summary:\n- Service tier upgraded to Premium Plus\n- Additional 50 user licenses added\n- SLA response time improved to 2 hours\n- Annual review scheduled for Q4 2026\n\nPlease sign the updated agreement through DocuSign link sent separately.\n\nLegal Department\nAmdox Technologies Pvt Ltd`
  ];

  // Generate 2846 Emails (+ 1 seed = 2847 total)
  for (let i = 0; i < 2846; i++) {
    const clientId = i % clients.length;
    const subId = i % subjects.length;
    const statId = i % (statuses.length - 1);
    const hours = (i % 720) + 2;
    const deptId = i % depts.length;
    const tplId = i % emailTemplates.length;
    const ref = 'AM-EML-' + (20000 + i);
    const ts = new Date(Date.now() - hours * 3600000).toLocaleString();

    base.push({
      id: 3500 - i,
      type: 'Email',
      recipient: clients[clientId].toLowerCase().replace(/[ &]/g, '_') + (100 + i) + '@example.com',
      subject: subjects[subId] + ' #' + (5000 + i),
      time: hours < 24 ? `${hours} hours ago` : `${Math.floor(hours / 24)} days ago`,
      content: emailTemplates[tplId](clients[clientId], subjects[subId], ref, ts),
      status: statuses[statId]
    });
  }

  // Generate ~189 WhatsApp Messages
  for (let i = 0; i < 188; i++) {
    const clientId = Math.floor(Math.random() * clients.length);
    const phone = '+91-98' + Math.floor(10000000 + Math.random() * 90000000);
    const waSubjects = ['Attendance Alert', 'Leave Approved', 'Payment Reminder', 'Meeting Link', 'Task Assigned'];
    const subId = Math.floor(Math.random() * waSubjects.length);
    const hours = Math.floor(Math.random() * 120) + 1;

    base.push({
      id: 3000 - i,
      type: 'WhatsApp',
      recipient: phone,
      subject: waSubjects[subId],
      time: `${hours} hours ago`,
      content: `Hey ${clients[clientId]} Team!\n\n${waSubjects[subId]} for the current cycle. Check your dashboard for more info.\n\n— Amdox Notify`,
      status: Math.random() > 0.3 ? 'Read' : 'Delivered'
    });
  }

  // Add more SMS and Webhooks to feel complete
  const smsTexts = [
    'Security Alert: New login detected from Chrome on Windows.',
    'Your monthly invoice is ready. Please check your email for details.',
    'OTP for password reset: 554210. Valid for 10 minutes.',
    'System Maintenance: Database will be offline for 15 mins at midnight.',
    'Inventory Alert: SKU-0033 stock is below reorder level.',
    'Employee on-boarding completed for Arjun Mehta.',
    'Backup successful: 1.2TB processed in 45ms.'
  ];

  for (let i = 0; i < 455; i++) {
    base.push({
      id: 2500 - i,
      type: 'SMS',
      recipient: '+91-7000' + (100000 + i),
      subject: i % 5 === 0 ? 'Billing Alert' : 'System Alert',
      time: `${Math.floor(i / 10) + 1} days ago`,
      content: smsTexts[i % smsTexts.length],
      status: 'Delivered'
    });
  }

  return base;
})();

pages.notifications = function (container) {
  container.innerHTML = `
    <div class="module-hero">
      <h2><i class="fas fa-bell" style="color:var(--warning)"></i> Notification & Event Engine</h2>
      <p>Multi-channel notifications — Email, SMS, WhatsApp, Push, Webhooks, Slack/Discord with BullMQ queue and retry mechanism.</p>
    </div>
    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr) !important;">
      <div class="stat-card" id="notif-stat-email" style="cursor:pointer"><div class="stat-card-header"><div class="stat-icon blue"><i class="fas fa-envelope"></i></div></div><div class="stat-value">2,847</div><div class="stat-label">Emails Sent</div></div>
      <div class="stat-card" id="notif-stat-sms" style="cursor:pointer"><div class="stat-card-header"><div class="stat-icon green"><i class="fas fa-comment-sms"></i></div></div><div class="stat-value">456</div><div class="stat-label">SMS Delivered</div></div>
      <div class="stat-card" id="notif-stat-whatsapp" style="cursor:pointer"><div class="stat-card-header"><div class="stat-icon cyan"><i class="fab fa-whatsapp"></i></div></div><div class="stat-value">189</div><div class="stat-label">WhatsApp Messages</div></div>
      <div class="stat-card" id="notif-stat-webhooks" style="cursor:pointer"><div class="stat-card-header"><div class="stat-icon purple"><i class="fas fa-code"></i></div></div><div class="stat-value">34</div><div class="stat-label">Webhooks Active</div></div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><span class="card-title">Notification Channels</span></div>
        <div class="activity-list">
          <div class="list-item" id="notif-ch-email" style="cursor:pointer"><div class="list-icon" style="background:rgba(59,130,246,0.12);color:var(--info)"><i class="fas fa-envelope"></i></div><div class="list-content"><div class="list-title">Email (SMTP)</div><div class="list-subtitle">SendGrid integration · 99.2% delivery</div></div><span class="badge badge-success">Active</span></div>
          <div class="list-item" id="notif-ch-sms" style="cursor:pointer"><div class="list-icon" style="background:rgba(34,197,94,0.12);color:var(--success)"><i class="fas fa-comment-sms"></i></div><div class="list-content"><div class="list-title">SMS Gateway</div><div class="list-subtitle">Twilio · OTP & alerts</div></div><span class="badge badge-success">Active</span></div>
          <div class="list-item" id="notif-ch-whatsapp" style="cursor:pointer"><div class="list-icon" style="background:rgba(6,182,212,0.12);color:var(--cyan)"><i class="fab fa-whatsapp"></i></div><div class="list-content"><div class="list-title">WhatsApp Business</div><div class="list-subtitle">Meta Cloud API</div></div><span class="badge badge-success">Active</span></div>
          <div class="list-item" id="notif-ch-slack" style="cursor:pointer"><div class="list-icon" style="background:rgba(168,85,247,0.12);color:var(--purple)"><i class="fab fa-slack"></i></div><div class="list-content"><div class="list-title">Slack Integration</div><div class="list-subtitle">Workspace notifications</div></div><span class="badge badge-success">Active</span></div>
          <div class="list-item" id="notif-ch-discord" style="cursor:pointer"><div class="list-icon" style="background:rgba(99,102,241,0.12);color:var(--accent)"><i class="fab fa-discord"></i></div><div class="list-content"><div class="list-title">Discord Webhooks</div><div class="list-subtitle">Dev team alerts</div></div><span class="badge badge-info">Config</span></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <span class="card-title">Recent Notifications</span>
          <button class="btn btn-secondary btn-xs" id="notif-view-all-logs" style="padding:4px 10px; font-size:11px;">View All Logs</button>
        </div>
        <div class="activity-list" id="notif-recent-list">
          <div class="activity-item" style="cursor:pointer" onclick="viewNotificationDetail(1124)"><div class="activity-dot green"></div><div><div class="activity-text">📧 Invoice #INV-2847 sent to Infosys via Email</div><div class="activity-time">2 min ago · Delivered</div></div></div>
          <div class="activity-item" style="cursor:pointer" onclick="viewNotificationDetail(1123)"><div class="activity-dot blue"></div><div><div class="activity-text">💬 OTP sent to +91-98765xxxxx via SMS</div><div class="activity-time">10 min ago · Delivered</div></div></div>
          <div class="activity-item" style="cursor:pointer" onclick="viewNotificationDetail(1122)"><div class="activity-dot purple"></div><div><div class="activity-text">🔔 Leave approval notification via WhatsApp</div><div class="activity-time">30 min ago · Read</div></div></div>
          <div class="activity-item" style="cursor:pointer" onclick="viewNotificationDetail(1121)"><div class="activity-dot yellow"></div><div><div class="activity-text">⚡ Webhook triggered: inventory.stock.low</div><div class="activity-time">1 hour ago · 200 OK</div></div></div>
        </div>
      </div>
    </div>`;

  // ── Notification Detail & Log Viewers ──
  window.viewNotificationDetail = function (id) {
    const msg = MOCK_SENT_MESSAGES.find(m => m.id === id);
    if (!msg) return;

    const typeIcons = {
      Email: '<i class="fas fa-envelope" style="color:var(--info)"></i>',
      SMS: '<i class="fas fa-comment-sms" style="color:var(--success)"></i>',
      WhatsApp: '<i class="fab fa-whatsapp" style="color:#25D366"></i>',
      Webhook: '<i class="fas fa-code" style="color:var(--purple)"></i>'
    };

    const contentHtml = `
      <div style="background:rgba(255,255,255,0.02); padding:20px; border-radius:12px; border:1px solid var(--border)">
        <div style="display:grid; grid-template-columns:100px 1fr; gap:12px; margin-bottom:20px; font-size:14px;">
          <div style="color:var(--text-muted)">Recipient:</div><div style="font-weight:600; color:var(--accent-light)">${escHtml(msg.recipient)}</div>
          <div style="color:var(--text-muted)">Subject:</div><div style="font-weight:600">${escHtml(msg.subject)}</div>
          <div style="color:var(--text-muted)">Sent At:</div><div>${msg.time}</div>
          <div style="color:var(--text-muted)">Status:</div><div><span class="badge badge-success">${msg.status}</span></div>
        </div>
        <div style="border-top:1px solid var(--border); padding-top:15px">
          <div style="color:var(--text-muted); font-size:12px; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;">Message Content</div>
          <div style="white-space:pre-wrap; font-family:var(--font-mono); font-size:13px; line-height:1.6; color:var(--text-secondary); background:rgba(0,0,0,0.2); padding:15px; border-radius:8px;">${escHtml(msg.content)}</div>
        </div>
      </div>
    `;

    showContentModal({
      title: `${typeIcons[msg.type] || ''} Message Details: #${msg.id}`,
      content: contentHtml,
      maxWidth: '600px'
    });
  };

  window.viewNotificationLogs = function (type = 'All') {
    const logs = type === 'All' ? MOCK_SENT_MESSAGES : MOCK_SENT_MESSAGES.filter(m => m.type === type);

    const typeIcons = {
      Email: '<i class="fas fa-envelope"></i>',
      SMS: '<i class="fas fa-comment-sms"></i>',
      WhatsApp: '<i class="fab fa-whatsapp"></i>',
      Webhook: '<i class="fas fa-code"></i>'
    };

    const tableRows = logs.map(m => `
      <tr style="cursor:pointer" onclick="viewNotificationDetail(${m.id})">
        <td>${typeIcons[m.type] || ''} ${m.type}</td>
        <td style="font-weight:600">${escHtml(m.recipient)}</td>
        <td>${escHtml(m.subject)}</td>
        <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:11px; color:var(--text-secondary)">${escHtml(m.content)}</td>
        <td>${m.time}</td>
        <td><span class="badge badge-success" style="font-size:10px">${m.status}</span></td>
        <td><button class="btn btn-secondary btn-xs" style="padding:2px 6px">View</button></td>
      </tr>
    `).join('');

    const contentHtml = `
      <div class="table-container" style="max-height:500px; overflow-y:auto">
        <table style="width:100%">
          <thead>
            <tr>
              <th>Type</th>
              <th>Recipient</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
      <div style="margin-top:15px; font-size:12px; color:var(--text-muted); font-style:italic;">
        Showing all ${logs.length} sent ${type === 'All' ? 'notifications' : type + 's'}.
      </div>
    `;

    showContentModal({
      title: `<i class="fas fa-list-ul" style="color:var(--info)"></i> Sent ${type} Logs`,
      content: contentHtml,
      maxWidth: '950px'
    });
  };

  document.getElementById('notif-view-all-logs')?.addEventListener('click', () => viewNotificationLogs('All'));


  // ── Stat card click handlers ──
  document.getElementById('notif-stat-email')?.addEventListener('click', () => {
    viewNotificationLogs('Email');
  });

  document.getElementById('notif-stat-sms')?.addEventListener('click', () => {
    viewNotificationLogs('SMS');
  });

  document.getElementById('notif-stat-whatsapp')?.addEventListener('click', () => {
    viewNotificationLogs('WhatsApp');
  });

  document.getElementById('notif-stat-webhooks')?.addEventListener('click', () => {
    showModal({
      title: '<i class="fas fa-code" style="color:var(--purple)"></i> Webhook Manager',
      submitLabel: 'Register Webhook',
      fields: [
        { name: 'url', label: 'Endpoint URL', required: true, placeholder: 'https://api.example.com/webhook' },
        { name: 'event', label: 'Trigger Event', type: 'select', options: ['invoice.created', 'invoice.paid', 'employee.onboarded', 'inventory.stock.low', 'order.placed', 'leave.approved'], default: 'invoice.created' },
        { name: 'secret', label: 'Signing Secret', placeholder: 'Auto-generated if empty' }
      ],
      onSubmit(data, close) {
        showToast('⚡ Webhook registered for event "' + data.event + '"!', 'success');
        const valEl = document.querySelector('#notif-stat-webhooks .stat-value');
        if (valEl) valEl.textContent = parseInt(valEl.textContent) + 1;
        close();
      }
    });
  });

  // ── Channel list item click handlers ──
  document.getElementById('notif-ch-email')?.addEventListener('click', () => {
    showModal({
      title: '<i class="fas fa-envelope" style="color:var(--info)"></i> Email (SMTP) Configuration',
      submitLabel: 'Save Settings',
      fields: [
        { name: 'provider', label: 'SMTP Provider', type: 'select', options: ['SendGrid', 'Mailgun', 'Amazon SES', 'Custom SMTP'], default: 'SendGrid' },
        { name: 'from_email', label: 'From Email', required: true, default: 'noreply@amdox.com' },
        { name: 'from_name', label: 'From Name', default: 'Amdox ERP Suite' },
        { name: 'daily_limit', label: 'Daily Send Limit', default: '5000' }
      ],
      onSubmit(data, close) {
        showToast('📧 Email SMTP settings updated — Provider: ' + data.provider, 'success');
        close();
      }
    });
  });

  document.getElementById('notif-ch-sms')?.addEventListener('click', () => {
    showModal({
      title: '<i class="fas fa-comment-sms" style="color:var(--success)"></i> SMS Gateway Configuration',
      submitLabel: 'Save Settings',
      fields: [
        { name: 'provider', label: 'SMS Provider', type: 'select', options: ['Twilio', 'MSG91', 'Vonage', 'AWS SNS'], default: 'Twilio' },
        { name: 'sender_id', label: 'Sender ID', required: true, default: 'AMDOX' },
        { name: 'api_key', label: 'API Key', placeholder: '••••••••••••' },
        { name: 'otp_length', label: 'OTP Length', type: 'select', options: ['4', '6', '8'], default: '6' }
      ],
      onSubmit(data, close) {
        showToast('💬 SMS Gateway updated — Provider: ' + data.provider + ', Sender: ' + data.sender_id, 'success');
        close();
      }
    });
  });

  document.getElementById('notif-ch-whatsapp')?.addEventListener('click', () => {
    showModal({
      title: '<i class="fab fa-whatsapp" style="color:#25D366"></i> WhatsApp Business Configuration',
      submitLabel: 'Save Settings',
      fields: [
        { name: 'business_id', label: 'Business Account ID', required: true, placeholder: 'e.g. 1234567890' },
        { name: 'phone_number', label: 'Business Phone Number', required: true, default: '+91-9876543210' },
        { name: 'api_version', label: 'API Version', type: 'select', options: ['v18.0', 'v17.0', 'v16.0'], default: 'v18.0' },
        { name: 'template_status', label: 'Template Status', type: 'select', options: ['Approved', 'Pending Review', 'Rejected'], default: 'Approved' }
      ],
      onSubmit(data, close) {
        showToast('📱 WhatsApp Business settings updated for ' + data.phone_number, 'success');
        close();
      }
    });
  });

  document.getElementById('notif-ch-slack')?.addEventListener('click', () => {
    showModal({
      title: '<i class="fab fa-slack" style="color:var(--purple)"></i> Slack Integration Settings',
      submitLabel: 'Save Settings',
      fields: [
        { name: 'workspace', label: 'Workspace Name', required: true, default: 'Amdox Technologies' },
        { name: 'channel', label: 'Default Channel', required: true, default: '#erp-alerts' },
        { name: 'webhook_url', label: 'Incoming Webhook URL', placeholder: 'https://hooks.slack.com/services/...' },
        { name: 'notify_on', label: 'Notify On', type: 'select', options: ['All Events', 'Critical Only', 'Invoices & Payments', 'HR Updates', 'Inventory Alerts'], default: 'All Events' }
      ],
      onSubmit(data, close) {
        showToast('🔔 Slack integration updated — Channel: ' + data.channel, 'success');
        close();
      }
    });
  });

  document.getElementById('notif-ch-discord')?.addEventListener('click', () => {
    showModal({
      title: '<i class="fab fa-discord" style="color:var(--accent)"></i> Discord Webhook Configuration',
      submitLabel: 'Save & Activate',
      fields: [
        { name: 'server', label: 'Server Name', required: true, placeholder: 'e.g. Amdox Dev Team' },
        { name: 'webhook_url', label: 'Webhook URL', required: true, placeholder: 'https://discord.com/api/webhooks/...' },
        { name: 'channel', label: 'Channel Name', default: '#dev-alerts' },
        { name: 'bot_name', label: 'Bot Display Name', default: 'Amdox ERP Bot' }
      ],
      onSubmit(data, close) {
        const badge = document.querySelector('#notif-ch-discord .badge');
        if (badge) { badge.textContent = 'Active'; badge.className = 'badge badge-success'; }
        showToast('🎮 Discord webhook configured for server "' + data.server + '"!', 'success');
        close();
      }
    });
  });
};

/* Asset Management Page */
pages.assets = function (container) {

  // ── localStorage helpers ──
  const LS_KEY = 'amdox_assets';
  const SEED_ASSETS = [
    { id: 'AST-001', name: 'MacBook Pro 16" M3', category: 'Laptop', assignedTo: 'Rahul Singh', status: 'In Use', value: 249900 },
    { id: 'AST-002', name: 'Dell UltraSharp 32"', category: 'Monitor', assignedTo: 'Anita Patel', status: 'In Use', value: 52000 },
    { id: 'AST-003', name: 'Herman Miller Aeron', category: 'Furniture', assignedTo: 'Conference Room B', status: 'In Use', value: 125000 },
    { id: 'AST-004', name: 'Epson Projector', category: 'AV Equipment', assignedTo: '', status: 'Maintenance', value: 85000 }
  ];

  function getAssets() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || SEED_ASSETS; } catch { return SEED_ASSETS; }
  }
  function saveAssets(list) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch { }
  }
  function nextId(list) {
    const nums = list.map(a => parseInt(a.id.replace('AST-', '')) || 0);
    return 'AST-' + String(Math.max(0, ...nums) + 1).padStart(3, '0');
  }
  function fmtVal(v) { return '₹' + Number(v).toLocaleString('en-IN'); }
  function esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  }

  // ── Status badge class helper (no bracket notation) ──
  function statusClass(s) {
    switch (s) {
      case 'In Use': return 'badge-success';
      case 'Maintenance': return 'badge-warning';
      case 'Retired': return 'badge-danger';
      case 'Available': return 'badge-info';
      default: return 'badge-info';
    }
  }

  // ── Build a table row using safe DOM APIs ──
  function buildRow(a) {
    const tr = document.createElement('tr');

    const tdId = document.createElement('td');
    tdId.style.cssText = 'font-family:var(--font-mono);font-size:12px;color:var(--accent-light)';
    tdId.textContent = a.id;
    tr.appendChild(tdId);

    const tdName = document.createElement('td');
    tdName.textContent = a.name;
    tr.appendChild(tdName);

    const tdCat = document.createElement('td');
    tdCat.textContent = a.category;
    tr.appendChild(tdCat);

    const tdAssign = document.createElement('td');
    tdAssign.textContent = a.assignedTo || '—';
    tr.appendChild(tdAssign);

    const tdStatus = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = 'badge ' + statusClass(a.status);
    badge.textContent = a.status;
    tdStatus.appendChild(badge);
    tr.appendChild(tdStatus);

    const tdVal = document.createElement('td');
    tdVal.textContent = fmtVal(a.value);
    tr.appendChild(tdVal);

    const tdAct = document.createElement('td');
    const actWrap = document.createElement('div');
    actWrap.style.cssText = 'display:flex;gap:6px';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-secondary btn-sm asset-edit-btn';
    editBtn.dataset.id = a.id;
    editBtn.style.cssText = 'padding:4px 10px;font-size:11px';
    editBtn.title = 'Edit';
    editBtn.innerHTML = '<i class="fas fa-pen"></i>';
    actWrap.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-secondary btn-sm asset-del-btn';
    delBtn.dataset.id = a.id;
    delBtn.style.cssText = 'padding:4px 10px;font-size:11px;color:var(--danger)';
    delBtn.title = 'Delete';
    delBtn.innerHTML = '<i class="fas fa-trash"></i>';
    actWrap.appendChild(delBtn);

    tdAct.appendChild(actWrap);
    tr.appendChild(tdAct);

    return tr;
  }

  // ── Edit Asset ──
  function handleEditAsset(assetId) {
    const assets = getAssets();
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;
    showModal({
      title: '<i class="fas fa-pen" style="color:var(--accent-light)"></i> Edit Asset',
      submitLabel: 'Update Asset',
      fields: [
        { name: 'name', label: 'Asset Name', required: true, default: asset.name },
        { name: 'category', label: 'Category', type: 'select', options: ['Laptop', 'Monitor', 'Furniture', 'AV Equipment', 'Networking', 'Printer', 'Phone', 'Tablet', 'Server', 'Other'], default: asset.category },
        { name: 'assignedTo', label: 'Assigned To', default: asset.assignedTo },
        { name: 'status', label: 'Status', type: 'select', options: ['In Use', 'Available', 'Maintenance', 'Retired'], default: asset.status },
        { name: 'value', label: 'Value (₹)', required: true, type: 'number', default: String(asset.value) }
      ],
      onSubmit(data, close) {
        const list = getAssets();
        const idx = list.findIndex(a => a.id === asset.id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], name: data.name, category: data.category, assignedTo: data.assignedTo || '', status: data.status, value: parseFloat(data.value) || 0 };
          saveAssets(list);
          showToast('Asset updated successfully!', 'success');
        }
        close();
        render();
      }
    });
  }

  // ── Delete Asset ──
  function handleDeleteAsset(assetId) {
    const asset = getAssets().find(a => a.id === assetId);
    if (!asset) return;
    const confirmMsg = 'Are you sure you want to delete asset <strong style="color:var(--accent-light)">' + esc(asset.id) + '</strong> (<strong>' + esc(asset.name) + '</strong>)?';
    showConfirm(confirmMsg, () => {
      const list = getAssets().filter(a => a.id !== assetId);
      saveAssets(list);
      const toastMsg = 'Asset <strong>' + esc(asset.id) + '</strong> (' + esc(asset.name) + ') has been deleted successfully!';
      showToast(toastMsg, 'success');
      render();
    });
  }

  // ── Render page ──
  function render() {
    const assets = getAssets();
    const total = assets.length;
    const inUse = assets.filter(a => a.status === 'In Use').length;
    const maint = assets.filter(a => a.status === 'Maintenance').length;
    const retired = assets.filter(a => a.status === 'Retired').length;

    // Static chrome (no user data interpolated)
    container.innerHTML = `
    <div class="module-hero">
      <h2><i class="fas fa-laptop" style="color:var(--cyan)"></i> Asset Management</h2>
      <p>Company assets tracking, device management, maintenance schedules, depreciation calculation, and QR code check-in.</p>
    </div>
    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr) !important;">
      <div class="stat-card" id="asset-card-total" style="cursor:pointer;"><div class="stat-card-header"><div class="stat-icon cyan"><i class="fas fa-laptop"></i></div></div><div class="stat-value" id="asset-stat-total"></div><div class="stat-label">Total Assets</div></div>
      <div class="stat-card" id="asset-card-inuse" style="cursor:pointer;"><div class="stat-card-header"><div class="stat-icon green"><i class="fas fa-circle-check"></i></div></div><div class="stat-value" id="asset-stat-inuse"></div><div class="stat-label">In Use</div></div>
      <div class="stat-card" id="asset-card-maint" style="cursor:pointer;"><div class="stat-card-header"><div class="stat-icon yellow"><i class="fas fa-wrench"></i></div></div><div class="stat-value" id="asset-stat-maint"></div><div class="stat-label">Under Maintenance</div></div>
      <div class="stat-card" id="asset-card-retired" style="cursor:pointer;"><div class="stat-card-header"><div class="stat-icon red"><i class="fas fa-box-archive"></i></div></div><div class="stat-value" id="asset-stat-retired"></div><div class="stat-label">Retired</div></div>
    </div>
    <div class="card">
      <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <span class="card-title">Asset Register</span>
        <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
          <div style="position:relative; display:flex; align-items:center;">
            <i class="fas fa-search" style="position:absolute; left:10px; color:var(--text-muted); font-size:12px;"></i>
            <input type="text" class="form-control" id="asset-search" placeholder="Search assets..." style="width:200px; padding:6px 12px 6px 28px; font-size:13px;">
          </div>
          <select class="form-control" id="asset-status-filter" style="width:140px; padding:6px 10px; font-size:13px;">
            <option value="">All Statuses</option>
            <option value="In Use">In Use</option>
            <option value="Available">Available</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Retired">Retired</option>
          </select>
          <button class="btn btn-primary btn-sm" id="btn-add-asset"><i class="fas fa-plus"></i> Add Asset</button>
        </div>
      </div>
      <div id="asset-search-feedback" style="display:none; align-items:center; justify-content:space-between; padding:10px 16px; margin: 12px 16px 0; background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.2); border-radius:var(--radius-md); font-size:13px; color:var(--text-primary);">
        <div>
          <i class="fas fa-filter" style="color:var(--accent); margin-right:6px;"></i>
          <span>Showing <strong id="asset-filtered-count">0</strong> of <strong id="asset-total-count">0</strong> assets matching <span id="asset-search-summary" style="font-weight:600; color:var(--accent-light);"></span></span>
        </div>
        <button class="btn btn-link btn-sm" id="btn-clear-asset-search" style="padding:0; color:var(--danger); text-decoration:none; font-size:12px; font-weight:600; display:flex; align-items:center; gap:4px; border:none; background:none; cursor:pointer;"><i class="fas fa-times-circle"></i> Clear Filters</button>
      </div>
      <div class="table-container"><table><thead><tr><th>Asset ID</th><th>Name</th><th>Category</th><th>Assigned To</th><th>Status</th><th>Value</th><th style="width:100px">Actions</th></tr></thead>
      <tbody id="asset-tbody"></tbody></table></div>
    </div>`;

    // Inject counts via textContent (safe)
    document.getElementById('asset-stat-total').textContent = total;
    document.getElementById('asset-stat-inuse').textContent = inUse;
    document.getElementById('asset-stat-maint').textContent = maint;
    document.getElementById('asset-stat-retired').textContent = retired;

    function renderRows() {
      const q = (document.getElementById('asset-search')?.value || '').toLowerCase().trim();
      const statusFilter = document.getElementById('asset-status-filter')?.value || '';

      const tbody = document.getElementById('asset-tbody');
      if (!tbody) return;
      tbody.innerHTML = '';

      const filtered = assets.filter(a => {
        const matchesQuery = q === '' ||
          a.id.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          (a.assignedTo || '').toLowerCase().includes(q);

        const matchesStatus = statusFilter === '' || a.status === statusFilter;

        return matchesQuery && matchesStatus;
      });

      // Update feedback banner
      const feedbackDiv = document.getElementById('asset-search-feedback');
      const filteredCountEl = document.getElementById('asset-filtered-count');
      const totalCountEl = document.getElementById('asset-total-count');
      const summaryEl = document.getElementById('asset-search-summary');

      if (feedbackDiv) {
        if (q !== '' || statusFilter !== '') {
          feedbackDiv.style.display = 'flex';
          if (filteredCountEl) filteredCountEl.textContent = filtered.length;
          if (totalCountEl) totalCountEl.textContent = total;

          if (summaryEl) {
            let summaryText = '';
            if (q !== '') summaryText += `"${q}"`;
            if (statusFilter !== '') {
              if (summaryText !== '') summaryText += ' in ';
              summaryText += `status "${statusFilter}"`;
            }
            summaryEl.textContent = summaryText;
          }
        } else {
          feedbackDiv.style.display = 'none';
        }
      }

      if (filtered.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 7;
        td.style.cssText = 'text-align:center;padding:40px;color:var(--text-muted);font-style:italic;';
        td.innerHTML = '<i class="fas fa-search" style="margin-right:8px;font-size:16px;"></i> No assets match your search.';
        tr.appendChild(td);
        tbody.appendChild(tr);
      } else {
        filtered.forEach(a => tbody.appendChild(buildRow(a)));
      }
    }

    // Initial table render
    renderRows();

    // Bind search and filter events
    document.getElementById('asset-search')?.addEventListener('input', renderRows);
    document.getElementById('asset-status-filter')?.addEventListener('change', renderRows);
    document.getElementById('btn-clear-asset-search')?.addEventListener('click', () => {
      const searchEl = document.getElementById('asset-search');
      const statusEl = document.getElementById('asset-status-filter');
      if (searchEl) searchEl.value = '';
      if (statusEl) statusEl.value = '';
      renderRows();
    });

    // ── Bind "+ Add Asset" ──
    document.getElementById('btn-add-asset').addEventListener('click', () => {
      showModal({
        title: '<i class="fas fa-laptop" style="color:var(--cyan)"></i> Add New Asset',
        submitLabel: 'Add Asset',
        fields: [
          { name: 'name', label: 'Asset Name', required: true, placeholder: 'e.g. MacBook Pro 14"' },
          { name: 'category', label: 'Category', type: 'select', options: ['Laptop', 'Monitor', 'Furniture', 'AV Equipment', 'Networking', 'Printer', 'Phone', 'Tablet', 'Server', 'Other'], default: 'Laptop' },
          { name: 'assignedTo', label: 'Assigned To', placeholder: 'Employee name or location' },
          { name: 'status', label: 'Status', type: 'select', options: ['In Use', 'Available', 'Maintenance', 'Retired'], default: 'In Use' },
          { name: 'value', label: 'Value (₹)', required: true, type: 'number', placeholder: 'e.g. 75000' }
        ],
        onSubmit(data, close) {
          const assets = getAssets();
          assets.push({
            id: nextId(assets),
            name: data.name,
            category: data.category,
            assignedTo: data.assignedTo || '',
            status: data.status,
            value: parseFloat(data.value) || 0
          });
          saveAssets(assets);
          showToast('Asset added successfully!', 'success');
          close();
          render();
        }
      });
    });

    // ── Bind Edit and Delete actions via Event Delegation ──
    const tbody = document.getElementById('asset-tbody');
    tbody?.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.asset-edit-btn');
      const delBtn = e.target.closest('.asset-del-btn');
      if (editBtn) {
        handleEditAsset(editBtn.dataset.id);
      } else if (delBtn) {
        handleDeleteAsset(delBtn.dataset.id);
      }
    });

    // ── Asset Stat Card Click Handlers ──
    document.getElementById('asset-card-total')?.addEventListener('click', () => {
      const totalVal = document.getElementById('asset-stat-total')?.textContent || '0';
      const totalValue = assets.reduce((s, a) => s + (a.value || 0), 0);
      showModal({
        title: '<i class="fas fa-laptop" style="color:var(--cyan)"></i> Asset Portfolio Value',
        submitLabel: 'Export CSV',
        fields: [
          { label: 'Total Inventory', default: totalVal + ' Assets', readonly: true },
          { label: 'Portfolio Book Value', default: '₹' + totalValue.toLocaleString('en-IN'), readonly: true },
          { label: 'Depreciation Rate', default: '15% Annual', readonly: true }
        ],
        onSubmit(data, close) {
          showToast('Asset register exported to CSV format.', 'success');
          close();
        }
      });
    });

    document.getElementById('asset-card-inuse')?.addEventListener('click', () => {
      const inUseVal = document.getElementById('asset-stat-inuse')?.textContent || '0';
      showModal({
        title: '<i class="fas fa-circle-check" style="color:var(--success)"></i> Operational Assets',
        submitLabel: 'Filter In-Use',
        fields: [
          { label: 'Currently In Use', default: inUseVal, readonly: true },
          { label: 'Utilization Rate', default: ((parseInt(inUseVal) / assets.length) * 100).toFixed(1) + '%', readonly: true },
          { label: 'Avg Unit Age', default: '1.4 Years', readonly: true }
        ],
        onSubmit(data, close) {
          const filter = document.getElementById('asset-status-filter');
          if (filter) { filter.value = 'In Use'; renderRows(); }
          close();
        }
      });
    });

    document.getElementById('asset-card-maint')?.addEventListener('click', () => {
      const maintVal = document.getElementById('asset-stat-maint')?.textContent || '0';
      showModal({
        title: '<i class="fas fa-wrench" style="color:var(--warning)"></i> Maintenance Schedule',
        submitLabel: 'Filter Maintenance',
        fields: [
          { label: 'Units Under Repair', default: maintVal, readonly: true },
          { label: 'Avg Down Time', default: '4.2 Business Days', readonly: true },
          { label: 'Next Major Audit', default: 'July 15, 2026', readonly: true }
        ],
        onSubmit(data, close) {
          const filter = document.getElementById('asset-status-filter');
          if (filter) { filter.value = 'Maintenance'; renderRows(); }
          close();
        }
      });
    });

    document.getElementById('asset-card-retired')?.addEventListener('click', () => {
      const retiredVal = document.getElementById('asset-stat-retired')?.textContent || '0';
      showModal({
        title: '<i class="fas fa-box-archive" style="color:var(--danger)"></i> Asset Retirement summary',
        submitLabel: 'Filter Retired',
        fields: [
          { label: 'Retired Assets', default: retiredVal, readonly: true },
          { label: 'Recovery Value', default: '₹' + (parseInt(retiredVal) * 12500).toLocaleString('en-IN'), readonly: true },
          { label: 'Disposal Method', default: 'E-waste Recycling', readonly: true }
        ],
        onSubmit(data, close) {
          const filter = document.getElementById('asset-status-filter');
          if (filter) { filter.value = 'Retired'; renderRows(); }
          close();
        }
      });
    });
  }

  // Initial render
  render();
};

/* Legal & Compliance */
pages.legal = function (container) {

  // ── localStorage helpers ──
  const LS_KEY = 'amdox_contracts';
  const SEED_CONTRACTS = [
    { id: 1, name: 'Master Service Agreement', party: 'Infosys Ltd', type: 'Service', startDate: 'Jan 2025', endDate: 'Dec 2026', status: 'Active', gdpr: 'Yes' },
    { id: 2, name: 'NDA — CloudHost', party: 'CloudHost Inc', type: 'NDA', startDate: 'Mar 2026', endDate: 'Mar 2027', status: 'Active', gdpr: 'Yes' },
    { id: 3, name: 'Vendor Agreement', party: 'TechSupply Co', type: 'Vendor', startDate: 'Jun 2025', endDate: 'Jun 2026', status: 'Expiring', gdpr: 'No' }
  ];

  function getContracts() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || SEED_CONTRACTS; } catch { return SEED_CONTRACTS; }
  }
  function saveContracts(list) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch { }
  }
  function nextId(list) {
    return list.length ? Math.max(...list.map(c => c.id)) + 1 : 1;
  }
  function esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  }

  // ── Status badge class helper ──
  function statusClass(s) {
    switch (s) {
      case 'Active': return 'badge-success';
      case 'Expiring': return 'badge-danger';
      case 'Terminated': return 'badge-warning';
      case 'Pending Approval': return 'badge-info';
      default: return 'badge-info';
    }
  }

  // ── Build a table row using safe DOM APIs ──
  function buildRow(c) {
    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    tdName.style.fontWeight = '600';
    tdName.style.display = 'flex';
    tdName.style.alignItems = 'center';
    tdName.style.gap = '8px';
    tdName.textContent = c.name;

    if (c.gdpr !== 'No') {
      const gBadge = document.createElement('span');
      gBadge.className = 'badge badge-success';
      gBadge.style.cssText = 'font-size:10px; padding:2px 6px; font-weight:600; display:inline-flex; align-items:center; gap:3px; background:rgba(34,197,94,0.12); color:var(--success); border:1px solid rgba(34,197,94,0.25); margin:0;';
      gBadge.innerHTML = '<i class="fas fa-shield-halved"></i> GDPR';
      tdName.appendChild(gBadge);
    }

    tr.appendChild(tdName);

    const tdParty = document.createElement('td');
    tdParty.textContent = c.party;
    tr.appendChild(tdParty);

    const tdType = document.createElement('td');
    tdType.textContent = c.type;
    tr.appendChild(tdType);

    const tdStart = document.createElement('td');
    tdStart.textContent = c.startDate;
    tr.appendChild(tdStart);

    const tdEnd = document.createElement('td');
    tdEnd.textContent = c.endDate;
    tr.appendChild(tdEnd);

    const tdStatus = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = 'badge ' + statusClass(c.status);
    badge.textContent = c.status;
    tdStatus.appendChild(badge);
    tr.appendChild(tdStatus);

    const tdAct = document.createElement('td');
    const actWrap = document.createElement('div');
    actWrap.style.cssText = 'display:flex;gap:6px';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-secondary btn-sm contract-edit-btn';
    editBtn.dataset.id = c.id;
    editBtn.style.cssText = 'padding:4px 10px;font-size:11px';
    editBtn.title = 'Edit';
    editBtn.innerHTML = '<i class="fas fa-pen"></i>';
    actWrap.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-secondary btn-sm contract-del-btn';
    delBtn.dataset.id = c.id;
    delBtn.style.cssText = 'padding:4px 10px;font-size:11px;color:var(--danger)';
    delBtn.title = 'Delete';
    delBtn.innerHTML = '<i class="fas fa-trash"></i>';
    actWrap.appendChild(delBtn);

    tdAct.appendChild(actWrap);
    tr.appendChild(tdAct);

    return tr;
  }

  // ── Edit Contract ──
  function handleEditContract(contractId) {
    const list = getContracts();
    const contract = list.find(c => c.id === contractId);
    if (!contract) return;
    showModal({
      title: '<i class="fas fa-pen" style="color:var(--accent-light)"></i> Edit Contract',
      submitLabel: 'Save Changes',
      fields: [
        { name: 'name', label: 'Contract Name', required: true, default: contract.name },
        { name: 'party', label: 'Counterparty', required: true, default: contract.party },
        { name: 'type', label: 'Contract Type', type: 'select', options: ['Service', 'NDA', 'Vendor', 'Employment', 'SaaS', 'Lease', 'Partnership', 'Other'], default: contract.type },
        { name: 'startDate', label: 'Start Date', required: true, default: contract.startDate },
        { name: 'endDate', label: 'End Date', required: true, default: contract.endDate },
        { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Expiring', 'Terminated', 'Pending Approval'], default: contract.status },
        { name: 'gdpr', label: 'GDPR Compliant', type: 'select', options: [{ value: 'Yes', label: '✅ Yes' }, { value: 'No', label: '❌ No' }], default: contract.gdpr || 'Yes' }
      ],
      onSubmit(data, close) {
        const currentList = getContracts();
        const idx = currentList.findIndex(c => c.id === contract.id);
        if (idx !== -1) {
          currentList[idx] = { ...currentList[idx], name: data.name, party: data.party, type: data.type, startDate: data.startDate, endDate: data.endDate, status: data.status, gdpr: data.gdpr };
          saveContracts(currentList);
          showToast(`Contract for "${data.party}" updated successfully!`, 'success');
        }
        close();
        render();
      }
    });
  }

  // ── Delete Contract ──
  function handleDeleteContract(contractId) {
    const list = getContracts();
    const contract = list.find(c => c.id === contractId);
    if (!contract) return;
    const confirmMsg = 'Are you sure you want to delete contract <strong style="color:var(--accent-light)">' + esc(contract.name) + '</strong> with <strong>' + esc(contract.party) + '</strong>?';
    showConfirm(confirmMsg, () => {
      const updatedList = getContracts().filter(c => c.id !== contractId);
      saveContracts(updatedList);
      const toastMsg = 'Contract for <strong>' + esc(contract.party) + '</strong> has been deleted successfully!';
      showToast(toastMsg, 'success');
      render();
    });
  }

  // ── Render page ──
  function render() {
    const contracts = getContracts();
    const total = contracts.length;
    const active = contracts.filter(c => c.status === 'Active').length;
    const expiring = contracts.filter(c => c.status === 'Expiring').length;
    const pending = contracts.filter(c => c.status === 'Pending Approval').length;

    // Static chrome
    container.innerHTML = `
    <div class="module-hero">
      <h2><i class="fas fa-gavel" style="color:var(--warning)"></i> Legal & Compliance</h2>
      <p>Contract management, compliance workflows, legal approvals, document storage, and regulatory tracking.</p>
    </div>
    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr) !important;">
      <div class="stat-card" id="legal-card-active" style="cursor:pointer;"><div class="stat-card-header"><div class="stat-icon yellow"><i class="fas fa-file-contract"></i></div></div><div class="stat-value" id="contract-stat-active">0</div><div class="stat-label">Active Contracts</div></div>
      <div class="stat-card" id="legal-card-gdpr" style="cursor:pointer;"><div class="stat-card-header"><div class="stat-icon green"><i class="fas fa-check-double"></i></div></div><div class="stat-value" id="contract-stat-gdpr">100%</div><div class="stat-label">GDPR Compliant</div></div>
      <div class="stat-card" id="legal-card-expiring" style="cursor:pointer;"><div class="stat-card-header"><div class="stat-icon red"><i class="fas fa-clock"></i></div></div><div class="stat-value" id="contract-stat-expiring">0</div><div class="stat-label">Expiring Soon</div></div>
      <div class="stat-card" id="legal-card-pending" style="cursor:pointer;"><div class="stat-card-header"><div class="stat-icon purple"><i class="fas fa-stamp"></i></div></div><div class="stat-value" id="contract-stat-pending">0</div><div class="stat-label">Pending Approvals</div></div>
    </div>
    <div class="card">
      <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <span class="card-title">Contracts</span>
        <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
          <div style="position:relative; display:flex; align-items:center;">
            <i class="fas fa-search" style="position:absolute; left:10px; color:var(--text-muted); font-size:12px;"></i>
            <input type="text" class="form-control" id="contract-search" placeholder="Search contracts..." style="width:200px; padding:6px 12px 6px 28px; font-size:13px;">
          </div>
          <select class="form-control" id="contract-status-filter" style="width:150px; padding:6px 10px; font-size:13px;">
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Expiring">Expiring</option>
            <option value="Terminated">Terminated</option>
            <option value="Pending Approval">Pending Approval</option>
          </select>
          <button class="btn btn-primary btn-sm" id="btn-add-contract"><i class="fas fa-plus"></i> New Contract</button>
        </div>
      </div>
      <div id="contract-search-feedback" style="display:none; align-items:center; justify-content:space-between; padding:10px 16px; margin: 12px 16px 0; background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.2); border-radius:var(--radius-md); font-size:13px; color:var(--text-primary);">
        <div>
          <i class="fas fa-filter" style="color:var(--accent); margin-right:6px;"></i>
          <span>Showing <strong id="contract-filtered-count">0</strong> of <strong id="contract-total-count">0</strong> contracts matching <span id="contract-search-summary" style="font-weight:600; color:var(--accent-light);"></span></span>
        </div>
        <button class="btn btn-link btn-sm" id="btn-clear-contract-search" style="padding:0; color:var(--danger); text-decoration:none; font-size:12px; font-weight:600; display:flex; align-items:center; gap:4px; border:none; background:none; cursor:pointer;"><i class="fas fa-times-circle"></i> Clear Filters</button>
      </div>
      <div class="table-container"><table><thead><tr><th>Contract</th><th>Party</th><th>Type</th><th>Start</th><th>End</th><th>Status</th><th style="width:100px">Actions</th></tr></thead>
      <tbody id="contract-tbody"></tbody></table></div>
    </div>`;

    // Inject counts via textContent (safe)
    const compliantCount = contracts.filter(c => c.gdpr !== 'No').length;
    const gdprPercent = total > 0 ? Math.round((compliantCount / total) * 100) : 100;
    document.getElementById('contract-stat-active').textContent = active;
    document.getElementById('contract-stat-gdpr').textContent = gdprPercent + '%';
    document.getElementById('contract-stat-expiring').textContent = expiring;
    document.getElementById('contract-stat-pending').textContent = pending;

    function renderRows() {
      const q = (document.getElementById('contract-search')?.value || '').toLowerCase().trim();
      const statusFilter = document.getElementById('contract-status-filter')?.value || '';

      const tbody = document.getElementById('contract-tbody');
      if (!tbody) return;
      tbody.innerHTML = '';

      const filtered = contracts.filter(c => {
        const matchesQuery = q === '' ||
          c.name.toLowerCase().includes(q) ||
          c.party.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q) ||
          c.startDate.toLowerCase().includes(q) ||
          c.endDate.toLowerCase().includes(q);

        const matchesStatus = statusFilter === '' || c.status === statusFilter;

        return matchesQuery && matchesStatus;
      });

      // Update feedback banner
      const feedbackDiv = document.getElementById('contract-search-feedback');
      const filteredCountEl = document.getElementById('contract-filtered-count');
      const totalCountEl = document.getElementById('contract-total-count');
      const summaryEl = document.getElementById('contract-search-summary');

      if (feedbackDiv) {
        if (q !== '' || statusFilter !== '') {
          feedbackDiv.style.display = 'flex';
          if (filteredCountEl) filteredCountEl.textContent = filtered.length;
          if (totalCountEl) totalCountEl.textContent = total;

          if (summaryEl) {
            let summaryText = '';
            if (q !== '') summaryText += `"${q}"`;
            if (statusFilter !== '') {
              if (summaryText !== '') summaryText += ' in ';
              summaryText += `status "${statusFilter}"`;
            }
            summaryEl.textContent = summaryText;
          }
        } else {
          feedbackDiv.style.display = 'none';
        }
      }

      if (filtered.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 7;
        td.style.cssText = 'text-align:center;padding:40px;color:var(--text-muted);font-style:italic;';
        td.innerHTML = '<i class="fas fa-search" style="margin-right:8px;font-size:16px;"></i> No contracts match your search.';
        tr.appendChild(td);
        tbody.appendChild(tr);
      } else {
        filtered.forEach(c => tbody.appendChild(buildRow(c)));
      }
    }

    // Initial table render
    renderRows();

    // Bind search and filter events
    document.getElementById('contract-search')?.addEventListener('input', renderRows);
    document.getElementById('contract-status-filter')?.addEventListener('change', renderRows);
    document.getElementById('btn-clear-contract-search')?.addEventListener('click', () => {
      const searchEl = document.getElementById('contract-search');
      const statusEl = document.getElementById('contract-status-filter');
      if (searchEl) searchEl.value = '';
      if (statusEl) statusEl.value = '';
      renderRows();
    });

    // ── Bind "New Contract" button ──
    document.getElementById('btn-add-contract').addEventListener('click', () => {
      showModal({
        title: '<i class="fas fa-file-contract" style="color:var(--warning)"></i> Create New Contract',
        submitLabel: 'Create Contract',
        fields: [
          { name: 'name', label: 'Contract Name', required: true, placeholder: 'e.g. Master Service Agreement' },
          { name: 'party', label: 'Counterparty', required: true, placeholder: 'e.g. Infosys Ltd' },
          { name: 'type', label: 'Contract Type', type: 'select', options: ['Service', 'NDA', 'Vendor', 'Employment', 'SaaS', 'Lease', 'Partnership', 'Other'], default: 'Service' },
          { name: 'startDate', label: 'Start Date', required: true, placeholder: 'e.g. Jan 2025' },
          { name: 'endDate', label: 'End Date', required: true, placeholder: 'e.g. Dec 2026' },
          { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Expiring', 'Terminated', 'Pending Approval'], default: 'Active' },
          { name: 'gdpr', label: 'GDPR Compliant', type: 'select', options: [{ value: 'Yes', label: '✅ Yes' }, { value: 'No', label: '❌ No' }], default: 'Yes' }
        ],
        onSubmit(data, close) {
          const list = getContracts();
          list.push({
            id: nextId(list),
            name: data.name,
            party: data.party,
            type: data.type,
            startDate: data.startDate,
            endDate: data.endDate,
            status: data.status,
            gdpr: data.gdpr
          });
          saveContracts(list);
          showToast(`Contract for "${data.party}" added successfully!`, 'success');
          close();
          render();
        }
      });
    });

    // ── Bind Edit and Delete actions via Event Delegation ──
    tbody?.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.contract-edit-btn');
      const delBtn = e.target.closest('.contract-del-btn');
      if (editBtn) {
        handleEditContract(parseInt(editBtn.dataset.id));
      } else if (delBtn) {
        handleDeleteContract(parseInt(delBtn.dataset.id));
      }
    });

    // ── Legal Stat Card Click Handlers ──
    document.getElementById('legal-card-active')?.addEventListener('click', () => {
      const activeVal = document.getElementById('contract-stat-active')?.textContent || '0';
      showModal({
        title: '<i class="fas fa-file-contract" style="color:var(--warning)"></i> Contract Portfolio Health',
        submitLabel: 'Export Register',
        fields: [
          { label: 'Active Agreements', default: activeVal, readonly: true },
          { label: 'Risk Rating', default: 'Low (0.4%)', readonly: true },
          { label: 'Avg Cycle Time', default: '14 Days', readonly: true }
        ],
        onSubmit(data, close) {
          showToast('Full contract register exported to PDF.', 'success');
          close();
        }
      });
    });

    document.getElementById('legal-card-gdpr')?.addEventListener('click', () => {
      const gdprVal = document.getElementById('contract-stat-gdpr')?.textContent || '100%';
      showModal({
        title: '<i class="fas fa-check-double" style="color:var(--success)"></i> Regulatory Compliance',
        submitLabel: 'Download Certificate',
        fields: [
          { label: 'GDPR Score', default: gdprVal, readonly: true },
          { label: 'Data Residency', default: 'EU / Mumbai Region', readonly: true },
          { label: 'Last External Audit', default: 'May 10, 2026', readonly: true }
        ],
        onSubmit(data, close) {
          showToast('Compliance certification downloaded successfully.', 'success');
          close();
        }
      });
    });

    document.getElementById('legal-card-expiring')?.addEventListener('click', () => {
      const expiringVal = document.getElementById('contract-stat-expiring')?.textContent || '0';
      showModal({
        title: '<i class="fas fa-clock" style="color:var(--danger)"></i> Renewal Alerts',
        submitLabel: 'Filter Expiring',
        fields: [
          { label: 'Agreements Expiring', default: expiringVal, readonly: true },
          { label: 'Auto-Renew Active', default: '84%', readonly: true },
          { label: 'Renewal Pipeline', default: '₹12.4L Value', readonly: true }
        ],
        onSubmit(data, close) {
          const filter = document.getElementById('contract-status-filter');
          if (filter) { filter.value = 'Expiring'; renderRows(); }
          close();
        }
      });
    });

    document.getElementById('legal-card-pending')?.addEventListener('click', () => {
      const pendingVal = document.getElementById('contract-stat-pending')?.textContent || '0';
      showModal({
        title: '<i class="fas fa-stamp" style="color:var(--purple)"></i> Approval Workflow',
        submitLabel: 'Filter Pending',
        fields: [
          { label: 'Awaiting Signature', default: pendingVal, readonly: true },
          { label: 'Bottleneck Stage', default: 'Financial Review', readonly: true },
          { label: 'Est. Completion', default: '2 Business Days', readonly: true }
        ],
        onSubmit(data, close) {
          const filter = document.getElementById('contract-status-filter');
          if (filter) { filter.value = 'Pending Approval'; renderRows(); }
          close();
        }
      });
    });
  }

  // Initial render
  render();
};