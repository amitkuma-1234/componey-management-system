/* CRM Page */
pages.crm = function (container) {
  container.innerHTML = `
    <div class="module-hero">
      <h2><i class="fas fa-handshake" style="color:var(--pink)"></i> Customer Relationship Management</h2>
      <p>Lead management, sales pipeline, customer analytics, support ticketing, and WhatsApp/email marketing integration.</p>
      <div class="page-actions" style="margin-top:16px">
        <button class="btn btn-primary btn-sm" id="crm-add-btn"><i class="fas fa-user-plus"></i> New Lead</button>
        <button class="btn btn-secondary btn-sm" id="crm-campaign-btn"><i class="fas fa-bullhorn"></i> Campaign</button>
      </div>
    </div>
    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr) !important;">
      <div class="stat-card" id="crm-stat-total"><div class="stat-card-header"><div class="stat-icon blue"><i class="fas fa-users"></i></div><span class="stat-trend up"><i class="fas fa-arrow-up"></i> 12%</span></div><div class="stat-value" id="crm-stats-total">—</div><div class="stat-label">Total Leads</div></div>
      <div class="stat-card" id="crm-stat-won"><div class="stat-card-header"><div class="stat-icon green"><i class="fas fa-trophy"></i></div></div><div class="stat-value" id="crm-stats-won">—</div><div class="stat-label">Won This Month</div></div>
      <div class="stat-card" id="crm-stat-value"><div class="stat-card-header"><div class="stat-icon purple"><i class="fas fa-indian-rupee-sign"></i></div></div><div class="stat-value" id="crm-stats-value">—</div><div class="stat-label">Pipeline Value</div></div>
      <div class="stat-card" id="crm-stat-rate"><div class="stat-card-header"><div class="stat-icon yellow"><i class="fas fa-percent"></i></div></div><div class="stat-value">68%</div><div class="stat-label">Win Rate</div></div>
    </div>
    <div class="card" style="margin-bottom:24px">
      <div class="card-header"><span class="card-title">Sales Pipeline</span></div>
      <div class="pipeline" id="crm-pipeline-stages">
        <div class="pipeline-stage"><div class="pipeline-stage-name">New Leads</div><div class="pipeline-stage-value">—</div><div class="pipeline-stage-count">₹0L value</div></div>
        <div class="pipeline-stage"><div class="pipeline-stage-name">Qualified</div><div class="pipeline-stage-value">—</div><div class="pipeline-stage-count">₹0L value</div></div>
        <div class="pipeline-stage"><div class="pipeline-stage-name">Proposal</div><div class="pipeline-stage-value">—</div><div class="pipeline-stage-count">₹0L value</div></div>
        <div class="pipeline-stage"><div class="pipeline-stage-name">Negotiation</div><div class="pipeline-stage-value">—</div><div class="pipeline-stage-count">₹0L value</div></div>
        <div class="pipeline-stage"><div class="pipeline-stage-name">Closed Won</div><div class="pipeline-stage-value">—</div><div class="pipeline-stage-count">₹0L value</div></div>
      </div>
    </div>
    <div class="grid-2" style="grid-template-columns: repeat(2, 1fr); margin-bottom:24px">
      <div class="card">
        <div class="card-header"><span class="card-title">Pipeline Analysis</span></div>
        <div class="chart-container"><canvas data-chart="pipeline"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Lead Directory</span></div>
        <div class="table-container" style="max-height: 280px; overflow-y: auto;">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Value</th>
                <th>Stage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="crm-leads-tbody">
              <tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)"><i class="fas fa-spinner fa-spin"></i> Loading leads...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="card-title">Support Tickets</span>
        <div style="display:flex; gap:10px; align-items:center;">
          <span class="badge badge-warning" id="crm-tickets-count">0 open</span>
          <button class="btn btn-primary btn-xs" id="crm-add-ticket-btn"><i class="fas fa-plus"></i> Add Ticket</button>
        </div>
      </div>
      <div class="table-container"><table><thead><tr><th>Ticket</th><th>Customer</th><th>Subject</th><th>Priority</th><th>Status</th><th>Assigned</th><th>Actions</th></tr></thead>
      <tbody id="crm-tickets-tbody">
        <tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)"><i class="fas fa-spinner fa-spin"></i> Loading tickets...</td></tr>
      </tbody></table></div>
    </div>`;

  const LS_LEADS_KEY = 'amdox_leads';
  const SEED_LEADS = [
    { id: 1, company: 'Tata Consulting Services', contact: 'Arun Mehta', value: 1800000, stage: 'New' },
    { id: 2, company: 'Flipkart India', contact: 'Sunita Rao', value: 2500000, stage: 'Qualified' },
    { id: 3, company: 'Bajaj Finance', contact: 'Ravi Sharma', value: 3200000, stage: 'Proposal' },
    { id: 4, company: 'Mahindra Group', contact: 'Deepa Nair', value: 4500000, stage: 'Negotiation' }
  ];

  function getLeads() {
    try { return JSON.parse(localStorage.getItem(LS_LEADS_KEY)) || SEED_LEADS; } catch { return SEED_LEADS; }
  }
  function saveLeads(list) {
    try { localStorage.setItem(LS_LEADS_KEY, JSON.stringify(list)); } catch { }
  }

  let cachedLeads = [];

  async function loadLeads() {
    const tbody = document.getElementById('crm-leads-tbody');
    if (!tbody) return;

    const render = (leads) => {
      const totalVal = leads.length;
      const wonVal = leads.filter(l => l.stage === 'Closed Won' || l.stage === 'Won').length;
      const pipeVal = leads.reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);

      const totalEl = document.getElementById('crm-stats-total');
      const wonEl = document.getElementById('crm-stats-won');
      const valueEl = document.getElementById('crm-stats-value');

      if (totalEl) totalEl.textContent = totalVal;
      if (wonEl) wonEl.textContent = wonVal;
      if (valueEl) valueEl.textContent = '₹' + (pipeVal / 100000).toFixed(1) + 'L';

      const stages = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'];
      const stagesContainer = document.getElementById('crm-pipeline-stages');
      if (stagesContainer) {
        stagesContainer.innerHTML = stages.map(stg => {
          const matchingLeads = leads.filter(l => l.stage === stg || (stg === 'Closed Won' && l.stage === 'Won'));
          const stageCount = matchingLeads.length;
          const stageValue = matchingLeads.reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);
          const stageClass = stageCount > 0 ? 'pipeline-stage active' : 'pipeline-stage';

          // Find the first lead in this stage to show on click
          const leadId = matchingLeads.length > 0 ? matchingLeads[0].id : null;
          const clickAttr = leadId ? `onclick="window._crmShowLeadDetails(${leadId})"` : '';
          const cursorStyle = leadId ? 'cursor:pointer' : 'cursor:default';

          return `
            <div class="${stageClass}" ${clickAttr} style="${cursorStyle}">
              <div class="pipeline-stage-name">${stg}</div>
              <div class="pipeline-stage-value">${stageCount}</div>
              <div class="pipeline-stage-count">₹${(stageValue / 100000).toFixed(1)}L value</div>
            </div>`;
        }).join('');
      }

      if (leads.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:25px;color:var(--text-muted)">No leads found.</td></tr>`;
        return;
      }

      const stageBadge = s => {
        switch (s) {
          case 'New': return 'badge-info';
          case 'Qualified': return 'badge-purple';
          case 'Proposal': return 'badge-warning';
          case 'Negotiation': return 'badge-success';
          case 'Won':
          case 'Closed Won': return 'badge-success';
          default: return 'badge-secondary';
        }
      };

      tbody.innerHTML = leads.map(l => `
        <tr style="cursor:pointer" onclick="window._crmShowLeadDetails(${l.id})">
          <td><div style="font-weight:600;color:var(--accent-light)">${escHtml(l.company)}</div></td>
          <td>${escHtml(l.contact)}</td>
          <td style="font-family:var(--font-mono)">₹${Number(l.value).toLocaleString('en-IN')}</td>
          <td><span class="badge ${stageBadge(l.stage)}">${escHtml(l.stage)}</span></td>
          <td>
            <div style="display:flex;gap:6px" onclick="event.stopPropagation()">
              <button class="btn btn-secondary btn-sm" title="Quick View" onclick="window._crmShowLeadDetails(${l.id})"><i class="fas fa-eye"></i></button>
              <button class="btn btn-secondary btn-sm" onclick="crmEditLead(${l.id})"><i class="fas fa-pen"></i></button>
              <button class="btn btn-secondary btn-sm" style="color:var(--danger)" onclick="crmDeleteLead(${l.id},'${l.company.replace(/'/g, "\\'")}')"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>`).join('');
    };

    if (!cachedLeads.length) {
      cachedLeads = getLeads();
    }
    render(cachedLeads);

    try {
      const res = await Promise.race([
        fetch(`${API_BASE}/leads`),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1500))
      ]);
      const json = await res.json();
      if (json.success) {
        cachedLeads = json.data;
        render(cachedLeads);
        saveLeads(cachedLeads);
      }
    } catch (e) {
      console.warn('CRM fallback to localStorage leads:', e);
    }
  }

  loadLeads();

  // ── Support Tickets Management ──
  const LS_TICKETS_KEY = 'amdox_tickets';
  const SEED_TICKETS = [
    { id: 1, ticketId: '#TKT-1024', customer: 'Infosys', subject: 'API integration issue', priority: 'High', status: 'In Progress', assigned: 'Rahul S.' },
    { id: 2, ticketId: '#TKT-1023', customer: 'Wipro', subject: 'Dashboard loading slow', priority: 'Medium', status: 'Open', assigned: 'Vikram K.' },
    { id: 3, ticketId: '#TKT-1022', customer: 'HCL Tech', subject: 'Report export failing', priority: 'Medium', status: 'Resolved', assigned: 'Anita P.' }
  ];

  function getTickets() {
    try { return JSON.parse(localStorage.getItem(LS_TICKETS_KEY)) || SEED_TICKETS; } catch { return SEED_TICKETS; }
  }
  function saveTickets(list) {
    try { localStorage.setItem(LS_TICKETS_KEY, JSON.stringify(list)); } catch { }
  }

  let cachedTickets = [];

  function loadTickets() {
    const tbody = document.getElementById('crm-tickets-tbody');
    const countEl = document.getElementById('crm-tickets-count');
    if (!tbody) return;

    cachedTickets = getTickets();
    const openCount = cachedTickets.filter(t => t.status !== 'Resolved').length;
    if (countEl) {
      countEl.textContent = `${openCount} open`;
      countEl.className = openCount > 0 ? 'badge badge-warning' : 'badge badge-success';
    }

    if (cachedTickets.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:25px;color:var(--text-muted)">No support tickets found.</td></tr>`;
      return;
    }

    const priBadge = p => {
      switch (p) {
        case 'High': return 'badge-danger';
        case 'Medium': return 'badge-info';
        case 'Low': return 'badge-secondary';
        default: return 'badge-secondary';
      }
    };

    const statusBadge = s => {
      switch (s) {
        case 'Open': return 'badge-info';
        case 'In Progress': return 'badge-warning';
        case 'Resolved': return 'badge-success';
        default: return 'badge-secondary';
      }
    };

    tbody.innerHTML = cachedTickets.map(t => `
      <tr>
        <td style="font-family:var(--font-mono);font-size:12px;color:var(--accent-light)">${escHtml(t.ticketId)}</td>
        <td>${escHtml(t.customer)}</td>
        <td>${escHtml(t.subject)}</td>
        <td><span class="badge ${priBadge(t.priority)}">${escHtml(t.priority)}</span></td>
        <td><span class="badge ${statusBadge(t.status)}">${escHtml(t.status)}</span></td>
        <td>${escHtml(t.assigned)}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn btn-secondary btn-sm" onclick="crmViewTicket(${t.id})"><i class="fas fa-eye"></i></button>
            <button class="btn btn-secondary btn-sm" onclick="crmEditTicket(${t.id})"><i class="fas fa-pen"></i></button>
            <button class="btn btn-secondary btn-sm" style="color:var(--danger)" onclick="crmDeleteTicket(${t.id},'${t.subject.replace(/'/g, "\\'")}')"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>`).join('');
  }

  loadTickets();

  document.getElementById('crm-add-ticket-btn')?.addEventListener('click', () => {
    showModal({
      title: '<i class="fas fa-plus" style="color:var(--accent-light)"></i> Add Support Ticket',
      submitLabel: 'Create Ticket',
      fields: [
        { name: 'customer', label: 'Customer Name', required: true, placeholder: 'e.g. Infosys' },
        { name: 'subject', label: 'Subject', required: true, placeholder: 'e.g. Login issue' },
        { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'], default: 'Medium' },
        { name: 'status', label: 'Status', type: 'select', options: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
        { name: 'assigned', label: 'Assign To', placeholder: 'e.g. Rahul S.' }
      ],
      onSubmit(data, close) {
        const list = getTickets();
        const nextId = list.length > 0 ? Math.max(...list.map(t => t.id)) + 1 : 1;
        const ticketNum = 1024 + nextId; // Just to make it look like #TKT-10xx
        const newTicket = {
          id: nextId,
          ticketId: `#TKT-${ticketNum}`,
          ...data
        };
        list.unshift(newTicket);
        saveTickets(list);
        showToast(`✅ Ticket ${newTicket.ticketId} created!`, 'success');
        close();
        loadTickets();
      }
    });
  });

  window.crmViewTicket = function (id) {
    const ticket = cachedTickets.find(t => t.id === id);
    if (!ticket) return;
    showModal({
      title: `<i class="fas fa-eye" style="color:var(--info)"></i> Ticket Details: ${ticket.ticketId}`,
      submitLabel: 'Close',
      submitClass: 'btn-secondary',
      fields: [
        { label: 'Customer', default: ticket.customer, readonly: true },
        { label: 'Subject', default: ticket.subject, readonly: true },
        { label: 'Priority', default: ticket.priority, readonly: true },
        { label: 'Status', default: ticket.status, readonly: true },
        { label: 'Assigned', default: ticket.assigned, readonly: true }
      ],
      onSubmit(data, close) { close(); }
    });
  };

  window.crmEditTicket = function (id) {
    const ticket = cachedTickets.find(t => t.id === id);
    if (!ticket) return;
    showModal({
      title: `<i class="fas fa-pen" style="color:var(--accent-light)"></i> Edit Ticket: ${ticket.ticketId}`,
      submitLabel: 'Save Changes',
      fields: [
        { name: 'customer', label: 'Customer Name', required: true, default: ticket.customer },
        { name: 'subject', label: 'Subject', required: true, default: ticket.subject },
        { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'], default: ticket.priority },
        { name: 'status', label: 'Status', type: 'select', options: ['Open', 'In Progress', 'Resolved'], default: ticket.status },
        { name: 'assigned', label: 'Assign To', default: ticket.assigned }
      ],
      onSubmit(data, close) {
        const list = getTickets();
        const idx = list.findIndex(t => t.id === id);
        if (idx > -1) {
          list[idx] = { ...list[idx], ...data };
          saveTickets(list);
          showToast(`✅ Ticket ${ticket.ticketId} updated!`, 'success');
        }
        close();
        loadTickets();
      }
    });
  };

  window.crmDeleteTicket = function (id, subject) {
    showConfirm(`Do you want to delete ticket: <strong>${subject}</strong>?`, () => {
      const list = getTickets().filter(t => t.id !== id);
      saveTickets(list);
      showToast(`Ticket removed.`, 'success');
      loadTickets();
    });
  };

  document.getElementById('crm-add-btn').addEventListener('click', () => {
    showModal({
      title: '<i class="fas fa-user-plus" style="color:var(--pink)"></i> Add New Lead',
      submitLabel: 'Create Lead',
      fields: [
        { name: 'company', label: 'Company Name', required: true, placeholder: 'e.g. Acme Corp' },
        { name: 'contact', label: 'Contact Person', required: true, placeholder: 'e.g. Jane Doe' },
        { name: 'value', label: 'Estimated Value (₹)', required: true, type: 'number', placeholder: 'e.g. 500000', default: 0 },
        { name: 'stage', label: 'Pipeline Stage', type: 'select', options: ['New', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'], default: 'New' }
      ],
      async onSubmit(data, close) {
        try {
          const res = await Promise.race([
            fetch(`${API_BASE}/leads`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            }),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1500))
          ]);
          const json = await res.json();
          if (!json.success) { showToast(json.error || 'Failed to create lead', 'error'); return; }
          showToast(`✅ Lead for "${json.data.company}" added!`, 'success');
        } catch (e) {
          const list = getLeads();
          const newLead = { id: Date.now(), ...data };
          list.unshift(newLead);
          saveLeads(list);
          cachedLeads = list;
          showToast(`✅ Lead added! (saved locally)`, 'success');
        }
        close();
        loadLeads();
      }
    });
  });

  window.crmEditLead = async function (id) {
    let lead = cachedLeads.find(l => l.id === id);
    if (!lead) {
      showToast('Lead not found', 'error');
      return;
    }

    showModal({
      title: '<i class="fas fa-pen" style="color:var(--pink)"></i> Edit Lead',
      submitLabel: 'Save Changes',
      fields: [
        { name: 'company', label: 'Company Name', required: true, default: lead.company },
        { name: 'contact', label: 'Contact Person', required: true, default: lead.contact },
        { name: 'value', label: 'Estimated Value (₹)', required: true, type: 'number', default: lead.value },
        { name: 'stage', label: 'Pipeline Stage', type: 'select', options: ['New', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'], default: lead.stage }
      ],
      async onSubmit(data, close) {
        try {
          const res = await Promise.race([
            fetch(`${API_BASE}/leads/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            }),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1500))
          ]);
          const json = await res.json();
          if (!json.success) { showToast(json.error || 'Failed to update lead', 'error'); return; }
          showToast(`✅ Lead for "${json.data.company}" updated!`, 'success');
        } catch (e) {
          const list = getLeads();
          const idx = list.findIndex(l => l.id === id);
          if (idx > -1) {
            list[idx] = { ...list[idx], ...data };
            saveLeads(list);
          }
          cachedLeads = list;
          showToast(`✅ Lead updated! (saved locally)`, 'success');
        }
        close();
        loadLeads();
      }
    });
  };

  window.crmDeleteLead = function (id, company) {
    showConfirm(`Do you want to delete lead for <strong>${company}</strong>?`, async () => {
      try {
        const res = await Promise.race([
          fetch(`${API_BASE}/leads/${id}`, { method: 'DELETE' }),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1500))
        ]);
        const json = await res.json();
        if (!json.success) { showToast(json.error || 'Failed to delete lead', 'error'); return; }
        showToast(`Lead for "${company}" removed.`, 'success');
      } catch (e) {
        const list = getLeads().filter(l => l.id !== id);
        saveLeads(list);
        cachedLeads = list;
        showToast(`Lead for "${company}" removed. (locally)`, 'success');
      }
      loadLeads();
    });
  };

  document.getElementById('crm-campaign-btn').addEventListener('click', () => {

    // ── Mock campaign data ──
    const MOCK_CAMPAIGNS = [
      {
        id: 'CMP-001', name: 'Q2 Product Launch Blast', type: 'Email', status: 'Completed',
        audience: 'All Leads', sentOn: '01 Jun 2026', sentTo: 1240,
        opened: 892, clicks: 310, unsubscribed: 14,
        subject: 'Introducing Amdox ERP v3.2 — The Future of Enterprise Management',
        message: 'Dear {{Name}},\n\nWe are thrilled to announce the launch of Amdox ERP v3.2 — packed with AI-powered features, a new mobile app, and 40% faster reporting.\n\nClick below to explore what\'s new.\n\nBest Regards,\nAmdox Marketing Team'
      },
      {
        id: 'CMP-002', name: 'Monthly Newsletter – June 2026', type: 'Email', status: 'Sent',
        audience: 'Qualified Leads', sentOn: '05 Jun 2026', sentTo: 620,
        opened: 410, clicks: 145, unsubscribed: 5,
        subject: 'Amdox Monthly Insights — June 2026 Edition',
        message: 'Hi {{Name}},\n\nThis month\'s top stories: AI module beta, CRM pipeline improvements, and customer success stories from top clients.\n\nRead the full newsletter on our portal.\n\nCheers,\nAmdox Team'
      },
      {
        id: 'CMP-003', name: 'Renewal Reminder SMS Blast', type: 'SMS', status: 'Completed',
        audience: 'Negotiation Stage', sentOn: '03 Jun 2026', sentTo: 45,
        opened: 45, clicks: 32, unsubscribed: 0,
        subject: 'Contract Renewal – Action Required',
        message: 'Hi {{Name}}, your Amdox ERP contract expires in 7 days. Renew now at erp.amdox.com/renew. Call 1800-AMDOX for help.'
      },
      {
        id: 'CMP-004', name: 'WhatsApp Re-engagement Drive', type: 'WhatsApp', status: 'Running',
        audience: 'Cold Leads (90+ days)', sentOn: '08 Jun 2026', sentTo: 180,
        opened: 134, clicks: 89, unsubscribed: 3,
        subject: 'We Miss You — Special Offer Inside',
        message: 'Hey {{Name}}! 👋\n\nIt\'s been a while. We have an exclusive 20% discount on Amdox ERP for valued prospects like you.\n\nClaim your offer: erp.amdox.com/offer\n\n— Amdox CRM Bot'
      },
      {
        id: 'CMP-005', name: 'Product Demo Invitation', type: 'Email', status: 'Draft',
        audience: 'Proposal Stage', sentOn: '—', sentTo: 0,
        opened: 0, clicks: 0, unsubscribed: 0,
        subject: 'Exclusive Invitation: Live Amdox ERP Demo — June 25, 2026',
        message: 'Dear {{Name}},\n\nYou are invited to an exclusive live demonstration of the Amdox ERP Suite.\n\nDate: June 25, 2026 | 3:00 PM IST\nFormat: Online (Microsoft Teams)\n\nRegister: erp.amdox.com/demo\n\nSeats are limited. Reserve yours now.\n\nAmdox Sales Team'
      }
    ];

    const typeIcon = { Email: 'fa-envelope', SMS: 'fa-comment-sms', WhatsApp: 'fab fa-whatsapp' };
    const typeColor = { Email: 'var(--info)', SMS: 'var(--success)', WhatsApp: '#25D366' };
    const statusBadge = { Completed: 'badge-success', Sent: 'badge-info', Running: 'badge-warning', Draft: 'badge-secondary' };

    // ── View a specific campaign detail ──
    window._crmViewCampaign = function (idx) {
      const c = MOCK_CAMPAIGNS[idx];
      const openRate = c.sentTo > 0 ? Math.round((c.opened / c.sentTo) * 100) : 0;
      const ctr = c.sentTo > 0 ? Math.round((c.clicks / c.sentTo) * 100) : 0;
      const html = `
        <div>
          <div style="display:flex;align-items:center;gap:12px;padding:16px;background:rgba(255,255,255,0.02);border-radius:12px;border:1px solid var(--border);margin-bottom:20px">
            <div style="width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;color:${typeColor[c.type]};background:${typeColor[c.type]}18">
              <i class="${typeIcon[c.type] || 'fas fa-bullhorn'}"></i>
            </div>
            <div style="flex:1">
              <div style="font-size:16px;font-weight:700">${c.name}</div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${c.type} Campaign &nbsp;•&nbsp; ${c.audience} &nbsp;•&nbsp; Sent ${c.sentOn}</div>
            </div>
            <span class="badge ${statusBadge[c.status]}">${c.status}</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px">
            ${[
          { label: 'Sent To', val: c.sentTo.toLocaleString(), color: 'var(--text-primary)', icon: 'fa-paper-plane' },
          { label: 'Opened', val: c.opened.toLocaleString() + ' (' + openRate + '%)', color: 'var(--info)', icon: 'fa-envelope-open' },
          { label: 'Clicked', val: c.clicks.toLocaleString() + ' (' + ctr + '%)', color: 'var(--success)', icon: 'fa-arrow-pointer' },
          { label: 'Unsubscribed', val: c.unsubscribed, color: c.unsubscribed > 10 ? 'var(--danger)' : 'var(--text-muted)', icon: 'fa-user-minus' }
        ].map(s => `
              <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:10px;padding:12px;text-align:center">
                <i class="fas ${s.icon}" style="color:${s.color};font-size:16px;margin-bottom:6px"></i>
                <div style="font-size:18px;font-weight:800;color:${s.color}">${s.val}</div>
                <div style="font-size:11px;color:var(--text-muted)">${s.label}</div>
              </div>`).join('')}
          </div>

          <div style="margin-bottom:16px">
            <div style="font-size:12px;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px">Open Rate Progress</div>
            <div style="display:flex;align-items:center;gap:12px">
              <div style="flex:1;height:10px;background:rgba(255,255,255,0.06);border-radius:10px;overflow:hidden">
                <div style="height:100%;width:${openRate}%;background:var(--info);border-radius:10px"></div>
              </div>
              <span style="font-size:13px;font-weight:700;color:var(--info);min-width:40px">${openRate}%</span>
            </div>
          </div>

          <div style="margin-bottom:16px">
            <div style="font-size:12px;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px">Subject Line</div>
            <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:8px;padding:12px;font-size:13px;font-weight:600">${c.subject}</div>
          </div>

          <div>
            <div style="font-size:12px;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px">Message Preview</div>
            <div style="background:rgba(0,0,0,0.2);border:1px solid var(--border);border-radius:8px;padding:14px;font-size:13px;line-height:1.7;white-space:pre-wrap;font-family:var(--font-mono);color:var(--text-secondary)">${c.message}</div>
          </div>
        </div>`;

      showContentModal({
        title: `<i class="fas fa-chart-bar" style="color:var(--info)"></i> Campaign Report — ${c.id}`,
        content: html,
        maxWidth: '720px'
      });
    };

    // ── Create new campaign form ──
    window._crmCreateCampaign = function () {
      showModal({
        title: '<i class="fas fa-bullhorn" style="color:var(--pink)"></i> Create New Campaign',
        submitLabel: 'Launch Campaign',
        fields: [
          { name: 'name', label: 'Campaign Name', required: true, placeholder: 'e.g. June Product Announcement' },
          { name: 'type', label: 'Channel', type: 'select', options: ['Email', 'SMS', 'WhatsApp'], default: 'Email' },
          { name: 'audience', label: 'Target Audience', type: 'select', options: ['All Leads', 'Qualified Leads', 'Proposal Stage', 'Negotiation Stage', 'Cold Leads (90+ days)', 'Custom Segment'], default: 'All Leads' },
          { name: 'subject', label: 'Subject / Message Title', required: true, placeholder: 'e.g. Exclusive Offer for Your Business' },
          { name: 'schedule', label: 'Schedule', type: 'select', options: ['Send Immediately', 'Schedule for Later', 'Save as Draft'], default: 'Send Immediately' },
          { name: 'message', label: 'Message Body (use {{Name}} for personalization)', placeholder: 'Dear {{Name}},\n\nYour campaign message here...' }
        ],
        onSubmit(data, close) {
          const audienceSizeMap = { 'All Leads': 1240, 'Qualified Leads': 620, 'Proposal Stage': 48, 'Negotiation Stage': 45, 'Cold Leads (90+ days)': 180, 'Custom Segment': 250 };
          const est = audienceSizeMap[data.audience] || 100;
          const action = data.schedule === 'Save as Draft' ? 'saved as Draft' : data.schedule === 'Schedule for Later' ? 'scheduled' : 'launched';
          showToast(`🚀 Campaign "${data.name}" ${action}! Estimated reach: ${est.toLocaleString()} recipients.`, 'success');
          close();
          // Re-open campaign manager to show updated list
          setTimeout(() => document.getElementById('crm-campaign-btn')?.click(), 300);
        }
      });
    };

    // ── Build the Campaign Manager HTML ──
    const campaignRows = MOCK_CAMPAIGNS.map((c, idx) => {
      const openRate = c.sentTo > 0 ? Math.round((c.opened / c.sentTo) * 100) : 0;
      return `
        <div style="display:flex;align-items:center;gap:14px;padding:14px;background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:10px;margin-bottom:10px">
          <div style="width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;color:${typeColor[c.type]};background:${typeColor[c.type]}18;flex-shrink:0">
            <i class="${typeIcon[c.type] || 'fas fa-bullhorn'}"></i>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:700;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.name}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${c.type} &nbsp;·&nbsp; ${c.audience} &nbsp;·&nbsp; ${c.sentOn}</div>
          </div>
          <div style="text-align:center;min-width:70px">
            <div style="font-size:14px;font-weight:700;color:var(--info)">${openRate}%</div>
            <div style="font-size:10px;color:var(--text-muted)">Open Rate</div>
          </div>
          <div style="text-align:center;min-width:60px">
            <div style="font-size:14px;font-weight:700">${c.sentTo > 0 ? c.sentTo.toLocaleString() : '—'}</div>
            <div style="font-size:10px;color:var(--text-muted)">Sent</div>
          </div>
          <span class="badge ${statusBadge[c.status]}" style="font-size:10px;white-space:nowrap">${c.status}</span>
          <button onclick="window._crmViewCampaign(${idx})" style="background:rgba(99,102,241,0.1);border:1px solid var(--accent);color:var(--accent);border-radius:6px;padding:5px 12px;cursor:pointer;font-size:11px;font-weight:600;white-space:nowrap">
            <i class="fas fa-chart-line"></i> Report
          </button>
        </div>`;
    }).join('');

    const totalSent = MOCK_CAMPAIGNS.reduce((s, c) => s + c.sentTo, 0);
    const totalOpened = MOCK_CAMPAIGNS.reduce((s, c) => s + c.opened, 0);
    const avgOpen = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;

    const html = `
      <div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">
          ${[
        { label: 'Total Campaigns', val: MOCK_CAMPAIGNS.length, color: 'var(--accent)', icon: 'fa-bullhorn' },
        { label: 'Total Recipients', val: totalSent.toLocaleString(), color: 'var(--info)', icon: 'fa-users' },
        { label: 'Avg Open Rate', val: avgOpen + '%', color: 'var(--success)', icon: 'fa-envelope-open' }
      ].map(s => `
            <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:10px;padding:14px;display:flex;align-items:center;gap:12px">
              <i class="fas ${s.icon}" style="color:${s.color};font-size:20px"></i>
              <div>
                <div style="font-size:20px;font-weight:800;color:${s.color}">${s.val}</div>
                <div style="font-size:11px;color:var(--text-muted)">${s.label}</div>
              </div>
            </div>`).join('')}
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <div style="font-size:14px;font-weight:700">All Campaigns</div>
          <button onclick="window._crmCreateCampaign()" style="background:linear-gradient(135deg,var(--pink),var(--purple));border:none;color:#fff;border-radius:8px;padding:7px 16px;cursor:pointer;font-size:12px;font-weight:700;display:flex;align-items:center;gap:6px">
            <i class="fas fa-plus"></i> Create Campaign
          </button>
        </div>

        <div>${campaignRows}</div>
      </div>`;

    showContentModal({
      title: '<i class="fas fa-bullhorn" style="color:var(--pink)"></i> CRM Campaign Manager',
      content: html,
      maxWidth: '820px'
    });
  });

  // ── Full Lead Details for each active lead ──
  const LEAD_DETAILS = {
    1: {
      company: 'Tata Consulting Services', industry: 'IT Services / Consulting', size: '600k+ Employees',
      contact: 'Arun Mehta', title: 'VP, Digital Transformation', email: 'arun.mehta@tcs.corp', phone: '+91 98765 43210',
      value: '₹18,00,000', stage: 'New', source: 'LinkedIn InMail',
      description: 'Major scale up of their internal HR portal. Looking for a SaaS solution to handle multi-country payroll and attendance.',
      priority: 'High', probability: '40%', est_close: 'Oct 2026',
      activities: [
        { type: 'Call', text: 'Initial discovery call - positive feedback', date: 'Jun 01, 2026' },
        { type: 'Email', text: 'Sent company profile and case studies', date: 'Jun 05, 2026' }
      ]
    },
    2: {
      company: 'Flipkart India', industry: 'E-commerce', size: '30,000+ Employees',
      contact: 'Sunita Rao', title: 'Operations Manager', email: 'sunita.rao@flipkart.com', phone: '+91 91234 56789',
      value: '₹25,000,000', stage: 'Qualified', source: 'Direct Inbound',
      description: 'Warehouse management and supply chain optimization module requested for the festive season rush.',
      priority: 'High', probability: '65%', est_close: 'Sep 2026',
      activities: [
        { type: 'Meeting', text: 'On-site demo at Bengaluru HQ - The operations team loved the real-time stock tracking dashboard.', date: 'May 28, 2026' },
        { type: 'Email', text: 'Technical requirement document received. Requested specific API for SAP integration.', date: 'Jun 02, 2026' },
        { type: 'Call', text: 'Pricing discussion. Negotiating on bulk user licenses for 500+ warehouse staff.', date: 'Jun 10, 2026' }
      ]
    },
    3: {
      company: 'Bajaj Finance', industry: 'Fintech / BFSI', size: '20,000+ Employees',
      contact: 'Ravi Sharma', title: 'IT Director', email: 'r.sharma@bajajfinserv.co', phone: '+91 99887 76655',
      value: '₹3,200,000', stage: 'Proposal', source: 'Referral',
      description: 'Loan processing automation and CRM integration. Security and compliance are top priorities.',
      priority: 'Medium', probability: '80%', est_close: 'Aug 2026',
      activities: [
        { type: 'Meeting', text: 'Budget and procurement discussion - Final approval from CFO expected next week.', date: 'May 15, 2026' },
        { type: 'Email', text: 'Final proposal sent for review. Included the mandatory ISO 27001 compliance audit reports.', date: 'Jun 08, 2026' },
        { type: 'Message', text: 'Ravi confirmed the Infosec team has cleared the vendor risk assessment.', date: 'Jun 10, 2026' }
      ]
    },
    4: {
      company: 'Mahindra Group', industry: 'Automotive / Conglomerate', size: '250k+ Employees',
      contact: 'Deepa Nair', title: 'Head of Procurement', email: 'nair.deepa@mahindra.auto', phone: '+91 90000 11111',
      value: '₹4,500,000', stage: 'Negotiation', source: 'Trade Show',
      description: 'Cross-module ERP implementation for three sub-units. Deep negotiations on multi-year licensing.',
      priority: 'High', probability: '90%', est_close: 'Jul 2026',
      activities: [
        { type: 'Meeting', text: 'Contractual terms review at the Mumbai office. Settled on a 3-year term.', date: 'Jun 03, 2026' },
        { type: 'Call', text: 'Discount structure finalization. Agreed to a 10% early-bird discount on total contract value.', date: 'Jun 09, 2026' },
        { type: 'Legal', text: 'Revised MSA sent to Mahindra legal team for final sign-off.', date: 'Jun 10, 2026' }
      ]
    }
  };

  function buildLeadDetailHTML(d) {
    const stageColor = d.stage === 'New' ? 'var(--info)' : d.stage === 'Qualified' ? 'var(--purple)' : d.stage === 'Proposal' ? 'var(--warning)' : 'var(--success)';
    return `
      <div style="font-size:14px">
        <div style="display:flex;align-items:center;gap:15px;padding:16px;background:rgba(255,255,255,0.02);border-radius:12px;border:1px solid var(--border);margin-bottom:16px">
          <div style="width:50px;height:50px;border-radius:12px;background:var(--accent)22;display:flex;align-items:center;justify-content:center;font-size:24px;color:var(--accent)">
            <i class="fas fa-building"></i>
          </div>
          <div style="flex:1">
            <div style="font-size:18px;font-weight:700;color:var(--text-primary)">${d.company}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${d.industry} &nbsp;•&nbsp; ${d.size}</div>
          </div>
          <span class="badge" style="background:${stageColor}22;color:${stageColor};border:1px solid ${stageColor}44;font-size:11px">${d.stage}</span>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
          <div style="background:rgba(255,255,255,0.02);border-radius:8px;padding:12px;border:1px solid var(--border)">
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Contact Person</div>
            <div style="font-weight:700;margin-top:4px">${d.contact}</div>
            <div style="font-size:11px;color:var(--text-muted)">${d.title}</div>
          </div>
          <div style="background:rgba(255,255,255,0.02);border-radius:8px;padding:12px;border:1px solid var(--border)">
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Deal Info</div>
            <div style="font-weight:700;margin-top:4px;color:var(--accent-light)">${d.value}</div>
            <div style="font-size:11px;color:var(--text-muted)">Close: ${d.est_close} (${d.probability} Prob.)</div>
          </div>
          <div style="background:rgba(255,255,255,0.02);border-radius:8px;padding:12px;border:1px solid var(--border)">
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Communication</div>
            <div style="font-size:12px;margin-top:4px"><i class="fas fa-envelope" style="width:16px;color:var(--info)"></i> ${d.email}</div>
            <div style="font-size:12px;margin-top:2px"><i class="fas fa-phone" style="width:16px;color:var(--success)"></i> ${d.phone}</div>
          </div>
          <div style="background:rgba(255,255,255,0.02);border-radius:8px;padding:12px;border:1px solid var(--border)">
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Lead Attributes</div>
            <div style="font-size:12px;margin-top:4px"><i class="fas fa-flag" style="width:16px;color:var(--danger)"></i> Priority: ${d.priority}</div>
            <div style="font-size:12px;margin-top:2px"><i class="fas fa-share-nodes" style="width:16px;color:var(--info)"></i> Source: ${d.source}</div>
          </div>
        </div>

        <div style="margin-bottom:16px">
          <div style="font-size:13px;font-weight:600;margin-bottom:6px">Internal Notes</div>
          <div style="padding:10px;background:rgba(0,0,0,0.15);border-radius:8px;font-size:12.5px;color:var(--text-secondary);border:1px solid var(--border);line-height:1.5">${d.description}</div>
        </div>

        <div>
          <div style="font-size:13px;font-weight:600;margin-bottom:8px">Activity Timeline</div>
          ${d.activities.map(a => `
            <div style="display:flex;gap:12px;margin-bottom:8px">
              <div style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;font-size:12px;margin-top:2px;border:1px solid var(--border)">
                <i class="fas ${a.type === 'Call' ? 'fa-phone' : a.type === 'Email' ? 'fa-envelope' : 'fa-handshake'}"></i>
              </div>
              <div style="flex:1">
                <div style="font-size:12px;font-weight:700">${a.type}: ${a.text}</div>
                <div style="font-size:10px;color:var(--text-muted)">Log date: ${a.date}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
  }

  // ── Global Lead Modal Logic (Refactored for Reliability) ──
  window._crmLeadTabSwitch = (lid) => {
    // 1. Update the body content
    const body = document.getElementById('crm-lead-detail-body');
    if (body && LEAD_DETAILS[lid]) {
      body.innerHTML = buildLeadDetailHTML(LEAD_DETAILS[lid]);
    }

    // 2. Update the tab styling
    const tabsContainer = document.getElementById('crm-lead-tabs');
    if (tabsContainer) {
      const tabs = tabsContainer.querySelectorAll('button');
      tabs.forEach(t => {
        const tabLid = parseInt(t.dataset.lid);
        const isActive = tabLid === lid;
        const d = LEAD_DETAILS[tabLid];

        t.style.borderBottom = isActive ? '2px solid var(--accent)' : '2px solid transparent';
        t.style.background = isActive ? 'rgba(99,102,241,0.08)' : 'transparent';
        t.style.color = isActive ? 'var(--text-primary)' : 'var(--text-muted)';
        const nameEl = t.querySelector('.tab-company-name');
        if (nameEl) nameEl.style.color = isActive ? 'var(--accent-light)' : 'var(--text-muted)';
      });
    }
  };

  window._crmShowLeadDetails = (selId = 1) => {
    const leadsIds = [1, 2, 3, 4];
    const initialDetail = LEAD_DETAILS[selId] || LEAD_DETAILS[1];

    const tabsHTML = leadsIds.map(lid => {
      const d = LEAD_DETAILS[lid];
      const isActive = lid === selId;
      return `
        <button onclick="window._crmLeadTabSwitch(${lid})" data-lid="${lid}" style="flex:1;padding:12px 10px;text-align:center;border:none;border-bottom:2px solid ${isActive ? 'var(--accent)' : 'transparent'};background:${isActive ? 'rgba(99,102,241,0.08)' : 'transparent'};cursor:pointer;transition:all 0.2s;display:flex;flex-direction:column;align-items:center;gap:2px;outline:none">
          <div class="tab-company-name" style="font-size:13px;font-weight:700;color:${isActive ? 'var(--accent-light)' : 'var(--text-muted)'}">${d.company.split(' ')[0]}</div>
          <div style="font-size:10px;color:var(--text-muted);font-weight:500">${d.contact}</div>
        </button>`;
    }).join('');

    const html = `
      <div>
        <div id="crm-lead-tabs" style="display:flex;border-bottom:1px solid var(--border);margin-bottom:20px;background:rgba(255,255,255,0.01)">${tabsHTML}</div>
        <div id="crm-lead-detail-body" style="min-height:300px">${buildLeadDetailHTML(initialDetail)}</div>
      </div>`;

    showContentModal({
      title: '<i class="fas fa-users" style="color:var(--info)"></i> CRM Strategic Lead Analysis',
      content: html,
      maxWidth: '750px'
    });
  };

  document.getElementById('crm-stat-total')?.addEventListener('click', () => {
    window._crmShowLeadDetails(1);
  });

  document.getElementById('crm-stat-won')?.addEventListener('click', () => {
    const wonLeads = ['Microsoft India', 'Zomato', 'Reliance Retail', 'HDFC Bank'];
    const html = `
      <div>
        <div style="background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.2);border-radius:10px;padding:20px;margin-bottom:20px;display:flex;align-items:center;gap:20px">
          <div style="width:64px;height:64px;border-radius:50%;background:var(--success)22;display:flex;align-items:center;justify-content:center;font-size:32px;color:var(--success)">
            <i class="fas fa-trophy"></i>
          </div>
          <div>
            <div style="font-size:24px;font-weight:900;color:var(--text-primary)">8 Successful Conversions</div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:4px">Target Achievement: <span style="color:var(--success);font-weight:700">112%</span> this month</div>
          </div>
        </div>
        <div style="font-size:14px;font-weight:700;margin-bottom:12px">Recently Won Clients</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          ${wonLeads.map(name => `
            <div style="display:flex;align-items:center;gap:10px;padding:12px;background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:8px">
              <i class="fas fa-circle-check" style="color:var(--success)"></i>
              <div>
                <div style="font-weight:700;font-size:13px">${name}</div>
                <div style="font-size:11px;color:var(--text-muted)">License: Enterprise Unlimited</div>
              </div>
            </div>`).join('')}
        </div>
        <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:12px;color:var(--text-muted)">Revenue impact: <span style="color:var(--success)">+₹84.5L</span></div>
          <button class="btn btn-primary" onclick="alert('Generating full wins report...')">Download Wins Report</button>
        </div>
      </div>`;

    showContentModal({
      title: '<i class="fas fa-award" style="color:var(--success)"></i> Sales Victory Log — June 2026',
      content: html,
      maxWidth: '650px'
    });
  });

  document.getElementById('crm-stat-value')?.addEventListener('click', () => {
    const pipeVal = document.getElementById('crm-stats-value')?.textContent || '₹120.0L';
    const html = `
      <div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px">
          <div style="background:rgba(168,85,247,0.06);border:1px solid rgba(168,85,247,0.2);padding:16px;border-radius:12px;text-align:center">
            <div style="font-size:20px;font-weight:900;color:var(--purple)">${pipeVal}</div>
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;margin-top:4px">Gross Value</div>
          </div>
          <div style="background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.2);padding:16px;border-radius:12px;text-align:center">
            <div style="font-size:20px;font-weight:900;color:var(--success)">₹74.2L</div>
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;margin-top:4px">Weighted Value</div>
          </div>
          <div style="background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.2);padding:16px;border-radius:12px;text-align:center">
            <div style="font-size:20px;font-weight:900;color:var(--info)">14.2 Days</div>
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;margin-top:4px">Avg. Sales Cycle</div>
          </div>
        </div>
        <div style="font-size:14px;font-weight:700;margin-bottom:12px">Pipeline Distribution</div>
        ${[
        { stage: 'Qualified', val: '₹45.0L', percent: 37, color: 'var(--purple)' },
        { stage: 'Proposal', val: '₹32.0L', percent: 26, color: 'var(--warning)' },
        { stage: 'Negotiation', val: '₹43.0L', percent: 37, color: 'var(--success)' }
      ].map(s => `
          <div style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
              <span>${s.stage}</span>
              <span style="font-weight:700">${s.val} (${s.percent}%)</span>
            </div>
            <div style="height:8px;background:rgba(255,255,255,0.05);border-radius:10px;overflow:hidden">
              <div style="height:100%;width:${s.percent}%;background:${s.color};border-radius:10px"></div>
            </div>
          </div>`).join('')}
      </div>`;

    showContentModal({
      title: '<i class="fas fa-chart-pie" style="color:var(--purple)"></i> Financial Forecast & Pipeline Health',
      content: html,
      maxWidth: '650px'
    });
  });

  document.getElementById('crm-stat-rate')?.addEventListener('click', () => {
    const html = `
      <div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:20px">
          <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:12px;padding:16px">
            <div style="font-size:32px;font-weight:900;color:var(--warning)">68%</div>
            <div style="font-size:12px;color:var(--text-muted);font-weight:600">Lead-to-Win Rate</div>
            <div style="font-size:11px;color:var(--success);margin-top:4px"><i class="fas fa-trend-up"></i> +4.2% from last month</div>
          </div>
          <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:12px;padding:16px">
            <div style="font-size:32px;font-weight:900;color:var(--info)">4.2%</div>
            <div style="font-size:12px;color:var(--text-muted);font-weight:600">Customer Churn</div>
            <div style="font-size:11px;color:var(--success);margin-top:4px"><i class="fas fa-trend-down"></i> Healthy status</div>
          </div>
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:10px;padding:16px">
          <div style="font-size:14px;font-weight:700;margin-bottom:12px">Retention Insights</div>
          <div style="display:flex;gap:20px">
            <div style="flex:1">
              <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">NPS SCORE</div>
              <div style="font-size:24px;font-weight:800;color:var(--success)">72</div>
            </div>
            <div style="flex:2">
              <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">BRAND LOYALTY STATUS</div>
              <span class="badge badge-success" style="font-size:12px;padding:6px 12px">GOLD STANDARD (88%)</span>
            </div>
          </div>
        </div>
      </div>`;

    showContentModal({
      title: '<i class="fas fa-heart-pulse" style="color:var(--warning)"></i> Relationship Health & Performance Analytics',
      content: html,
      maxWidth: '600px'
    });
  });
};

/* Projects Page */
pages.projects = function (container) {
  container.innerHTML = `
    <div class="module-hero">
      <h2><i class="fas fa-diagram-project" style="color:var(--accent-light)"></i> Project Management</h2>
      <p>Agile workflows, Kanban boards, Gantt charts, sprint management, resource allocation, and budget tracking.</p>
      <div class="page-actions" style="margin-top:16px">
        <button class="btn btn-primary btn-sm" id="project-add-btn"><i class="fas fa-plus"></i> New Project</button>
        <button class="btn btn-secondary btn-sm" id="project-tasks-btn"><i class="fas fa-list-check"></i> My Tasks</button>
      </div>
    </div>
    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr) !important;">
      <div class="stat-card" id="proj-stat-active"><div class="stat-card-header"><div class="stat-icon indigo"><i class="fas fa-folder-open"></i></div></div><div class="stat-value" id="project-stats-active">—</div><div class="stat-label">Active Projects</div></div>
      <div class="stat-card" id="proj-stat-done"><div class="stat-card-header"><div class="stat-icon green"><i class="fas fa-check-double"></i></div></div><div class="stat-value" id="project-stats-done">—</div><div class="stat-label">Tasks Completed</div></div>
      <div class="stat-card" id="proj-stat-progress"><div class="stat-card-header"><div class="stat-icon yellow"><i class="fas fa-clock"></i></div></div><div class="stat-value" id="project-stats-progress">—</div><div class="stat-label">In Progress</div></div>
      <div class="stat-card" id="proj-stat-overdue"><div class="stat-card-header"><div class="stat-icon red"><i class="fas fa-flag"></i></div></div><div class="stat-value">7</div><div class="stat-label">Overdue</div></div>
    </div>
    <div class="tabs">
      <div class="tab active" data-proj-tab="kanban" onclick="projectTabSwitch(this, 'kanban')">Kanban Board</div>
      <div class="tab" data-proj-tab="gantt" onclick="projectTabSwitch(this, 'gantt')">Gantt Chart</div>
      <div class="tab" data-proj-tab="sprint" onclick="projectTabSwitch(this, 'sprint')">Sprint</div>
      <div class="tab" data-proj-tab="timeline" onclick="projectTabSwitch(this, 'timeline')">Timeline</div>
    </div>
    
    <div id="project-main-content">
      <!-- Kanban Board (Default) -->
      <div id="view-kanban" class="project-view-container active">
        <div class="kanban-board" style="margin-bottom:24px" id="project-kanban-board">
          <div class="kanban-column">
            <div class="kanban-column-header"><span class="kanban-column-title" style="color:var(--text-muted)">📋 Backlog</span><span class="kanban-count" id="proj-count-backlog">0</span></div>
            <div class="kanban-cards" id="proj-col-backlog"></div>
          </div>
          <div class="kanban-column">
            <div class="kanban-column-header"><span class="kanban-column-title" style="color:var(--info)">🔄 In Progress</span><span class="kanban-count" id="proj-count-progress">0</span></div>
            <div class="kanban-cards" id="proj-col-progress"></div>
          </div>
          <div class="kanban-column">
            <div class="kanban-column-header"><span class="kanban-column-title" style="color:var(--warning)">👀 Review</span><span class="kanban-count" id="proj-count-review">0</span></div>
            <div class="kanban-cards" id="proj-col-review"></div>
          </div>
          <div class="kanban-column">
            <div class="kanban-column-header"><span class="kanban-column-title" style="color:var(--success)">✅ Done</span><span class="kanban-count" id="proj-count-done">0</span></div>
            <div class="kanban-cards" id="proj-col-done"></div>
          </div>
        </div>

        <div class="grid-2" style="grid-template-columns: repeat(2, 1fr);">
          <div class="card"><div class="card-header"><span class="card-title">Quick Stats</span></div><div style="padding:10px 0;">
            <div style="display:flex; justify-content:space-between; margin-bottom:12px;"><span style="color:var(--text-secondary)">Task Efficiency</span><span style="font-weight:600; color:var(--success)">92%</span></div>
            <div class="progress-bar" style="height:6px; margin-bottom:20px;"><div class="progress-fill" style="width:92%; background:var(--success)"></div></div>
            <div style="display:flex; justify-content:space-between; margin-bottom:12px;"><span style="color:var(--text-secondary)">Resource Utilization</span><span style="font-weight:600; color:var(--accent)">78%</span></div>
            <div class="progress-bar" style="height:6px;"><div class="progress-fill" style="width:78%; background:var(--accent)"></div></div>
          </div></div>
          <div class="card"><div class="card-header"><span class="card-title">Recent Activity</span></div><div class="activity-list" style="margin-top:10px">
            <div class="activity-item"><div class="activity-dot blue"></div><div><div class="activity-text"><strong>Rahul</strong> moved ERP v3.2 to In Progress</div><div class="activity-time">5m ago</div></div></div>
            <div class="activity-item"><div class="activity-dot green"></div><div><div class="activity-text"><strong>Anita</strong> completed Payment Gateway</div><div class="activity-time">2h ago</div></div></div>
            <div class="activity-item"><div class="activity-dot yellow"></div><div><div class="activity-text"><strong>Vikram</strong> added subtasks to AI Module</div><div class="activity-time">Yesterday</div></div></div>
          </div></div>
        </div>
      </div>

      <!-- Gantt Chart View -->
      <div id="view-gantt" class="project-view-container" style="display:none;">
        <div class="card">
          <div class="card-header">
            <span class="card-title"><i class="fas fa-chart-gantt" style="color:var(--accent)"></i> Detailed Project Gantt</span>
            <div style="display:flex; gap:10px;" id="gantt-granularity-toggles">
              <button class="btn btn-secondary btn-xs" data-gantt="day">Day</button>
              <button class="btn btn-primary btn-xs" data-gantt="week">Week</button>
              <button class="btn btn-secondary btn-xs" data-gantt="month">Month</button>
            </div>
          </div>
          <div id="gantt-content" style="padding:20px 0;">
            <!-- Gantt timeline and rows will be rendered here -->
          </div>
        </div>
      </div>

      <!-- Sprint View -->
      <div id="view-sprint" class="project-view-container" style="display:none;">
        <div class="grid-2">
          <div class="card">
            <div class="card-header">
              <span class="card-title">Sprint 14 Burndown</span>
              <span class="badge badge-info">4 Days Left</span>
            </div>
            <div class="chart-container"><canvas data-chart="sprint"></canvas></div>
          </div>
          <div class="card">
            <div class="card-header"><span class="card-title">Active Sprint Backlog</span></div>
            <div class="activity-list">
              ${[
      { id: "S-102", task: "Implement OAuth2.0 Flow", story: 8, owner: "RS", status: "In Progress" },
      { id: "S-105", task: "Database Schema Migration", story: 5, owner: "VK", status: "In Progress" },
      { id: "S-108", task: "Landing Page SEO Audit", story: 3, owner: "AP", status: "Done" },
      { id: "S-112", task: "Bug #847: Login redirect", story: 2, owner: "RS", status: "Review" }
    ].map(s => `
                <div style="display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid var(--border);">
                  <div style="width:40px; height:40px; border-radius:10px; background:rgba(255,255,255,0.03); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:var(--accent)">${s.id}</div>
                  <div style="flex:1;">
                    <div style="font-size:13.5px; font-weight:600; color:var(--text-primary);">${s.task}</div>
                    <div style="font-size:11px; color:var(--text-muted); margin-top:3px;">Story Points: ${s.story} • ${s.owner}</div>
                  </div>
                  <span class="badge ${s.status === 'Done' ? 'badge-success' : (s.status === 'Review' ? 'badge-warning' : 'badge-info')}" style="font-size:10px;">${s.status}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline View -->
      <div id="view-timeline" class="project-view-container" style="display:none;">
        <div class="card">
          <div class="card-header"><span class="card-title">Organization Roadmap 2026</span></div>
          <div style="padding:20px 0;">
            <div style="position:relative; padding-left:40px; border-left:2px solid var(--border); margin-left:20px;">
              ${[
      { month: "June", title: "ERP v3.2 Release", desc: "Full migration to cloud-native architecture.", icon: "fa-rocket", color: "var(--accent)" },
      { month: "July", title: "AI Integration Phase 1", desc: "Beta launch of AI-driven demand forecasting.", icon: "fa-brain", color: "var(--purple)" },
      { month: "August", title: "Mobile App 2.0", desc: "Complete overhaul of iOS/Android user experience.", icon: "fa-mobile-screen", color: "var(--info)" },
      { month: "October", title: "Global Expansion", desc: "Support for multi-region data centers and localization.", icon: "fa-earth-americas", color: "var(--success)" }
    ].map(item => `
                <div class="roadmap-item" style="position:relative; margin-bottom:35px; cursor:pointer;" data-title="${item.title}" data-desc="${item.desc}" data-month="${item.month}">
                  <div style="position:absolute; left:-55px; top:0; width:30px; height:30px; border-radius:50%; background:${item.color}; border:4px solid var(--bg-card); display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; z-index:2;">
                    <i class="fas ${item.icon}"></i>
                  </div>
                  <div style="font-size:11px; font-weight:800; color:${item.color}; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px;">${item.month}</div>
                  <div style="font-size:15px; font-weight:700; color:var(--text-primary); margin-bottom:4px;">${item.title}</div>
                  <div style="font-size:13px; color:var(--text-secondary);">${item.desc}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>`;

  const LS_PROJ_KEY = 'amdox_projects';
  const SEED_PROJ = [
    { id: 1, name: 'ERP v3.2', description: 'Core platform upgrade', status: 'In Progress', priority: 'High', assigned_to: 'Rahul Singh' },
    { id: 2, name: 'Mobile App', description: 'iOS & Android companion app', status: 'In Progress', priority: 'High', assigned_to: 'Priya Sharma' },
    { id: 3, name: 'AI Module', description: 'AI prediction engine', status: 'Backlog', priority: 'Medium', assigned_to: 'Vikram Kumar' },
    { id: 4, name: 'CRM Revamp', description: 'New CRM UI and pipeline tracking', status: 'Review', priority: 'Medium', assigned_to: 'Anita Patel' },
    { id: 5, name: 'Payment Gateway', description: 'Razorpay & Stripe integration', status: 'Done', priority: 'High', assigned_to: 'Anita Patel' }
  ];

  function getProjects() {
    try { return JSON.parse(localStorage.getItem(LS_PROJ_KEY)) || SEED_PROJ; } catch { return SEED_PROJ; }
  }
  function saveProjects(list) {
    try { localStorage.setItem(LS_PROJ_KEY, JSON.stringify(list)); } catch { }
  }

  let cachedProjects = [];

  async function loadProjects() {
    const kanban = document.getElementById('project-kanban-board');
    if (!kanban) return;

    const render = (projects) => {
      const activeEl = document.getElementById('project-stats-active');
      const doneEl = document.getElementById('project-stats-done');
      const progressEl = document.getElementById('project-stats-progress');

      const backlogCount = projects.filter(p => p.status === 'Backlog').length;
      const progressCount = projects.filter(p => p.status === 'In Progress').length;
      const reviewCount = projects.filter(p => p.status === 'Review').length;
      const doneCount = projects.filter(p => p.status === 'Done').length;

      if (activeEl) activeEl.textContent = (projects.length - doneCount);
      if (doneEl) doneEl.textContent = doneCount * 12 + 189;
      if (progressEl) progressEl.textContent = progressCount;

      document.getElementById('proj-count-backlog').textContent = backlogCount;
      document.getElementById('proj-count-progress').textContent = progressCount;
      document.getElementById('proj-count-review').textContent = reviewCount;
      document.getElementById('proj-count-done').textContent = doneCount;

      const populateCol = (statusVal, colId) => {
        const colEl = document.getElementById(colId);
        if (!colEl) return;
        const matching = projects.filter(p => p.status === statusVal);
        if (matching.length === 0) {
          colEl.innerHTML = `<div style="text-align:center;font-size:11px;color:var(--text-muted);padding:20px;border:1px dashed var(--border);border-radius:8px">No projects</div>`;
          return;
        }

        const priBadge = p => {
          switch (p) {
            case 'High': return 'badge-danger';
            case 'Medium': return 'badge-warning';
            case 'Low': return 'badge-info';
            default: return 'badge-info';
          }
        };

        const initials = name => (name || '—').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

        colEl.innerHTML = matching.map(p => `
          <div class="kanban-card" style="border-left: 3px solid var(--accent-light); position:relative;">
            <div style="position:absolute; top:8px; right:8px; display:flex; gap:4px">
              <button style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:11px" onclick="projectEdit(${p.id})"><i class="fas fa-pen"></i></button>
              <button style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:11px" onclick="projectDelete(${p.id}, '${p.name.replace(/'/g, "\\'")}')"><i class="fas fa-trash"></i></button>
            </div>
            <div class="kanban-card-title" style="margin-right:25px">${escHtml(p.name)}</div>
            <div style="font-size:11.5px; color:var(--text-secondary); margin-bottom:10px">${escHtml(p.description || '')}</div>
            <div class="kanban-card-meta">
              <span class="badge ${priBadge(p.priority)}" style="font-size:10px">${escHtml(p.priority)}</span>
              <div class="avatar-group">
                <div class="avatar" title="${escHtml(p.assigned_to)}">${initials(p.assigned_to)}</div>
              </div>
            </div>
          </div>`).join('');
      };

      populateCol('Backlog', 'proj-col-backlog');
      populateCol('In Progress', 'proj-col-progress');
      populateCol('Review', 'proj-col-review');
      populateCol('Done', 'proj-col-done');
    };

    if (!cachedProjects.length) {
      cachedProjects = getProjects();
    }
    render(cachedProjects);

    try {
      const res = await Promise.race([
        fetch(`${API_BASE}/projects`),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1500))
      ]);
      const json = await res.json();
      if (json.success) {
        cachedProjects = json.data;
        render(cachedProjects);
        saveProjects(cachedProjects);
      }
    } catch (e) {
      console.warn('Projects fallback to localStorage projects:', e);
    }
  }

  loadProjects();

  document.getElementById('project-add-btn').addEventListener('click', () => {
    showModal({
      title: '<i class="fas fa-plus" style="color:var(--accent-light)"></i> Create New Project',
      submitLabel: 'Create Project',
      fields: [
        { name: 'name', label: 'Project Name', required: true, placeholder: 'e.g. ERP integration v2' },
        { name: 'description', label: 'Description', placeholder: 'Brief summary of goals' },
        { name: 'status', label: 'Status / Column', type: 'select', options: ['Backlog', 'In Progress', 'Review', 'Done'], default: 'In Progress' },
        { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'], default: 'Medium' },
        { name: 'assigned_to', label: 'Assigned Employee Name', placeholder: 'e.g. Rahul Singh' }
      ],
      async onSubmit(data, close) {
        try {
          const res = await Promise.race([
            fetch(`${API_BASE}/projects`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            }),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1500))
          ]);
          const json = await res.json();
          if (!json.success) { showToast(json.error || 'Failed to create project', 'error'); return; }
          showToast(`✅ Project "${json.data.name}" created!`, 'success');
        } catch (e) {
          const list = getProjects();
          const newP = { id: Date.now(), ...data };
          list.unshift(newP);
          saveProjects(list);
          cachedProjects = list;
          showToast(`✅ Project created! (saved locally)`, 'success');
        }
        close();
        loadProjects();
      }
    });
  });

  window.projectEdit = function (id) {
    const proj = cachedProjects.find(p => p.id === id);
    if (!proj) {
      showToast('Project not found', 'error');
      return;
    }

    showModal({
      title: '<i class="fas fa-pen" style="color:var(--accent-light)"></i> Edit Project',
      submitLabel: 'Save Changes',
      fields: [
        { name: 'name', label: 'Project Name', required: true, default: proj.name },
        { name: 'description', label: 'Description', default: proj.description },
        { name: 'status', label: 'Status / Column', type: 'select', options: ['Backlog', 'In Progress', 'Review', 'Done'], default: proj.status },
        { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'], default: proj.priority },
        { name: 'assigned_to', label: 'Assigned Employee Name', default: proj.assigned_to }
      ],
      async onSubmit(data, close) {
        try {
          const res = await Promise.race([
            fetch(`${API_BASE}/projects/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            }),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1500))
          ]);
          const json = await res.json();
          if (!json.success) { showToast(json.error || 'Failed to update project', 'error'); return; }
          showToast(`✅ Project "${json.data.name}" updated!`, 'success');
        } catch (e) {
          const list = getProjects();
          const idx = list.findIndex(p => p.id === id);
          if (idx > -1) {
            list[idx] = { ...list[idx], ...data };
            saveProjects(list);
          }
          cachedProjects = list;
          showToast(`✅ Project updated! (saved locally)`, 'success');
        }
        close();
        loadProjects();
      }
    });
  };

  window.projectDelete = function (id, name) {
    showConfirm(`Do you want to delete project <strong>${name}</strong>?`, async () => {
      try {
        const res = await Promise.race([
          fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' }),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1500))
        ]);
        const json = await res.json();
        if (!json.success) { showToast(json.error || 'Failed to delete project', 'error'); return; }
        showToast(`Project "${name}" deleted.`, 'success');
      } catch (e) {
        const list = getProjects().filter(p => p.id !== id);
        saveProjects(list);
        cachedProjects = list;
        showToast(`Project "${name}" deleted. (locally)`, 'success');
      }
      loadProjects();
    });
  };

  document.getElementById('project-tasks-btn').addEventListener('click', () => {
    document.getElementById('proj-stat-done')?.click();
  });

  // ── Tab Switching Logic ──
  window.projectTabSwitch = function (tabEl, viewId) {
    // 1. Update UI classes for tabs
    const tabs = tabEl.parentElement.querySelectorAll('.tab');
    tabs.forEach(t => t.classList.remove('active'));
    tabEl.classList.add('active');

    // 2. Hide all view containers
    const containers = document.querySelectorAll('.project-view-container');
    containers.forEach(c => c.style.display = 'none');

    // 3. Show the selected container
    const target = document.getElementById('view-' + viewId);
    if (target) {
      target.style.display = 'block';
      // Trigger chart re-initialization if needed (especially for Sprint chart)
      if (viewId === 'sprint' && typeof initChartsOnPage === 'function') {
        setTimeout(() => initChartsOnPage('projects'), 100);
      }
    }
  };

  // ── Stat Card Click Handlers ──

  // ── Full Project Details for each active project ──
  const PROJECT_DETAILS = {
    1: {
      name: 'ERP v3.2', icon: 'fa-server', color: 'var(--accent)',
      description: 'Core platform upgrade to cloud-native microservices architecture. Migrates legacy monolith to modern containerised deployment on AWS EKS.',
      status: 'In Progress', priority: 'High', assigned_to: 'Rahul Singh',
      team: ['Rahul Singh', 'Deepak Nair', 'Sneha Iyer', 'Aravind Raj'],
      start: 'Jan 15, 2026', deadline: 'Jul 30, 2026', budget: '₹18,00,000', spent: '₹11,20,000',
      progress: 64,
      tasks_total: 87, tasks_done: 56, tasks_inprogress: 18, tasks_todo: 13,
      tasks: [
        { id: 'T-001', title: 'Setup Kubernetes Cluster', status: 'Done', assignee: 'Rahul Singh', due: 'Feb 10' },
        { id: 'T-002', title: 'Migrate Auth Service', status: 'Done', assignee: 'Deepak Nair', due: 'Feb 20' },
        { id: 'T-003', title: 'Inventory Microservice', status: 'Done', assignee: 'Sneha Iyer', due: 'Mar 5' },
        { id: 'T-004', title: 'Finance API Gateway', status: 'Done', assignee: 'Rahul Singh', due: 'Mar 15' },
        { id: 'T-005', title: 'HR Module Refactor', status: 'Done', assignee: 'Aravind Raj', due: 'Mar 25' },
        { id: 'T-006', title: 'Database Sharding', status: 'In Progress', assignee: 'Deepak Nair', due: 'Jun 20' },
        { id: 'T-007', title: 'CI/CD Pipeline v2', status: 'In Progress', assignee: 'Sneha Iyer', due: 'Jun 25' },
        { id: 'T-008', title: 'Load Balancer Config', status: 'To Do', assignee: 'Rahul Singh', due: 'Jul 10' },
        { id: 'T-009', title: 'Performance Benchmarking', status: 'To Do', assignee: 'Aravind Raj', due: 'Jul 20' }
      ],
      milestones: [
        { title: 'Infrastructure Setup', date: 'Feb 2026', done: true },
        { title: 'Core Services Migrated', date: 'Apr 2026', done: true },
        { title: 'Integration Testing', date: 'Jun 2026', done: false },
        { title: 'Production Rollout', date: 'Jul 2026', done: false }
      ]
    },
    2: {
      name: 'Mobile App 2.0', icon: 'fa-mobile-screen', color: 'var(--info)',
      description: 'Complete redesign of iOS & Android companion app with offline-first architecture, biometric login, push notifications and real-time ERP dashboard access.',
      status: 'In Progress', priority: 'High', assigned_to: 'Priya Sharma',
      team: ['Priya Sharma', 'Kiran Bose', 'Meera Nair'],
      start: 'Feb 1, 2026', deadline: 'Aug 15, 2026', budget: '₹12,00,000', spent: '₹5,80,000',
      progress: 48,
      tasks_total: 62, tasks_done: 30, tasks_inprogress: 14, tasks_todo: 18,
      tasks: [
        { id: 'T-020', title: 'Figma UI/UX Designs', status: 'Done', assignee: 'Priya Sharma', due: 'Mar 1' },
        { id: 'T-021', title: 'React Native Boilerplate', status: 'Done', assignee: 'Kiran Bose', due: 'Mar 10' },
        { id: 'T-022', title: 'Authentication Module', status: 'Done', assignee: 'Priya Sharma', due: 'Mar 20' },
        { id: 'T-023', title: 'Dashboard Widgets', status: 'Done', assignee: 'Meera Nair', due: 'Apr 5' },
        { id: 'T-024', title: 'Biometric Login', status: 'Done', assignee: 'Kiran Bose', due: 'Apr 15' },
        { id: 'T-025', title: 'Push Notifications', status: 'In Progress', assignee: 'Priya Sharma', due: 'Jun 30' },
        { id: 'T-026', title: 'Offline Sync Engine', status: 'In Progress', assignee: 'Kiran Bose', due: 'Jul 10' },
        { id: 'T-027', title: 'iOS App Store Submission', status: 'To Do', assignee: 'Priya Sharma', due: 'Aug 5' },
        { id: 'T-028', title: 'Android Play Store Upload', status: 'To Do', assignee: 'Meera Nair', due: 'Aug 10' }
      ],
      milestones: [
        { title: 'Design Complete', date: 'Mar 2026', done: true },
        { title: 'Beta Build Ready', date: 'May 2026', done: true },
        { title: 'Feature Complete', date: 'Jul 2026', done: false },
        { title: 'App Store Launch', date: 'Aug 2026', done: false }
      ]
    },
    3: {
      name: 'AI Prediction Module', icon: 'fa-brain', color: 'var(--purple)',
      description: 'AI-powered demand forecasting and anomaly detection engine. Uses ML models to predict inventory needs, flag financial irregularities, and optimize HR scheduling.',
      status: 'Backlog', priority: 'Medium', assigned_to: 'Vikram Kumar',
      team: ['Vikram Kumar', 'Ananya Sinha'],
      start: 'Apr 15, 2026', deadline: 'Nov 30, 2026', budget: '₹22,00,000', spent: '₹1,40,000',
      progress: 12,
      tasks_total: 95, tasks_done: 11, tasks_inprogress: 3, tasks_todo: 81,
      tasks: [
        { id: 'T-040', title: 'ML Framework Selection', status: 'Done', assignee: 'Vikram Kumar', due: 'May 1' },
        { id: 'T-041', title: 'Data Pipeline Setup', status: 'Done', assignee: 'Ananya Sinha', due: 'May 10' },
        { id: 'T-042', title: 'Demand Forecast Prototype', status: 'Done', assignee: 'Vikram Kumar', due: 'May 25' },
        { id: 'T-043', title: 'Anomaly Detection Model', status: 'In Progress', assignee: 'Ananya Sinha', due: 'Jun 30' },
        { id: 'T-044', title: 'HR Scheduling Algorithm', status: 'To Do', assignee: 'Vikram Kumar', due: 'Aug 15' },
        { id: 'T-045', title: 'ERP Integration Layer', status: 'To Do', assignee: 'Ananya Sinha', due: 'Sep 20' },
        { id: 'T-046', title: 'Model Training Pipeline', status: 'To Do', assignee: 'Vikram Kumar', due: 'Oct 10' },
        { id: 'T-047', title: 'A/B Testing Framework', status: 'To Do', assignee: 'Ananya Sinha', due: 'Nov 1' }
      ],
      milestones: [
        { title: 'Research & POC', date: 'May 2026', done: true },
        { title: 'Core Models Built', date: 'Aug 2026', done: false },
        { title: 'ERP Integration', date: 'Oct 2026', done: false },
        { title: 'Production Deploy', date: 'Nov 2026', done: false }
      ]
    },
    4: {
      name: 'CRM Revamp', icon: 'fa-handshake', color: 'var(--warning)',
      description: 'Complete redesign of the CRM module with new pipeline-based lead tracking, support ticket automation, customer 360° view, and WhatsApp Business integration.',
      status: 'Review', priority: 'Medium', assigned_to: 'Anita Patel',
      team: ['Anita Patel', 'Suresh Raj', 'Divya Menon'],
      start: 'Mar 10, 2026', deadline: 'Jun 30, 2026', budget: '₹8,50,000', spent: '₹7,20,000',
      progress: 88,
      tasks_total: 48, tasks_done: 42, tasks_inprogress: 4, tasks_todo: 2,
      tasks: [
        { id: 'T-060', title: 'Lead Pipeline UI', status: 'Done', assignee: 'Anita Patel', due: 'Apr 1' },
        { id: 'T-061', title: 'Contact Management', status: 'Done', assignee: 'Suresh Raj', due: 'Apr 10' },
        { id: 'T-062', title: 'Deal Tracking', status: 'Done', assignee: 'Divya Menon', due: 'Apr 20' },
        { id: 'T-063', title: 'Support Ticket System', status: 'Done', assignee: 'Anita Patel', due: 'May 1' },
        { id: 'T-064', title: 'WhatsApp Integration', status: 'Done', assignee: 'Suresh Raj', due: 'May 15' },
        { id: 'T-065', title: 'Customer 360° View', status: 'Done', assignee: 'Divya Menon', due: 'May 25' },
        { id: 'T-066', title: 'Email Campaign Builder', status: 'In Progress', assignee: 'Anita Patel', due: 'Jun 20' },
        { id: 'T-067', title: 'Analytics Dashboard', status: 'In Progress', assignee: 'Suresh Raj', due: 'Jun 25' },
        { id: 'T-068', title: 'UAT & Sign-off', status: 'To Do', assignee: 'Divya Menon', due: 'Jun 28' }
      ],
      milestones: [
        { title: 'Core CRM Features', date: 'Apr 2026', done: true },
        { title: 'Integrations Complete', date: 'May 2026', done: true },
        { title: 'User Acceptance Testing', date: 'Jun 2026', done: false },
        { title: 'Go-Live', date: 'Jun 30, 2026', done: false }
      ]
    }
  };

  // ── All 201 Completed Tasks Pool ──
  const ALL_COMPLETED_TASKS = (function () {
    const pool = [];
    const projects = [
      { name: 'ERP v3.2', count: 56, assignees: ['Rahul Singh', 'Deepak Nair', 'Sneha Iyer', 'Aravind Raj'], color: 'var(--accent)' },
      { name: 'Mobile App 2.0', count: 30, assignees: ['Priya Sharma', 'Kiran Bose', 'Meera Nair'], color: 'var(--info)' },
      { name: 'AI Prediction Module', count: 11, assignees: ['Vikram Kumar', 'Ananya Sinha'], color: 'var(--purple)' },
      { name: 'CRM Revamp', count: 42, assignees: ['Anita Patel', 'Suresh Raj', 'Divya Menon'], color: 'var(--warning)' },
      { name: 'Payment Gateway', count: 62, assignees: ['Anita Patel', 'Kiran Bose', 'Deepak Nair'], color: 'var(--success)' }
    ];
    const taskTypes = [
      'Backend API development', 'Frontend component build', 'Unit testing & coverage', 'Code review & merge', 'Database migration', 'UI/UX implementation',
      'Integration testing', 'Performance optimization', 'Documentation update', 'Bug fix & hotfix', 'Security audit', 'API endpoint testing',
      'Data model design', 'Authentication flow', 'Third-party integration', 'Deployment configuration', 'Environment setup', 'Feature flagging',
      'Load testing', 'User acceptance testing', 'Accessibility review', 'Analytics tracking', 'Error handling', 'Logging & monitoring', 'Cache optimization'
    ];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    let taskId = 1;
    projects.forEach(proj => {
      for (let i = 0; i < proj.count; i++) {
        const tType = taskTypes[(taskId + i) % taskTypes.length];
        const assignee = proj.assignees[i % proj.assignees.length];
        const month = months[Math.floor(i / Math.max(1, Math.floor(proj.count / 6))) % 6];
        const day = (i % 28) + 1;
        pool.push({
          id: 'TSK-' + String(taskId).padStart(4, '0'),
          title: tType + ' — ' + proj.name,
          project: proj.name,
          projectColor: proj.color,
          assignee,
          completedOn: `${day < 10 ? '0' + day : day} ${month} 2026`,
          storyPts: [1, 2, 3, 5, 8][taskId % 5]
        });
        taskId++;
      }
    });
    return pool;
  })();

  // Helper to create a project detail card HTML
  function buildProjectDetailHTML(details) {
    const statusColor = details.status === 'In Progress' ? 'var(--info)' : details.status === 'Review' ? 'var(--warning)' : details.status === 'Backlog' ? 'var(--text-muted)' : 'var(--success)';
    const prioColor = details.priority === 'High' ? 'var(--danger)' : details.priority === 'Medium' ? 'var(--warning)' : 'var(--info)';
    const taskRows = details.tasks.map(t => {
      const sc = t.status === 'Done' ? 'badge-success' : t.status === 'In Progress' ? 'badge-info' : 'badge-warning';
      return `<tr><td style="font-family:var(--font-mono);font-size:11px;color:var(--accent-light)">${t.id}</td><td>${t.title}</td><td>${t.assignee}</td><td>Due ${t.due}</td><td><span class="badge ${sc}" style="font-size:10px">${t.status}</span></td></tr>`;
    }).join('');
    const milestones = details.milestones.map(m => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
        <i class="fas ${m.done ? 'fa-circle-check' : 'fa-circle-dot'}" style="color:${m.done ? 'var(--success)' : 'var(--text-muted)'};font-size:14px"></i>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:600">${m.title}</div>
          <div style="font-size:11px;color:var(--text-muted)">${m.date}</div>
        </div>
        ${m.done ? '<span class="badge badge-success" style="font-size:10px">Completed</span>' : '<span class="badge badge-info" style="font-size:10px">Upcoming</span>'}
      </div>
    `).join('');
    return `
      <div style="font-size:14px">
        <div style="display:flex;align-items:center;gap:12px;padding:16px;background:rgba(255,255,255,0.02);border-radius:12px;border:1px solid var(--border);margin-bottom:16px">
          <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;font-size:20px;color:${details.color}">
            <i class="fas ${details.icon}"></i>
          </div>
          <div style="flex:1">
            <div style="font-size:17px;font-weight:700;color:var(--text-primary)">${details.name}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${details.description}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
          <div style="background:rgba(255,255,255,0.02);border-radius:8px;padding:12px;border:1px solid var(--border)">
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Status</div>
            <div style="font-size:14px;font-weight:700;color:${statusColor};margin-top:4px">${details.status}</div>
          </div>
          <div style="background:rgba(255,255,255,0.02);border-radius:8px;padding:12px;border:1px solid var(--border)">
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Priority</div>
            <div style="font-size:14px;font-weight:700;color:${prioColor};margin-top:4px">${details.priority}</div>
          </div>
          <div style="background:rgba(255,255,255,0.02);border-radius:8px;padding:12px;border:1px solid var(--border)">
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Timeline</div>
            <div style="font-size:12px;font-weight:600;margin-top:4px">${details.start} → ${details.deadline}</div>
          </div>
          <div style="background:rgba(255,255,255,0.02);border-radius:8px;padding:12px;border:1px solid var(--border)">
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Budget</div>
            <div style="font-size:12px;font-weight:600;margin-top:4px">${details.spent} / ${details.budget}</div>
          </div>
        </div>
        <div style="margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:13px;font-weight:600">Overall Progress</span>
            <span style="font-size:13px;font-weight:700;color:${details.color}">${details.progress}%</span>
          </div>
          <div style="height:10px;background:rgba(255,255,255,0.06);border-radius:10px;overflow:hidden">
            <div style="height:100%;width:${details.progress}%;background:${details.color};border-radius:10px;transition:width 0.6s ease"></div>
          </div>
          <div style="display:flex;gap:16px;margin-top:8px;font-size:11px;color:var(--text-muted)">
            <span><span style="color:var(--success);font-weight:700">${details.tasks_done}</span> Done</span>
            <span><span style="color:var(--info);font-weight:700">${details.tasks_inprogress}</span> In Progress</span>
            <span><span style="color:var(--text-muted);font-weight:700">${details.tasks_todo}</span> To Do</span>
            <span><span style="font-weight:700">${details.tasks_total}</span> Total</span>
          </div>
        </div>
        <div style="margin-bottom:16px">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px">Team Members (${details.team.length})</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${details.team.map(m => `<span style="background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:20px;padding:4px 12px;font-size:12px">${m}</span>`).join('')}
          </div>
        </div>
        <div style="margin-bottom:16px">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px">Milestones</div>
          ${milestones}
        </div>
        <div>
          <div style="font-size:13px;font-weight:600;margin-bottom:8px">Task Breakdown</div>
          <div style="overflow-x:auto">
            <table style="width:100%;font-size:12px">
              <thead><tr style="color:var(--text-muted);border-bottom:1px solid var(--border)">
                <th style="padding:6px 8px;text-align:left">ID</th><th style="padding:6px 8px;text-align:left">Task</th><th style="padding:6px 8px;text-align:left">Assignee</th><th style="padding:6px 8px;text-align:left">Due</th><th style="padding:6px 8px;text-align:left">Status</th>
              </tr></thead>
              <tbody>${taskRows}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  }

  document.getElementById('proj-stat-active')?.addEventListener('click', () => {
    const projects = (cachedProjects.length ? cachedProjects : getProjects()).filter(p => p.status !== 'Done');
    // Build a tabbed project viewer
    const projectIds = [1, 2, 3, 4];
    let currentTab = projectIds[0];

    const renderActiveModal = (selId) => {
      currentTab = selId;
      const detail = PROJECT_DETAILS[selId];
      const tabsHTML = projectIds.map(pid => {
        const d = PROJECT_DETAILS[pid];
        const isActive = pid === selId;
        return `<button onclick="window._projTabSwitch(${pid})" style="padding:8px 14px;border-radius:8px;border:1px solid ${isActive ? d.color : 'var(--border)'};background:${isActive ? d.color + '22' : 'transparent'};color:${isActive ? d.color : 'var(--text-muted)'};cursor:pointer;font-size:12px;font-weight:${isActive ? '700' : '500'};white-space:nowrap">
          <i class="fas ${d.icon}" style="margin-right:4px"></i>${d.name}
        </button>`;
      }).join('');
      const html = `
        <div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border)">${tabsHTML}</div>
          <div id="proj-detail-body">${buildProjectDetailHTML(detail)}</div>
        </div>`;
      showContentModal({
        title: '<i class="fas fa-folder-open" style="color:var(--accent-light)"></i> Active Projects — Full Details',
        content: html,
        maxWidth: '820px'
      });
      window._projTabSwitch = (pid) => {
        const d = PROJECT_DETAILS[pid];
        const tabBtns = document.querySelectorAll('[onclick^="window._projTabSwitch"]');
        tabBtns.forEach(b => {
          const bpid = parseInt(b.getAttribute('onclick').match(/\d+/)[0]);
          const bd = PROJECT_DETAILS[bpid];
          b.style.background = bpid === pid ? bd.color + '22' : 'transparent';
          b.style.color = bpid === pid ? bd.color : 'var(--text-muted)';
          b.style.border = `1px solid ${bpid === pid ? bd.color : 'var(--border)'}`;
          b.style.fontWeight = bpid === pid ? '700' : '500';
        });
        const body = document.getElementById('proj-detail-body');
        if (body) body.innerHTML = buildProjectDetailHTML(d);
      };
    };
    renderActiveModal(projectIds[0]);
  });

  document.getElementById('proj-stat-done')?.addEventListener('click', () => {
    const tasks = ALL_COMPLETED_TASKS;
    const byProject = {};
    tasks.forEach(t => {
      if (!byProject[t.project]) byProject[t.project] = [];
      byProject[t.project].push(t);
    });

    const summaryCards = Object.entries(byProject).map(([proj, tlist]) => {
      const color = tlist[0].projectColor;
      return `<div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:10px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:10px;height:10px;border-radius:50%;background:${color}"></div>
          <span style="font-size:13px;font-weight:600">${proj}</span>
        </div>
        <span style="font-size:20px;font-weight:800;color:${color}">${tlist.length}</span>
      </div>`;
    }).join('');

    const tableRows = tasks.map(t => `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.03)">
        <td style="font-family:var(--font-mono);font-size:11px;color:var(--accent-light);padding:8px">${t.id}</td>
        <td style="font-size:12px;padding:8px;max-width:220px">${t.title}</td>
        <td style="padding:8px">
          <span style="font-size:11px;padding:2px 8px;border-radius:20px;background:${t.projectColor}22;color:${t.projectColor};font-weight:600">${t.project.split(' ')[0]}</span>
        </td>
        <td style="font-size:12px;padding:8px">${t.assignee}</td>
        <td style="font-size:12px;padding:8px;color:var(--text-muted)">${t.completedOn}</td>
        <td style="padding:8px;text-align:center;font-size:11px;color:var(--text-muted)">${t.storyPts} pts</td>
      </tr>`).join('');

    const html = `
      <div>
        <div style="background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.2);border-radius:10px;padding:16px;margin-bottom:20px;display:flex;align-items:center;gap:16px">
          <div style="font-size:48px;font-weight:900;color:var(--success);line-height:1">${tasks.length}</div>
          <div>
            <div style="font-size:16px;font-weight:700">Tasks Completed</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:3px">Across all projects • May 2026 Sprint</div>
            <div style="font-size:12px;color:var(--success);margin-top:4px">✅ Total Story Points: ${tasks.reduce((s, t) => s + t.storyPts, 0)}</div>
          </div>
        </div>
        <div style="font-size:13px;font-weight:600;margin-bottom:10px">Breakdown by Project</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px">${summaryCards}</div>
        <div style="font-size:13px;font-weight:600;margin-bottom:10px">All ${tasks.length} Completed Tasks</div>
        <div style="overflow:auto;max-height:360px;border:1px solid var(--border);border-radius:8px">
          <table style="width:100%;border-collapse:collapse">
            <thead style="position:sticky;top:0;background:var(--bg-card);z-index:1">
              <tr style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid var(--border)">
                <th style="padding:10px 8px;text-align:left">Task ID</th>
                <th style="padding:10px 8px;text-align:left">Title</th>
                <th style="padding:10px 8px;text-align:left">Project</th>
                <th style="padding:10px 8px;text-align:left">Assignee</th>
                <th style="padding:10px 8px;text-align:left">Completed</th>
                <th style="padding:10px 8px;text-align:center">Pts</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </div>`;

    showContentModal({
      title: '<i class="fas fa-check-double" style="color:var(--success)"></i> 201 Tasks Completed — Full Breakdown',
      content: html,
      maxWidth: '900px'
    });
  });

  document.getElementById('proj-stat-progress')?.addEventListener('click', () => {
    const progVal = document.getElementById('project-stats-progress')?.textContent || '2';
    showModal({
      title: '<i class="fas fa-clock" style="color:var(--warning)"></i> Work in Progress',
      submitLabel: 'View Kanban',
      fields: [
        { label: 'Items in Progress', default: progVal, readonly: true },
        { label: 'ERP v3.2 — CI/CD Pipeline v2', default: 'Assigned: Sneha Iyer | Due: Jun 25', readonly: true },
        { label: 'ERP v3.2 — Database Sharding', default: 'Assigned: Deepak Nair | Due: Jun 20', readonly: true },
        { label: 'Avg Cycle Time', default: '3.5 Days', readonly: true },
        { label: 'Blocked Items', default: '2 Tasks', readonly: true }
      ],
      onSubmit(data, close) {
        close();
        document.querySelector('[data-proj-tab="kanban"]')?.click();
      }
    });
  });

  document.getElementById('proj-stat-overdue')?.addEventListener('click', () => {
    const overdueHTML = `
      <div>
        <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:16px;margin-bottom:20px;display:flex;align-items:center;gap:16px">
          <div style="font-size:48px;font-weight:900;color:var(--danger);line-height:1">7</div>
          <div>
            <div style="font-size:16px;font-weight:700">Overdue Tasks</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:3px">Require immediate attention</div>
            <div style="font-size:12px;color:var(--danger);margin-top:4px">⚠️ Est. delay impact: 2 business days</div>
          </div>
        </div>
        ${[
        { id: 'T-006', title: 'Database Sharding', project: 'ERP v3.2', assignee: 'Deepak Nair', due: 'Jun 20', overdue: '3 days', priority: 'High' },
        { id: 'T-025', title: 'Push Notifications', project: 'Mobile App 2.0', assignee: 'Priya Sharma', due: 'Jun 30', overdue: '1 day', priority: 'High' },
        { id: 'T-044', title: 'HR Scheduling Algorithm', project: 'AI Module', assignee: 'Vikram Kumar', due: 'Aug 15', overdue: 'Delayed start', priority: 'Medium' },
        { id: 'T-066', title: 'Email Campaign Builder', project: 'CRM Revamp', assignee: 'Anita Patel', due: 'Jun 20', overdue: '3 days', priority: 'Medium' },
        { id: 'T-067', title: 'Analytics Dashboard', project: 'CRM Revamp', assignee: 'Suresh Raj', due: 'Jun 25', overdue: '1 day', priority: 'Medium' },
        { id: 'T-043', title: 'Anomaly Detection Model', project: 'AI Module', assignee: 'Ananya Sinha', due: 'Jun 30', overdue: 'Blocked', priority: 'High' },
        { id: 'T-027', title: 'iOS App Store Submission', project: 'Mobile App 2.0', assignee: 'Priya Sharma', due: 'Aug 5', overdue: 'At risk', priority: 'High' }
      ].map(t => `
          <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:8px;margin-bottom:8px">
            <div style="flex:1">
              <div style="font-size:13px;font-weight:600">${t.title}</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${t.project} · ${t.assignee} · Due ${t.due}</div>
            </div>
            <span style="font-size:11px;padding:3px 10px;border-radius:20px;background:rgba(239,68,68,0.15);color:var(--danger);font-weight:700">${t.overdue}</span>
            <span class="badge ${t.priority === 'High' ? 'badge-danger' : 'badge-warning'}" style="font-size:10px">${t.priority}</span>
          </div>`).join('')}
      </div>`;
    showContentModal({
      title: '<i class="fas fa-flag" style="color:var(--danger)"></i> 7 Overdue Tasks — Critical Alerts',
      content: overdueHTML,
      maxWidth: '700px'
    });
  });

  // ── Gantt Re-rendering Logic ──
  const renderGantt = (mode = 'week') => {
    const ganttBox = document.getElementById('gantt-content');
    if (!ganttBox) return;

    let headers = [];
    if (mode === 'day') {
      headers = ['01 Jun', '02 Jun', '03 Jun', '04 Jun', '05 Jun', '06 Jun', '07 Jun', '08 Jun', '09 Jun', '10 Jun'];
    } else if (mode === 'week') {
      headers = ['Wk 22', 'Wk 23', 'Wk 24', 'Wk 25', 'Wk 26', 'Wk 27', 'Wk 28', 'Wk 29', 'Wk 30', 'Wk 31'];
    } else if (mode === 'month') {
      headers = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    }

    const rows = [
      { name: "ERP v3.2 Core", start: mode === 'day' ? 10 : 0, end: mode === 'day' ? 90 : 70, color: "var(--accent)" },
      { name: "Mobile UI Kit", start: mode === 'day' ? 30 : 15, end: mode === 'day' ? 60 : 40, color: "var(--info)" },
      { name: "API Security", start: mode === 'day' ? 40 : 30, end: mode === 'day' ? 80 : 60, color: "var(--purple)" },
      { name: "AI Engine Beta", start: mode === 'day' ? 50 : 50, end: mode === 'day' ? 100 : 90, color: "var(--pink)" },
      { name: "QA & Testing", start: mode === 'day' ? 80 : 70, end: mode === 'day' ? 120 : 100, color: "var(--success)" }
    ];

    ganttBox.innerHTML = `
      <div style="display:flex; border-bottom:1px solid var(--border); padding-bottom:10px; margin-bottom:10px;">
        <div style="width:160px; font-weight:700; color:var(--text-muted); font-size:11px; text-transform:uppercase;">Task / Project</div>
        <div style="flex:1; display:flex; font-weight:700; color:var(--text-muted); font-size:11px;">
          ${headers.map(h => `<div style="flex:1; text-align:center;">${h}</div>`).join('')}
        </div>
      </div>
      ${rows.map(row => `
        <div style="display:flex; align-items:center; height:45px; border-bottom:1px solid rgba(255,255,255,0.03);">
          <div style="width:160px; font-size:13px; font-weight:600; color:var(--text-primary);">${row.name}</div>
          <div style="flex:1; position:relative; height:12px; background:rgba(255,255,255,0.01); border-radius:10px; overflow:hidden;">
            <div style="position:absolute; left:${row.start}%; width:${Math.min(100 - row.start, row.end - row.start)}%; height:100%; background:${row.color}; border-radius:10px; box-shadow:0 0 15px ${row.color}44;"></div>
          </div>
        </div>
      `).join('')}
    `;
  };

  // Initial render
  renderGantt('week');

  // ── Gantt Granularity Toggles ──
  document.getElementById('gantt-granularity-toggles')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    // Update active state classes
    const buttons = e.currentTarget.querySelectorAll('button');
    buttons.forEach(b => {
      b.classList.remove('btn-primary');
      b.classList.add('btn-secondary');
    });
    btn.classList.remove('btn-secondary');
    btn.classList.add('btn-primary');

    const mode = btn.getAttribute('data-gantt');
    renderGantt(mode);
  });

  // ── Roadmap Timeline Handlers ──
  document.getElementById('view-timeline')?.addEventListener('click', (e) => {
    const item = e.target.closest('.roadmap-item');
    if (!item) return;

    const title = item.getAttribute('data-title');
    const desc = item.getAttribute('data-desc');
    const month = item.getAttribute('data-month');

    showModal({
      title: `<i class="fas fa-flag" style="color:var(--accent)"></i> Milestone: ${title}`,
      submitLabel: 'Set Reminder',
      fields: [
        { label: 'Phase', default: month + ' 2026', readonly: true },
        { label: 'Objective', default: desc, readonly: true },
        { label: 'Status', default: 'Scheduled', readonly: true },
        { label: 'KPI Target', default: '99.9% Scalability', readonly: true }
      ],
      onSubmit(data, close) {
        showToast(`✅ Reminder set for ${title}!`, 'success');
        close();
      }
    });
  });
};

