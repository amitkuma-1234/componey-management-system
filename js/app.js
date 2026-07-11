/* ============================================================
   AMDOX ERP SUITE — Main Application Controller
   ============================================================ */

// ── API Base URL ──
const API_BASE = (window.location.protocol === 'file:' || window.location.hostname === '')
  ? 'http://localhost:3000/api'
  : window.location.origin + '/api';

// ── Profile Syncing & Logout Utilities ──
function updateSidebarAndProfile() {
  const userJson = localStorage.getItem('amdox_auth_user');
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      const initials = user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

      const sidebarAvatar = document.querySelector('.sidebar-user .user-avatar span:first-child');
      if (sidebarAvatar) sidebarAvatar.textContent = initials;

      const sidebarName = document.querySelector('.sidebar-user .user-name');
      if (sidebarName) sidebarName.textContent = user.name;
      const sidebarRole = document.querySelector('.sidebar-user .user-role');
      if (sidebarRole) sidebarRole.textContent = user.role;

      // Add role badge next to user role in sidebar footer
      const existingBadge = document.querySelector('.sidebar-user .role-badge');
      if (existingBadge) existingBadge.remove();
      if (sidebarRole) {
        const roleKey = getRoleKey(user.role);
        const roleColors = {
          admin: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Admin' },
          hr: { bg: 'rgba(168,85,247,0.15)', color: '#a855f7', label: 'HR' },
          manager: { bg: 'rgba(6,182,212,0.15)', color: '#06b6d4', label: 'Manager' },
          employee: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', label: 'Staff' }
        };
        const rc = roleColors[roleKey] || roleColors.employee;
        const badge = document.createElement('span');
        badge.className = 'role-badge';
        badge.textContent = rc.label;
        badge.style.cssText = `display:inline-block;margin-left:6px;padding:1px 6px;border-radius:4px;font-size:9px;font-weight:700;background:${rc.bg};color:${rc.color};letter-spacing:0.4px;vertical-align:middle;`;
        sidebarRole.appendChild(badge);
      }

      const topbarAvatar = document.querySelector('.topbar-profile .profile-avatar span');
      if (topbarAvatar) topbarAvatar.textContent = initials;
      const topbarName = document.querySelector('.topbar-profile .profile-name');
      if (topbarName) topbarName.textContent = user.name;
    } catch (e) {
      console.error('Error updating profile from localStorage:', e);
    }
  }
}

function logoutUser() {
  localStorage.removeItem('amdox_auth_token');
  localStorage.removeItem('amdox_auth_user');
  window.location.href = 'login.html';
}

// ── RBAC: Map role string → key ──
function getRoleKey(roleStr) {
  const r = (roleStr || '').toLowerCase();
  if (r.includes('admin')) return 'admin';
  if (r.includes('hr')) return 'hr';
  if (r.includes('manager')) return 'manager';
  return 'employee';
}

// ── RBAC: Show/hide sidebar items by role ──
function applyRoleSidebar() {
  let roleKey = 'employee';
  try {
    const u = JSON.parse(localStorage.getItem('amdox_auth_user') || '{}');
    roleKey = getRoleKey(u.role);
  } catch { }

  document.querySelectorAll('.nav-item[data-roles]').forEach(item => {
    const allowed = (item.dataset.roles || '').split(',').map(s => s.trim());
    // Admin sees everything; otherwise check allowed roles
    const visible = (roleKey === 'admin') || allowed.includes(roleKey);
    item.style.display = visible ? '' : 'none';
  });

  // Also hide section headings whose ALL items are hidden
  document.querySelectorAll('.nav-section').forEach(section => {
    const items = section.querySelectorAll('.nav-item');
    const anyVisible = Array.from(items).some(i => i.style.display !== 'none');
    const heading = section.querySelector('.nav-section-title');
    if (heading) heading.style.display = anyVisible ? '' : 'none';
  });
}

// ── Page Renderers (Global Registry) ──
window.pages = {};

// ── App Init ──
document.addEventListener('DOMContentLoaded', () => {
  updateSidebarAndProfile();
  applyRoleSidebar();

  // Intercept all manual logout links
  document.querySelectorAll('a[href="login.html"]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      logoutUser();
    });
  });

  setTimeout(() => {
    document.getElementById('preloader').classList.add('hidden');
    document.getElementById('app').classList.add('visible');
    applyRoleSidebar();
    initRouter();
    initSidebar();
    initTopbar();
    initAIPanel();
    initCommandPalette();
    initNotifications();
    initGlobalActions();
  }, 2200);
});

// ── Router ──
function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function handleRoute() {
  const hash = (location.hash || '#dashboard').replace('#', '');
  navigateTo(hash);
}

function navigateTo(page) {
  const container = document.getElementById('page-content');

  // ── Route Guard: block forbidden pages ──
  let roleKey = 'employee';
  try {
    const u = JSON.parse(localStorage.getItem('amdox_auth_user') || '{}');
    roleKey = getRoleKey(u.role);
  } catch { }
  const targetNav = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (targetNav) {
    const allowed = (targetNav.dataset.roles || '').split(',').map(s => s.trim());
    if (!allowed.includes(roleKey)) {
      showToast('⛔ Access denied — insufficient permissions.', 'error');
      page = 'dashboard';
      location.hash = 'dashboard';
    }
  }

  // Update nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');
  // Update breadcrumb
  const titles = {
    dashboard: 'Dashboard', analytics: 'Analytics & BI', 'ai-center': 'AI Command Center',
    hr: 'HR Management', finance: 'Finance & Accounting', inventory: 'Inventory & Supply Chain',
    crm: 'CRM', projects: 'Project Management', auth: 'Auth & Security',
    notifications: 'Notifications', assets: 'Asset Management', legal: 'Legal & Compliance',
    ecommerce: 'E-Commerce', communication: 'Communication', devops: 'DevOps & Deploy',
    settings: 'Settings'
  };
  const safePage = String(page);
  document.getElementById('breadcrumb-current').textContent = Object.hasOwn(titles, safePage) ? titles[safePage] : safePage;
  // Render page
  container.innerHTML = '';
  container.className = 'page-content animate-fade';

  // Robust lookup: check global pages object
  let renderFn = window.pages[safePage];

  // Fallback check
  if (!renderFn) {
    console.warn(`Page renderer for "${safePage}" not found. Falling back to dashboard.`);
    renderFn = window.pages.dashboard;
  }

  if (renderFn) renderFn(container);
  // Init charts after render
  setTimeout(() => initChartsOnPage(safePage), 100);
  // Close mobile sidebar
  // Close mobile sidebar + overlay
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.remove('mobile-open');
  const overlay = document.getElementById('sidebar-overlay');
  if (overlay) { overlay.classList.remove('active'); overlay.style.display = 'none'; }
}

