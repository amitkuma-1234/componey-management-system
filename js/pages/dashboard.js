window.pages = window.pages || {};
var pages = window.pages;
/* ============================================================
   Dashboard Page — Reads from db
   ============================================================ */
pages.dashboard = function(container) {
  const stats = db.table('dashboardStats').getAll();
  const activity = db.table('recentActivity').getAll();
  const approvals = db.table('pendingApprovals').getAll();
  const performers = db.table('topPerformers').getAll();
  const health = db.table('systemHealth').getAll();

  // Dynamically update Active Employees count from database
  const employeeStat = stats.find(s => s.id === 2 || s.label === 'Active Employees');
  if (employeeStat) {
    employeeStat.value = db.table('employees').count().toString();
  }

  // ── Low Stock Alerts for Dashboard ──
  const lowStockAlerts = db.table('lowStockAlerts').getAll();
  const products = db.table('products').getAll();

  // Also find any products marked 'Low Stock' that aren't already in the alerts table
  const alertNames = lowStockAlerts.map(a => a.name);
  const additionalLowStock = products.filter(p => p.status === 'Low Stock' && !alertNames.includes(p.name));
  const allAlerts = [
    ...lowStockAlerts,
    ...additionalLowStock.map(p => ({
      id: 'prod-' + p.id,
      name: p.name,
      stock: p.stock,
      reorderLevel: Math.max(20, Math.round(p.stock * 2.5)),
      severity: p.stock <= 5 ? 'critical' : 'warning',
      watched: false
    }))
  ];

  const criticalCount = allAlerts.filter(a => a.severity === 'critical').length;

  const lowStockHTML = allAlerts.map(a => {
    const isCritical = a.severity === 'critical';
    const watched = a.watched ? true : false;
    const stockPct = Math.min(100, Math.round((a.stock / a.reorderLevel) * 100));
    const barColor = stockPct <= 25 ? 'var(--danger)' : stockPct <= 50 ? 'var(--warning)' : 'var(--success)';

    const actionBtn = isCritical
      ? `<button class="btn btn-primary btn-sm" onclick="reorderLowStockItem('${a.id}')"><i class="fas fa-truck-fast" style="margin-right:4px"></i>Reorder</button>`
      : `<button class="btn btn-${watched?'success':'secondary'} btn-sm" onclick="watchLowStockItem('${a.id}')" id="watch-btn-${a.id}">${watched?'<i class=\"fas fa-eye\" style=\"margin-right:4px\"></i>Watching':'<i class=\"fas fa-eye\" style=\"margin-right:4px\"></i>Watch'}</button>`;

    return `<div class="list-item" style="flex-wrap:wrap;gap:8px">
      <div class="list-icon" style="background:${isCritical?'rgba(239,68,68,0.12)':'rgba(245,158,11,0.12)'};color:${isCritical?'var(--danger)':'var(--warning)'}">
        <i class="fas ${isCritical?'fa-exclamation':'fa-triangle-exclamation'}"></i>
      </div>
      <div class="list-content" style="flex:1;min-width:140px">
        <div class="list-title">${a.name}</div>
        <div class="list-subtitle">Stock: ${a.stock} / Reorder: ${a.reorderLevel}</div>
        <div class="progress-bar" style="margin-top:6px;height:4px">
          <div style="width:${stockPct}%;height:100%;border-radius:4px;background:${barColor};transition:width 0.6s ease"></div>
        </div>
      </div>
      <span class="badge badge-${isCritical?'danger':'warning'}" style="font-size:10px">${isCritical?'Critical':'Warning'}</span>
      ${actionBtn}
    </div>`;
  }).join('');

  const statsHTML = stats.map((s, i) => `
    <div class="stat-card animate-slide-up" style="animation-delay:${i*0.1}s; cursor:pointer" onclick="window.viewStatDetail('Dashboard', '${s.label}')">
      <div class="stat-card-header">
        <div class="stat-icon ${s.color}"><i class="fas ${s.icon}"></i></div>
        <span class="stat-trend up"><i class="fas fa-arrow-up"></i> ${s.trend}</span>
      </div>
      <div class="stat-value">${s.value}</div>
      <div class="stat-label">${s.label}</div>
      <div class="progress-bar" style="margin-top:10px"><div class="progress-fill ${s.color}" style="width:${s.progress}%"></div></div>
    </div>`).join('');

  const activityHTML = activity.map(a => `
    <div class="activity-item" style="cursor:pointer" onclick="window.viewStatDetail('Activity', '${a.text}')"><div class="activity-dot ${a.dot}"></div><div><div class="activity-text">${a.text}</div><div class="activity-time">${a.time}</div></div></div>`).join('');

  const approvalsHTML = approvals.map(a => `
    <div class="list-item" style="cursor:pointer" onclick="window.viewStatDetail('Approval', '${a.title}')"><div class="list-icon" style="background:${a.iconBg};color:${a.iconColor}"><i class="fas ${a.icon}"></i></div><div class="list-content"><div class="list-title">${a.title}</div><div class="list-subtitle">${a.subtitle}</div></div></div>`).join('');

  const performersHTML = performers.map(p => `
    <div class="list-item" style="cursor:pointer" onclick="window.viewStatDetail('HR', '${p.name}')"><div class="user-avatar" style="background:${p.gradient};width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff">${p.initials}</div><div class="list-content"><div class="list-title">${p.name}</div><div class="list-subtitle">${p.dept} · ${p.kpi} KPI</div></div><span class="badge ${p.badgeClass}">${p.badge}</span></div>`).join('');

  const healthHTML = health.map(h => `
    <div class="list-item" style="cursor:pointer" onclick="window.viewStatDetail('System', '${h.name}')"><div class="list-icon" style="background:${h.iconBg};color:${h.iconColor}"><i class="fas ${h.icon}"></i></div><div class="list-content"><div class="list-title">${h.name}</div><div class="list-subtitle">${h.detail}</div></div><span class="badge badge-${h.status==='Healthy'?'success':'warning'}">${h.status}</span></div>`).join('');

  container.innerHTML = `
    <div class="page-header">
      <div><h2>Welcome back, Amit 👋</h2><p>Here's what's happening across your organization today.</p></div>
      <div class="page-actions">
        <div class="dropdown-wrapper" style="position:relative">
          <button class="btn btn-secondary btn-sm" onclick="window.toggleExportDropdown(event)">
            <i class="fas fa-download"></i> Export <i class="fas fa-chevron-down" style="font-size:10px;margin-left:4px"></i>
          </button>
          <div class="chart-dropdown" id="export-dropdown" style="width:160px">
            <a href="#" onclick="window.exportHRReport(); window.toggleExportDropdown(event)">
              <i class="fas fa-file-pdf"></i> Download PDF
            </a>
            <a href="#" onclick="window.exportEmployeesCSV(); window.toggleExportDropdown(event)">
              <i class="fas fa-file-csv"></i> Download CSV
            </a>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="window.openQuickActions()"><i class="fas fa-plus"></i> Quick Action</button>
      </div>
    </div>
    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr) !important;">${statsHTML}</div>
    <div class="grid-2" style="grid-template-columns: repeat(2, 1fr) !important;">
      <div class="card"><div class="card-header"><div><span class="card-title">Revenue vs Expenses</span><br><span class="card-subtitle">Last 12 months overview</span></div><div class="chart-menu-wrapper" style="position:relative"><button class="btn btn-secondary btn-sm" onclick="window.toggleChartMenu(event,'chart-menu-revenue')"><i class="fas fa-ellipsis"></i></button><div class="chart-dropdown" id="chart-menu-revenue"><a href="#" onclick="window.downloadChartPNG(event,'revenue')"><i class="fas fa-image"></i> Download PNG</a><a href="#" onclick="window.exportChartCSV(event,'revenue')"><i class="fas fa-file-csv"></i> Export CSV</a><div class="dropdown-divider"></div><a href="#" onclick="window.refreshChart(event,'revenue')"><i class="fas fa-rotate"></i> Refresh</a><a href="#" onclick="window.fullscreenChart(event,'revenue')"><i class="fas fa-expand"></i> Fullscreen</a></div></div></div><div class="chart-container"><canvas data-chart="revenue"></canvas></div></div>
      <div class="card"><div class="card-header"><div><span class="card-title">Module Usage</span><br><span class="card-subtitle">Resource distribution</span></div><div class="chart-menu-wrapper" style="position:relative"><button class="btn btn-secondary btn-sm" onclick="window.toggleChartMenu(event,'chart-menu-doughnut')"><i class="fas fa-ellipsis"></i></button><div class="chart-dropdown" id="chart-menu-doughnut"><a href="#" onclick="window.downloadChartPNG(event,'doughnut')"><i class="fas fa-image"></i> Download PNG</a><a href="#" onclick="window.exportChartCSV(event,'doughnut')"><i class="fas fa-file-csv"></i> Export CSV</a><div class="dropdown-divider"></div><a href="#" onclick="window.refreshChart(event,'doughnut')"><i class="fas fa-rotate"></i> Refresh</a><a href="#" onclick="window.fullscreenChart(event,'doughnut')"><i class="fas fa-expand"></i> Fullscreen</a></div></div></div><div class="chart-container"><canvas data-chart="doughnut"></canvas></div></div>
    </div>
    <div class="card" style="border-left:3px solid var(--danger)">
      <div class="card-header">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(239,68,68,0.12);display:flex;align-items:center;justify-content:center;color:var(--danger)"><i class="fas fa-exclamation-triangle"></i></div>
          <div>
            <span class="card-title">Low Stock Alerts</span>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">Items requiring attention across all warehouses</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="badge badge-danger">${criticalCount} critical</span>
          <span class="badge badge-warning">${allAlerts.length - criticalCount} warning</span>
          <a href="#inventory" class="btn btn-secondary btn-sm"><i class="fas fa-arrow-right" style="margin-right:4px"></i>View All</a>
        </div>
      </div>
      <div class="activity-list" style="max-height:400px;overflow-y:auto">${lowStockHTML}</div>
    </div>
    <div class="grid-2" style="grid-template-columns: repeat(2, 1fr) !important;">
      <div class="card"><div class="card-header"><span class="card-title">Recent Activity</span><a href="#notifications" class="btn btn-secondary btn-sm">View All</a></div><div class="activity-list">${activityHTML}</div></div>
      <div class="card"><div class="card-header"><span class="card-title">Weekly Task Overview</span><button class="btn btn-secondary btn-sm" onclick="window.showWeeklyTasks()"><i class="fas fa-calendar"></i> This Week</button></div><div class="chart-container"><canvas data-chart="bar"></canvas></div></div>
    </div>
    <div class="grid-3" style="grid-template-columns: repeat(3, 1fr) !important;">
      <div class="card"><div class="card-header"><span class="card-title">Pending Approvals</span><span class="badge badge-warning">${approvals.length} pending</span></div><div class="activity-list">${approvalsHTML}</div></div>
      <div class="card"><div class="card-header"><span class="card-title">Top Performers</span><span class="badge badge-success">This Month</span></div><div class="activity-list">${performersHTML}</div></div>
      <div class="card"><div class="card-header"><span class="card-title">System Health</span><span class="badge badge-success"><i class="fas fa-circle" style="font-size:6px"></i> All Systems Go</span></div><div class="activity-list">${healthHTML}</div></div>
    </div>`;
};
