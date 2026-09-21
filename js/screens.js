/**
 * Dynamic Mobile Screen Renderers Connected to Store State
 */

import { store, CATEGORIES } from "./store.js";
import { renderSpendingSpline, renderHatchedBarChart } from "./charts.js";

// Active dashboard time filter
let activeDashboardRange = "1 week";

// Activity filter states
let activitySearchQuery = "";
let activityTypeFilter = "all"; // 'all', 'expense', 'income'

/**
 * Update positioning of trend badge over spending chart
 */
export function positionTrendPin(spendingCard, coord, totalWidth) {
  const pinWrapper = spendingCard.querySelector(".trend-badge-wrapper");
  if (!pinWrapper || !coord) return;
  const percentX = ((coord.x / totalWidth) * 100).toFixed(2);
  pinWrapper.style.position = "absolute";
  pinWrapper.style.left = `${percentX}%`;
  pinWrapper.style.top = "20px";
  pinWrapper.style.transform = "translateX(-50%)";
}

/**
 * Screen 1: Home / Dashboard Screen
 */
export function renderHomeScreen(containerEl, switchTabFn, onAddTxFn, onEditTxFn, onOpenDepositFn, onOpenMenuFn) {
  const metrics = store.getMetrics(activeDashboardRange);
  const splineData = store.getSplineData(activeDashboardRange);
  const recentTxs = store.getTransactions().slice(0, 4);
  const user = store.data.user;

  containerEl.innerHTML = `
    <div class="screen-dashboard">
      <!-- In-App Header -->
      <div class="screen-header">
        <button class="header-btn" id="btn-menu" aria-label="Open Sidebar Menu" title="Menu">
          <svg width="22" height="16" viewBox="0 0 22 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
            <line x1="0" y1="2" x2="22" y2="2" />
            <line x1="0" y1="8" x2="16" y2="8" />
            <line x1="0" y1="14" x2="22" y2="14" />
          </svg>
        </button>

        <div style="display: flex; align-items: center; gap: 8px;">
          <!-- Scan Receipt Button -->
          <button class="header-btn" id="btn-header-scan-receipt" title="Scan Receipt with Camera" style="background: #FFFFFF; box-shadow: var(--shadow-sm);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>

          <!-- Quick Add Transaction Header Icon -->
          <button class="header-btn" id="btn-header-add-tx" title="Add Transaction" style="background: #FFFFFF; box-shadow: var(--shadow-sm);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          
          <div class="header-avatar" id="btn-user-avatar" title="${user.name} (Tap to edit profile)">
            <img src="${user.avatar}" alt="${user.name}" />
          </div>
        </div>
      </div>

      <!-- Balance Section -->
      <div class="dashboard-balance-section">
        <div class="dashboard-balance-label">Total balance</div>
        <div class="dashboard-balance-amount ${metrics.isNegativeBalance ? "is-negative" : ""}" id="dash-total-balance">${metrics.totalBalance}</div>
      </div>

      <!-- Time Interval Switcher -->
      <div class="time-tabs" id="spending-time-tabs">
        ${["1 week", "1 month", "3 months", "6 months"]
          .map(
            (tabKey) => `
          <button class="time-tab-btn ${tabKey === activeDashboardRange ? "active" : ""}" data-range="${tabKey}">
            ${tabKey === "1 week" ? "This week" : tabKey === "1 month" ? "This month" : tabKey}
          </button>
        `
          )
          .join("")}
      </div>

      <!-- Spending Card with Hatched Spline Chart -->
      <div class="spending-card" id="spending-card-box">
        <div class="spending-header">
          <div class="spending-stat">
            <span class="label">Spending</span>
            <span class="amount" id="spending-amount-val">${splineData.spendingAmount}</span>
          </div>

          <!-- Floating Trend Pin & Badge -->
          <div class="trend-badge-wrapper" id="spending-trend-wrapper">
            <div class="trend-badge" id="spending-trend-badge">${splineData.trendLabel}</div>
          </div>
        </div>

        <!-- SVG Hatched Spline Chart -->
        <div class="chart-container">
          <svg class="chart-svg" id="spending-spline-svg"></svg>
        </div>

        <!-- Days Axis Labels -->
        <div class="chart-days-axis" id="spending-days-axis">
          ${splineData.labels.map((lbl) => `<span>${lbl}</span>`).join("")}
        </div>
      </div>

      <!-- Quick Action Grid (2x2 Cards with signature colors) -->
      <div class="action-grid" style="margin-bottom: 20px;">
        <button class="action-card-btn" id="btn-action-send">
          <div class="action-icon" style="color: var(--color-primary);">
            <svg viewBox="0 0 24 24">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </div>
          <span class="action-label">Send</span>
        </button>

        <!-- Deposit Action Button (Vibrant Coral/Blue) -->
        <button class="action-card-btn accent-blue" id="btn-action-deposit">
          <div class="action-icon">
            <svg viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="16" />
              <polyline points="7 11 12 16 17 11" />
              <line x1="5" y1="20" x2="19" y2="20" />
            </svg>
          </div>
          <span class="action-label">Receive</span>
        </button>

        <!-- Invest Action Card -->
        <button class="action-card-btn" id="btn-action-invest">
          <div class="action-icon" style="color: var(--color-success);">
            <svg viewBox="0 0 24 24">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <span class="action-label">Invest</span>
        </button>

        <!-- Subscriptions Action Card -->
        <button class="action-card-btn" id="btn-action-subscriptions" style="background: #FFFFFF;">
          <div class="action-icon" style="color: #6366F1;">
            <svg viewBox="0 0 24 24">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
          </div>
          <span class="action-label">Subscriptions</span>
        </button>
      </div>


      <!-- Recent Transactions Preview -->
      <div class="transactions-feed">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <div class="section-title" style="margin-bottom: 0;">Recent Activity</div>
          <button id="btn-see-all-txs" style="font-size: 13px; font-weight: 700; color: var(--color-primary);">See All</button>
        </div>

        <div class="feed-items-card">
          ${
            recentTxs.length === 0
              ? `
              <div style="padding: 24px 16px; text-align: center; color: var(--color-slate);">
                <div style="font-size: 28px; margin-bottom: 8px;">💳</div>
                <div style="font-weight: 700; font-size: 14px; color: var(--color-dark); margin-bottom: 4px;">No Transactions Yet</div>
                <div style="font-size: 12px; margin-bottom: 14px;">Deposit funds or add an expense to see it here.</div>
                <button class="action-pill-btn" id="btn-empty-deposit" style="margin: 0 auto;">Deposit with ID</button>
              </div>
            `
              : recentTxs
                  .map((tx) => {
                    const meta = CATEGORIES[tx.category] || CATEGORIES["Other Expense"];
                    const isIncome = tx.type === "income";
                    const isRecurring = Boolean(tx.isRecurring);
                    const hasReceipt = Boolean(tx.receiptPhoto);
                    return `
                    <div class="transaction-row" data-id="${tx.id}">
                      <div class="transaction-merchant">
                        <div class="merchant-logo-box" style="font-size: 20px;">
                          ${meta.icon}
                        </div>
                        <div class="merchant-info">
                          <span class="merchant-name">
                            ${tx.title}
                            ${hasReceipt ? `<span title="Receipt Scanned" style="font-size: 11px; margin-left: 4px;">🧾</span>` : ""}
                            ${isRecurring ? `<span class="badge-recurring">🔁 ${tx.billingCycle || "Monthly"}</span>` : ""}
                          </span>
                          <span class="merchant-category">${tx.category} • ${tx.date}</span>
                        </div>
                      </div>
                      <div class="transaction-values">
                        <span class="transaction-main-amt" style="color: ${isIncome ? "var(--color-success)" : "var(--color-dark)"};">
                          ${isIncome ? "+" : "-"}${metrics.currencySymbol}${tx.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  `;
                  })
                  .join("")
          }
        </div>
      </div>
    </div>
  `;

  // Render Spline
  const svgEl = containerEl.querySelector("#spending-spline-svg");
  const chartRes = renderSpendingSpline(svgEl, splineData.points, splineData.highlightIndex);
  if (chartRes) {
    const cardEl = containerEl.querySelector("#spending-card-box");
    positionTrendPin(cardEl, chartRes.highlightCoord, chartRes.totalWidth);
  }

  // Bind Tabs
  const tabsContainer = containerEl.querySelector("#spending-time-tabs");
  tabsContainer?.querySelectorAll(".time-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeDashboardRange = btn.dataset.range;
      renderHomeScreen(containerEl, switchTabFn, onAddTxFn, onEditTxFn, onOpenDepositFn);
    });
  });

  // Action bindings
  containerEl.querySelector("#btn-menu")?.addEventListener("click", () => {
    if (typeof onOpenMenuFn === "function") onOpenMenuFn();
  });

  containerEl.querySelector("#btn-header-add-tx")?.addEventListener("click", () => {
    if (typeof onAddTxFn === "function") onAddTxFn();
  });

  containerEl.querySelector("#btn-action-deposit")?.addEventListener("click", () => {
    if (typeof onOpenDepositFn === "function") onOpenDepositFn();
  });

  containerEl.querySelector("#btn-banner-deposit")?.addEventListener("click", () => {
    if (typeof onOpenDepositFn === "function") onOpenDepositFn();
  });

  containerEl.querySelector("#btn-card-deposit")?.addEventListener("click", () => {
    if (typeof onOpenDepositFn === "function") onOpenDepositFn();
  });

  containerEl.querySelector("#btn-empty-deposit")?.addEventListener("click", () => {
    if (typeof onOpenDepositFn === "function") onOpenDepositFn();
  });

  containerEl.querySelector("#btn-action-invest")?.addEventListener("click", () => {
    if (typeof switchTabFn === "function") {
      switchTabFn("analytics");
    }
  });

  containerEl.querySelector("#btn-action-subscriptions")?.addEventListener("click", () => {
    if (typeof switchTabFn === "function") {
      switchTabFn("analytics");
      setTimeout(() => {
        const subCard = document.querySelector(".subscriptions-summary-card");
        if (subCard) {
          subCard.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  });

  containerEl.querySelector("#btn-action-analytics")?.addEventListener("click", () => {
    if (typeof switchTabFn === "function") switchTabFn("analytics");
  });

  containerEl.querySelector("#btn-see-all-txs")?.addEventListener("click", () => {
    if (typeof switchTabFn === "function") switchTabFn("activity");
  });

  // Tap on any recent transaction row to edit
  containerEl.querySelectorAll(".transaction-row").forEach((row) => {
    row.addEventListener("click", () => {
      const txId = row.dataset.id;
      if (txId && typeof onEditTxFn === "function") onEditTxFn(txId);
    });
  });
}

/**
 * Dedicated Page: Deposit Funds with Vault ID
 */
export function renderDepositPage(containerEl, onDepositCompleteFn, onBackFn) {
  const metrics = store.getMetrics();
  let depositAmount = 500.00;
  let selectedMethod = "Direct Wire Transfer";

  containerEl.innerHTML = `
    <div class="screen-deposit-page">
      <!-- Screen Header with Back Button -->
      <div class="screen-header" style="margin-bottom: 12px;">
        <button class="header-btn" id="btn-deposit-back" aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div class="header-title">Deposit Funds</div>
        <div style="width: 38px;"></div>
      </div>

      <!-- Hero Deposit Amount Card -->
      <div class="deposit-hero-card">
        <div style="font-size: 13px; font-weight: 600; color: var(--color-slate);">Enter Deposit Amount</div>
        
        <div class="deposit-amount-wrapper">
          <span class="form-currency-symbol">${metrics.currencySymbol}</span>
          <input type="number" step="10" min="1" class="deposit-amount-input" id="page-deposit-amount" value="${depositAmount.toFixed(2)}" />
        </div>

        <!-- Quick Preset Pills -->
        <div class="preset-pills-row" id="deposit-preset-pills">
          <button type="button" class="preset-pill-btn" data-amt="50">+${metrics.currencySymbol}50</button>
          <button type="button" class="preset-pill-btn" data-amt="100">+${metrics.currencySymbol}100</button>
          <button type="button" class="preset-pill-btn" data-amt="250">+${metrics.currencySymbol}250</button>
          <button type="button" class="preset-pill-btn active" data-amt="500">+${metrics.currencySymbol}500</button>
          <button type="button" class="preset-pill-btn" data-amt="1000">+${metrics.currencySymbol}1,000</button>
        </div>
      </div>

      <!-- Funding Methods List -->
      <div>
        <div class="section-title" style="font-size: 15px; margin-bottom: 10px;">Select Funding Method</div>
        <div class="deposit-methods-list" id="deposit-methods-list">
          <div class="deposit-method-item selected" data-method="Direct Wire Transfer">
            <div class="method-item-left">
              <div class="method-icon-box">🏦</div>
              <div class="method-title-box">
                <span class="method-name">Direct Wire Transfer</span>
                <span class="method-desc">Same-day settlement • Zero fees</span>
              </div>
            </div>
            <div class="method-radio-dot"></div>
          </div>

          <div class="deposit-method-item" data-method="Debit / Credit Card">
            <div class="method-item-left">
              <div class="method-icon-box">💳</div>
              <div class="method-title-box">
                <span class="method-name">Debit / Credit Card</span>
                <span class="method-desc">Instant funding • Visa, Mastercard</span>
              </div>
            </div>
            <div class="method-radio-dot"></div>
          </div>

          <div class="deposit-method-item" data-method="Bank ACH Transfer">
            <div class="method-item-left">
              <div class="method-icon-box">🏛️</div>
              <div class="method-title-box">
                <span class="method-name">Bank ACH Link</span>
                <span class="method-desc">Connect checking account</span>
              </div>
            </div>
            <div class="method-radio-dot"></div>
          </div>

          <div class="deposit-method-item" data-method="Instant Crypto USD">
            <div class="method-item-left">
              <div class="method-icon-box">⚡</div>
              <div class="method-title-box">
                <span class="method-name">Crypto & Stablecoin</span>
                <span class="method-desc">USDC, USDT instant settlement</span>
              </div>
            </div>
            <div class="method-radio-dot"></div>
          </div>
        </div>
      </div>

      <!-- Memo Note -->
      <div class="input-group">
        <label class="input-label">Reference / Note (optional)</label>
        <input type="text" class="input-field" id="page-deposit-memo" placeholder="Deposit reference..." value="Initial Account Funding" />
      </div>

      <!-- Submit Button -->
      <button class="btn-primary" id="btn-page-submit-deposit" style="margin-top: 6px; padding: 18px;">
        Complete Deposit
      </button>
    </div>
  `;

  const amountInput = containerEl.querySelector("#page-deposit-amount");

  // Presets click
  containerEl.querySelectorAll(".preset-pill-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      containerEl.querySelectorAll(".preset-pill-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      depositAmount = parseFloat(btn.dataset.amt);
      if (amountInput) amountInput.value = depositAmount.toFixed(2);
    });
  });

  // Method selection click
  containerEl.querySelectorAll(".deposit-method-item").forEach((item) => {
    item.addEventListener("click", () => {
      containerEl.querySelectorAll(".deposit-method-item").forEach((i) => i.classList.remove("selected"));
      item.classList.add("selected");
      selectedMethod = item.dataset.method;
    });
  });

  // Back button click
  containerEl.querySelector("#btn-deposit-back")?.addEventListener("click", () => {
    if (typeof onBackFn === "function") onBackFn();
  });

  // Submit deposit
  containerEl.querySelector("#btn-page-submit-deposit")?.addEventListener("click", () => {
    const amt = parseFloat(amountInput.value);
    const memo = containerEl.querySelector("#page-deposit-memo")?.value || "";

    if (!amt || amt <= 0) {
      amountInput.focus();
      return;
    }

    store.deposit({
      amount: amt,
      method: selectedMethod,
      notes: memo,
    });

    if (typeof onDepositCompleteFn === "function") {
      onDepositCompleteFn(amt);
    }
  });
}