// ── Sidebar ──
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebar-toggle');
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const overlay = document.getElementById('sidebar-overlay');

  // Desktop: collapse/expand sidebar
  toggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));

  // Mobile: open/close sidebar + overlay
  const openMobileSidebar = () => {
    sidebar.classList.add('mobile-open');
    overlay.style.display = 'block';
    requestAnimationFrame(() => overlay.classList.add('active'));
  };
  const closeMobileSidebar = () => {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
    setTimeout(() => { overlay.style.display = 'none'; }, 250);
  };

  mobileBtn.addEventListener('click', () => {
    if (sidebar.classList.contains('mobile-open')) {
      closeMobileSidebar();
    } else {
      openMobileSidebar();
    }
  });

  // Tap overlay to close sidebar
  if (overlay) {
    overlay.addEventListener('click', closeMobileSidebar);
  }

  // Search filter
  document.getElementById('sidebar-search-input').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.nav-item').forEach(item => {
      const text = item.querySelector('span')?.textContent.toLowerCase() || '';
      item.style.display = text.includes(q) ? '' : 'none';
    });
  });

  // Nav clicks — also close mobile sidebar
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      location.hash = page;
      // Close sidebar on mobile/tablet
      if (window.innerWidth <= 1024) {
        closeMobileSidebar();
      }
    });
  });

  // User menu button logout link
  const userMenuBtn = document.getElementById('user-menu-btn');
  if (userMenuBtn) {
    userMenuBtn.addEventListener('click', () => {
      logoutUser();
    });
  }
}

// ── Topbar ──
function initTopbar() {
  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.dataset.theme === 'dark';
    html.dataset.theme = isDark ? 'light' : 'dark';
    const icon = document.querySelector('#theme-toggle i');
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    showToast(isDark ? 'Light mode enabled' : 'Dark mode enabled', 'info');
  });

  // Fullscreen
  document.getElementById('fullscreen-btn').addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  });

  // Global search
  document.getElementById('global-search-input').addEventListener('focus', () => {
    openCommandPalette();
  });

  // Profile dropdown toggle
  const profileBtn = document.getElementById('topbar-profile');
  const dropdown = document.getElementById('profile-dropdown');
  if (profileBtn && dropdown) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
      if (dropdown.classList.contains('open')) {
        const rect = profileBtn.getBoundingClientRect();
        dropdown.style.top = (rect.bottom + 8) + 'px';
        dropdown.style.right = (window.innerWidth - rect.right) + 'px';
      }
    });
    document.addEventListener('click', (e) => {
      if (!profileBtn.contains(e.target)) dropdown.classList.remove('open');
    });
  }
}

