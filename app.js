/* ═══════════════════════════════════════════════════════
   FINANCE TRACKER — app.js
   Auth → Dashboard flow. 100% English UI.
═══════════════════════════════════════════════════════ */

'use strict';

// ─────────────────────────────────────────
// DEMO DATA
// ─────────────────────────────────────────
const DEMO_TRANSACTIONS = [
  { id:1,  date:'2025-05-23', desc:'Monthly Salary',        cat:'Salary',        type:'Income',  amount:29000, notes:'May salary credited' },
  { id:2,  date:'2025-05-22', desc:'Bakery & Café',         cat:'Food',          type:'Expense', amount:1300,  notes:'Morning breakfast' },
  { id:3,  date:'2025-05-21', desc:'Zomato Food Order',     cat:'Food',          type:'Expense', amount:890,   notes:'Dinner delivery' },
  { id:4,  date:'2025-05-20', desc:'Clothes Shopping',      cat:'Shopping',      type:'Expense', amount:3000,  notes:'Summer wardrobe' },
  { id:5,  date:'2025-05-19', desc:'Freelance Web Project', cat:'Freelance',     type:'Income',  amount:8500,  notes:'Client payment received' },
  { id:6,  date:'2025-05-18', desc:'Monthly Bus Pass',      cat:'Transport',     type:'Expense', amount:500,   notes:'' },
  { id:7,  date:'2025-05-17', desc:'Netflix Subscription',  cat:'Entertainment', type:'Expense', amount:649,   notes:'' },
  { id:8,  date:'2025-05-16', desc:'Electricity Bill',      cat:'Bills',         type:'Expense', amount:1800,  notes:'May electricity' },
  { id:9,  date:'2025-05-15', desc:'Weekly Grocery',        cat:'Food',          type:'Expense', amount:2200,  notes:'Big Bazaar' },
  { id:10, date:'2025-05-14', desc:'Ola Cab Ride',          cat:'Transport',     type:'Expense', amount:320,   notes:'' },
  { id:11, date:'2025-05-13', desc:'Mutual Fund Return',    cat:'Investment',    type:'Income',  amount:3200,  notes:'Monthly SIP gain' },
  { id:12, date:'2025-05-12', desc:'Doctor Consultation',   cat:'Health',        type:'Expense', amount:700,   notes:'General checkup' },
  { id:13, date:'2025-05-10', desc:'Cinema Ticket',         cat:'Entertainment', type:'Expense', amount:450,   notes:'Weekend movie' },
  { id:14, date:'2025-05-08', desc:'Water Bill',            cat:'Bills',         type:'Expense', amount:350,   notes:'' },
  { id:15, date:'2025-05-05', desc:'Udemy Online Course',   cat:'Other',         type:'Expense', amount:999,   notes:'React course' },
];

const BUDGETS_DATA = [
  { cat:'Food',          budget:5000, icon:'🍔', color:'#2dd4a0' },
  { cat:'Transport',     budget:2000, icon:'🚌', color:'#4f8ef7' },
  { cat:'Shopping',      budget:4000, icon:'🛍️', color:'#f5a623' },
  { cat:'Bills',         budget:3000, icon:'💡', color:'#f7614f' },
  { cat:'Entertainment', budget:1500, icon:'🎬', color:'#a78bfa' },
  { cat:'Health',        budget:2000, icon:'💊', color:'#f472b6' },
];

const GOALS_DATA = [
  { emoji:'🏠', name:'House Down Payment', target:500000, saved:125000, deadline:'Dec 2026' },
  { emoji:'✈️', name:'Europe Trip',         target:80000,  saved:42000,  deadline:'Jun 2026' },
  { emoji:'💻', name:'New Laptop',          target:60000,  saved:55000,  deadline:'Mar 2025' },
  { emoji:'💰', name:'Emergency Fund',      target:100000, saved:70000,  deadline:'Ongoing'  },
];

const CAT_COLORS = {
  Food:'#2dd4a0', Transport:'#4f8ef7', Shopping:'#f5a623',
  Bills:'#f7614f', Entertainment:'#a78bfa', Salary:'#60d4f7',
  Freelance:'#fbbf24', Investment:'#34d399', Health:'#f472b6', Other:'#94a3b8'
};

