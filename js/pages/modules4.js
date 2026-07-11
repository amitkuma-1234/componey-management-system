/* ============================================================
   E-Commerce Page — Unified Dashboard & Sync Simulator
   ============================================================ */
pages.ecommerce = function (container) {
  const LS_ECOM_ORDERS = 'amdox_ecom_orders';
  const SEED_ORDERS = [
    { id: 'ORD-4521', platform: 'Shopify', customer: 'Rajesh Gupta', amount: 4299, status: 'Delivered' },
    { id: 'ORD-4520', platform: 'WooCommerce', customer: 'Sneha Reddy', amount: 12500, status: 'Shipped' },
    { id: 'ORD-4519', platform: 'Amazon', customer: 'Karan Mehta', amount: 8999, status: 'Processing' }
  ];

  function getOrders() {
    try { return JSON.parse(localStorage.getItem(LS_ECOM_ORDERS)) || SEED_ORDERS; } catch { return SEED_ORDERS; }
  }
  function saveOrders(list) {
    try { localStorage.setItem(LS_ECOM_ORDERS, JSON.stringify(list)); } catch { }
  }

  const renderECom = () => {
    const orders = getOrders();
    const totalOrders = orders.length;
    const totalRev = orders.reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0);

    container.innerHTML = `
      <div class="module-hero">
        <h2><i class="fas fa-cart-shopping" style="color:var(--success)"></i> E-Commerce Integration</h2>
        <p>Shopify, WooCommerce, and marketplace API integrations with unified order management and inventory sync.</p>
      </div>
      <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr) !important;">
        <div class="stat-card" id="ecom-card-orders" style="cursor:pointer;"><div class="stat-card-header"><div class="stat-icon green"><i class="fas fa-shopping-bag"></i></div><span class="stat-trend up"><i class="fas fa-arrow-up"></i> 24%</span></div><div class="stat-value" id="ecom-stat-count">${totalOrders}</div><div class="stat-label">Orders This Month</div></div>
        <div class="stat-card" id="ecom-card-rev" style="cursor:pointer;"><div class="stat-card-header"><div class="stat-icon blue"><i class="fas fa-indian-rupee-sign"></i></div></div><div class="stat-value" id="ecom-stat-rev">₹${(totalRev / 100000).toFixed(2)}L</div><div class="stat-label">E-Com Revenue</div></div>
        <div class="stat-card" id="ecom-card-stores" style="cursor:pointer;"><div class="stat-card-header"><div class="stat-icon purple"><i class="fas fa-store"></i></div></div><div class="stat-value">3</div><div class="stat-label">Connected Stores</div></div>
        <div class="stat-card" id="ecom-sync-btn" style="cursor:pointer;"><div class="stat-card-header"><div class="stat-icon yellow"><i class="fas fa-rotate"></i></div></div><div class="stat-value" id="ecom-sync-text">Synced</div><div class="stat-label">Click to Force Sync</div></div>
      </div>
      <div class="grid-3" style="margin-bottom: 24px;">
        <div class="card" id="ecom-card-shopify" style="border-color:rgba(34,197,94,0.3); cursor:pointer;"><div style="text-align:center;padding:20px"><div style="width:50px;height:50px;border-radius:12px;background:rgba(34,197,94,0.12);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:22px;color:var(--success)"><i class="fab fa-shopify"></i></div><h3 style="font-size:15px;margin-bottom:4px">Shopify</h3><p style="font-size:12px;color:var(--text-muted)">842 products synced</p><span class="badge badge-success" style="margin-top:8px">Connected</span></div></div>
        <div class="card" id="ecom-card-woo" style="border-color:rgba(168,85,247,0.3); cursor:pointer;"><div style="text-align:center;padding:20px"><div style="width:50px;height:50px;border-radius:12px;background:rgba(168,85,247,0.12);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:22px;color:var(--purple)"><i class="fab fa-wordpress"></i></div><h3 style="font-size:15px;margin-bottom:4px">WooCommerce</h3><p style="font-size:12px;color:var(--text-muted)">356 products synced</p><span class="badge badge-success" style="margin-top:8px">Connected</span></div></div>
        <div class="card" id="ecom-card-amazon" style="border-color:rgba(245,158,11,0.3); cursor:pointer;"><div style="text-align:center;padding:20px"><div style="width:50px;height:50px;border-radius:12px;background:rgba(245,158,11,0.12);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:22px;color:var(--warning)"><i class="fab fa-amazon"></i></div><h3 style="font-size:15px;margin-bottom:4px">Amazon Marketplace</h3><p style="font-size:12px;color:var(--text-muted)">289 products synced</p><span class="badge badge-success" style="margin-top:8px">Connected</span></div></div>
      </div>
      <div class="card">
        <div class="card-header">
          <span class="card-title">Recent Orders</span>
          <button class="btn btn-primary btn-sm" id="ecom-new-order-btn"><i class="fas fa-plus"></i> Create Order</button>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Platform</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="ecom-orders-tbody">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>`;

    const tbody = document.getElementById('ecom-orders-tbody');
    const platBadgeClass = p => {
      if (p === 'Shopify') return 'badge-success';
      if (p === 'WooCommerce') return 'badge-purple';
      return 'badge-warning';
    };
    const platIcon = p => {
      if (p === 'Shopify') return '<i class="fab fa-shopify"></i>';
      if (p === 'WooCommerce') return '<i class="fab fa-wordpress"></i>';
      return '<i class="fab fa-amazon"></i>';
    };
    const statusBadge = s => {
      if (s === 'Delivered') return 'badge-success';
      if (s === 'Shipped') return 'badge-info';
      return 'badge-warning';
    };

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td style="font-family:var(--font-mono);font-size:12px;color:var(--accent-light)">${escHtml(o.id)}</td>
        <td><span class="badge ${platBadgeClass(o.platform)}">${platIcon(o.platform)} ${escHtml(o.platform)}</span></td>
        <td>${escHtml(o.customer)}</td>
        <td style="font-family:var(--font-mono)">₹${Number(o.amount).toLocaleString('en-IN')}</td>
        <td>
          <select class="form-control" style="font-size:11px; padding:4px 8px; height:auto; width:120px; border-radius:8px; border-color:${o.status === 'Delivered' ? 'var(--success)' : (o.status === 'Shipped' ? 'var(--info)' : 'var(--warning)')};" onchange="ecomUpdateStatus('${o.id}', this.value)">
            <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
            <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-secondary btn-sm" style="color:var(--info); padding:4px 8px;" onclick="ecomViewOrder('${o.id}')" title="View Details"><i class="fas fa-eye"></i></button>
            <button class="btn btn-secondary btn-sm" style="color:var(--accent); padding:4px 8px;" onclick="ecomEditOrder('${o.id}')" title="Edit Order"><i class="fas fa-edit"></i></button>
            <button class="btn btn-secondary btn-sm" style="color:var(--danger); padding:4px 8px;" onclick="ecomDeleteOrder('${o.id}')" title="Delete Order"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>`).join('');

    // Hook Create Order button
    document.getElementById('ecom-new-order-btn').addEventListener('click', () => {
      showModal({
        title: '<i class="fas fa-shopping-bag" style="color:var(--success)"></i> Create Demo Order',
        submitLabel: 'Add Order',
        fields: [
          { name: 'platform', label: 'Store Platform', type: 'select', options: ['Shopify', 'WooCommerce', 'Amazon'], default: 'Shopify' },
          { name: 'customer', label: 'Customer Name', required: true, placeholder: 'e.g. Anita Singh' },
          { name: 'amount', label: 'Order Value (₹)', required: true, type: 'number', placeholder: 'e.g. 1500' },
          { name: 'status', label: 'Delivery Status', type: 'select', options: ['Processing', 'Shipped', 'Delivered'], default: 'Processing' }
        ],
        async onSubmit(data, close) {
          const list = getOrders();
          const nextId = 'ORD-' + (4500 + list.length + 22);
          list.unshift({ id: nextId, ...data });
          saveOrders(list);
          showToast(`✅ Order ${nextId} created successfully!`, 'success');
          close();
          renderECom();
        }
      });
    });

    // Hook Force Sync button
    document.getElementById('ecom-sync-btn')?.addEventListener('click', () => {
      const text = document.getElementById('ecom-sync-text');
      if (!text) return;
      text.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      showToast('Syncing orders from active store integrations...', 'info');
      setTimeout(() => {
        text.textContent = 'Synced';
        showToast('✅ All stores synchronized successfully!', 'success');
      }, 1500);
    });

    // ── E-Commerce Stat Card Handlers ──
    document.getElementById('ecom-card-orders')?.addEventListener('click', () => {
      showModal({
        title: '<i class="fas fa-shopping-bag" style="color:var(--success)"></i> Sales Momentum',
        submitLabel: 'View Detailed Log',
        fields: [
          { label: 'Orders (Monthly)', default: totalOrders.toString(), readonly: true },
          { label: 'Growth Trend', default: '+24.6% vs April', readonly: true },
          { label: 'Avg Order Value', default: '₹' + (totalRev / totalOrders).toLocaleString('en-IN', { maximumFractionDigits: 0 }), readonly: true }
        ],
        onSubmit(data, close) {
          close();
          const table = document.getElementById('ecom-orders-tbody');
          if (table) table.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    document.getElementById('ecom-card-rev')?.addEventListener('click', () => {
      showModal({
        title: '<i class="fas fa-indian-rupee-sign" style="color:var(--info)"></i> Revenue Breakdown',
        submitLabel: 'Analytics Portal',
        fields: [
          { label: 'Total Revenue', default: '₹' + totalRev.toLocaleString('en-IN'), readonly: true },
          { label: 'Processing Fees', default: '₹' + (totalRev * 0.02).toLocaleString('en-IN'), readonly: true },
          { label: 'Net Payout', default: '₹' + (totalRev * 0.98).toLocaleString('en-IN'), readonly: true }
        ],
        onSubmit(data, close) {
          close();
          location.hash = '#analytics';
        }
      });
    });

    document.getElementById('ecom-card-stores')?.addEventListener('click', () => {
      showModal({
        title: '<i class="fas fa-store" style="color:var(--purple)"></i> Integration Hub',
        submitLabel: 'Manage APIs',
        fields: [
          { label: 'Shopify Store', default: 'Active (842 SKUs)', readonly: true },
          { label: 'WooCommerce', default: 'Active (356 SKUs)', readonly: true },
          { label: 'Amazon Seller', default: 'Active (289 SKUs)', readonly: true }
        ],
        onSubmit(data, close) {
          close();
          document.getElementById('ecom-card-shopify')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Shopify card click
    document.getElementById('ecom-card-shopify')?.addEventListener('click', () => {
      showModal({
        title: '<i class="fab fa-shopify" style="color:var(--success)"></i> Shopify Store Settings',
        submitLabel: 'Save Configuration',
        fields: [
          { name: 'store_url', label: 'Store URL', required: true, default: 'amdox-store.myshopify.com' },
          { name: 'api_key', label: 'API Key', required: true, placeholder: '••••••••••••••••' },
          { name: 'sync_mode', label: 'Sync Mode', type: 'select', options: ['Real-time', 'Every 5 min', 'Every 15 min', 'Hourly', 'Manual'], default: 'Real-time' },
          { name: 'sync_products', label: 'Sync Products', type: 'select', options: ['All Products', 'Active Only', 'In Stock Only'], default: 'All Products' }
        ],
        onSubmit(data, close) {
          showToast('🛍️ Shopify store configured — ' + data.store_url, 'success');
          close();
        }
      });
    });

    // WooCommerce card click
    document.getElementById('ecom-card-woo')?.addEventListener('click', () => {
      showModal({
        title: '<i class="fab fa-wordpress" style="color:var(--purple)"></i> WooCommerce Settings',
        submitLabel: 'Save Configuration',
        fields: [
          { name: 'site_url', label: 'WordPress Site URL', required: true, default: 'https://store.amdox.com' },
          { name: 'consumer_key', label: 'Consumer Key', required: true, placeholder: 'ck_xxxxxxxxxxxx' },
          { name: 'consumer_secret', label: 'Consumer Secret', placeholder: 'cs_xxxxxxxxxxxx' },
          { name: 'api_version', label: 'WC API Version', type: 'select', options: ['wc/v3', 'wc/v2', 'wc/v1'], default: 'wc/v3' }
        ],
        onSubmit(data, close) {
          showToast('🔌 WooCommerce connected — ' + data.site_url, 'success');
          close();
        }
      });
    });

    // Amazon card click
    document.getElementById('ecom-card-amazon')?.addEventListener('click', () => {
      showModal({
        title: '<i class="fab fa-amazon" style="color:var(--warning)"></i> Amazon Marketplace Settings',
        submitLabel: 'Save Configuration',
        fields: [
          { name: 'seller_id', label: 'Seller ID', required: true, placeholder: 'e.g. A1B2C3D4E5F6G7' },
          { name: 'marketplace', label: 'Marketplace Region', type: 'select', options: ['Amazon.in (India)', 'Amazon.com (US)', 'Amazon.co.uk (UK)', 'Amazon.de (Germany)', 'Amazon.co.jp (Japan)'], default: 'Amazon.in (India)' },
          { name: 'mws_token', label: 'MWS Auth Token', placeholder: 'amzn.mws.xxxxxxxx' },
          { name: 'fulfillment', label: 'Fulfillment', type: 'select', options: ['FBA (Fulfilled by Amazon)', 'FBM (Merchant Fulfilled)', 'Both'], default: 'FBA (Fulfilled by Amazon)' }
        ],
        onSubmit(data, close) {
          showToast('📦 Amazon Marketplace configured — Seller: ' + data.seller_id, 'success');
          close();
        }
      });
    });
  };

  window.ecomDeleteOrder = function (id) {
    showConfirm(`Delete order <strong>${id}</strong>?`, () => {
      const list = getOrders().filter(o => o.id !== id);
      saveOrders(list);
      showToast(`Order ${id} deleted.`, 'success');
      renderECom();
    });
  };

  window.ecomUpdateStatus = function (id, newStatus) {
    const list = getOrders();
    const idx = list.findIndex(o => o.id === id);
    if (idx > -1) {
      list[idx].status = newStatus;
      saveOrders(list);
      showToast(`Order ${id} status updated to ${newStatus}`, 'success');
      renderECom();
    }
  };

  window.ecomViewOrder = function (id) {
    const order = getOrders().find(o => o.id === id);
    if (!order) return;

    showModal({
      title: `<i class="fas fa-eye" style="color:var(--info)"></i> View Order Details: ${id}`,
      submitLabel: 'Close',
      submitClass: 'btn-secondary',
      fields: [
        { label: 'Order ID', default: order.id, readonly: true },
        { label: 'Platform', default: order.platform, readonly: true },
        { label: 'Customer', default: order.customer, readonly: true },
        { label: 'Amount', default: `₹${Number(order.amount).toLocaleString('en-IN')}`, readonly: true },
        { label: 'Status', default: order.status, readonly: true }
      ],
      onSubmit(data, close) { close(); }
    });
  };

  window.ecomEditOrder = function (id) {
    const list = getOrders();
    const order = list.find(o => o.id === id);
    if (!order) return;

    showModal({
      title: `<i class="fas fa-edit" style="color:var(--accent)"></i> Edit Order: ${id}`,
      submitLabel: 'Save Changes',
      fields: [
        { name: 'customer', label: 'Customer Name', required: true, default: order.customer },
        { name: 'amount', label: 'Order Value (₹)', required: true, type: 'number', default: order.amount },
        { name: 'platform', label: 'Store Platform', type: 'select', options: ['Shopify', 'WooCommerce', 'Amazon'], default: order.platform },
        { name: 'status', label: 'Delivery Status', type: 'select', options: ['Processing', 'Shipped', 'Delivered'], default: order.status }
      ],
      async onSubmit(data, close) {
        const idx = list.findIndex(o => o.id === id);
        if (idx > -1) {
          list[idx] = { ...list[idx], ...data };
          saveOrders(list);
          showToast(`✅ Order ${id} updated successfully!`, 'success');
          close();
          renderECom();
        }
      }
    });
  };

  renderECom();
};

/* ============================================================
   Communication Page — Team Chats & Announcements
   ============================================================ */
pages.communication = function (container) {
  const LS_CHAT = 'amdox_chat_msgs';
  const LS_ANNOUNCEMENTS = 'amdox_announcements';

  const SEED_MSGS = {
    'general': [
      { sender: 'Anita Patel', text: 'Has everyone checked the new Q2 revenue projections?', time: '2:15 PM' },
      { sender: 'Rahul Singh', text: 'Yes, looking solid. The AI forecast models were very close.', time: '2:18 PM' }
    ],
    'engineering': [
      { sender: 'Priya Sharma', text: 'Just pushed the SSO fix to feature/auth branch.', time: '10:05 AM' },
      { sender: 'Rahul Singh', text: 'Awesome, running the build checklist now.', time: '10:11 AM' }
    ],
    'sales': [
      { sender: 'Anita Patel', text: 'Tata Motors contract finalized. Great work everyone!', time: 'Yesterday' }
    ]
  };

  const SEED_ANN = [
    { text: '📢 Town Hall Meeting — Friday 4 PM, all hands deck', author: 'CEO', time: '2 hours ago', dot: 'blue' },
    { text: '🎉 Q2 Results: Revenue target exceeded by 18%!', author: 'Finance', time: 'Yesterday', dot: 'green' }
  ];

  function getMsgs(chan) {
    try {
      const all = JSON.parse(localStorage.getItem(LS_CHAT)) || SEED_MSGS;
      return all[chan] || [];
    } catch { return SEED_MSGS[chan] || []; }
  }

  function saveMsg(chan, msg) {
    try {
      const all = JSON.parse(localStorage.getItem(LS_CHAT)) || SEED_MSGS;
      if (!all[chan]) all[chan] = [];
      all[chan].push(msg);
      localStorage.setItem(LS_CHAT, JSON.stringify(all));
    } catch { }
  }

  function getAnnouncements() {
    try { return JSON.parse(localStorage.getItem(LS_ANNOUNCEMENTS)) || SEED_ANN; } catch { return SEED_ANN; }
  }

  function saveAnnouncements(list) {
    try { localStorage.setItem(LS_ANNOUNCEMENTS, JSON.stringify(list)); } catch { }
  }

  let activeChannel = 'general';

  const renderComm = () => {
    const anns = getAnnouncements();
    const currentMsgs = getMsgs(activeChannel);

    container.innerHTML = `
      <div class="module-hero">
        <h2><i class="fas fa-comments" style="color:var(--info)"></i> Internal Communication</h2>
        <p>Team chat, video meetings, company announcements, knowledge base, and SOP documentation portal.</p>
      </div>
      <div style="display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 20px !important; margin-bottom: 24px !important; width: 100% !important;">
        <div class="stat-card" id="comm-card-msgs" style="cursor:pointer; margin:0 !important;"><div class="stat-card-header"><div class="stat-icon blue"><i class="fas fa-message"></i></div></div><div class="stat-value" id="comm-total-msgs">1,245</div><div class="stat-label">Messages Today</div></div>
        <div class="stat-card" id="comm-card-meetings" style="cursor:pointer; margin:0 !important;"><div class="stat-card-header"><div class="stat-icon green"><i class="fas fa-video"></i></div></div><div class="stat-value" id="comm-total-meetings">8</div><div class="stat-label">Active Meetings</div></div>
        <div class="stat-card" id="comm-card-ann" style="cursor:pointer; margin:0 !important;"><div class="stat-card-header"><div class="stat-icon purple"><i class="fas fa-bullhorn"></i></div></div><div class="stat-value" id="comm-total-ann">${anns.length}</div><div class="stat-label">Announcements</div></div>
        <div class="stat-card" id="btn-start-meet" style="cursor:pointer; margin:0 !important;"><div class="stat-card-header"><div class="stat-icon cyan"><i class="fas fa-camera"></i></div></div><div class="stat-value">Meet</div><div class="stat-label">Start Huddle</div></div>
      </div>
      <div style="display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; margin-bottom: 24px !important; width: 100% !important;">
        <div class="card" style="display:flex; flex-direction:column; height: 480px; margin:0 !important;">
          <div class="card-header" style="padding-bottom: 8px;">
            <span class="card-title">Chat Room: #${activeChannel}</span>
            <div style="display:flex; gap:4px">
              <button class="btn btn-secondary btn-xs ${activeChannel === 'general' ? 'active' : ''}" onclick="commSelectChannel('general')">#general</button>
              <button class="btn btn-secondary btn-xs ${activeChannel === 'engineering' ? 'active' : ''}" onclick="commSelectChannel('engineering')">#eng</button>
              <button class="btn btn-secondary btn-xs ${activeChannel === 'sales' ? 'active' : ''}" onclick="commSelectChannel('sales')">#sales</button>
            </div>
          </div>
          <div class="activity-list" id="comm-chat-log" style="flex:1; overflow-y:auto; padding:12px; display:flex; flex-direction:column; gap:10px; border-bottom: 1px solid var(--border)">
            <!-- Render messages -->
          </div>
          <form id="comm-chat-form" style="display:flex; gap:8px; padding:10px;">
            <input type="text" class="form-input" id="comm-input" placeholder="Type a message to #${activeChannel}..." style="flex:1;" autocomplete="off">
            <button type="submit" class="btn btn-primary" style="padding: 8px 16px;"><i class="fas fa-paper-plane"></i></button>
          </form>
        </div>
        <div class="card" style="display:flex; flex-direction:column; height: 480px; margin:0 !important;">
          <div class="card-header">
            <span class="card-title">Announcements</span>
            <button class="btn btn-primary btn-sm" id="comm-add-ann-btn"><i class="fas fa-plus"></i> Post Announcement</button>
          </div>
          <div class="activity-list" id="comm-ann-list" style="flex:1; overflow-y:auto; padding:12px;">
            <!-- Announcements -->
          </div>
        </div>
      </div>`;

    // Render Chat Log
    const chatLog = document.getElementById('comm-chat-log');
    if (currentMsgs.length === 0) {
      chatLog.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:30px; font-size:13px;">No messages in this channel yet.</div>`;
    } else {
      chatLog.innerHTML = currentMsgs.map(m => `
        <div style="background:rgba(255,255,255,0.02); padding:8px 12px; border-radius:8px; border:1px solid var(--border)">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:11.5px;">
            <strong style="color:var(--accent-light)">${escHtml(m.sender)}</strong>
            <span style="color:var(--text-muted)">${escHtml(m.time)}</span>
          </div>
          <div style="font-size:13px; color:var(--text-secondary)">${escHtml(m.text)}</div>
        </div>`).join('');
      // Scroll to bottom
      chatLog.scrollTop = chatLog.scrollHeight;
    }

    // Render Announcements
    const annList = document.getElementById('comm-ann-list');
    annList.innerHTML = anns.map(a => `
      <div class="activity-item">
        <div class="activity-dot ${a.dot || 'blue'}"></div>
        <div>
          <div class="activity-text">${escHtml(a.text)}</div>
          <div class="activity-time">Posted by ${escHtml(a.author)} · ${escHtml(a.time)}</div>
        </div>
      </div>`).join('');

    // Attach Chat Submit
    document.getElementById('comm-chat-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('comm-input');
      const val = input.value.trim();
      if (!val) return;

      const userJson = localStorage.getItem('amdox_auth_user');
      let name = 'Amit Kumar';
      if (userJson) {
        try { name = JSON.parse(userJson).name; } catch (err) { }
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      const newMsg = { sender: name, text: val, time: timeStr };
      saveMsg(activeChannel, newMsg);
      input.value = '';
      renderComm();

      // Bump chat stat slightly
      const countEl = document.getElementById('comm-total-msgs');
      if (countEl) {
        const val = parseInt(countEl.textContent.replace(/,/g, '')) || 1245;
        countEl.textContent = Number(val + 1).toLocaleString('en-IN');
      }
    });

    // Attach Post Announcement
    document.getElementById('comm-add-ann-btn').addEventListener('click', () => {
      showModal({
        title: '<i class="fas fa-bullhorn" style="color:var(--purple)"></i> Post Company Announcement',
        submitLabel: 'Publish',
        fields: [
          { name: 'text', label: 'Announcement Message', required: true, placeholder: 'e.g. Q3 goals aligned...' },
          { name: 'author', label: 'Author Department/Name', required: true, placeholder: 'e.g. HR Team', default: 'HR Team' },
          { name: 'dot', label: 'Alert Tag Color', type: 'select', options: ['blue', 'green', 'yellow', 'purple', 'red'], default: 'blue' }
        ],
        async onSubmit(data, close) {
          const list = getAnnouncements();
          list.unshift({ ...data, time: 'Just now' });
          saveAnnouncements(list);
          showToast('📢 New announcement broadcasted!', 'success');
          close();
          renderComm();
        }
      });
    });

    // Start Huddle
    document.getElementById('btn-start-meet')?.addEventListener('click', () => {
      showModal({
        title: '<i class="fas fa-camera" style="color:var(--cyan)"></i> Start Instant Huddle',
        submitLabel: 'Go Live',
        fields: [
          { name: 'topic', label: 'Meeting Topic', required: true, placeholder: 'e.g. Quick Sync' },
          { name: 'channel', label: 'Broadcast to', type: 'select', options: ['#general', '#engineering', '#sales', 'Private'], default: '#general' },
          { name: 'record', label: 'Record Session', type: 'select', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }], default: 'no' }
        ],
        onSubmit(data, close) {
          showToast(`🎥 Huddle "${data.topic}" is live on ${data.channel}!`, 'success');
          close();
        }
      });
    });

    // ── Communication Stat Card Handlers (Enhanced) ──
    document.getElementById('comm-card-msgs')?.addEventListener('click', () => {
      const msgCount = document.getElementById('comm-total-msgs')?.textContent || '1,245';
      const recentNames = ['Anita Patel', 'Rahul Singh', 'Priya Sharma', 'Arjun Mehta', 'Sneha Reddy', 'Vikram Singh', 'Amit Kumar'];
      const channels = ['#general', '#engineering', '#sales', '#hr', '#marketing'];
      const texts = ['Great work on the Q2 reports!', 'SSO fix is live.', 'Client call at 4 PM.', 'Check the new SOP.', 'Happy Birthday Sneha!', 'Meeting link sent.'];

      const logs = [];
      for (let i = 1; i <= 20; i++) {
        logs.push({
          sender: recentNames[i % recentNames.length],
          channel: channels[i % channels.length],
          text: texts[i % texts.length],
          time: `${Math.floor(i / 2) + 1} min ago`
        });
      }

      const html = `
        <div style="padding:5px">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; background:rgba(99,102,241,0.05); padding:10px; border-radius:10px; border:1px solid rgba(99,102,241,0.1)">
            <div><span style="color:var(--text-muted); font-size:12px">Total Volume (24h)</span><div style="font-size:20px; font-weight:700; color:var(--accent-light)">${msgCount}</div></div>
            <div><span style="color:var(--text-muted); font-size:12px">Peak Hour</span><div style="font-size:20px; font-weight:700; color:var(--success)">11:30 AM</div></div>
            <div><span style="color:var(--text-muted); font-size:12px">Sentiment</span><div style="font-size:20px; font-weight:700; color:var(--info)">Positive (92%)</div></div>
          </div>
          <div class="table-container" style="max-height:400px; overflow-y:auto">
            <table style="width:100%; border-collapse:collapse">
              <thead style="position:sticky; top:0; background:var(--bg-card); z-index:1">
                <tr style="text-align:left; border-bottom:1px solid var(--border); font-size:12px; color:var(--text-muted)">
                  <th style="padding:10px">Sender</th>
                  <th>Channel</th>
                  <th>Message Snippet</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                ${logs.map(l => `
                  <tr style="border-bottom:1px solid var(--border); font-size:13px">
                    <td style="padding:12px 10px; font-weight:600; color:var(--accent-light)">${l.sender}</td>
                    <td><span class="badge" style="background:rgba(255,255,255,0.05)">${l.channel}</span></td>
                    <td style="color:var(--text-secondary)">${l.text}</td>
                    <td style="font-size:11px; color:var(--text-muted)">${l.time}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div style="margin-top:15px; text-align:right">
            <button class="btn btn-secondary btn-sm" id="comm-export-btn-real"><i class="fas fa-file-csv"></i> Export Full Log (CSV)</button>
          </div>
        </div>`;

      showContentModal({
        title: '<i class="fas fa-comments" style="color:var(--info)"></i> Team Engagement Log',
        content: html,
        maxWidth: '750px'
      });

      // Hook Export Button
      document.getElementById('comm-export-btn-real')?.addEventListener('click', () => {
        showToast('⚙️ Preparing export for 1,245 message records...', 'info');

        setTimeout(() => {
          const headers = ['Sender', 'Channel', 'Message', 'Timestamp'];
          const recentNames = ['Anita Patel', 'Rahul Singh', 'Priya Sharma', 'Arjun Mehta', 'Sneha Reddy', 'Vikram Singh', 'Amit Kumar'];
          const channels = ['#general', '#engineering', '#sales', '#hr', '#marketing'];
          const texts = ['Great work!', 'SSO fix live', 'Check SOP', 'Meeting link', 'Budget approved', 'Code reviewed'];

          let csv = headers.join(',') + '\n';
          for (let i = 1; i <= 100; i++) { // Sample 100 for the file
            const row = [
              recentNames[i % recentNames.length],
              channels[i % channels.length],
              `"${texts[i % texts.length].replace(/"/g, '""')}"`,
              `${i}m ago`
            ];
            csv += row.join(',') + '\n';
          }

          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Amdox_Comm_Log_${new Date().toISOString().split('T')[0]}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          showToast('✅ Full log exported successfully!', 'success');
        }, 1200);
      });
    });

    document.getElementById('comm-card-meetings')?.addEventListener('click', () => {
      const meetings = [
        { topic: 'Engineering Daily Standup', room: 'Dev Room Alpha', host: 'Rahul Singh', users: 12, time: 'Active 24m' },
        { topic: 'Sales Pipeline Review', room: 'Sales Hub', host: 'Anita Patel', users: 5, time: 'Active 10m' },
        { topic: 'Design System Workspace', room: 'Figma Live', host: 'Priya Sharma', users: 3, time: 'Active 45m' },
        { topic: 'Monthly HR All-Hands', room: 'Town Hall', host: 'Sonia Gill', users: 48, time: 'Starting' },
        { topic: 'Tech Architecture Sync', room: 'The Bunker', host: 'Arjun Mehta', users: 4, time: 'Active 1h' },
        { topic: 'Marketing Q3 Planning', room: 'Creative Studio', host: 'Rajesh Gupta', users: 6, time: 'Active 15m' },
        { topic: 'Customer Success Huddle', room: 'Support Lobby', host: 'Vikram Singh', users: 8, time: 'Active 5m' },
        { topic: 'CEO Quick Fire', room: 'Admin Suite', host: 'Amit Kumar', users: 2, time: 'Active 2m' }
      ];

      const html = `
        <div style="padding:10px">
          <div style="margin-bottom:20px; display:grid !important; grid-template-columns:repeat(3, 1fr) !important; gap:12px !important; width: 100% !important;">
            <div style="background:linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1)); padding:15px; border-radius:12px; border:1px solid rgba(99,102,241,0.2); text-align:center">
              <div style="font-size:12px; color:var(--text-muted)">Total Live</div>
              <div style="font-size:24px; font-weight:700; color:var(--info)">88 Users</div>
            </div>
            <div style="background:linear-gradient(135deg, rgba(34,197,94,0.1), rgba(6,182,212,0.1)); padding:15px; border-radius:12px; border:1px solid rgba(34,197,94,0.2); text-align:center">
              <div style="font-size:12px; color:var(--text-muted)">Active Huddles</div>
              <div style="font-size:24px; font-weight:700; color:var(--success)">8</div>
            </div>
            <div style="background:linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.1)); padding:15px; border-radius:12px; border:1px solid rgba(245,158,11,0.2); text-align:center">
              <div style="font-size:12px; color:var(--text-muted)">Bandwidth</div>
              <div style="font-size:24px; font-weight:700; color:var(--warning)">1.2 Gbps</div>
            </div>
          </div>
          <div style="display:grid !important; grid-template-columns: repeat(2, 1fr) !important; gap:15px !important; width: 100% !important;">
            ${meetings.map(m => `
              <div class="card" style="margin-bottom:0 !important; padding:15px; border-color:rgba(255,255,255,0.05); transition:all 0.2s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.05)'">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px">
                  <span class="badge" style="background:rgba(34,197,94,0.12); color:var(--success); font-size:10px"><i class="fas fa-circle" style="font-size:8px; margin-right:4px"></i> LIVE</span>
                  <span style="font-size:11px; color:var(--text-muted)">${m.time}</span>
                </div>
                <h4 style="font-size:14px; margin-bottom:5px; color:var(--text-primary)">${m.topic}</h4>
                <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px"><i class="fas fa-map-marker-alt" style="margin-right:5px"></i> ${m.room}</div>
                <div style="display:flex; justify-content:space-between; align-items:center">
                  <div style="display:flex; align-items:center; gap:6px">
                    <div style="width:24px; height:24px; border-radius:50%; background:var(--accent); display:flex; align-items:center; justify-content:center; font-size:9px; color:#fff">${m.host.substring(0, 2).toUpperCase()}</div>
                    <span style="font-size:12px">${m.host}</span>
                  </div>
                  <div style="font-size:12px; color:var(--text-muted)"><i class="fas fa-users"></i> ${m.users}</div>
                </div>
                <button class="btn btn-primary btn-sm" style="width:100%; margin-top:12px; font-size:11px; padding:6px" onclick="showToast('Connecting to secure media stream...', 'info')">Join Room</button>
              </div>`).join('')}
          </div>
        </div>`;

      showContentModal({
        title: '<i class="fas fa-video" style="color:var(--success)"></i> Active Global Conferences',
        content: html,
        maxWidth: '800px'
      });
    });

    document.getElementById('comm-card-ann')?.addEventListener('click', () => {
      showModal({
        title: '<i class="fas fa-bullhorn" style="color:var(--purple)"></i> Broadcast Stats',
        submitLabel: 'Scroll to Posts',
        fields: [
          { label: 'Total Announcements', default: anns.length.toString(), readonly: true },
          { label: 'Read Ratio', default: '92%', readonly: true },
          { label: 'Latest Update', default: anns[0]?.text || 'N/A', readonly: true }
        ],
        onSubmit(data, close) {
          close();
          const list = document.getElementById('comm-ann-list');
          if (list) list.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  };

  window.commSelectChannel = function (chan) {
    activeChannel = chan;
    renderComm();
  };

  renderComm();
};

/* ============================================================
   DevOps Page — Automated CI/CD Deploy Pipelines
   ============================================================ */
pages.devops = function (container) {
  const LS_DEVOPS_BUILDS = 'amdops_builds';
  const LS_DEVOPS_STATS = 'amdops_stats';

  const SEED_BUILDS = [
    { id: '847', branch: 'main', action: 'Deployed to production', time: '5 min ago', status: 'Passed' },
    { id: '846', branch: 'feature/ai-module', action: 'Deployed to staging', time: '1 hour ago', status: 'Passed' },
    { id: '845', branch: 'fix/auth-bug', action: 'Test compilation', time: '2 hours ago', status: 'Failed' },
    { id: '844', branch: 'main', action: 'Production release', time: '5 hours ago', status: 'Passed' }
  ];

  const SEED_STATS = { uptime: '99.98%', builds: 847, pods: 24, latency: 45 };

  function getBuilds() {
    try { return JSON.parse(localStorage.getItem(LS_DEVOPS_BUILDS)) || SEED_BUILDS; } catch { return SEED_BUILDS; }
  }
  function saveBuilds(list) {
    try { localStorage.setItem(LS_DEVOPS_BUILDS, JSON.stringify(list)); } catch { }
  }
  function getStats() {
    try { return JSON.parse(localStorage.getItem(LS_DEVOPS_STATS)) || SEED_STATS; } catch { return SEED_STATS; }
  }
  function saveStats(stats) {
    try { localStorage.setItem(LS_DEVOPS_STATS, JSON.stringify(stats)); } catch { }
  }

  const renderDevOps = () => {
    const builds = getBuilds();
    const stats = getStats();

    container.innerHTML = `
      <div class="module-hero">
        <h2><i class="fas fa-server" style="color:var(--cyan)"></i> DevOps & Deployment</h2>
        <p>CI/CD pipelines, Docker/Kubernetes, Terraform IaC, ArgoCD GitOps, and Prometheus/Grafana monitoring.</p>
      </div>
      <div style="display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 20px !important; margin-bottom: 24px !important; width: 100% !important;">
        <div class="stat-card" id="devops-card-uptime" style="cursor:pointer; margin:0 !important;"><div class="stat-card-header"><div class="stat-icon green"><i class="fas fa-circle-check"></i></div></div><div class="stat-value" id="devops-stat-uptime">${stats.uptime}</div><div class="stat-label">Uptime</div></div>
        <div class="stat-card" id="devops-card-deployments" style="cursor:pointer; margin:0 !important;"><div class="stat-card-header"><div class="stat-icon blue"><i class="fas fa-code-branch"></i></div></div><div class="stat-value" id="devops-stat-builds">${stats.builds}</div><div class="stat-label">Deployments</div></div>
        <div class="stat-card" id="devops-card-pods" style="cursor:pointer; margin:0 !important;"><div class="stat-card-header"><div class="stat-icon cyan"><i class="fas fa-cubes"></i></div></div><div class="stat-value" id="devops-stat-pods">${stats.pods}</div><div class="stat-label">Active Pods</div></div>
        <div class="stat-card" id="devops-card-latency" style="cursor:pointer; margin:0 !important;"><div class="stat-card-header"><div class="stat-icon purple"><i class="fas fa-gauge-high"></i></div></div><div class="stat-value" id="devops-stat-latency">${stats.latency}ms</div><div class="stat-label">Avg Latency</div></div>
      </div>
      <div style="display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; margin-bottom: 24px !important; width: 100% !important;">
        <div class="card" style="margin:0 !important;">
          <div class="card-header">
            <span class="card-title">CI/CD Pipeline Status</span>
            <button class="btn btn-primary btn-sm" id="devops-deploy-btn"><i class="fas fa-play"></i> Trigger Deploy</button>
          </div>
          <div class="activity-list" id="devops-builds-list">
            <!-- Dynamically rendered builds -->
          </div>
        </div>
        <div class="card" style="margin:0 !important;">
          <div class="card-header"><span class="card-title">Infrastructure Stack</span></div>
          <div class="activity-list">
            <div class="list-item"><div class="list-icon" style="background:rgba(6,182,212,0.12);color:var(--cyan)"><i class="fab fa-docker"></i></div><div class="list-content"><div class="list-title">Docker</div><div class="list-subtitle">24 containers running</div></div><span class="badge badge-success">Healthy</span></div>
            <div class="list-item"><div class="list-icon" style="background:rgba(59,130,246,0.12);color:var(--info)"><i class="fas fa-dharmachakra"></i></div><div class="list-content"><div class="list-title">Kubernetes (EKS)</div><div class="list-subtitle">3 nodes, 24 pods</div></div><span class="badge badge-success">Healthy</span></div>
            <div class="list-item"><div class="list-icon" style="background:rgba(168,85,247,0.12);color:var(--purple)"><i class="fas fa-cloud"></i></div><div class="list-content"><div class="list-title">Terraform</div><div class="list-subtitle">42 resources managed</div></div><span class="badge badge-success">Synced</span></div>
            <div class="list-item"><div class="list-icon" style="background:rgba(245,158,11,0.12);color:var(--warning)"><i class="fas fa-chart-area"></i></div><div class="list-content"><div class="list-title">Prometheus + Grafana</div><div class="list-subtitle">156 metrics tracked</div></div><span class="badge badge-success">Active</span></div>
          </div>
        </div>
      </div>
      
      <!-- Manual ZIP Deployment Package Upload -->
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-file-archive" style="color:var(--cyan); margin-right:8px;"></i> Manual Deployment (ZIP Package)</span>
        </div>
        <div style="padding: 20px;">
          <div id="zip-upload-zone" style="border: 2px dashed rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 30px; text-align: center; background: rgba(6, 182, 212, 0.02); cursor: pointer; transition: all 0.3s ease;">
            <div style="font-size: 40px; color: var(--cyan); margin-bottom: 12px;">
              <i class="fas fa-cloud-arrow-up" id="upload-icon"></i>
            </div>
            <h4 style="font-size: 15px; margin-bottom: 6px; color: var(--text-primary);" id="upload-zone-title">Drag & Drop ZIP deploy package here, or click to browse</h4>
            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 15px;">Max file size: 50MB. Only .zip extension files are allowed.</p>
            <input type="file" id="zip-file-input" accept=".zip" style="display: none;" />
            <button class="btn btn-secondary btn-sm" id="select-zip-btn"><i class="fas fa-folder-open"></i> Select ZIP File</button>
            <div id="selected-file-info" style="display: none; margin-top: 15px; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; border: 1px solid var(--border);">
              <span style="font-size: 13px; font-family: var(--font-mono); color: var(--accent-light);" id="selected-file-name">filename.zip</span>
              <span style="font-size: 12px; color: var(--text-muted); margin-left: 10px;" id="selected-file-size">(0 KB)</span>
            </div>
          </div>
          <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
            <button class="btn btn-primary" id="start-zip-upload-btn" disabled><i class="fas fa-upload"></i> Upload & Deploy Package</button>
          </div>
        </div>
      </div>`;

    const buildsList = document.getElementById('devops-builds-list');
    const badgeClass = status => {
      if (status === 'Passed') return 'badge-success';
      if (status === 'Failed') return 'badge-danger';
      return 'badge-warning';
    };
    const buildIcon = status => {
      if (status === 'Passed') return 'fa-check-circle';
      if (status === 'Failed') return 'fa-times-circle';
      return 'fa-spinner fa-spin';
    };
    const listColor = status => {
      if (status === 'Passed') return 'var(--success)';
      if (status === 'Failed') return 'var(--danger)';
      return 'var(--warning)';
    };

    buildsList.innerHTML = builds.map(b => `
      <div class="list-item">
        <div class="list-icon" style="background:rgba(255,255,255,0.03);color:${listColor(b.status)}">
          <i class="fas ${buildIcon(b.status)}"></i>
        </div>
        <div class="list-content">
          <div class="list-title">Build #${b.id} — ${escHtml(b.branch)}</div>
          <div class="list-subtitle">${escHtml(b.action)} · ${escHtml(b.time)}</div>
        </div>
        <span class="badge ${badgeClass(b.status)}">${escHtml(b.status)}</span>
      </div>`).join('');

    // Select ZIP File Event Hooks
    const zipFileInput = document.getElementById('zip-file-input');
    const zipUploadZone = document.getElementById('zip-upload-zone');
    const selectZipBtn = document.getElementById('select-zip-btn');
    const selectedFileInfo = document.getElementById('selected-file-info');
    const selectedFileName = document.getElementById('selected-file-name');
    const selectedFileSize = document.getElementById('selected-file-size');
    const startZipUploadBtn = document.getElementById('start-zip-upload-btn');
    const uploadIcon = document.getElementById('upload-icon');
    const uploadZoneTitle = document.getElementById('upload-zone-title');

    // Click on zone or select button triggers file selection
    zipUploadZone.addEventListener('click', (e) => {
      if (e.target !== selectZipBtn && e.target !== startZipUploadBtn && !startZipUploadBtn.contains(e.target)) {
        zipFileInput.click();
      }
    });
    selectZipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      zipFileInput.click();
    });

    zipFileInput.addEventListener('change', () => {
      if (zipFileInput.files.length > 0) {
        const file = zipFileInput.files[0];
        selectedFileName.textContent = file.name;
        selectedFileSize.textContent = `(${(file.size / 1024).toFixed(1)} KB)`;
        selectedFileInfo.style.display = 'block';
        startZipUploadBtn.disabled = false;

        // Visual feedback
        zipUploadZone.style.borderColor = 'var(--cyan)';
        zipUploadZone.style.background = 'rgba(6, 182, 212, 0.05)';
        uploadIcon.className = 'fas fa-file-zipper';
        uploadZoneTitle.textContent = 'ZIP File Selected';
      } else {
        selectedFileInfo.style.display = 'none';
        startZipUploadBtn.disabled = true;
        zipUploadZone.style.borderColor = 'rgba(6, 182, 212, 0.3)';
        zipUploadZone.style.background = 'rgba(6, 182, 212, 0.02)';
        uploadIcon.className = 'fas fa-cloud-arrow-up';
        uploadZoneTitle.textContent = 'Drag & Drop ZIP deploy package here, or click to browse';
      }
    });

    // Drag and Drop simulation/handling
    zipUploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zipUploadZone.style.borderColor = 'var(--cyan)';
      zipUploadZone.style.background = 'rgba(6, 182, 212, 0.08)';
    });

    zipUploadZone.addEventListener('dragleave', () => {
      if (zipFileInput.files.length === 0) {
        zipUploadZone.style.borderColor = 'rgba(6, 182, 212, 0.3)';
        zipUploadZone.style.background = 'rgba(6, 182, 212, 0.02)';
      }
    });

    zipUploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.name.endsWith('.zip')) {
          zipFileInput.files = e.dataTransfer.files;
          zipFileInput.dispatchEvent(new Event('change'));
        } else {
          showToast('Only .zip files are allowed!', 'error');
          zipUploadZone.style.borderColor = 'rgba(6, 182, 212, 0.3)';
          zipUploadZone.style.background = 'rgba(6, 182, 212, 0.02)';
        }
      }
    });

    // Upload & Deploy handler
    startZipUploadBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (zipFileInput.files.length === 0) return;

      const file = zipFileInput.files[0];
      const formData = new FormData();
      formData.append('zipFile', file);

      startZipUploadBtn.disabled = true;
      startZipUploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

      try {
        const response = await fetch('/api/upload-zip', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          showToast('ZIP package uploaded & deployment verified!', 'success');

          // Clear input and UI state
          zipFileInput.value = '';
          selectedFileInfo.style.display = 'none';
          startZipUploadBtn.disabled = true;
          startZipUploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload & Deploy Package';
          zipUploadZone.style.borderColor = 'rgba(6, 182, 212, 0.3)';
          zipUploadZone.style.background = 'rgba(6, 182, 212, 0.02)';
          uploadIcon.className = 'fas fa-cloud-arrow-up';
          uploadZoneTitle.textContent = 'Drag & Drop ZIP deploy package here, or click to browse';

          // Insert a new Passed build to list
          const list = getBuilds();
          const currentStats = getStats();
          const nextBuildId = String(currentStats.builds + 1);

          const newBuild = {
            id: nextBuildId,
            branch: 'manual-zip',
            action: `Deployed package: ${result.fileInfo.originalName}`,
            time: 'Just now',
            status: 'Passed'
          };

          list.unshift(newBuild);
          saveBuilds(list);

          // Update Stats
          currentStats.builds += 1;
          currentStats.latency = Math.floor(30 + Math.random() * 10);
          saveStats(currentStats);

          renderDevOps();
        } else {
          showToast(`Error: ${result.error}`, 'error');
          startZipUploadBtn.disabled = false;
          startZipUploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload & Deploy Package';
        }
      } catch (error) {
        console.error('Upload failed:', error);
        showToast('Server upload error occurred!', 'error');
        startZipUploadBtn.disabled = false;
        startZipUploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload & Deploy Package';
      }
    });

    // Deploy simulation
    document.getElementById('devops-deploy-btn').addEventListener('click', (e) => {
      const btn = e.target;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Compiling...';

      // Insert temporary building item
      const list = getBuilds();
      const currentStats = getStats();
      const nextBuildId = String(currentStats.builds + 1);

      const activeBuild = { id: nextBuildId, branch: 'main', action: 'Provisioning cluster nodes', time: 'Just now', status: 'Running' };
      list.unshift(activeBuild);
      saveBuilds(list);
      renderDevOps();
      showToast(`⚡ CI/CD Pipeline #${nextBuildId} initiated!`, 'info');

      // Compile steps
      setTimeout(() => {
        const freshList = getBuilds();
        const activeIdx = freshList.findIndex(b => b.id === nextBuildId);
        if (activeIdx > -1) {
          freshList[activeIdx].action = 'Compiling Docker images & running tests';
          saveBuilds(freshList);
          renderDevOps();
        }
      }, 1500);

      // Finalize compiler result
      setTimeout(() => {
        const freshList = getBuilds();
        const activeIdx = freshList.findIndex(b => b.id === nextBuildId);
        if (activeIdx > -1) {
          const pass = Math.random() < 0.85;
          freshList[activeIdx].status = pass ? 'Passed' : 'Failed';
          freshList[activeIdx].action = pass ? 'Deployed to production cluster successfully' : 'Compilation error in unit tests';
          freshList[activeIdx].time = '1s ago';
          saveBuilds(freshList);

          // Update Stats
          currentStats.builds += 1;
          if (pass) {
            currentStats.pods += Math.floor(Math.random() * 3) - 1; // pods drift
            currentStats.latency = Math.floor(38 + Math.random() * 10); // latency drift
          }
          saveStats(currentStats);

          showToast(pass ? `✅ Build #${nextBuildId} deployed!` : `❌ Pipeline #${nextBuildId} failed tests.`, pass ? 'success' : 'error');
        }
        renderDevOps();
      }, 3500);
    });

    // ── DevOps Stat Card Handlers ──
    document.getElementById('devops-card-uptime')?.addEventListener('click', () => {
      showModal({
        title: '<i class="fas fa-circle-check" style="color:var(--success)"></i> Cluster Availability',
        submitLabel: 'Run Health Check',
        fields: [
          { label: 'System Uptime', default: stats.uptime, readonly: true },
          { label: 'Unscheduled Downtime', default: '8 mins (Last 30d)', readonly: true },
          { label: 'Critical Errors', default: '0 Active', readonly: true }
        ],
        onSubmit(data, close) {
          showToast('🛡️ Deep infrastructure health scan completed. No anomalies found.', 'success');
          close();
        }
      });
    });

    document.getElementById('devops-card-deployments')?.addEventListener('click', () => {
      showModal({
        title: '<i class="fas fa-code-branch" style="color:var(--info)"></i> release Velocity',
        submitLabel: 'View Build Pipeline',
        fields: [
          { label: 'Total Deployments', default: stats.builds.toString(), readonly: true },
          { label: 'Success Rate', default: '94.2%', readonly: true },
          { label: 'Avg Build Time', default: '2m 45s', readonly: true }
        ],
        onSubmit(data, close) {
          close();
          const list = document.getElementById('devops-builds-list');
          if (list) list.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    document.getElementById('devops-card-pods')?.addEventListener('click', () => {
      showModal({
        title: '<i class="fas fa-cubes" style="color:var(--cyan)"></i> Kubernetes Resources',
        submitLabel: 'Scale Cluster',
        fields: [
          { label: 'Running Pods', default: stats.pods.toString(), readonly: true },
          { label: 'CPU Utilization', default: '42.8%', readonly: true },
          { label: 'Memory Reserved', default: '16.4 GB', readonly: true }
        ],
        onSubmit(data, close) {
          showToast('🚀 Autoscaling rules updated. Cluster capacity increased by 20%.', 'success');
          close();
        }
      });
    });

    document.getElementById('devops-card-latency')?.addEventListener('click', () => {
      showModal({
        title: '<i class="fas fa-gauge-high" style="color:var(--purple)"></i> Networking Performance',
        submitLabel: 'Analyze Traffic',
        fields: [
          { label: 'Avg Latency', default: stats.latency + 'ms', readonly: true },
          { label: 'P99 Latency', default: (stats.latency * 1.5).toFixed(0) + 'ms', readonly: true },
          { label: 'Request Success', default: '99.99%', readonly: true }
        ],
        onSubmit(data, close) {
          showToast('📊 Network traffic analysis report generated in Analytics.', 'info');
          close();
        }
      });
    });
  };

  renderDevOps();
};

/* ============================================================
   Settings Page — Dynamic Tenant Syncing
   ============================================================ */
pages.settings = function (container) {
  const renderSettings = () => {
    const userJson = localStorage.getItem('amdox_auth_user');
    let currentUser = { name: 'Amit Kumar', email: 'amit@amdox.com', role: 'Super Admin' };
    if (userJson) {
      try { currentUser = JSON.parse(userJson); } catch (e) { }
    }

    const tenantName = localStorage.getItem('amdox_tenant_name') || 'Amdox Technologies Pvt Ltd';
    const planName = localStorage.getItem('amdox_platform_plan') || 'Enterprise';

    container.innerHTML = `
      <div class="module-hero">
        <h2><i class="fas fa-gear" style="color:var(--text-secondary)"></i> Platform Settings</h2>
        <p>Company configuration, user management, integrations, billing, and system preferences.</p>
      </div>
      <div style="display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 20px !important; margin-bottom: 24px !important; width: 100% !important;">
        <div class="card" id="set-card-company" style="cursor:pointer; margin:0 !important;"><div style="text-align:center;padding:16px"><div style="width:48px;height:48px;border-radius:12px;background:rgba(99,102,241,0.12);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:20px;color:var(--accent)"><i class="fas fa-building"></i></div><h3 style="font-size:14px">Company Profile</h3><p style="font-size:12px;color:var(--text-muted);margin-top:4px">Name, logo, address</p></div></div>
        <div class="card" id="set-card-user" style="cursor:pointer; margin:0 !important;"><div style="text-align:center;padding:16px"><div style="width:48px;height:48px;border-radius:12px;background:rgba(34,197,94,0.12);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:20px;color:var(--success)"><i class="fas fa-users-gear"></i></div><h3 style="font-size:14px">User Settings</h3><p style="font-size:12px;color:var(--text-muted);margin-top:4px">Account configurations</p></div></div>
        <div class="card" id="set-card-backup" style="cursor:pointer; margin:0 !important;"><div style="text-align:center;padding:16px"><div style="width:48px;height:48px;border-radius:12px;background:rgba(6,182,212,0.12);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:20px;color:var(--cyan)"><i class="fas fa-database"></i></div><h3 style="font-size:14px">Data & Backup</h3><p style="font-size:12px;color:var(--text-muted);margin-top:4px">Export local cache</p></div></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">System Information</span></div>
        <div class="table-container">
          <table>
            <tbody>
              <tr><td style="font-weight:600;width:200px">Platform Version</td><td>Amdox ERP v3.2.1</td></tr>
              <tr><td style="font-weight:600">Active Tenant</td><td id="settings-info-tenant">${escHtml(tenantName)}</td></tr>
              <tr><td style="font-weight:600">Plan Status</td><td><span class="badge badge-purple">${escHtml(planName)}</span></td></tr>
              <tr><td style="font-weight:600">Logged In User</td><td>${escHtml(currentUser.name)} (${escHtml(currentUser.email)})</td></tr>
              <tr><td style="font-weight:600">Last Backup</td><td id="settings-info-backup">May 18, 2026 · 02:00 AM IST</td></tr>
            </tbody>
          </table>
        </div>
      </div>`;

    // Hook company profile edit
    document.getElementById('set-card-company').addEventListener('click', () => {
      showModal({
        title: '<i class="fas fa-building" style="color:var(--accent)"></i> Edit Company Profile',
        submitLabel: 'Save Settings',
        fields: [
          { name: 'tenant', label: 'Company / Tenant Name', required: true, default: tenantName },
          { name: 'plan', label: 'Platform Plan Tier', type: 'select', options: ['Starter', 'Professional', 'Enterprise', 'Ultimate'], default: planName }
        ],
        async onSubmit(data, close) {
          localStorage.setItem('amdox_tenant_name', data.tenant);
          localStorage.setItem('amdox_platform_plan', data.plan);

          // Dynamically change index.html tenant dropdown if present
          const select = document.getElementById('tenant-select');
          if (select && select.options.length > 0) {
            select.options[0].text = data.tenant;
          }

          showToast('✅ Company settings saved successfully!', 'success');
          close();
          renderSettings();
        }
      });
    });

    // Hook user settings edit
    document.getElementById('set-card-user').addEventListener('click', () => {
      showModal({
        title: '<i class="fas fa-users-gear" style="color:var(--success)"></i> Edit User Profile',
        submitLabel: 'Save Profile',
        fields: [
          { name: 'name', label: 'Your Full Name', required: true, default: currentUser.name },
          { name: 'role', label: 'Your Role / Job Title', required: true, default: currentUser.role }
        ],
        async onSubmit(data, close) {
          currentUser.name = data.name;
          currentUser.role = data.role;
          localStorage.setItem('amdox_auth_user', JSON.stringify(currentUser));

          // Trigger global app profile bar update
          if (typeof updateSidebarAndProfile === 'function') {
            updateSidebarAndProfile();
          }

          showToast('✅ User profile updated!', 'success');
          close();
          renderSettings();
        }
      });
    });

    // Hook backup actions
    document.getElementById('set-card-backup').addEventListener('click', () => {
      showModal({
        title: '<i class="fas fa-database" style="color:var(--cyan)"></i> Data Management',
        submitLabel: 'Process Action',
        fields: [
          {
            name: 'action', label: 'Select Action', type: 'select', options: [
              { value: 'export', label: 'Export Local Cache (JSON)' },
              { value: 'backup', label: 'Trigger Cloud Backup' },
              { value: 'clear', label: 'Clear All Local Data' }
            ], default: 'export'
          },
          { label: 'Estimated Size', default: (JSON.stringify(localStorage).length / 1024).toFixed(1) + ' KB', readonly: true }
        ],
        async onSubmit(data, close) {
          if (data.action === 'export') {
            const blob = new Blob([JSON.stringify(localStorage, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `amdox_erp_backup_${new Date().getTime()}.json`;
            a.click();
            showToast('✅ Local cache exported successfully!', 'success');
          } else if (data.action === 'backup') {
            showToast('☁️ Initiating cloud synchronization...', 'info');
            setTimeout(() => {
              const nowStr = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
              const infoEl = document.getElementById('settings-info-backup');
              if (infoEl) infoEl.textContent = nowStr + ' IST';
              showToast('✅ Enterprise cloud backup completed!', 'success');
            }, 1000);
          } else if (data.action === 'clear') {
            showConfirm('🚨 CRITICAL: This will wipe all local ERP data and reset the system. Continue?', () => {
              localStorage.clear();
              location.reload();
            });
          }
          close();
        }
      });
    });
  };

  renderSettings();
};