// ── AI Panel ──
function initAIPanel() {
  const panel = document.getElementById('ai-chat-panel');
  const btn = document.getElementById('ai-assistant-btn');
  const closeBtn = document.getElementById('ai-chat-close');
  const input = document.getElementById('ai-input');
  const sendBtn = document.getElementById('ai-send-btn');
  const messagesContainer = document.getElementById('ai-chat-messages');

  btn.addEventListener('click', () => panel.classList.toggle('open'));
  closeBtn.addEventListener('click', () => panel.classList.remove('open'));

  const getERPData = () => {
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

    let employees, invoices, products;
    try { employees = JSON.parse(localStorage.getItem('amdox_employees')) || SEED_EMP; } catch { employees = SEED_EMP; }
    try { invoices = JSON.parse(localStorage.getItem('amdox_invoices')) || SEED_INV; } catch { invoices = SEED_INV; }
    try { products = JSON.parse(localStorage.getItem('amdox_products')) || SEED_PROD; } catch { products = SEED_PROD; }

    let aiState;
    try {
      aiState = JSON.parse(localStorage.getItem('amdox_ai_state')) || {
        anomalyResolved: false,
        skuOrdered: false,
        resourceOptimized: false,
        contractReviewed: false
      };
    } catch {
      aiState = {
        anomalyResolved: false,
        skuOrdered: false,
        resourceOptimized: false,
        contractReviewed: false
      };
    }

    return { employees, invoices, products, aiState };
  };

  const generateAIResponse = (query) => {
    const q = query.toLowerCase().trim();
    const data = getERPData();

    // 1. Revenue Forecast / Revenue
    if (q.includes('revenue') || q.includes('forecast') || q.includes('profit') || q.includes('finance')) {
      const paidInvoices = data.invoices.filter(i => i.status === 'Paid');
      const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
      const pendingInvoices = data.invoices.filter(i => i.status === 'Pending' || i.status === 'Sent');
      const pendingRevenue = pendingInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

      return `📊 **Revenue Forecast & Financial Insights:**
• **Current Paid Revenue**: ₹${(totalRevenue / 100000).toFixed(2)} Lakhs (from ${paidInvoices.length} paid invoices)
• **Pending/Sent Receivables**: ₹${(pendingRevenue / 100000).toFixed(2)} Lakhs (from ${pendingInvoices.length} invoices)
• **Q3 2026 AI Projection**: **₹2.4 Crore** (+18% YoY growth).
• **AI Recommendation**: Follow up on pending payments from **${pendingInvoices.map(i => i.client).join(', ')}** to ensure cash flow targets are met.`;
    }

    // 2. Pending Approvals / approvals
    if (q.includes('approval') || q.includes('pending') || q.includes('workflow')) {
      const pendingInvoices = data.invoices.filter(i => i.status === 'Pending');
      const anomalyText = data.aiState.anomalyResolved
        ? '✅ All anomalies resolved.'
        : '⚠️ **Marketing Department Anomaly**: deviation detected (Requires resolution).';

      let approvalList = pendingInvoices.map(inv => `• **Invoice ${inv.invoice_no}** for **${inv.client}** (₹${(inv.amount / 100000).toFixed(2)} L) - Due ${inv.due_date}`).join('\n');
      if (!approvalList) approvalList = '• None (All invoices processed/sent).';

      return `📋 **Pending Approvals & Alerts:**
Here are the items currently awaiting attention or authorization:
${approvalList}
${anomalyText}
• **AI Recommendation**: Shift 2 developers to Project B to expedite task deadlines and clear resource blockages.`;
    }

    // 3. Employee Analytics / Employees / HR
    if (q.includes('employee') || q.includes('analytics') || q.includes('hr') || q.includes('staff')) {
      const activeCount = data.employees.filter(e => e.status === 'Active').length;
      const probationCount = data.employees.filter(e => e.status === 'Probation').length;

      return `👥 **HR & Employee Analytics:**
• **Total Registered Staff**: ${data.employees.length} employees
• **Status Breakdown**: ${activeCount} Active, ${probationCount} on Probation.
• **Recent Onboarding**: Priya Sharma (HR Manager, joined Mar 2023).
• **AI Team Recommendation**: 2 engineers are recommended to be shifted from Project A to Project B to accelerate Project B's timeline by 4 days.`;
    }

    // 4. Inventory Alerts / Inventory / SKU / stock
    if (q.includes('inventory') || q.includes('alert') || q.includes('stock') || q.includes('sku')) {
      const lowStockItems = data.products.filter(p => p.stock < p.reorder_level);
      let alertText = '';
      if (lowStockItems.length > 0) {
        alertText = lowStockItems.map(p => `• **${p.name}** (${p.sku}): Only **${p.stock}** left (Reorder level: ${p.reorder_level}, Warehouse: ${p.warehouse})`).join('\n');
      } else {
        alertText = '• All stock levels are currently healthy and above reorder thresholds.';
      }

      const orderedText = data.aiState.skuOrdered
        ? '✅ **SKU-0089 (Dell Monitor)** auto-reordered successfully.'
        : '⚠️ **SKU-0089 (Dell Monitor)** predicted stockout in 3 days (Needs reorder).';

      return `📦 **Inventory & Supply Chain Alerts:**
${alertText}
${orderedText}
• **AI Recommendation**: Enable auto-reorder automation in inventory settings to prevent stockouts.`;
    }

    // 5. Generate / report
    if (q.includes('generate') || q.includes('report') || q.includes('export') || q.includes('download')) {
      return `📑 **Report Generator Assistant:**
I can help you compile data for downloading. 
To export a complete system report:
1. Go to the **Analytics & BI** page from the sidebar.
2. Click **Export PDF** or **Export Excel** at the top right action bar.
3. For AI metrics, open the **AI Command Center** and click **Run AI Analysis**, then click **Export Report** once analysis completes.`;
    }

    // Default response using custom query text
    return `💡 **Amdox AI Assistant:**
I've parsed your request regarding **"${query}"**. Based on current ERP modules:
• **Finance**: ${data.invoices.length} invoices logged. Total value ₹${(data.invoices.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0) / 100000).toFixed(2)} Lakhs.
• **Inventory**: ${data.products.length} products tracked. ${data.products.filter(p => p.stock < p.reorder_level).length} low stock warnings.
• **HR**: ${data.employees.length} employees active across Engineering, HR, Sales.

Please ask me about **"Show revenue forecast"**, **"Pending approvals"**, **"Employee analytics"**, or **"Inventory alerts"** for targeted details.`;
  };

  const sendMessage = () => {
    const text = input.value.trim();
    if (!text) return;
    // User message
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-message user';

    const uContent = document.createElement('div');
    uContent.className = 'ai-message-content';
    uContent.textContent = text;
    userMsg.appendChild(uContent);

    messagesContainer.appendChild(userMsg);
    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Bot response
    setTimeout(() => {
      const botMsg = document.createElement('div');
      botMsg.className = 'ai-message bot';
      const botText = generateAIResponse(text);

      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'ai-message-avatar';
      const avatarIcon = document.createElement('i');
      avatarIcon.className = 'fas fa-robot';
      avatarDiv.appendChild(avatarIcon);
      botMsg.appendChild(avatarDiv);

      const contentDiv = document.createElement('div');
      contentDiv.className = 'ai-message-content';
      contentDiv.style.whiteSpace = 'pre-wrap';
      contentDiv.style.lineHeight = '1.5';

      // Escape HTML and format bold tags safely to avoid CWE-79
      const safeHtml = String(botText)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      contentDiv.innerHTML = safeHtml;

      botMsg.appendChild(contentDiv);

      messagesContainer.appendChild(botMsg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000);
  };

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });

  // Suggestion chips
  document.querySelectorAll('.ai-suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.textContent;
      sendMessage();
    });
  });
}

// ── Command Palette ──
function initCommandPalette() {
  const palette = document.getElementById('command-palette');
  const input = document.getElementById('command-input');
  const items = document.querySelectorAll('.command-item');

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openCommandPalette();
    }
    if (e.key === 'Escape') palette.classList.remove('open');
  });

  palette.querySelector('.command-palette-backdrop').addEventListener('click', () => {
    palette.classList.remove('open');
  });

  // Dynamic filter results
  input.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(q) ? 'flex' : 'none';
    });
  });

  items.forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      if (action) location.hash = action;
      palette.classList.remove('open');
    });
  });
}

function openCommandPalette() {
  const palette = document.getElementById('command-palette');
  palette.classList.add('open');
  document.getElementById('command-input').value = '';
  document.querySelectorAll('.command-item').forEach(item => item.style.display = 'flex');
  document.getElementById('command-input').focus();
}