/* AI Command Center */
pages['ai-center'] = function (container) {
  const getAIState = () => {
    try {
      return JSON.parse(localStorage.getItem('amdox_ai_state')) || {
        anomalyResolved: false,
        skuOrdered: false,
        resourceOptimized: false,
        contractReviewed: false
      };
    } catch {
      return {
        anomalyResolved: false,
        skuOrdered: false,
        resourceOptimized: false,
        contractReviewed: false
      };
    }
  };

  const saveAIState = (state) => {
    try {
      localStorage.setItem('amdox_ai_state', JSON.stringify(state));
    } catch { }
  };

  const state = getAIState();
  const anomaliesCount = state.anomalyResolved ? 22 : 23;

  container.innerHTML = `
    <div class="module-hero" style="background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(168,85,247,0.1))">
      <h2><i class="fas fa-brain" style="color:var(--purple)"></i> AI Command Center</h2>
      <p>Demand forecasting, anomaly detection, intelligent approvals, predictive analytics, and AI-generated business insights.</p>
      <div class="page-actions" style="margin-top:16px">
        <button class="btn btn-primary btn-sm" id="btn-run-ai-analysis"><i class="fas fa-wand-magic-sparkles"></i> Run AI Analysis</button>
        <button class="btn btn-secondary btn-sm" id="btn-chat-with-ai"><i class="fas fa-robot"></i> Chat with AI</button>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-card-header"><div class="stat-icon purple"><i class="fas fa-brain"></i></div></div><div class="stat-value">156</div><div class="stat-label">AI Models Active</div></div>
      <div class="stat-card"><div class="stat-card-header"><div class="stat-icon green"><i class="fas fa-bullseye"></i></div></div><div class="stat-value">94.2%</div><div class="stat-label">Forecast Accuracy</div></div>
      <div class="stat-card"><div class="stat-card-header"><div class="stat-icon cyan"><i class="fas fa-bolt"></i></div></div><div class="stat-value">1,247</div><div class="stat-label">Predictions Today</div></div>
      <div class="stat-card"><div class="stat-card-header"><div class="stat-icon pink"><i class="fas fa-shield-halved"></i></div></div><div class="stat-value" id="ai-anomalies-stat">${anomaliesCount}</div><div class="stat-label">Anomalies Detected</div></div>
    </div>
    <div class="grid-3">
      <div class="card" style="border-color:rgba(99,102,241,0.3)">
        <div style="text-align:center;padding:20px 0"><div style="width:60px;height:60px;border-radius:16px;background:linear-gradient(135deg,var(--accent),var(--purple));display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px;color:#fff"><i class="fas fa-chart-line"></i></div><h3 style="font-size:16px;margin-bottom:6px">Demand Forecasting</h3><p style="font-size:13px;color:var(--text-secondary)">LSTM & Prophet models for accurate predictions</p><div style="margin-top:16px"><span class="badge badge-success">Active</span></div></div>
      </div>
      <div class="card" style="border-color:rgba(236,72,153,0.3)">
        <div style="text-align:center;padding:20px 0"><div style="width:60px;height:60px;border-radius:16px;background:linear-gradient(135deg,var(--pink),var(--danger));display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px;color:#fff"><i class="fas fa-triangle-exclamation"></i></div><h3 style="font-size:16px;margin-bottom:6px">Anomaly Detection</h3><p style="font-size:13px;color:var(--text-secondary)">Real-time fraud & anomaly detection engine</p><div style="margin-top:16px"><span class="badge badge-success">Active</span></div></div>
      </div>
      <div class="card" style="border-color:rgba(6,182,212,0.3)">
        <div style="text-align:center;padding:20px 0"><div style="width:60px;height:60px;border-radius:16px;background:linear-gradient(135deg,var(--cyan),var(--info));display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px;color:#fff"><i class="fas fa-robot"></i></div><h3 style="font-size:16px;margin-bottom:6px">AI Assistant</h3><p style="font-size:13px;color:var(--text-secondary)">Natural language business intelligence</p><div style="margin-top:16px"><span class="badge badge-success">Active</span></div></div>
      </div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><span class="card-title">AI-Generated Insights</span><span class="badge badge-purple">Last 24h</span></div>
        <div class="activity-list" id="ai-insights-list">
          <!-- Dynamically populated below -->
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Revenue Forecast</span></div>
        <div class="chart-container"><canvas data-chart="revenue"></canvas></div>
      </div>
    </div>`;

  const renderAIStateOnPage = () => {
    const currentState = getAIState();

    // Update anomalies count badge on page
    const statValEl = document.getElementById('ai-anomalies-stat');
    if (statValEl) {
      statValEl.textContent = currentState.anomalyResolved ? 22 : 23;
    }

    const insightsList = container.querySelector('#ai-insights-list');
    if (insightsList) {
      insightsList.innerHTML = `
        <div class="activity-item"><div class="activity-dot purple"></div><div><div class="activity-text">📈 <strong>Revenue Prediction:</strong> Q3 2026 projected at ₹2.4 Crore (+18% YoY)</div><div class="activity-time">AI Confidence: 94%</div></div></div>
        <div class="activity-item"><div class="activity-dot red"></div><div><div class="activity-text">🚨 <strong>Anomaly Alert:</strong> Unusual expense pattern detected in Marketing dept ${currentState.anomalyResolved ? '<span class="badge badge-success" style="font-size:10px;margin-left:6px">Resolved</span>' : ''}</div><div class="activity-time">AI Confidence: 87%</div></div></div>
        <div class="activity-item"><div class="activity-dot green"></div><div><div class="activity-text">✅ <strong>Recommendation:</strong> Reorder SKU-0089 (Dell Monitor) — predicted stockout in 3 days ${currentState.skuOrdered ? '<span class="badge badge-success" style="font-size:10px;margin-left:6px">Ordered</span>' : ''}</div><div class="activity-time">AI Confidence: 92%</div></div></div>
        <div class="activity-item"><div class="activity-dot blue"></div><div><div class="activity-text">💡 <strong>Optimization:</strong> Shift 2 engineers from Project A to B for 15% faster delivery ${currentState.resourceOptimized ? '<span class="badge badge-success" style="font-size:10px;margin-left:6px">Applied</span>' : ''}</div><div class="activity-time">AI Confidence: 89%</div></div></div>
      `;
    }
  };

  renderAIStateOnPage();

  // ── Run AI Analysis button ──
  document.getElementById('btn-run-ai-analysis').addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box" style="max-width:560px">
        <div class="modal-header">
          <h3 class="modal-title"><i class="fas fa-wand-magic-sparkles" style="color:var(--purple)"></i> AI Analysis Engine</h3>
          <button class="modal-close" id="ai-analysis-close"><i class="fas fa-xmark"></i></button>
        </div>
        <div class="modal-body" id="ai-analysis-body">
          <div style="text-align:center;padding:20px 0">
            <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--purple));display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:28px;color:#fff;animation:pulse-glow 2s infinite">
              <i class="fas fa-brain"></i>
            </div>
            <h3 style="font-size:16px;margin-bottom:8px">Running AI Analysis...</h3>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:20px">Analyzing data across all modules</p>
            <div class="progress-bar" style="height:8px;margin-bottom:12px">
              <div class="progress-fill blue" id="ai-progress-fill" style="width:0%;transition:width 0.5s ease"></div>
            </div>
            <p style="font-size:12px;color:var(--text-muted)" id="ai-progress-label">Initializing models...</p>
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));

    const closeModal = () => { overlay.classList.remove('open'); setTimeout(() => overlay.remove(), 200); };
    overlay.querySelector('#ai-analysis-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

    // Simulate progress
    const fill = overlay.querySelector('#ai-progress-fill');
    const label = overlay.querySelector('#ai-progress-label');
    const body = overlay.querySelector('#ai-analysis-body');
    const steps = [
      { pct: 20, text: 'Scanning HR & Finance data...' },
      { pct: 45, text: 'Running anomaly detection...' },
      { pct: 65, text: 'Generating demand forecasts...' },
      { pct: 85, text: 'Computing revenue predictions...' },
      { pct: 100, text: 'Analysis complete!' }
    ];
    steps.forEach((step, i) => {
      setTimeout(() => {
        if (!document.body.contains(overlay)) return;
        fill.style.width = step.pct + '%';
        label.textContent = step.text;
        if (step.pct === 100) {
          setTimeout(() => {
            if (!document.body.contains(overlay)) return;
            const currentState = getAIState();
            body.innerHTML = `
              <div style="padding:8px 0">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
                  <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,var(--success),#16a34a);display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px"><i class="fas fa-check"></i></div>
                  <div><h3 style="font-size:15px;font-weight:700">Analysis Complete</h3><p style="font-size:12px;color:var(--text-muted)">Processed 12,847 data points in 4.2s</p></div>
                </div>
                <div style="display:flex;flex-direction:column;gap:12px">
                  <div style="background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:14px">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><i class="fas fa-chart-trending-up" style="color:var(--success)"></i><strong style="font-size:13px">Revenue Forecast</strong></div>
                    <p style="font-size:13px;color:var(--text-secondary)">Q3 2026 revenue projected at <strong style="color:var(--success)">₹2.4 Crore</strong> (+18% YoY). High confidence (94%).</p>
                  </div>
                  <div style="background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:14px">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><i class="fas fa-triangle-exclamation" style="color:var(--warning)"></i><strong style="font-size:13px">Anomalies Found</strong></div>
                    <div style="display:flex;flex-direction:column;gap:8px">
                      <div style="display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:4px;padding:8px 10px;gap:10px">
                        <div style="font-size:12.5px;color:var(--text-secondary)">
                          ⚠️ <strong>Marketing Dept:</strong> Expenses deviate 23% from baseline pattern.
                        </div>
                        ${currentState.anomalyResolved
                ? '<span style="color:var(--success);font-size:11px;font-weight:600;white-space:nowrap;flex-shrink:0"><i class="fas fa-circle-check"></i> Resolved</span>'
                : '<button class="btn btn-danger btn-xs" id="btn-fix-anomaly" style="padding:4px 8px;font-size:11px;white-space:nowrap;flex-shrink:0">Resolve</button>'}
                      </div>
                    </div>
                  </div>
                  <div style="background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:14px">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><i class="fas fa-lightbulb" style="color:var(--accent-light)"></i><strong style="font-size:13px">Recommendations & Actions</strong></div>
                    <div style="display:flex;flex-direction:column;gap:8px">
                      <div style="display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:4px;padding:8px 10px;gap:10px">
                        <div style="font-size:12.5px;color:var(--text-secondary)">
                          📦 <strong>Inventory SKU-0089:</strong> Dell Monitor stockout predicted in 3 days.
                        </div>
                        ${currentState.skuOrdered
                ? '<span style="color:var(--success);font-size:11px;font-weight:600;white-space:nowrap;flex-shrink:0"><i class="fas fa-circle-check"></i> Ordered</span>'
                : '<button class="btn btn-primary btn-xs" id="btn-action-reorder" style="padding:4px 8px;font-size:11px;white-space:nowrap;flex-shrink:0">Auto-Reorder</button>'}
                      </div>
                      <div style="display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:4px;padding:8px 10px;gap:10px">
                        <div style="font-size:12.5px;color:var(--text-secondary)">
                          👥 <strong>Resource Allocation:</strong> Shift 2 developers from Project A to B.
                        </div>
                        ${currentState.resourceOptimized
                ? '<span style="color:var(--success);font-size:11px;font-weight:600;white-space:nowrap;flex-shrink:0"><i class="fas fa-circle-check"></i> Applied</span>'
                : '<button class="btn btn-primary btn-xs" id="btn-action-optimize" style="padding:4px 8px;font-size:11px;white-space:nowrap;flex-shrink:0">Optimize</button>'}
                      </div>
                      <div style="display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:4px;padding:8px 10px;gap:10px">
                        <div style="font-size:12.5px;color:var(--text-secondary)">
                          📄 <strong>Acme Corp Contract:</strong> Renewal deadline approaching.
                        </div>
                        ${currentState.contractReviewed
                ? '<span style="color:var(--success);font-size:11px;font-weight:600;white-space:nowrap;flex-shrink:0"><i class="fas fa-circle-check"></i> Reviewed</span>'
                : '<button class="btn btn-secondary btn-xs" id="btn-action-review" style="padding:4px 8px;font-size:11px;white-space:nowrap;flex-shrink:0">Review</button>'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;padding-top:16px;border-top:1px solid var(--border-color)">
                <button class="btn btn-secondary btn-sm" id="ai-analysis-done">Close</button>
                <button class="btn btn-primary btn-sm" id="ai-analysis-export"><i class="fas fa-download"></i> Export Report</button>
              </div>`;

            // Anomaly Resolution Action
            const fixAnomalyBtn = overlay.querySelector('#btn-fix-anomaly');
            if (fixAnomalyBtn) {
              fixAnomalyBtn.addEventListener('click', (e) => {
                const btn = e.target;
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resolving...';

                setTimeout(() => {
                  const resolvedBadge = document.createElement('span');
                  resolvedBadge.style.color = 'var(--success)';
                  resolvedBadge.style.fontSize = '11px';
                  resolvedBadge.style.fontWeight = '600';
                  resolvedBadge.innerHTML = '<i class="fas fa-circle-check"></i> Resolved';
                  btn.replaceWith(resolvedBadge);

                  // Save state
                  const latestState = getAIState();
                  latestState.anomalyResolved = true;
                  saveAIState(latestState);

                  renderAIStateOnPage();
                  showToast('Anomaly resolved: Marketing department budget aligned with baseline guidelines.', 'success');
                }, 1200);
              });
            }

            // Auto-Reorder Action
            const reorderBtn = overlay.querySelector('#btn-action-reorder');
            if (reorderBtn) {
              reorderBtn.addEventListener('click', (e) => {
                const btn = e.target;
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

                setTimeout(() => {
                  const completedBadge = document.createElement('span');
                  completedBadge.style.color = 'var(--success)';
                  completedBadge.style.fontSize = '11px';
                  completedBadge.style.fontWeight = '600';
                  completedBadge.innerHTML = '<i class="fas fa-circle-check"></i> Ordered';
                  btn.replaceWith(completedBadge);

                  // Save state
                  const latestState = getAIState();
                  latestState.skuOrdered = true;
                  saveAIState(latestState);

                  renderAIStateOnPage();
                  showToast('Purchase order generated successfully for SKU-0089 (Dell Monitor).', 'success');
                }, 1000);
              });
            }

            // Optimize Action
            const optimizeBtn = overlay.querySelector('#btn-action-optimize');
            if (optimizeBtn) {
              optimizeBtn.addEventListener('click', (e) => {
                const btn = e.target;
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Optimizing...';

                setTimeout(() => {
                  const completedBadge = document.createElement('span');
                  completedBadge.style.color = 'var(--success)';
                  completedBadge.style.fontSize = '11px';
                  completedBadge.style.fontWeight = '600';
                  completedBadge.innerHTML = '<i class="fas fa-circle-check"></i> Applied';
                  btn.replaceWith(completedBadge);

                  // Save state
                  const latestState = getAIState();
                  latestState.resourceOptimized = true;
                  saveAIState(latestState);

                  renderAIStateOnPage();
                  showToast('Resource allocation updated: 2 developers shifted to Project B.', 'success');
                }, 1000);
              });
            }

            // Review Action
            const reviewBtn = overlay.querySelector('#btn-action-review');
            if (reviewBtn) {
              reviewBtn.addEventListener('click', (e) => {
                const btn = e.target;
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

                setTimeout(() => {
                  const completedBadge = document.createElement('span');
                  completedBadge.style.color = 'var(--success)';
                  completedBadge.style.fontSize = '11px';
                  completedBadge.style.fontWeight = '600';
                  completedBadge.innerHTML = '<i class="fas fa-circle-check"></i> Reviewed';
                  btn.replaceWith(completedBadge);

                  // Save state
                  const latestState = getAIState();
                  latestState.contractReviewed = true;
                  saveAIState(latestState);

                  renderAIStateOnPage();
                  showToast('Acme Corp contract flagged for review. Opened renewal checklist.', 'info');
                }, 1000);
              });
            }

            overlay.querySelector('#ai-analysis-done').addEventListener('click', closeModal);

            overlay.querySelector('#ai-analysis-export').addEventListener('click', () => {
              if (!window.jspdf) {
                showToast('PDF library is loading. Please try again in a few seconds.', 'error');
                return;
              }
              try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                const now = new Date();
                const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                const finalState = getAIState();

                // Header block
                doc.setFillColor(30, 27, 75); // Dark deep blue background
                doc.rect(0, 0, 210, 35, 'F');

                doc.setTextColor(255, 255, 255);
                doc.setFontSize(20);
                doc.setFont('helvetica', 'bold');
                doc.text('Amdox Technologies Pvt Ltd', 14, 15);
                doc.setFontSize(11);
                doc.setFont('helvetica', 'normal');
                doc.text('AI Command Center — Analysis Report', 14, 25);

                doc.setFontSize(9);
                doc.text('Generated: ' + dateStr + ' at ' + timeStr, 196, 25, { align: 'right' });

                // Content title
                doc.setTextColor(40, 40, 40);
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('AI Analysis Summary', 14, 48);

                // Summary text info
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text('Processed 12,847 data points in 4.2 seconds across all enterprise modules.', 14, 55);

                // Revenue Forecast
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(34, 197, 94); // success color (green)
                doc.text('1. Revenue Forecast (High Confidence - 94%)', 14, 68);

                doc.setTextColor(80, 80, 80);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text('Q3 2026 revenue is projected at Rs. 2.4 Crore, reflecting a positive trajectory (+18% YoY growth).', 14, 75);

                // Anomalies Found
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(245, 158, 11); // warning color (amber/yellow)
                doc.text('2. Anomalies Detected (AI Confidence - 87%)', 14, 88);

                doc.setTextColor(80, 80, 80);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                const anomalyText = finalState.anomalyResolved
                  ? '0 active anomalies (1 anomaly resolved: Marketing department budget successfully aligned).'
                  : '1 active anomaly: Marketing department expenses deviate by 23% from baseline pattern.';
                doc.text(anomalyText, 14, 95);

                // Recommendations
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(99, 102, 241); // accent-light (purple/indigo)
                doc.text('3. AI Recommended Actions', 14, 112);

                doc.setTextColor(80, 80, 80);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text('Action items status:', 14, 119);

                // Recommendation bullets
                const reorderStatus = finalState.skuOrdered ? 'Completed' : 'Pending Action';
                const optimizeStatus = finalState.resourceOptimized ? 'Applied' : 'Pending Action';
                const reviewStatus = finalState.contractReviewed ? 'Reviewed' : 'Pending Action';

                doc.text(`• Inventory: Auto-reorder SKU-0089 (Dell Monitor) [Status: ${reorderStatus}]`, 18, 126);
                doc.text(`• Resource Allocation: Shift 2 engineers from Project A to B [Status: ${optimizeStatus}]`, 18, 132);
                doc.text(`• Procurement: Acme Corp contract renewal checklist [Status: ${reviewStatus}]`, 18, 138);

                // Footer
                doc.setDrawColor(220, 220, 220);
                doc.line(14, 275, 196, 275);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text('Amdox AI Command Center — Confidential Report | Page 1 of 1', 105, 282, { align: 'center' });

                // Save PDF
                doc.save('Amdox_AI_Analysis_Report_' + dateStr.replace(/ /g, '_') + '.pdf');
                showToast('AI Analysis report downloaded successfully!', 'success');
                closeModal();
              } catch (err) {
                console.error('PDF export error:', err);
                showToast('Failed to export PDF: ' + err.message, 'error');
              }
            });
          }, 600);
        }
      }, (i + 1) * 800);
    });
  });

  // ── Chat with AI button ──
  document.getElementById('btn-chat-with-ai').addEventListener('click', () => {
    const panel = document.getElementById('ai-chat-panel');
    if (panel) {
      panel.classList.add('open');
      const input = document.getElementById('ai-input');
      if (input) input.focus();
    }
  });
};