// ─────────────────────────────────────────
// STORAGE KEYS
// ─────────────────────────────────────────
const KEYS = {
  users:   'ft_users_v2',
  session: 'ft_session_v2',
  txnPfx:  'ft_txns_v2_',    // + user email
};

// ─────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────
const $     = id => document.getElementById(id);
const fmt   = n  => '₹' + Number(n).toLocaleString('en-IN');
const today = () => new Date().toISOString().slice(0, 10);

function toast(msg, type = 'ok') {
  const el = $('toast');
  el.textContent = msg;
  el.className = 'toast' + (type === 'err' ? ' toast-err' : '');
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2800);
}

function setErr(id, msg)  { const e = $(id); if (e) e.textContent = msg; }
function clearErr(...ids) { ids.forEach(id => { const e = $(id); if (e) e.textContent = ''; }); }

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────
const Auth = {

  switchTab(tab) {
    ['login','register'].forEach(t => {
      $(`tab-${t}`).classList.toggle('active', t === tab);
      $(`form-${t}`).classList.toggle('active', t === tab);
    });
    clearErr('l-email-err','l-pass-err','r-name-err','r-email-err','r-pass-err','r-confirm-err','r-agree-err');
  },

  togglePass(inputId, btn) {
    const inp = $(inputId);
    if (!inp) return;
    inp.type   = inp.type === 'password' ? 'text' : 'password';
    btn.textContent = inp.type === 'password' ? '👁️' : '🙈';
  },

  forgotPassword() {
    toast('Password reset is not available in this demo. Please register a new account or use the demo login.', 'ok');
  },

  getUsers()       { const r = localStorage.getItem(KEYS.users);   return r ? JSON.parse(r) : []; },
  saveUsers(arr)   { localStorage.setItem(KEYS.users,   JSON.stringify(arr)); },
  getSession()     { const r = localStorage.getItem(KEYS.session); return r ? JSON.parse(r) : null; },
  saveSession(usr) { localStorage.setItem(KEYS.session, JSON.stringify(usr)); },
  clearSession()   { localStorage.removeItem(KEYS.session); },

  // ── Login ──
  login() {
    const email = ($('l-email').value || '').trim().toLowerCase();
    const pass  = ($('l-password').value || '');
    const rem   = $('l-remember').checked;

    clearErr('l-email-err','l-pass-err');
    let ok = true;
    if (!email)              { setErr('l-email-err', '⚠️ Please enter your email address'); ok = false; }
    else if (!email.includes('@')) { setErr('l-email-err', '⚠️ Please enter a valid email address'); ok = false; }
    if (!pass)               { setErr('l-pass-err', '⚠️ Please enter your password'); ok = false; }
    if (!ok) return;

    const user = Auth.getUsers().find(u => u.email === email && u.password === pass);
    if (!user) { setErr('l-pass-err', '❌ Incorrect email or password'); return; }

    Auth.saveSession({ name: user.name, email: user.email, remember: rem });
    Auth.goToDashboard(user);
  },

  // ── Register ──
  register() {
    const name    = ($('r-name').value     || '').trim();
    const email   = ($('r-email').value    || '').trim().toLowerCase();
    const pass    = ($('r-password').value || '');
    const confirm = ($('r-confirm').value  || '');
    const agree   = $('r-agree').checked;

    clearErr('r-name-err','r-email-err','r-pass-err','r-confirm-err','r-agree-err');
    let ok = true;
    if (!name)                    { setErr('r-name-err',    '⚠️ Please enter your full name');            ok = false; }
    if (!email)                   { setErr('r-email-err',   '⚠️ Please enter your email address');        ok = false; }
    else if (!email.includes('@')){ setErr('r-email-err',   '⚠️ Please enter a valid email address');     ok = false; }
    if (!pass)                    { setErr('r-pass-err',    '⚠️ Please enter a password');                ok = false; }
    else if (pass.length < 6)     { setErr('r-pass-err',    '⚠️ Password must be at least 6 characters'); ok = false; }
    if (pass !== confirm)         { setErr('r-confirm-err', '⚠️ Passwords do not match');                 ok = false; }
    if (!agree)                   { setErr('r-agree-err',   '⚠️ You must agree to the terms & conditions'); ok = false; }
    if (!ok) return;

    const users = Auth.getUsers();
    if (users.find(u => u.email === email)) {
      setErr('r-email-err', '❌ This email is already registered. Please sign in.');
      return;
    }

    const newUser = { name, email, password: pass, createdAt: today() };
    users.push(newUser);
    Auth.saveUsers(users);

    // Load demo data for new user
    const key = KEYS.txnPfx + email;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(JSON.parse(JSON.stringify(DEMO_TRANSACTIONS))));
    }

    Auth.saveSession({ name, email });
    toast('Account created successfully! Welcome 🎉');
    setTimeout(() => Auth.goToDashboard(newUser), 350);
  },

  // ── Demo Login ──
  loginDemo() {
    const demo = { name: 'Demo User', email: 'demo@financetrack.app' };
    // Always reload fresh demo data
    localStorage.setItem(
      KEYS.txnPfx + demo.email,
      JSON.stringify(JSON.parse(JSON.stringify(DEMO_TRANSACTIONS)))
    );
    Auth.saveSession(demo);
    Auth.goToDashboard(demo);
    toast('Logged in with demo account 🚀');
  },

  // ── Enter Dashboard ──
  goToDashboard(user) {
    // Set initials
    const initials = user.name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

    // Update sidebar & topbar user info
    $('user-name-sidebar').textContent  = user.name;
    $('user-email-sidebar').textContent = user.email;
    $('user-avatar-sidebar').textContent = initials;
    $('topbar-avatar').textContent       = initials;
    $('topbar-sub').textContent = `Welcome back, ${user.name.split(' ')[0]}! Here's your financial overview.`;

    // Pre-fill settings fields
    $('s-name').value  = user.name;
    $('s-email').value = user.email;

    // Set current user in State
    State.currentEmail = user.email;

    // Make sure this user has transaction data
    const key = KEYS.txnPfx + user.email;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(JSON.parse(JSON.stringify(DEMO_TRANSACTIONS))));
    }

    // Hide auth, show dashboard
    $('auth-screen').style.display = 'none';
    const dash = $('dashboard-screen');
    dash.classList.add('active');

    // Set date field and render dashboard
    if ($('f-date')) $('f-date').value = today();
    App.renderDashboard();
  },

  // ── Logout ──
  logout() {
    Auth.clearSession();
    State.currentEmail = null;

    // Reset all pages to default
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    $('page-dashboard').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector('.nav-item[data-page="dashboard"]').classList.add('active');
    $('topbar-title').textContent = 'Dashboard';

    // Hide dashboard, show auth
    $('dashboard-screen').classList.remove('active');
    $('auth-screen').style.display = 'flex';

    // Clear login fields
    $('l-email').value    = '';
    $('l-password').value = '';
    clearErr('l-email-err','l-pass-err');
    Auth.switchTab('login');
    toast('You have been logged out. See you soon!');
  },

  // ── Auto-login if session exists ──
  checkSession() {
    const s = Auth.getSession();
    if (s) { Auth.goToDashboard(s); return true; }
    return false;
  }
};