// ── Notifications ──
function initNotifications() {
  const panel = document.getElementById('notification-panel');
  const btn = document.getElementById('notification-btn');
  const items = document.querySelectorAll('.notification-item');
  const dot = document.querySelector('.notification-dot');
  const countBadge = document.querySelector('.nav-count');

  btn.addEventListener('click', () => {
    panel.classList.toggle('open');
    // Hide notifications indicator when opened
    if (dot) dot.style.display = 'none';
    if (countBadge) countBadge.style.display = 'none';
  });

  const navItem = document.getElementById('nav-notifications');
  if (navItem) {
    navItem.addEventListener('click', () => {
      if (dot) dot.style.display = 'none';
      if (countBadge) countBadge.style.display = 'none';
    });
  }

  // Mark all read
  document.getElementById('mark-all-read').addEventListener('click', () => {
    items.forEach(n => n.classList.remove('unread'));
    if (dot) dot.style.display = 'none';
    if (countBadge) countBadge.style.display = 'none';
    showToast('All notifications marked as read', 'success');
  });

  // Click individual notification
  items.forEach(item => {
    item.addEventListener('click', () => {
      if (item.classList.contains('unread')) {
        item.classList.remove('unread');
        const unreadCount = document.querySelectorAll('.notification-item.unread').length;
        if (unreadCount === 0) {
          if (dot) dot.style.display = 'none';
          if (countBadge) countBadge.style.display = 'none';
        } else {
          if (countBadge) countBadge.textContent = unreadCount;
        }
        showToast('Notification marked as read', 'success');
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !btn.contains(e.target)) panel.classList.remove('open');
  });
}

// ── Global Mock Actions ──
function initGlobalActions() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (btn) {
      // Skip modal-specific buttons that are handled by their own logic
      if (btn.closest('.modal-overlay') || btn.dataset.modalTrigger || btn.dataset.apiAction) return;
      // Skip admin dashboard Export/Quick Action buttons (handled by dashboard.js)
      if (btn.id === 'admin-export-btn' || btn.id === 'admin-quick-action-btn') return;
      if (btn.closest('#admin-export-dropdown') || btn.closest('#admin-quick-action-dropdown')) return;
      const text = btn.textContent.trim();
      if (text.toLowerCase().includes('export')) {
        showToast(`Exporting data... ${text}`, 'info');
      } else if (text === 'View') {
        showToast('Opening record details...', 'info');
      } else if (text === 'Reorder') {
        showToast('Purchase order initiated!', 'success');
      } else if (text === 'Watch') {
        showToast('Item added to watch list.', 'info');
      }
    }
  });
}

// ── Modal Helper ──
function showModal({ title, fields, onSubmit, submitLabel = 'Save', submitClass = 'btn-primary' }) {
  // Remove any existing generic modal (but NOT the scan terminal, which manages itself)
  const existingModal = document.querySelector('.modal-overlay:not(#scan-modal-overlay):not(#profit-modal-overlay)');
  existingModal?.remove();

  const cleanTitle = title.replace(/<[^>]*>/g, '').replace(/"/g, '&quot;');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modalBox = document.createElement('div');
  modalBox.className = 'modal-box';
  modalBox.setAttribute('role', 'dialog');
  modalBox.setAttribute('aria-modal', 'true');
  modalBox.setAttribute('aria-label', cleanTitle);

  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';

  const modalTitle = document.createElement('h3');
  modalTitle.className = 'modal-title';
  modalTitle.innerHTML = title;
  modalHeader.appendChild(modalTitle);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.id = 'modal-close-btn';
  closeBtn.setAttribute('aria-label', 'Close');
  const closeIcon = document.createElement('i');
  closeIcon.className = 'fas fa-xmark';
  closeBtn.appendChild(closeIcon);
  modalHeader.appendChild(closeBtn);

  const modalForm = document.createElement('form');
  modalForm.id = 'modal-form';
  modalForm.className = 'modal-form';
  modalForm.noValidate = true;

  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';

  fields.forEach(f => {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';

    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = f.label;
    if (f.required) {
      const star = document.createElement('span');
      star.style.color = 'var(--danger)';
      star.textContent = ' *';
      label.appendChild(star);
    }
    formGroup.appendChild(label);

    if (f.type === 'select') {
      const select = document.createElement('select');
      select.className = 'form-control';
      select.id = 'modal-field-' + f.name;
      select.name = f.name;
      if (f.required) select.required = true;

      if (f.options) {
        f.options.forEach(o => {
          const val = o.value !== undefined ? o.value : o;
          const lbl = o.label !== undefined ? o.label : o;
          const option = document.createElement('option');
          option.value = val;
          option.textContent = lbl;
          if (f.default === val) option.selected = true;
          select.appendChild(option);
        });
      }
      formGroup.appendChild(select);
    } else {
      const input = document.createElement('input');
      input.className = 'form-control';
      input.type = f.type || 'text';
      input.id = 'modal-field-' + f.name;
      input.name = f.name;
      input.placeholder = f.placeholder || '';
      input.value = f.default || '';
      if (f.required) input.required = true;
      formGroup.appendChild(input);
    }

    modalBody.appendChild(formGroup);
  });

  const modalFooter = document.createElement('div');
  modalFooter.className = 'modal-footer';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn btn-secondary';
  cancelBtn.id = 'modal-cancel-btn';
  cancelBtn.textContent = 'Cancel';

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn ' + submitClass;
  submitBtn.id = 'modal-submit-btn';
  submitBtn.textContent = submitLabel;

  modalFooter.appendChild(cancelBtn);
  modalFooter.appendChild(submitBtn);

  modalForm.appendChild(modalBody);
  modalForm.appendChild(modalFooter);

  modalBox.appendChild(modalHeader);
  modalBox.appendChild(modalForm);

  overlay.appendChild(modalBox);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => overlay.classList.add('open'));

  // Focus first field
  setTimeout(() => {
    const first = overlay.querySelector('input, select');
    if (first) first.focus();
  }, 100);

  const closeModal = () => {
    overlay.classList.remove('open');
    setTimeout(() => overlay.remove(), 200);
  };

  overlay.querySelector('#modal-close-btn').addEventListener('click', closeModal);
  overlay.querySelector('#modal-cancel-btn').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  overlay.querySelector('#modal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentSubmitBtn = overlay.querySelector('#modal-submit-btn');
    // Collect form data
    const data = {};
    fields.forEach(f => {
      const el = overlay.querySelector(`[name="${f.name}"]`);
      if (el && typeof f.name === 'string' && f.name !== '__proto__' && f.name !== 'constructor' && f.name !== 'prototype') {
        Reflect.set(data, f.name, el.value.trim());
      }
    });
    // Basic required validation
    const missing = fields.filter(f => f.required && !Reflect.get(data, f.name));
    if (missing.length) {
      showToast(`Please fill in: ${missing.map(f => f.label).join(', ')}`, 'error');
      return;
    }
    currentSubmitBtn.disabled = true;
    currentSubmitBtn.textContent = ' Saving...';
    const spinner = document.createElement('i');
    spinner.className = 'fas fa-spinner fa-spin';
    currentSubmitBtn.prepend(spinner);

    try {
      await onSubmit(data, closeModal);
    } finally {
      currentSubmitBtn.disabled = false;
      currentSubmitBtn.textContent = submitLabel;
    }
  });
}