/**
 * Off-Canvas Sidebar Drawer Renderer
 */
export function renderSidebarDrawer(
  drawerEl,
  switchTabFn,
  closeDrawerFn,
  onOpenSyncFn,
  onOpenResetFn,
  onOpenCurrencyFn
) {
  const user = store.data.user;
  const metrics = store.getMetrics();
  const curr = store.getCurrency();

  drawerEl.innerHTML = `
    <!-- Drawer Header -->
    <div class="drawer-header">
      <div class="drawer-user-box" id="btn-drawer-profile" style="cursor: pointer;" title="Tap to Edit Profile">
        <div class="drawer-avatar">
          <img src="${user.avatar}" alt="${user.name}" />
        </div>
        <div>
          <div class="drawer-username" style="display: flex; align-items: center; gap: 6px;">
            <span>${user.name}</span>
            <span style="font-size: 13px; opacity: 0.8;">✏️</span>
          </div>
          <div class="drawer-user-tag">Personal Vault • Edit Profile</div>
        </div>
      </div>
      <button class="drawer-close-btn" id="btn-close-drawer" aria-label="Close Menu">✕</button>
    </div>

    <!-- Navigation Items -->
    <div class="drawer-nav-list">
      <div class="drawer-nav-item" data-go="home">
        <div class="drawer-nav-icon">🏠</div>
        <div class="drawer-nav-text">
          <span class="drawer-nav-title">Home Dashboard</span>
        </div>
      </div>

      <!-- Direct Deposit Link to Page -->
      <div class="drawer-nav-item" data-go="deposit">
        <div class="drawer-nav-icon">💳</div>
        <div class="drawer-nav-text">
          <span class="drawer-nav-title">Deposit Funds</span>
        </div>
      </div>

      <div class="drawer-nav-item" data-go="analytics">
        <div class="drawer-nav-icon">📊</div>
        <div class="drawer-nav-text">
          <span class="drawer-nav-title">Analytics & Charts</span>
        </div>
      </div>

      <div class="drawer-nav-item" data-go="activity">
        <div class="drawer-nav-icon">📝</div>
        <div class="drawer-nav-text">
          <span class="drawer-nav-title">All Transactions</span>
        </div>
      </div>

      <!-- Currency Switcher Option -->
      <div class="drawer-nav-item" id="btn-drawer-currency">
        <div class="drawer-nav-icon">${curr.icon}</div>
        <div class="drawer-nav-text">
          <span class="drawer-nav-title">Currency (${curr.symbol})</span>
          <span class="drawer-nav-subtitle">${curr.name}</span>
        </div>
      </div>

      <!-- Scan Receipt OCR -->
      <div class="drawer-nav-item" id="btn-drawer-scan-receipt">
        <div class="drawer-nav-icon">📷</div>
        <div class="drawer-nav-text">
          <span class="drawer-nav-title">Scan Receipt (Camera OCR)</span>
          <span class="drawer-nav-subtitle">Capture receipt & auto-fill</span>
        </div>
      </div>

      <!-- Export to CSV -->
      <div class="drawer-nav-item" id="btn-drawer-export-csv">
        <div class="drawer-nav-icon">📥</div>
        <div class="drawer-nav-text">
          <span class="drawer-nav-title">Export Ledger (CSV)</span>
          <span class="drawer-nav-subtitle">Download Excel spreadsheet</span>
        </div>
      </div>

      <!-- Device Sync & Cloud Backup -->
      <div class="drawer-nav-item" id="btn-drawer-sync">
        <div class="drawer-nav-icon">🔄</div>
        <div class="drawer-nav-text">
          <span class="drawer-nav-title">Device Sync & Backup</span>
          <span class="drawer-nav-subtitle">Sync between phone & PC</span>
        </div>
      </div>
    </div>

    <!-- Drawer Footer Actions -->
    <div class="drawer-footer">
      <button type="button" class="drawer-footer-btn" id="btn-drawer-reset-zero" style="color: #E74C3C; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        <span>Reset Vault to 0.00</span>
      </button>
    </div>
  `;

  // Close button
  drawerEl.querySelector("#btn-close-drawer")?.addEventListener("click", () => {
    if (typeof closeDrawerFn === "function") closeDrawerFn();
  });

  // Currency click
  drawerEl.querySelector("#btn-drawer-currency")?.addEventListener("click", () => {
    if (typeof closeDrawerFn === "function") closeDrawerFn();
    if (typeof onOpenCurrencyFn === "function") onOpenCurrencyFn();
  });

  // Device Sync click
  drawerEl.querySelector("#btn-drawer-sync")?.addEventListener("click", () => {
    if (typeof closeDrawerFn === "function") closeDrawerFn();
    if (typeof onOpenSyncFn === "function") onOpenSyncFn();
  });

  // Nav Items click
  drawerEl.querySelectorAll(".drawer-nav-item[data-go]").forEach((item) => {
    item.addEventListener("click", () => {
      const target = item.dataset.go;
      if (typeof closeDrawerFn === "function") closeDrawerFn();
      if (typeof switchTabFn === "function") switchTabFn(target);
    });
  });

  // Reset to zero with PIN confirmation
  drawerEl.querySelector("#btn-drawer-reset-zero")?.addEventListener("click", () => {
    if (typeof closeDrawerFn === "function") closeDrawerFn();
    if (typeof onOpenResetFn === "function") {
      onOpenResetFn();
    }
  });
}