// ─────────────────────────────────────────
// STATE
// ─────────────────────────────────────────
const State = {
  txnPage:      1,
  TXN_PER_PAGE: 8,
  selectedType: 'Income',
  deleteId:     null,
  calYear:      2025,
  calMonth:     4,        // 0-indexed, 4 = May
  currentEmail: null,

  key()   { return KEYS.txnPfx + (this.currentEmail || '__guest__'); },
  get()   { const r = localStorage.getItem(this.key()); return r ? JSON.parse(r) : []; },
  save(a) { localStorage.setItem(this.key(), JSON.stringify(a)); },
};

// ─────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────
const PAGE_META = {
  dashboard:    { title:'Dashboard',           sub:"Here's your financial overview." },
  transactions: { title:'Transaction History', sub:'All your income and expense records.' },
  budgets:      { title:'Budgets',             sub:'Track your monthly spending limits.' },
  goals:        { title:'Financial Goals',     sub:'Your savings targets and progress.' },
  add:          { title:'Add Transaction',     sub:'Record a new income or expense.' },
  calendar:     { title:'Calendar View',       sub:'Browse your transactions by date.' },
  settings:     { title:'Settings',            sub:'Manage your profile and data.' },
};

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const pg = $('page-' + pageId);
  if (pg) pg.classList.add('active');

  const nav = document.querySelector(`.nav-item[data-page="${pageId}"]`);
  if (nav) nav.classList.add('active');

  const m = PAGE_META[pageId] || {};
  $('topbar-title').textContent = m.title || '';
  if (pageId === 'dashboard') {
    const s = Auth.getSession();
    $('topbar-sub').textContent = s
      ? `Welcome back, ${s.name.split(' ')[0]}! Here's your financial overview.`
      : m.sub || '';
  } else {
    $('topbar-sub').textContent = m.sub || '';
  }

  const renders = {
    dashboard:    App.renderDashboard,
    transactions: () => { State.txnPage = 1; App.renderTxnTable(); App.populateCatFilter(); },
    budgets:      App.renderBudgets,
    goals:        App.renderGoals,
    add:          App.renderQuickStats,
    calendar:     App.renderCalendar,
  };
  if (renders[pageId]) renders[pageId]();
  $('sidebar').classList.remove('open');
}