// ── Confirm Dialog ──
function showConfirm(message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';

  const modalBox = document.createElement('div');
  modalBox.className = 'modal-box';
  modalBox.style.maxWidth = '400px';

  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';

  const modalTitle = document.createElement('h3');
  modalTitle.className = 'modal-title';

  const icon = document.createElement('i');
  icon.className = 'fas fa-triangle-exclamation';
  icon.style.color = 'var(--warning)';
  modalTitle.appendChild(icon);
  modalTitle.appendChild(document.createTextNode(' Confirm Action'));
  modalHeader.appendChild(modalTitle);

  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';
  const p = document.createElement('p');
  p.textContent = message;
  modalBody.appendChild(p);

  const modalFooter = document.createElement('div');
  modalFooter.className = 'modal-footer';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-secondary';
  cancelBtn.id = 'confirm-cancel';
  cancelBtn.textContent = 'Cancel';

  const okBtn = document.createElement('button');
  okBtn.className = 'btn btn-danger';
  okBtn.id = 'confirm-ok';
  okBtn.textContent = 'Delete';

  modalFooter.appendChild(cancelBtn);
  modalFooter.appendChild(okBtn);

  modalBox.appendChild(modalHeader);
  modalBox.appendChild(modalBody);
  modalBox.appendChild(modalFooter);

  overlay.appendChild(modalBox);
  document.body.appendChild(overlay);

  cancelBtn.addEventListener('click', () => overlay.remove());
  okBtn.addEventListener('click', () => { overlay.remove(); onConfirm(); });
}

// ── Content Modal (Custom HTML) ──
function showContentModal({ title, content, maxWidth = '650px' }) {
  const existingModal = document.querySelector('.modal-overlay:not(#scan-modal-overlay):not(#profit-modal-overlay)');
  existingModal?.remove();

  const cleanTitle = title.replace(/<[^>]*>/g, '').replace(/"/g, '&quot;');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modalBox = document.createElement('div');
  modalBox.className = 'modal-box';
  modalBox.style.maxWidth = maxWidth;
  modalBox.setAttribute('role', 'dialog');
  modalBox.setAttribute('aria-modal', 'true');
  modalBox.setAttribute('aria-label', cleanTitle);

  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';

  const modalTitle = document.createElement('h3');
  modalTitle.className = 'modal-title';
  modalTitle.innerHTML = title;
  modalHeader.appendChild(modalTitle);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.id = 'modal-close-btn';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = '<i class="fas fa-xmark"></i>';
  modalHeader.appendChild(closeBtn);

  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';
  modalBody.innerHTML = content;

  const modalFooter = document.createElement('div');
  modalFooter.className = 'modal-footer text-right';
  modalFooter.style.justifyContent = 'flex-end';

  const closeFooterBtn = document.createElement('button');
  closeFooterBtn.className = 'btn btn-secondary';
  closeFooterBtn.textContent = 'Close';
  const closeModal = () => {
    overlay.classList.remove('open');
    setTimeout(() => overlay.remove(), 200);
  };
  closeFooterBtn.addEventListener('click', closeModal);
  modalFooter.appendChild(closeFooterBtn);

  modalBox.appendChild(modalHeader);
  modalBox.appendChild(modalBody);
  modalBox.appendChild(modalFooter);
  overlay.appendChild(modalBox);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => overlay.classList.add('open'));
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
}

// ── Toast ──
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;

  const iconName = type === 'success' ? 'check-circle' : (type === 'error' ? 'times-circle' : 'info-circle');

  const icon = document.createElement('i');
  icon.className = 'fas fa-' + iconName;
  toast.appendChild(icon);

  const spanMsg = document.createElement('span');
  spanMsg.className = 'toast-message';
  spanMsg.textContent = message;
  toast.appendChild(spanMsg);

  const spanClose = document.createElement('span');
  spanClose.className = 'toast-close';
  const closeIcon = document.createElement('i');
  closeIcon.className = 'fas fa-xmark';
  spanClose.appendChild(closeIcon);
  spanClose.addEventListener('click', () => toast.remove());
  toast.appendChild(spanClose);

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ── Chart Initialization ──
function initChartsOnPage(page) {
  document.querySelectorAll('canvas[data-chart]').forEach(canvas => {
    const type = canvas.dataset.chart;
    const ctx = canvas.getContext('2d');
    const chartConfigs = getChartConfig(type);
    if (chartConfigs) new Chart(ctx, chartConfigs);
  });
}