/**
 * Screen 2: Analytics & Breakdown Screen
 */
export function renderAnalyticsScreen(containerEl, onAddTxFn, onEditTxFn, onOpenMenuFn) {
  const barData = store.getWeekdayBarData();
  const categories = store.getCategoryBreakdown(activeDashboardRange);
  const metrics = store.getMetrics(activeDashboardRange);
  const subs = store.getSubscriptionsSummary();

  containerEl.innerHTML = `
    <div class="screen-transactions">
      <!-- Screen Header -->
      <div class="screen-header">
        <button class="header-btn" id="btn-analytics-menu" aria-label="Open Sidebar Menu" title="Menu">
          <svg width="22" height="16" viewBox="0 0 22 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
            <line x1="0" y1="2" x2="22" y2="2" />
            <line x1="0" y1="8" x2="16" y2="8" />
            <line x1="0" y1="14" x2="22" y2="14" />
          </svg>
        </button>
        <div class="header-title">Analytics</div>
        <button class="header-btn" id="btn-analytics-add-tx" style="background: #FFFFFF; box-shadow: var(--shadow-sm);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <!-- View Switcher (Bars vs Diagram) -->
      <div class="analytics-view-switch">
        <button class="view-switch-btn active">Weekly Spending</button>
      </div>

      <!-- Hatched Stacked Bar Chart Stage -->
      <div class="bar-chart-stage" id="analytics-bar-stage"></div>

      <!-- Top Category Summary Cards -->
      <div class="category-cards-row">
        ${categories
          .slice(0, 2)
          .map(
            (cat) => `
          <div class="category-mini-card">
            <div class="category-mini-top">
              <span class="category-indicator-dot ${cat.indicator || "orange"}"></span>
              <span class="category-mini-amount">${cat.amount}</span>
            </div>
            <div class="category-mini-bottom">
              <span>${cat.category}</span>
              <span>${cat.percentage}</span>
            </div>
          </div>
        `
          )
          .join("")}
      </div>

      <!-- Spending by Category List with Progress Bars -->
      <div class="section-title">Spending by Category</div>
      <div class="category-breakdown-list">
        ${categories
          .map(
            (cat) => `
          <div class="category-bar-card">
            <div class="category-bar-top">
              <div class="category-bar-left">
                <span class="category-bar-icon">${cat.icon || "🏷️"}</span>
                <span class="category-bar-name">${cat.category}</span>
              </div>
              <div class="category-bar-amounts">
                <span>${cat.amount}</span>
                <span class="category-bar-percent">${cat.percentage}</span>
              </div>
            </div>
            <div class="category-progress-track">
              <div class="category-progress-fill" style="width: ${cat.percentage}; background-color: ${cat.color || "var(--color-primary)"};"></div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>

      <!-- Recurring Subscriptions & Fixed Commitments Card -->
      <div class="subscriptions-summary-card">
        <div class="subscriptions-card-header">
          <div class="subscriptions-card-title">
            <span>🔁</span>
            <span>Recurring Subscriptions (${subs.count})</span>
          </div>
          <div class="subscriptions-total-burn">
            ${subs.monthlyTotalFormatted}<span style="font-size: 11px; color: var(--color-slate); font-weight: 500;"> /mo</span>
          </div>
        </div>
        ${
          subs.count > 0
            ? `
          <div class="subscription-list-items">
            ${subs.items
              .map(
                (sub) => `
              <div class="subscription-row-item">
                <div class="sub-item-left">
                  <span>${CATEGORIES[sub.category]?.icon || "🏷️"}</span>
                  <div>
                    <div class="sub-item-name">${sub.title}</div>
                    <div class="sub-item-cycle">${sub.billingCycle.toUpperCase()} • ${sub.category}</div>
                  </div>
                </div>
                <div class="sub-item-amount">${sub.amountFormatted}</div>
              </div>
            `
              )
              .join("")}
          </div>
        `
            : `
          <div style="font-size: 12px; color: var(--color-slate); padding: 4px 0;">
            No active subscriptions yet. Turn on the <strong>Recurring</strong> switch when adding an expense!
          </div>
        `
        }
      </div>

      <!-- Income vs Expenses Summary Card -->
      <div class="app-card" style="margin-bottom: 24px;">
        <div style="font-size: 13px; font-weight: 600; color: var(--color-slate); margin-bottom: 10px;">Income vs Expenses (Monthly)</div>
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
          <span style="font-size: 14px; font-weight: 700; color: var(--color-success);">Income: ${metrics.monthlyIncome}</span>
          <span style="font-size: 14px; font-weight: 700; color: var(--color-primary);">Expenses: ${metrics.monthlyExpenses}</span>
        </div>
        ${(() => {
          const totalFlow = (metrics.monthlyIncomeRaw + metrics.monthlyExpensesRaw) || 1;
          const incPct = Math.round((metrics.monthlyIncomeRaw / totalFlow) * 100);
          const expPct = 100 - incPct;
          return `
            <div class="category-progress-track" style="height: 10px; display: flex;">
              <div style="height: 100%; width: ${incPct}%; background: var(--color-success); border-radius: 999px 0 0 999px;"></div>
              <div style="height: 100%; width: ${expPct}%; background: var(--color-primary); border-radius: 0 999px 999px 0;"></div>
            </div>
          `;
        })()}
      </div>
    </div>
  `;

  // Render Bar Chart with real dynamic calculation on selection
  const barStage = containerEl.querySelector("#analytics-bar-stage");
  const renderBarWithIndex = (selectedIdx) => {
    const data = store.getWeekdayBarData(selectedIdx);
    renderHatchedBarChart(barStage, data, (item, clickedIdx) => {
      renderBarWithIndex(clickedIdx);
    });
  };
  renderBarWithIndex(barData.selectedDayIndex);

  containerEl.querySelector("#btn-analytics-menu")?.addEventListener("click", () => {
    if (typeof onOpenMenuFn === "function") onOpenMenuFn();
  });

  containerEl.querySelector("#btn-analytics-add-tx")?.addEventListener("click", () => {
    if (typeof onAddTxFn === "function") onAddTxFn();
  });
}

/**
 * Screen 3: Activity & Full Transaction History with Search & Filter
 */
export function renderActivityScreen(containerEl, onAddTxFn, onEditTxFn, onOpenMenuFn) {
  let allTxs = store.getTransactions();
  const curr = store.getCurrency();

  // Apply Type Filter
  if (activityTypeFilter !== "all") {
    allTxs = allTxs.filter((t) => t.type === activityTypeFilter);
  }

  // Apply Search Query
  if (activitySearchQuery.trim() !== "") {
    const q = activitySearchQuery.toLowerCase();
    allTxs = allTxs.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.amount.toString().includes(q)
    );
  }

  containerEl.innerHTML = `
    <div class="screen-transactions">
      <div class="screen-header">
        <button class="header-btn" id="btn-activity-menu" aria-label="Open Sidebar Menu" title="Menu">
          <svg width="22" height="16" viewBox="0 0 22 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
            <line x1="0" y1="2" x2="22" y2="2" />
            <line x1="0" y1="8" x2="16" y2="8" />
            <line x1="0" y1="14" x2="22" y2="14" />
          </svg>
        </button>
        <div class="header-title">Transactions</div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <!-- Scan Receipt Button -->
          <button class="header-btn" id="btn-header-scan-receipt" title="Scan Receipt with Camera" style="background: #FFFFFF; box-shadow: var(--shadow-sm);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>

          <button class="header-btn" id="btn-activity-add-tx" style="background: #FFFFFF; box-shadow: var(--shadow-sm);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Real-time Search Input Bar -->
      <div class="search-input-box">
        <svg class="search-icon-pos" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input type="text" id="tx-search-input" placeholder="Search by merchant, category, amount..." value="${activitySearchQuery}" />
      </div>

      <!-- Filter Pills & Export CSV Action Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 8px;">
        <div class="filter-pills-row" id="tx-filter-pills" style="margin-bottom: 0;">
          <button class="filter-pill-btn ${activityTypeFilter === "all" ? "active" : ""}" data-filter="all">All</button>
          <button class="filter-pill-btn ${activityTypeFilter === "expense" ? "active" : ""}" data-filter="expense">Expenses</button>
          <button class="filter-pill-btn ${activityTypeFilter === "income" ? "active" : ""}" data-filter="income">Income</button>
        </div>

        <button type="button" class="btn-export-csv" id="btn-export-csv-activity" title="Download CSV Spreadsheet">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>Export CSV</span>
        </button>
      </div>

      <!-- Transaction Feed List -->
      <div class="transactions-feed">
        <div class="feed-items-card">
          ${
            allTxs.length === 0
              ? `<div style="padding: 24px; text-align: center; color: var(--color-slate);">
                  No matching transactions found.
                </div>`
              : allTxs
                  .map((tx) => {
                    const meta = CATEGORIES[tx.category] || CATEGORIES["Other Expense"];
                    const isIncome = tx.type === "income";
                    const isRecurring = Boolean(tx.isRecurring);
                    const hasReceipt = Boolean(tx.receiptPhoto);
                    return `
                    <div class="transaction-row" data-id="${tx.id}">
                      <div class="transaction-merchant">
                        <div class="merchant-logo-box" style="font-size: 20px;">
                          ${meta.icon}
                        </div>
                        <div class="merchant-info">
                          <span class="merchant-name">
                            ${tx.title}
                            ${hasReceipt ? `<span title="Receipt Scanned" style="font-size: 11px; margin-left: 4px;">🧾</span>` : ""}
                            ${isRecurring ? `<span class="badge-recurring">🔁 ${tx.billingCycle || "Monthly"}</span>` : ""}
                          </span>
                          <span class="merchant-category">${tx.category} • ${tx.date}</span>
                        </div>
                      </div>
                      <div class="transaction-values">
                        <span class="transaction-main-amt" style="color: ${isIncome ? "var(--color-success)" : "var(--color-dark)"};">
                          ${isIncome ? "+" : "-"}${curr.symbol}${tx.amount.toFixed(2)}
                        </span>
                        ${tx.notes ? `<span class="transaction-sub-amt" style="color: var(--color-slate); font-weight: 500;">${tx.notes}</span>` : ""}
                      </div>
                    </div>
                  `;
                  })
                  .join("")
          }
        </div>
      </div>
    </div>
  `;

  // Search input handler
  const searchInput = containerEl.querySelector("#tx-search-input");
  searchInput?.addEventListener("input", (e) => {
    activitySearchQuery = e.target.value;
    renderActivityScreen(containerEl, onAddTxFn, onEditTxFn, onOpenMenuFn);
    const updatedInput = containerEl.querySelector("#tx-search-input");
    if (updatedInput) {
      updatedInput.focus();
      updatedInput.setSelectionRange(updatedInput.value.length, updatedInput.value.length);
    }
  });

  // Filter pills handler
  containerEl.querySelectorAll(".filter-pill-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activityTypeFilter = btn.dataset.filter;
      renderActivityScreen(containerEl, onAddTxFn, onEditTxFn, onOpenMenuFn);
    });
  });

  // Hamburger Menu button
  containerEl.querySelector("#btn-activity-menu")?.addEventListener("click", () => {
    if (typeof onOpenMenuFn === "function") onOpenMenuFn();
  });

  // Add Transaction button
  containerEl.querySelector("#btn-activity-add-tx")?.addEventListener("click", () => {
    if (typeof onAddTxFn === "function") onAddTxFn();
  });

  // Edit Transaction tap
  containerEl.querySelectorAll(".transaction-row").forEach((row) => {
    row.addEventListener("click", () => {
      const txId = row.dataset.id;
      if (txId && typeof onEditTxFn === "function") onEditTxFn(txId);
    });
  });
}