// ─────────────────────────────────────────
// APP
// ─────────────────────────────────────────
const App = {

  // ── Dashboard ──────────────────────────
  renderDashboard() {
    const txns   = State.get();
    const income = txns.filter(t => t.type === 'Income').reduce((s,t) => s + t.amount, 0);
    const expense= txns.filter(t => t.type === 'Expense').reduce((s,t) => s + t.amount, 0);
    const balance= income - expense;
    const budget = 21000;
    const bPct   = Math.min(999, Math.round((expense / budget) * 100));

    $('stat-grid').innerHTML = `
      <div class="stat-card s-income">
        <div class="stat-icon">📈</div>
        <div class="stat-label">Total Income</div>
        <div class="stat-value">${fmt(income)}</div>
        <div class="stat-change change-pos">+₹2,000 vs last month</div>
      </div>
      <div class="stat-card s-expense">
        <div class="stat-icon">📉</div>
        <div class="stat-label">Total Expense</div>
        <div class="stat-value">${fmt(expense)}</div>
        <div class="stat-change change-neg">−₹1,200 vs last month</div>
      </div>
      <div class="stat-card s-balance">
        <div class="stat-icon">💎</div>
        <div class="stat-label">Balance</div>
        <div class="stat-value">${fmt(balance)}</div>
        <div class="stat-change">Net savings this month</div>
      </div>
      <div class="stat-card s-budget">
        <div class="stat-icon">📊</div>
        <div class="stat-label">Budget Used</div>
        <div class="stat-value">${bPct}%</div>
        <div class="stat-change">of ${fmt(budget)} limit</div>
      </div>`;

    App.renderBarChart(txns);
    App.renderDonut(txns);
    App.renderRecentTxns(txns);
    App.renderMonthlySummary(txns);
  },

  renderBarChart(txns) {
    const hI = [18000,21000,19000,23000];
    const hE = [12000,14000,15000,13000];
    const tI = txns.filter(t=>t.type==='Income').reduce((s,t)=>s+t.amount,0);
    const tE = txns.filter(t=>t.type==='Expense').reduce((s,t)=>s+t.amount,0);
    const inc = [...hI,tI], exp = [...hE,tE];
    const months = ['Jan','Feb','Mar','Apr','May'];
    const maxV   = Math.max(...inc,...exp) || 1;
    const H = 110;
    $('bar-chart').innerHTML = months.map((m,i) => `
      <div class="bar-group">
        <div class="bar-pair">
          <div class="bar inc" style="height:${Math.round((inc[i]/maxV)*H)}px" title="Income: ${fmt(inc[i])}"></div>
          <div class="bar exp" style="height:${Math.round((exp[i]/maxV)*H)}px" title="Expense: ${fmt(exp[i])}"></div>
        </div>
        <div class="bar-lbl">${m}</div>
      </div>`).join('');
  },

  renderDonut(txns) {
    const cats = {};
    txns.filter(t=>t.type==='Expense').forEach(t=>{ cats[t.cat]=(cats[t.cat]||0)+t.amount; });
    const total = Object.values(cats).reduce((s,v)=>s+v,0);

    const tv = $('donut-total-val');
    if (tv) tv.textContent = fmt(total);
    if (!total) { $('donut-legend').innerHTML='<div style="color:var(--text3);font-size:.8rem">No expense data yet.</div>'; return; }

    const cx=75,cy=75,r=52,sw=20,C=2*Math.PI*r;
    let off=0;
    let circles=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surface3)" stroke-width="${sw}"/>`;
    let leg='';

    Object.entries(cats).sort((a,b)=>b[1]-a[1]).forEach(([cat,val])=>{
      const pct=val/total, dash=pct*C, gap=C-dash;
      const rot=off*360-90, color=CAT_COLORS[cat]||'#94a3b8';
      circles+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"
        stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${-off*C}"
        transform="rotate(${rot} ${cx} ${cy})" style="transition:.6s"/>`;
      leg+=`<div class="donut-leg-item">
        <div class="donut-leg-left"><div class="donut-leg-dot" style="background:${color}"></div>${cat}</div>
        <div class="donut-leg-val">${fmt(val)}</div>
      </div>`;
      off+=pct;
    });

    $('donut-svg').innerHTML=`${circles}
      <text x="75" y="71" text-anchor="middle" class="donut-label-top">Total</text>
      <text x="75" y="88" text-anchor="middle" class="donut-label-val">${fmt(total)}</text>`;
    $('donut-legend').innerHTML=leg;
  },

  renderRecentTxns(txns) {
    const rows=[...txns].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5)
      .map(t=>`<tr>
        <td style="color:var(--text3)">${t.date}</td>
        <td style="color:var(--text)">${t.desc}</td>
        <td><span class="cat-chip">${t.cat}</span></td>
        <td><span class="badge ${t.type.toLowerCase()}">${t.type}</span></td>
        <td class="${t.type==='Income'?'amount-pos':'amount-neg'}">${t.type==='Income'?'+':'−'}${fmt(t.amount)}</td>
      </tr>`).join('');
    $('recent-tbody').innerHTML = rows || '<tr><td colspan="5" style="text-align:center;color:var(--text3);padding:20px">No transactions yet. Add one!</td></tr>';
  },

  renderMonthlySummary(txns) {
    const income  = txns.filter(t=>t.type==='Income').reduce((s,t)=>s+t.amount,0);
    const expense = txns.filter(t=>t.type==='Expense').reduce((s,t)=>s+t.amount,0);
    const expT    = txns.filter(t=>t.type==='Expense');
    const maxT    = expT.reduce((m,t)=>t.amount>(m.amount||0)?t:m,{});
    const minT    = expT.reduce((m,t)=>(!m.amount||t.amount<m.amount)?t:m,{});
    const sPct    = income ? Math.max(0,Math.round(((income-expense)/income)*100)) : 0;
    $('monthly-summary').innerHTML=`
      <div class="summary-item"><span class="s-label">Total Income</span><span class="s-val income-color">${fmt(income)}</span></div>
      <div class="summary-item"><span class="s-label">Total Expense</span><span class="s-val expense-color">${fmt(expense)}</span></div>
      <div class="summary-item"><span class="s-label">Net Savings</span><span class="s-val">${fmt(Math.max(0,income-expense))}</span></div>
      <div class="summary-item"><span class="s-label">Transactions</span><span class="s-val">${txns.length}</span></div>
      <div class="summary-item"><span class="s-label">Highest Expense</span><span class="s-val expense-color">${maxT.amount?fmt(maxT.amount):'—'}</span></div>
      <div class="summary-item"><span class="s-label">Lowest Expense</span><span class="s-val income-color">${minT.amount?fmt(minT.amount):'—'}</span></div>
      <div class="savings-bar">
        <div class="savings-bar-label"><span>Savings Rate</span><span style="color:var(--accent)">${sPct}%</span></div>
        <div class="prog-track"><div class="prog-fill" style="width:${sPct}%;background:var(--accent)"></div></div>
      </div>`;
  },

  // ── Transactions ───────────────────────
  renderTxnTable() {
    const search= ($('txn-search')?.value||'').toLowerCase();
    const typeF = $('txn-filter-type')?.value||'';
    const catF  = $('txn-filter-cat')?.value||'';

    let txns = State.get().sort((a,b)=>new Date(b.date)-new Date(a.date));
    if (search) txns=txns.filter(t=>t.desc.toLowerCase().includes(search)||t.cat.toLowerCase().includes(search)||(t.notes||'').toLowerCase().includes(search));
    if (typeF)  txns=txns.filter(t=>t.type===typeF);
    if (catF)   txns=txns.filter(t=>t.cat===catF);

    const total=txns.length, pages=Math.ceil(total/State.TXN_PER_PAGE)||1;
    if (State.txnPage>pages) State.txnPage=pages;
    const slice=txns.slice((State.txnPage-1)*State.TXN_PER_PAGE, State.txnPage*State.TXN_PER_PAGE);

    $('all-txn-tbody').innerHTML=slice.map(t=>`<tr>
      <td style="color:var(--text3)">${t.date}</td>
      <td style="color:var(--text)">${t.desc}</td>
      <td><span class="cat-chip">${t.cat}</span></td>
      <td><span class="badge ${t.type.toLowerCase()}">${t.type}</span></td>
      <td class="${t.type==='Income'?'amount-pos':'amount-neg'}">${t.type==='Income'?'+':'−'}${fmt(t.amount)}</td>
      <td style="color:var(--text3);font-size:.76rem;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.notes||'—'}</td>
      <td><button class="delete-btn" onclick="App.deleteTxn(${t.id})" title="Delete">🗑️</button></td>
    </tr>`).join('') || `<tr><td colspan="7" style="text-align:center;padding:28px;color:var(--text3)">No transactions found.</td></tr>`;

    let pag=`<span style="margin-right:6px">${total} record${total!==1?'s':''}</span>`;
    for(let i=1;i<=pages;i++) pag+=`<button class="page-btn${i===State.txnPage?' active':''}" onclick="State.txnPage=${i};App.renderTxnTable()">${i}</button>`;
    $('txn-pagination').innerHTML=pag;
  },

  populateCatFilter() {
    const cats=[...new Set(State.get().map(t=>t.cat))].sort();
    const sel=$('txn-filter-cat'); if(!sel) return;
    sel.innerHTML='<option value="">All Categories</option>'+cats.map(c=>`<option value="${c}">${c}</option>`).join('');
  },

  deleteTxn(id)   { State.deleteId=id; App.openModal('modal-delete'); },
  confirmDelete() {
    State.save(State.get().filter(t=>t.id!==State.deleteId));
    App.closeModal('modal-delete');
    App.renderTxnTable();
    toast('Transaction deleted successfully.');
  },

  // ── Budgets ────────────────────────────
  renderBudgets() {
    const txns=State.get();
    let tB=0,tS=0;
    $('budget-grid').innerHTML=BUDGETS_DATA.map(b=>{
      const spent=txns.filter(t=>t.type==='Expense'&&t.cat===b.cat).reduce((s,t)=>s+t.amount,0);
      const pct=Math.min(150,Math.round((spent/b.budget)*100));
      const rem=b.budget-spent;
      tB+=b.budget; tS+=spent;
      const sc=pct>=100?'status-over':pct>=75?'status-warn':'status-ok';
      const sm=pct>=100?`⛔ Over budget by ${fmt(Math.abs(rem))}`:pct>=75?`⚠️ ${fmt(rem)} remaining`:`✅ ${fmt(rem)} remaining`;
      const fc=pct>=100?'#f7614f':pct>=75?'#f5a623':b.color;
      return `<div class="budget-card">
        <div class="budget-cat-header">
          <div class="budget-cat-icon" style="background:${fc}22">${b.icon}</div>
          <div class="budget-cat-name">${b.cat}</div>
        </div>
        <div class="budget-numbers"><span>Spent: ${fmt(spent)}</span><span>Budget: ${fmt(b.budget)}</span></div>
        <div class="budget-track"><div class="budget-fill" style="width:${Math.min(100,pct)}%;background:${fc}"></div></div>
        <div class="budget-status ${sc}">${sm} · ${pct}%</div>
      </div>`;
    }).join('');
    $('total-budget-val').textContent    = fmt(tB);
    $('total-spent-val').textContent     = fmt(tS);
    $('total-remaining-val').textContent = fmt(Math.max(0,tB-tS));
  },

  // ── Goals ──────────────────────────────
  renderGoals() {
    $('goals-grid').innerHTML=GOALS_DATA.map(g=>{
      const pct=Math.min(100,Math.round((g.saved/g.target)*100));
      return `<div class="goal-card">
        <div class="goal-emoji">${g.emoji}</div>
        <div class="goal-name">${g.name}</div>
        <div class="goal-deadline">🗓️ Deadline: ${g.deadline}</div>
        <div class="goal-amounts">
          <span class="goal-amount-saved">${fmt(g.saved)} saved</span>
          <span class="goal-amount-target">Target: ${fmt(g.target)}</span>
        </div>
        <div class="goal-track"><div class="goal-fill" style="width:${pct}%"></div></div>
        <div class="goal-footer">
          <span class="goal-pct">${pct}% complete</span>
          <span class="goal-saved">${fmt(g.target-g.saved)} to go</span>
        </div>
      </div>`;
    }).join('');
  },

  // ── Add Transaction ────────────────────
  setType(type) {
    State.selectedType=type;
    $('btn-income').className ='type-btn income-btn' +(type==='Income' ?' active':'');
    $('btn-expense').className='type-btn expense-btn'+(type==='Expense'?' active':'');
  },
  clearForm() {
    ['f-desc','f-amount','f-notes'].forEach(id=>{if($(id)) $(id).value='';});
    if ($('f-date')) $('f-date').value=today();
  },
  addTransaction() {
    const desc  =($('f-desc').value||'').trim();
    const amount=parseFloat($('f-amount').value);
    const cat   =$('f-cat').value;
    const date  =$('f-date').value||today();
    const notes =($('f-notes').value||'').trim();
    if (!desc)               { toast('Please enter a description.','err'); return; }
    if (!amount||amount<=0)  { toast('Please enter a valid amount.','err'); return; }
    const txns=State.get();
    const nid=Math.max(0,...txns.map(t=>t.id))+1;
    txns.unshift({id:nid,date,desc,cat,type:State.selectedType,amount,notes});
    State.save(txns);
    App.clearForm();
    App.renderQuickStats();
    toast(`${State.selectedType} of ${fmt(amount)} added successfully! ✅`);
  },
  renderQuickStats() {
    const txns=State.get();
    const inc=txns.filter(t=>t.type==='Income').reduce((s,t)=>s+t.amount,0);
    const exp=txns.filter(t=>t.type==='Expense').reduce((s,t)=>s+t.amount,0);
    const qs=$('quick-stats'); if(!qs) return;
    qs.innerHTML=`
      <div class="qs-item"><span class="qs-label">Total Income</span><span class="qs-val income-color">${fmt(inc)}</span></div>
      <div class="qs-item"><span class="qs-label">Total Expense</span><span class="qs-val expense-color">${fmt(exp)}</span></div>
      <div class="qs-item"><span class="qs-label">Current Balance</span><span class="qs-val">${fmt(inc-exp)}</span></div>
      <div class="qs-item"><span class="qs-label">Total Transactions</span><span class="qs-val">${txns.length}</span></div>
      <div class="qs-item"><span class="qs-label">Last Entry</span><span class="qs-val" style="font-size:.8rem">${txns.length?txns[0].desc:'—'}</span></div>`;
  },

  // ── Calendar ───────────────────────────
  renderCalendar() {
    const MN=['January','February','March','April','May','June','July','August','September','October','November','December'];
    const DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const {calYear:y,calMonth:m}=State;
    $('cal-month-label').textContent=`${MN[m]} ${y}`;
    $('cal-days-header').innerHTML=DN.map(d=>`<div class="cal-day-name">${d}</div>`).join('');
    const txnMap={};
    State.get().forEach(t=>{txnMap[t.date]=(txnMap[t.date]||0)+1;});
    const fd=new Date(y,m,1).getDay(), dim=new Date(y,m+1,0).getDate();
    let html='';
    for(let i=0;i<fd;i++) html+='<div class="cal-cell empty"></div>';
    for(let d=1;d<=dim;d++){
      const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      html+=`<div class="cal-cell${txnMap[ds]?' has-txn':''}" onclick="App.showCalDay('${ds}')">${d}${txnMap[ds]?'<div class="cal-dot"></div>':''}</div>`;
    }
    $('cal-grid').innerHTML=html;
    $('cal-selected-date').textContent='—';
    $('cal-day-detail').innerHTML='<div class="cal-empty-msg">👆 Click a date to view transactions</div>';
  },
  showCalDay(ds) {
    const txns=State.get().filter(t=>t.date===ds);
    $('cal-selected-date').textContent=ds;
    if(!txns.length){ $('cal-day-detail').innerHTML='<div class="cal-empty-msg">No transactions recorded on this date.</div>'; return; }
    $('cal-day-detail').innerHTML=txns.map(t=>`
      <div class="cal-txn-item">
        <div><div class="cal-txn-desc">${t.desc}</div><div class="cal-txn-meta">${t.cat} · ${t.type}</div></div>
        <span class="${t.type==='Income'?'amount-pos':'amount-neg'}">${t.type==='Income'?'+':'−'}${fmt(t.amount)}</span>
      </div>`).join('');
  },
  calMove(dir) {
    State.calMonth+=dir;
    if(State.calMonth<0){State.calMonth=11;State.calYear--;}
    if(State.calMonth>11){State.calMonth=0;State.calYear++;}
    App.renderCalendar();
  },

  // ── Settings ───────────────────────────
  saveProfile() {
    const name =($('s-name').value||'').trim();
    const email=($('s-email').value||'').trim();
    if(!name){ toast('Name cannot be empty.','err'); return; }
    const init=name.trim().split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
    $('user-name-sidebar').textContent  =name;
    $('user-email-sidebar').textContent =email;
    $('user-avatar-sidebar').textContent=init;
    $('topbar-avatar').textContent      =init;
    const s=Auth.getSession();
    if(s){ s.name=name; s.email=email; Auth.saveSession(s); }
    toast('Profile saved successfully! ✅');
  },

  exportCSV() {
    const txns=State.get();
    if(!txns.length){ toast('No transactions to export.','err'); return; }
    const header='Date,Description,Category,Type,Amount,Notes\n';
    const rows=txns.map(t=>`${t.date},"${t.desc}","${t.cat}","${t.type}",${t.amount},"${(t.notes||'').replace(/"/g,'""')}"`).join('\n');
    const blob=new Blob([header+rows],{type:'text/csv'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='finance-tracker-export.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('CSV file downloaded successfully! 📥');
  },

  clearAllData() {
    State.save([]);
    App.closeModal('modal-clear');
    App.renderDashboard();
    toast('All data has been cleared. You can start fresh!');
  },

  resetToDemo() {
    State.save(JSON.parse(JSON.stringify(DEMO_TRANSACTIONS)));
    App.closeModal('modal-reset');
    App.renderDashboard();
    toast('Demo data loaded successfully! 🔄');
  },

  openModal(id)  { const e=$(id); if(e) e.classList.add('open'); },
  closeModal(id) { const e=$(id); if(e) e.classList.remove('open'); },
};

// ─────────────────────────────────────────
// EVENT LISTENERS
// ─────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => showPage(item.dataset.page));
});

document.addEventListener('click', e => {
  const btn = e.target.closest('.view-all-btn');
  if (btn && btn.dataset.page) showPage(btn.dataset.page);
});

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

$('menu-btn')?.addEventListener('click', () => {
  $('sidebar').classList.toggle('open');
});

// ─────────────────────────────────────────
// INIT — Auth screen first, always
// ─────────────────────────────────────────
(function init() {
  // Always show auth screen first — no auto-login
  // (Comment out Auth.checkSession() if you want "remember me" to auto-login)
  // Auth.checkSession();
  $('auth-screen').style.display = 'flex';
  $('dashboard-screen').classList.remove('active');
})();