function getChartConfig(type) {
  const gridColor = 'rgba(255,255,255,0.05)';
  const configs = {
    revenue: {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Revenue (₹ Lakhs)', data: [42, 48, 55, 51, 67, 72, 78, 85, 82, 95, 102, 118],
          borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)',
          fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#6366f1',
          borderWidth: 2
        }, {
          label: 'Expenses (₹ Lakhs)', data: [28, 32, 35, 38, 40, 42, 45, 48, 44, 50, 52, 58],
          borderColor: '#ec4899', backgroundColor: 'rgba(236,72,153,0.1)',
          fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#ec4899',
          borderWidth: 2
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { color: '#94a3b8', usePointStyle: true, padding: 20 } } }, scales: { x: { grid: { color: gridColor }, ticks: { color: '#64748b' } }, y: { grid: { color: gridColor }, ticks: { color: '#64748b' } } } }
    },
    doughnut: {
      type: 'doughnut',
      data: {
        labels: ['HR', 'Finance', 'Inventory', 'CRM', 'Projects'],
        datasets: [{ data: [25, 30, 20, 15, 10], backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4'], borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', usePointStyle: true, padding: 16 } } } }
    },
    bar: {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Tasks Completed', data: [12, 19, 8, 15, 22, 10, 5],
          backgroundColor: 'rgba(99,102,241,0.7)', borderRadius: 6, borderSkipped: false
        }, {
          label: 'Tasks Created', data: [15, 22, 12, 18, 25, 14, 8],
          backgroundColor: 'rgba(168,85,247,0.4)', borderRadius: 6, borderSkipped: false
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { color: '#94a3b8', usePointStyle: true } } }, scales: { x: { grid: { display: false }, ticks: { color: '#64748b' } }, y: { grid: { color: gridColor }, ticks: { color: '#64748b' } } } }
    },
    attendance: {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        datasets: [{
          label: 'Present', data: [142, 148, 145, 150, 138],
          backgroundColor: 'rgba(34,197,94,0.7)', borderRadius: 4
        }, {
          label: 'Absent', data: [8, 5, 10, 3, 15],
          backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 4
        }, {
          label: 'WFH', data: [12, 9, 7, 9, 9],
          backgroundColor: 'rgba(99,102,241,0.7)', borderRadius: 4
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { color: '#94a3b8', usePointStyle: true } } }, scales: { x: { stacked: true, grid: { display: false }, ticks: { color: '#64748b' } }, y: { stacked: true, grid: { color: gridColor }, ticks: { color: '#64748b' } } } }
    },
    cashflow: {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Inflow', data: [85, 92, 78, 95, 110, 105],
          borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)',
          fill: true, tension: 0.4, borderWidth: 2
        }, {
          label: 'Outflow', data: [65, 70, 72, 68, 75, 80],
          borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)',
          fill: true, tension: 0.4, borderWidth: 2
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { color: '#94a3b8', usePointStyle: true } } }, scales: { x: { grid: { color: gridColor }, ticks: { color: '#64748b' } }, y: { grid: { color: gridColor }, ticks: { color: '#64748b' } } } }
    },
    inventory: {
      type: 'bar',
      data: {
        labels: ['Electronics', 'Furniture', 'Supplies', 'Software', 'Hardware', 'Services'],
        datasets: [{
          label: 'Stock Level', data: [340, 180, 520, 90, 210, 150],
          backgroundColor: ['rgba(99,102,241,0.7)', 'rgba(236,72,153,0.7)', 'rgba(34,197,94,0.7)', 'rgba(245,158,11,0.7)', 'rgba(6,182,212,0.7)', 'rgba(168,85,247,0.7)'],
          borderRadius: 6
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { grid: { color: gridColor }, ticks: { color: '#64748b' } }, y: { grid: { display: false }, ticks: { color: '#94a3b8' } } } }
    },
    pipeline: {
      type: 'doughnut',
      data: {
        labels: ['Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
        datasets: [{ data: [35, 25, 18, 15, 7], backgroundColor: ['#3b82f6', '#6366f1', '#f59e0b', '#22c55e', '#ef4444'], borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', usePointStyle: true, padding: 12 } } } }
    },
    sprint: {
      type: 'line',
      data: {
        labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'],
        datasets: [{
          label: 'Ideal', data: [40, 36, 32, 28, 24, 20, 16, 12, 8, 0],
          borderColor: 'rgba(148,163,184,0.5)', borderDash: [5, 5], borderWidth: 2, pointRadius: 0, fill: false
        }, {
          label: 'Actual', data: [40, 38, 35, 30, 28, 22, 20, 15, 11, 6],
          borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)',
          fill: true, tension: 0.3, borderWidth: 2
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { color: '#94a3b8', usePointStyle: true } } }, scales: { x: { grid: { color: gridColor }, ticks: { color: '#64748b' } }, y: { grid: { color: gridColor }, ticks: { color: '#64748b' } } } }
    }
  };
  return Object.hasOwn(configs, type) ? Reflect.get(configs, type) : null;
}

// ── Utility ──
function formatCurrency(n) { return '₹' + n.toLocaleString('en-IN'); }
function formatNumber(n) { return n.toLocaleString('en-IN'); }

// ── Quick Action Menu ──
window.openQuickActions = function() {
  // Remove existing quick action popup if any
  document.getElementById('quick-action-overlay')?.remove();

  const actions = [
    { icon: 'fa-user-plus',        color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  label: 'Add Employee',        desc: 'Onboard a new team member',         page: 'hr' },
    { icon: 'fa-file-invoice-dollar', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Create Invoice',      desc: 'Generate a new invoice',            page: 'finance' },
    { icon: 'fa-diagram-project',  color: '#a855f7', bg: 'rgba(168,85,247,0.12)', label: 'New Project',          desc: 'Start a new project',               page: 'projects' },
    { icon: 'fa-box',              color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  label: 'Add Inventory Item',   desc: 'Register stock or assets',          page: 'inventory' },
    { icon: 'fa-handshake',        color: '#ec4899', bg: 'rgba(236,72,153,0.12)', label: 'New CRM Lead',         desc: 'Capture a sales opportunity',       page: 'crm' },
    { icon: 'fa-bell',             color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Send Notification',    desc: 'Broadcast an alert or update',      page: 'notifications' },
    { icon: 'fa-shield-halved',    color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  label: 'Security Audit',       desc: 'Review auth & access logs',         page: 'auth' },
    { icon: 'fa-chart-line',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'View Analytics',       desc: 'Open reports & BI dashboard',       page: 'analytics' }
  ];

  const overlay = document.createElement('div');
  overlay.id = 'quick-action-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);backdrop-filter:blur(6px);opacity:0;transition:opacity 0.25s ease;';

  const modal = document.createElement('div');
  modal.style.cssText = 'background:var(--bg-card,#141a2e);border:1px solid var(--border-color,rgba(255,255,255,0.05));border-radius:20px;padding:28px;width:min(560px,90vw);max-height:80vh;overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,0.5);transform:scale(0.95);transition:transform 0.25s cubic-bezier(0.4,0,0.2,1);';

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;';
  const titleWrap = document.createElement('div');
  const titleH = document.createElement('h3');
  titleH.style.cssText = 'font-size:18px;font-weight:700;color:var(--text-primary,#f1f5f9);margin:0;';
  titleH.textContent = '⚡ Quick Actions';
  const subtitle = document.createElement('p');
  subtitle.style.cssText = 'font-size:13px;color:var(--text-muted,#64748b);margin:4px 0 0;';
  subtitle.textContent = 'Jump to any module or create something new';
  titleWrap.appendChild(titleH);
  titleWrap.appendChild(subtitle);
  header.appendChild(titleWrap);

  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = 'width:36px;height:36px;border-radius:10px;border:none;background:rgba(255,255,255,0.05);color:var(--text-muted,#64748b);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;transition:all 0.2s;';
  closeBtn.innerHTML = '<i class="fas fa-xmark"></i>';
  closeBtn.onmouseenter = () => { closeBtn.style.background = 'rgba(255,255,255,0.1)'; closeBtn.style.color = '#fff'; };
  closeBtn.onmouseleave = () => { closeBtn.style.background = 'rgba(255,255,255,0.05)'; closeBtn.style.color = 'var(--text-muted,#64748b)'; };
  header.appendChild(closeBtn);
  modal.appendChild(header);

  // Actions grid
  const grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:12px;';

  actions.forEach((a, i) => {
    const card = document.createElement('div');
    card.style.cssText = `display:flex;align-items:center;gap:14px;padding:16px;border-radius:14px;border:1px solid var(--border-color,rgba(255,255,255,0.05));background:var(--bg-surface,rgba(255,255,255,0.02));cursor:pointer;transition:all 0.2s cubic-bezier(0.4,0,0.2,1);animation:qa-fadein 0.3s ease ${i*0.04}s both;`;
    card.onmouseenter = () => { card.style.background = a.bg; card.style.borderColor = a.color + '33'; card.style.transform = 'translateY(-2px)'; card.style.boxShadow = `0 8px 24px ${a.bg}`; };
    card.onmouseleave = () => { card.style.background = 'var(--bg-surface,rgba(255,255,255,0.02))'; card.style.borderColor = 'var(--border-color,rgba(255,255,255,0.05))'; card.style.transform = 'none'; card.style.boxShadow = 'none'; };
    card.onclick = () => {
      closeOverlay();
      location.hash = a.page;
      
      // Deep link to specific actions on the target pages
      setTimeout(() => {
        if (typeof showToast === 'function') showToast(`Opening ${a.label} form...`, 'success');
        
        const actionMap = {
          'Add Employee': 'hr-add-btn',
          'Create Invoice': 'inv-add-btn',
          'New Project': 'project-add-btn',
          'Add Inventory Item': 'prod-add-btn',
          'New CRM Lead': 'crm-add-btn'
        };

        const targetId = actionMap[a.label];
        if (targetId) {
          const btn = document.getElementById(targetId);
          if (btn) btn.click();
        }
      }, 500);
    };

    const iconWrap = document.createElement('div');
    iconWrap.style.cssText = `width:44px;height:44px;border-radius:12px;background:${a.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0;`;
    iconWrap.innerHTML = `<i class="fas ${a.icon}" style="font-size:18px;color:${a.color}"></i>`;

    const textWrap = document.createElement('div');
    textWrap.style.cssText = 'flex:1;min-width:0;';
    const labelEl = document.createElement('div');
    labelEl.style.cssText = 'font-size:14px;font-weight:600;color:var(--text-primary,#f1f5f9);';
    labelEl.textContent = a.label;
    const descEl = document.createElement('div');
    descEl.style.cssText = 'font-size:12px;color:var(--text-muted,#64748b);margin-top:2px;';
    descEl.textContent = a.desc;
    textWrap.appendChild(labelEl);
    textWrap.appendChild(descEl);

    card.appendChild(iconWrap);
    card.appendChild(textWrap);

    const arrow = document.createElement('i');
    arrow.className = 'fas fa-chevron-right';
    arrow.style.cssText = 'font-size:12px;color:var(--text-muted,#64748b);opacity:0;transition:opacity 0.2s;';
    card.onmouseenter = ((origEnter) => function() { origEnter.call(this); arrow.style.opacity = '1'; })(card.onmouseenter);
    card.onmouseleave = ((origLeave) => function() { origLeave.call(this); arrow.style.opacity = '0'; })(card.onmouseleave);
    card.appendChild(arrow);

    grid.appendChild(card);
  });

  modal.appendChild(grid);

  // Keyboard shortcut hint
  const hint = document.createElement('div');
  hint.style.cssText = 'margin-top:16px;text-align:center;font-size:12px;color:var(--text-muted,#64748b);';
  hint.innerHTML = 'Press <kbd style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);border-radius:4px;padding:2px 6px;font-size:11px;font-family:var(--font-mono);font-weight:600;color:var(--text-muted)">ESC</kbd> to close';
  modal.appendChild(hint);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Add keyframe animation
  if (!document.getElementById('qa-anim-style')) {
    const style = document.createElement('style');
    style.id = 'qa-anim-style';
    style.textContent = '@keyframes qa-fadein { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }';
    document.head.appendChild(style);
  }

  // Animate in
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    modal.style.transform = 'scale(1)';
  });

  // Close handlers
  function closeOverlay() {
    overlay.style.opacity = '0';
    modal.style.transform = 'scale(0.95)';
    setTimeout(() => overlay.remove(), 250);
  }
  closeBtn.onclick = closeOverlay;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeOverlay(); });
  const escHandler = e => { if (e.key === 'Escape') { closeOverlay(); document.removeEventListener('keydown', escHandler); } };
  document.addEventListener('keydown', escHandler);
};

// ── Export Dashboard Report ──
window.exportHRReport = async function() {
  if (typeof showToast === 'function') {
    showToast('<i class="fas fa-spinner fa-spin"></i> Initializing PDF engine...', 'info');
    
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let currentY = 20;

      // 1. Professional Header
      doc.setFillColor(20, 26, 46); // Dark blue theme
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('AMDOX ERP SUITE', margin, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Enterprise Operations & AI Analytics Report', margin, 28);
      
      doc.setFontSize(9);
      doc.text('Generated on: ' + new Date().toLocaleString(), pageWidth - margin, 20, { align: 'right' });
      doc.text('Status: Official System Export', pageWidth - margin, 26, { align: 'right' });

      currentY = 55;

      // 2. Executive Summary Section
      doc.setTextColor(20, 26, 46);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', margin, currentY);
      currentY += 10;

      // Fetch dynamic data from database
      const stats = [
        { label: 'Active Employees', value: db.table('employees').count().toString() },
        { label: 'Active Projects', value: '47' }, // Mock or dynamic if available
        { label: 'Revenue (Q3)', value: '₹2.4 Cr' },
        { label: 'System Health', value: '98.2% Optimal' }
      ];

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      
      stats.forEach((s, i) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(s.label + ':', margin, currentY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(99, 102, 241);
        doc.text(s.value, margin + 45, currentY);
        currentY += 8;
      });

      currentY += 10;

      // 3. Visual Dashboard Capture
      showToast('<i class="fas fa-camera"></i> Capturing dashboard visuals...', 'info');
      
      const dashboardElement = document.getElementById('page-content');
      if (dashboardElement) {
        // We use a temporary clone or specific scaling for better quality
        const canvas = await html2canvas(dashboardElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#0f172a' // Match dark theme
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Check if it fits on the first page, otherwise move to next
        if (currentY + imgHeight > pageHeight - margin) {
          doc.addPage();
          currentY = 20;
        }
        
        doc.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
      }

      // Footer on all pages
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${i} of ${totalPages} | Confidential - Amdox Technologies Internal Use Only`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      doc.save(`Amdox_ERP_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      showToast('✅ PDF Report exported successfully!', 'success');
      
    } catch (error) {
      console.error('PDF Export Error:', error);
      showToast('❌ Failed to generate PDF report.', 'error');
    }
  }
};

// ── Export Employees CSV ──
window.exportEmployeesCSV = function() {
  try {
    showToast('<i class="fas fa-file-csv"></i> Generating CSV report...', 'info');
    
    const employees = db.table('employees').getAll();
    if (!employees || employees.length === 0) {
      showToast('No employee data found to export.', 'warning');
      return;
    }

    const headers = ['ID', 'Name', 'Email', 'Department', 'Role', 'Status', 'Join Date', 'Salary'];
    
    // Prepare rows
    const rows = employees.map(e => [
      e.id,
      `"${e.name}"`,
      `"${e.email}"`,
      `"${e.department}"`,
      `"${e.role}"`,
      `"${e.status}"`,
      `"${e.joinDate || e.joined || 'N/A'}"`,
      e.salary || 0
    ]);

    // Build CSV string
    const csvString = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hr_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('✅ CSV Report exported!', 'success');
  } catch (error) {
    console.error('CSV Export Error:', error);
    showToast('❌ Failed to export CSV.', 'error');
  }
};

// ── Toggle Export Dropdown ──
window.toggleExportDropdown = function(event) {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById('export-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('open');
  }
};

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  const exportDropdown = document.getElementById('export-dropdown');
  if (exportDropdown && !e.target.closest('.dropdown-wrapper')) exportDropdown.classList.remove('open');
  
  // Also close chart menus
  document.querySelectorAll('.chart-dropdown.open').forEach(menu => {
    if (!e.target.closest('.chart-menu-wrapper')) menu.classList.remove('open');
  });
});

// ── Chart Actions ──
window.toggleChartMenu = function(event, id) {
  if (event) event.stopPropagation();
  const menu = document.getElementById(id);
  if (menu) {
    // Close other open chart menus first
    document.querySelectorAll('.chart-dropdown.open').forEach(m => {
      if (m.id !== id) m.classList.remove('open');
    });
    menu.classList.toggle('open');
  }
};

window.downloadChartPNG = function(event, chartType) {
  if (event) event.preventDefault();
  const canvas = document.querySelector(`canvas[data-chart="${chartType}"]`);
  if (canvas) {
    const link = document.createElement('a');
    link.download = `chart_${chartType}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast(`✅ ${chartType} chart downloaded as PNG`, 'info');
  }
};

window.exportChartCSV = function(event, chartType) {
  if (event) event.preventDefault();
  // Simple mock CSV for charts
  const content = `Date,Value\nJan,42\nFeb,48\nMar,55\nApr,51\nMay,67\nJun,72`;
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `chart_data_${chartType}.csv`;
  link.click();
  showToast(`✅ ${chartType} data exported as CSV`, 'info');
};

window.refreshChart = function(event, chartType) {
  if (event) event.preventDefault();
  showToast(`<i class="fas fa-rotate fa-spin"></i> Refreshing ${chartType} data...`, 'info');
  setTimeout(() => {
    // In a real app, you'd re-fetch data and update the chart object here
    showToast(`✅ ${chartType} chart updated!`, 'success');
  }, 1000);
};

window.fullscreenChart = function(event, chartType) {
  if (event) event.preventDefault();
  const container = document.querySelector(`canvas[data-chart="${chartType}"]`).closest('.card');
  if (container) {
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        showToast('Error attempting to enable full-screen mode', 'error');
      });
    } else {
      document.exitFullscreen();
    }
  }
};

window.showWeeklyTasks = function() {
  const tasks = [
    { id: 101, title: 'UI Hardening - Sidebar', status: 'Completed', owner: 'Amit', date: 'June 23' },
    { id: 102, title: 'API Integration - Auth Module', status: 'In Progress', owner: 'Priya', date: 'June 24' },
    { id: 103, title: 'Database Optimization', status: 'Completed', owner: 'Rahul', date: 'June 22' },
    { id: 104, title: 'Bug Fix: Export PDF', status: 'Completed', owner: 'Amit', date: 'June 24' },
    { id: 105, title: 'Weekly Sprint Release', status: 'Pending', owner: 'Neha', date: 'June 26' },
    { id: 106, title: 'Legal Compliance Audit', status: 'In Progress', owner: 'Vikram', date: 'June 25' }
  ];

  const content = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Task ID</th>
            <th>Description</th>
            <th>Owner</th>
            <th>Due Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${tasks.map(t => `
            <tr>
              <td style="font-family:var(--font-mono);font-size:12px;color:var(--accent-light)">#${t.id}</td>
              <td style="font-weight:600">${t.title}</td>
              <td>${t.owner}</td>
              <td>${t.date}</td>
              <td><span class="badge badge-${t.status === 'Completed' ? 'success' : (t.status === 'In Progress' ? 'info' : 'warning')}">${t.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div style="margin-top:20px; text-align:right">
      <button class="btn btn-primary btn-sm" onclick="location.hash = 'projects'; const overlay = document.querySelector('.modal-overlay'); overlay.classList.remove('open'); setTimeout(() => overlay.remove(), 200)">View All in Project Board</button>
    </div>
  `;

  showContentModal({
    title: '<i class="fas fa-calendar-check" style="color:var(--accent)"></i> Weekly Task Detail Overview',
    content: content,
    maxWidth: '720px'
  });
};
