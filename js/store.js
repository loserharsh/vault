/**
 * Central State Store & LocalStorage Persistence for Strata Personal Finance
 * Starts with $0.00 balance and requires Vault ID deposit on first launch.
 */

const STORAGE_KEY = "strata_finance_vault_v3";

// Generate unique Vault Account ID (e.g. VLT-4829-QX)
export function generateVaultId() {
  const prefix = "VLT";
  const num = Math.floor(1000 + Math.random() * 9000);
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const suffix = chars[Math.floor(Math.random() * chars.length)] + chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${num}-${suffix}`;
}

// Category definitions with colors & icons
export const CATEGORIES = {
  // Expenses
  "Food & Drinks": { icon: "☕", color: "#F04E23", indicator: "orange", type: "expense" },
  "Shopping": { icon: "🛍️", color: "#FF9F43", indicator: "orange", type: "expense" },
  "Transportation": { icon: "🚕", color: "#9DCAFF", indicator: "blue", type: "expense" },
  "Technology": { icon: "💻", color: "#54B435", indicator: "green", type: "expense" },
  "Entertainment": { icon: "🎬", color: "#9B59B6", indicator: "purple", type: "expense" },
  "Bills & Utilities": { icon: "⚡", color: "#E67E22", indicator: "orange", type: "expense" },
  "Health": { icon: "💊", color: "#E74C3C", indicator: "red", type: "expense" },
  "Other Expense": { icon: "💳", color: "#777781", indicator: "slate", type: "expense" },
  // Income
  "Deposit": { icon: "🏦", color: "#F04E23", indicator: "orange", type: "income" },
  "Salary": { icon: "💰", color: "#2ECC71", indicator: "green", type: "income" },
  "Freelance": { icon: "⚡", color: "#27AE60", indicator: "green", type: "income" },
  "Investments": { icon: "📈", color: "#3498DB", indicator: "blue", type: "income" },
  "Transfer In": { icon: "📥", color: "#1ABC9C", indicator: "green", type: "income" },
  "Other Income": { icon: "💵", color: "#2ECC71", indicator: "green", type: "income" },
};

// Supported Currencies with One Piece Berries
export const CURRENCIES = {
  BERRY: { symbol: "฿", code: "BERRY", name: "One Piece Berries", short: "฿ Berries", icon: "🏴‍☠️" },
  USD: { symbol: "$", code: "USD", name: "US Dollar", short: "$ USD", icon: "💵" },
  INR: { symbol: "₹", code: "INR", name: "Indian Rupee", short: "₹ INR", icon: "🇮🇳" },
  EUR: { symbol: "€", code: "EUR", name: "Euro", short: "€ EUR", icon: "💶" },
  GBP: { symbol: "£", code: "GBP", name: "British Pound", short: "£ GBP", icon: "💷" },
};

// Helper: Format date as YYYY-MM-DD
export function getIsoDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split("T")[0];
}

// Initial Clean Seed: 0 balance, unactivated, One Piece Berries currency
const INITIAL_DATA = {
  account: {
    vaultId: "VLT-7492-AX",
    currency: "BERRY",
    isActivated: false,
    depositCount: 0,
    createdDate: getIsoDate(0),
  },
  user: {
    name: "Alex Thorne",
    avatar: "assets/avatars/luffy.png",
  },
  transactions: [], // Zero transactions initially!
};

class FinanceStore {
  constructor() {
    this.listeners = [];
    this.data = this.loadFromStorage();
    this.lastCopiedVaultId = this.data?.account?.vaultId || "";
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.transactions) && parsed.account) {
          if (!parsed.account.currency) {
            parsed.account.currency = "BERRY";
          }
          if (!parsed.user || !parsed.user.avatar || parsed.user.avatar.includes("unsplash")) {
            parsed.user = {
              name: parsed.user?.name || "Alex Thorne",
              avatar: "assets/avatars/luffy.png",
            };
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not load from localStorage, using fresh zero state:", e);
    }
    const fresh = JSON.parse(JSON.stringify(INITIAL_DATA));
    fresh.account.vaultId = generateVaultId();
    this.saveToStorage(fresh);
    return fresh;
  }

  getCurrency() {
    const code = this.data?.account?.currency || "BERRY";
    return CURRENCIES[code] || CURRENCIES.BERRY;
  }

  setCurrency(currencyCode) {
    if (CURRENCIES[currencyCode]) {
      this.data.account.currency = currencyCode;
      this.notify();
      return true;
    }
    return false;
  }

  saveToStorage(dataToSave) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave || this.data));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }

  subscribe(callback) {
    if (typeof callback === "function") {
      this.listeners.push(callback);
    }
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  notify() {
    this.saveToStorage();
    this.listeners.forEach((cb) => {
      try {
        cb(this.data);
      } catch (err) {
        console.error("Error in store subscriber:", err);
      }
    });
  }

  // ==========================================
  // DEPOSIT & SEND
  // ==========================================

  deposit({ amount, method = "Direct Wire", notes = "" }) {
    const depositAmt = Math.abs(parseFloat(amount) || 0);
    if (depositAmt <= 0) return null;

    this.data.account.isActivated = true;
    this.data.account.depositCount = (this.data.account.depositCount || 0) + 1;

    const newTx = {
      id: `tx-dep-${Date.now()}`,
      title: `Deposit via ${method}`,
      type: "income",
      category: "Deposit",
      amount: depositAmt,
      date: getIsoDate(0),
      notes: notes || "Account Deposit",
    };

    this.data.transactions.unshift(newTx);
    this.notify();
    return newTx;
  }

  depositWithId(params) {
    return this.deposit(params);
  }

  sendMoney({ recipient, amount, category = "Other Expense", notes = "" }) {
    const sendAmt = Math.abs(parseFloat(amount) || 0);
    if (sendAmt <= 0) return null;

    const targetRecipient = recipient?.trim() || "Recipient";
    const newTx = {
      id: `tx-send-${Date.now()}`,
      title: `Transfer to ${targetRecipient}`,
      type: "expense",
      category: category || "Other Expense",
      amount: sendAmt,
      date: getIsoDate(0),
      notes: notes ? `Transfer: ${notes}` : `Transfer to ${targetRecipient}`,
    };

    this.data.transactions.unshift(newTx);
    this.notify();
    return newTx;
  }

  sendWithVaultId({ recipientVaultId, amount, notes = "" }) {
    return this.sendMoney({ recipient: recipientVaultId, amount, notes });
  }

  // ==========================================
  // OPTION 2: DEVICE SYNC & CLOUD BACKUP KEY
  // ==========================================

  exportSyncKey() {
    try {
      const payload = {
        account: this.data.account,
        user: this.data.user,
        transactions: this.data.transactions,
        exportedAt: new Date().toISOString(),
      };
      const jsonStr = JSON.stringify(payload);
      return btoa(unescape(encodeURIComponent(jsonStr)));
    } catch (e) {
      console.error("Export sync key error:", e);
      return "";
    }
  }

  importSyncKey(syncCode) {
    try {
      if (!syncCode || typeof syncCode !== "string") return false;
      const clean = syncCode.trim();
      const decoded = decodeURIComponent(escape(atob(clean)));
      const parsed = JSON.parse(decoded);
      if (parsed && Array.isArray(parsed.transactions) && parsed.user) {
        this.data.account = parsed.account || this.data.account;
        this.data.user = parsed.user;
        this.data.transactions = parsed.transactions;
        this.saveToStorage();
        this.notify();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Import sync key error:", e);
      return false;
    }
  }

  updateUserProfile({ name, avatar }) {
    if (name !== undefined && name.trim()) {
      this.data.user.name = name.trim();
    }
    if (avatar !== undefined && avatar.trim()) {
      this.data.user.avatar = avatar.trim();
    }
    this.notify();
    return this.data.user;
  }

  resetAccountToZero() {
    this.data.account = {
      vaultId: generateVaultId(),
      isActivated: false,
      depositCount: 0,
      createdDate: getIsoDate(0),
    };
    this.data.transactions = [];
    this.notify();
  }

  loadSampleData() {
    this.data.account.isActivated = true;
    this.data.transactions = [
      {
        id: `tx-sample-1`,
        title: "Initial Wire Deposit",
        type: "income",
        category: "Deposit",
        amount: 5000.00,
        date: getIsoDate(5),
        notes: `Vault ID: ${this.data.account.vaultId}`,
      },
      {
        id: `tx-sample-2`,
        title: "Freelance Retainer",
        type: "income",
        category: "Freelance",
        amount: 2400.00,
        date: getIsoDate(3),
        notes: "Client sprint payment",
      },
      {
        id: `tx-sample-3`,
        title: "Apple Store",
        type: "expense",
        category: "Technology",
        amount: 9.99,
        date: getIsoDate(0),
        notes: "iCloud subscription",
      },
      {
        id: `tx-sample-4`,
        title: "Uber Transit",
        type: "expense",
        category: "Transportation",
        amount: 23.99,
        date: getIsoDate(1),
        notes: "Ride downtown",
      },
      {
        id: `tx-sample-5`,
        title: "Starbucks Reserve",
        type: "expense",
        category: "Food & Drinks",
        amount: 16.49,
        date: getIsoDate(2),
        notes: "Coffee & pastries",
      },
      {
        id: `tx-sample-6`,
        title: "Zara Clothing",
        type: "expense",
        category: "Shopping",
        amount: 78.89,
        date: getIsoDate(4),
        notes: "Summer collection",
      },
    ];
    this.notify();
  }

  // ==========================================
  // TRANSACTION CRUD
  // ==========================================

  getTransactions() {
    return [...this.data.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getTransactionById(id) {
    return this.data.transactions.find((tx) => tx.id === id);
  }

  addTransaction(txData) {
    const newTx = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: txData.title?.trim() || "Untitled Transaction",
      type: txData.type === "income" ? "income" : "expense",
      category: txData.category || (txData.type === "income" ? "Salary" : "Food & Drinks"),
      amount: Math.abs(parseFloat(txData.amount) || 0),
      date: txData.date || getIsoDate(0),
      notes: txData.notes?.trim() || "",
      isRecurring: Boolean(txData.isRecurring),
      billingCycle: txData.billingCycle || "monthly",
      receiptPhoto: txData.receiptPhoto || "",
    };

    this.data.transactions.unshift(newTx);

    // If account was not activated, adding any positive transaction activates it
    this.data.account.isActivated = true;

    this.notify();
    return newTx;
  }

  updateTransaction(id, updatedFields) {
    const idx = this.data.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const existing = this.data.transactions[idx];
    const updated = {
      ...existing,
      ...updatedFields,
      amount: updatedFields.amount !== undefined ? Math.abs(parseFloat(updatedFields.amount) || 0) : existing.amount,
      title: updatedFields.title !== undefined ? updatedFields.title.trim() : existing.title,
      isRecurring: updatedFields.isRecurring !== undefined ? Boolean(updatedFields.isRecurring) : existing.isRecurring,
      billingCycle: updatedFields.billingCycle || existing.billingCycle || "monthly",
      receiptPhoto: updatedFields.receiptPhoto !== undefined ? updatedFields.receiptPhoto : (existing.receiptPhoto || ""),
    };

    this.data.transactions[idx] = updated;
    this.notify();
    return updated;
  }

  deleteTransaction(id) {
    const prevLen = this.data.transactions.length;
    this.data.transactions = this.data.transactions.filter((t) => t.id !== id);
    if (this.data.transactions.length !== prevLen) {
      this.notify();
      return true;
    }
    return false;
  }

  // ==========================================
  // AGGREGATIONS & METRICS
  // ==========================================

  filterByRange(rangeKey = "1 week") {
    const now = new Date();
    let days = 7;
    if (rangeKey === "1 month" || rangeKey === "This month") days = 30;
    else if (rangeKey === "3 months") days = 90;
    else if (rangeKey === "6 months") days = 180;

    const cutoff = new Date();
    cutoff.setDate(now.getDate() - days);

    return this.data.transactions.filter((t) => new Date(t.date) >= cutoff);
  }

  getMetrics(rangeKey = "1 week") {
    const curr = this.getCurrency();
    const allIncome = this.data.transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const allExpenses = this.data.transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Total Balance can go negative if expenses exceed income
    const totalBalance = allIncome - allExpenses;

    const periodTxs = this.filterByRange(rangeKey);
    const periodIncome = periodTxs
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const periodExpenses = periodTxs
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate 30-day Monthly Income and Monthly Expenses
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const monthlyIncomeRaw = this.data.transactions
      .filter((t) => t.type === "income" && new Date(t.date) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpensesRaw = this.data.transactions
      .filter((t) => t.type === "expense" && new Date(t.date) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + t.amount, 0);

    const formatAmount = (val) => {
      const isNeg = val < 0;
      const absVal = Math.abs(val);
      const formatted = absVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return isNeg ? `-${curr.symbol}${formatted}` : `${curr.symbol}${formatted}`;
    };

    const trendLabel = periodExpenses > 0 ? "+12.5% vs last period" : "No spend yet";

    return {
      totalBalance: formatAmount(totalBalance),
      totalBalanceRaw: totalBalance,
      isNegativeBalance: totalBalance < 0,
      income: formatAmount(periodIncome),
      expenses: formatAmount(periodExpenses),
      periodExpensesRaw: periodExpenses,
      periodIncomeRaw: periodIncome,
      monthlyIncome: formatAmount(monthlyIncomeRaw),
      monthlyIncomeRaw,
      monthlyExpenses: formatAmount(monthlyExpensesRaw),
      monthlyExpensesRaw,
      trendLabel,
      vaultId: this.data.account.vaultId,
      currency: curr,
      currencyCode: curr.code,
      currencySymbol: curr.symbol,
      isActivated: this.data.account.isActivated && this.data.transactions.length > 0,
    };

  }

  getCategoryBreakdown(rangeKey = "1 week") {
    const curr = this.getCurrency();
    const periodExpenses = this.filterByRange(rangeKey).filter((t) => t.type === "expense");
    const totalExp = periodExpenses.reduce((sum, t) => sum + t.amount, 0) || 1;

    const grouped = {};
    periodExpenses.forEach((t) => {
      grouped[t.category] = (grouped[t.category] || 0) + t.amount;
    });

    const result = Object.entries(grouped)
      .map(([cat, amt]) => {
        const meta = CATEGORIES[cat] || CATEGORIES["Other Expense"];
        return {
          category: cat,
          amount: `${curr.symbol}${amt.toFixed(2)}`,
          amountRaw: amt,
          percentage: `${Math.round((amt / totalExp) * 100)}%`,
          percentRaw: (amt / totalExp) * 100,
          color: meta.color,
          indicator: meta.indicator,
          icon: meta.icon,
        };
      })
      .sort((a, b) => b.amountRaw - a.amountRaw);

    if (result.length === 0) {
      return [
        { category: "Transfers", amount: `${curr.symbol}0.00`, percentage: "0%", color: "#54B435", indicator: "green", icon: "📥" },
        { category: "Shopping", amount: `${curr.symbol}0.00`, percentage: "0%", color: "#F04E23", indicator: "orange", icon: "🛍️" },
      ];
    }

    return result;
  }

  getSplineData(rangeKey = "1 week") {
    const curr = this.getCurrency();
    const txs = this.filterByRange(rangeKey).filter((t) => t.type === "expense");
    const totalExp = txs.reduce((sum, t) => sum + t.amount, 0);

    let labels = ["M", "T", "W", "T", "F", "S", "S"];
    let points = [0, 0, 0, 0, 0, 0, 0];

    if (rangeKey === "1 month" || rangeKey === "This month") {
      labels = ["W1", "W2", "W3", "W4"];
      points = [0, 0, 0, 0];
    } else if (rangeKey === "3 months") {
      labels = ["Month 1", "Month 2", "Month 3"];
      points = [0, 0, 0];
    } else if (rangeKey === "6 months") {
      labels = ["M1", "M2", "M3", "M4", "M5", "M6"];
      points = [0, 0, 0, 0, 0, 0];
    }

    if (totalExp > 0) {
      // Map actual expenses into weekday/period buckets
      txs.forEach((t) => {
        const d = new Date(t.date);
        const dayIdx = d.getDay(); // 0 Sun .. 6 Sat
        const mappedIdx = dayIdx === 0 ? 6 : dayIdx - 1;
        if (points[mappedIdx] !== undefined) {
          points[mappedIdx] += t.amount;
        }
      });

      const maxVal = Math.max(...points, 1);
      points = points.map((p) => Math.min(90, Math.max(12, Math.round((p / maxVal) * 80) + 10)));
    } else {
      // Flat clean baseline when no expenses yet
      points = points.map(() => 4);
    }

    return {
      labels,
      points,
      highlightIndex: points.length >= 2 ? points.length - 2 : 0,
      spendingAmount: `${curr.symbol}${totalExp.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      trendLabel: totalExp > 0 ? "+12.5% vs last week" : `${curr.symbol}0.00 spent`,
    };
  }

  getWeekdayBarData(selectedDayIndex = null) {
    const curr = this.getCurrency();
    const daysData = [
      { day: "M", total: 0, amountRaw: 0, categoryBreakdown: {} },
      { day: "T", total: 0, amountRaw: 0, categoryBreakdown: {} },
      { day: "W", total: 0, amountRaw: 0, categoryBreakdown: {} },
      { day: "T", total: 0, amountRaw: 0, categoryBreakdown: {} },
      { day: "F", total: 0, amountRaw: 0, categoryBreakdown: {} },
      { day: "S", total: 0, amountRaw: 0, categoryBreakdown: {} },
      { day: "S", total: 0, amountRaw: 0, categoryBreakdown: {} },
    ];

    const expenses = this.filterByRange("1 week").filter((t) => t.type === "expense");
    expenses.forEach((t) => {
      const d = new Date(t.date);
      const dayIdx = d.getDay();
      const mappedIdx = dayIdx === 0 ? 6 : dayIdx - 1;
      if (daysData[mappedIdx]) {
        daysData[mappedIdx].amountRaw += t.amount;
        const catName = t.category || "Other Expense";
        const meta = CATEGORIES[catName] || CATEGORIES["Other Expense"];
        const colorGroup = meta.indicator || "orange";
        daysData[mappedIdx].categoryBreakdown[colorGroup] =
          (daysData[mappedIdx].categoryBreakdown[colorGroup] || 0) + t.amount;
      }
    });

    // Determine target active day (explicit index, or day with highest spend, or Friday 4)
    let targetIdx = selectedDayIndex !== null && selectedDayIndex !== undefined ? selectedDayIndex : -1;
    if (targetIdx < 0 || targetIdx > 6) {
      let maxDayIdx = 4;
      let maxDayVal = 0;
      daysData.forEach((d, idx) => {
        if (d.amountRaw > maxDayVal) {
          maxDayVal = d.amountRaw;
          maxDayIdx = idx;
        }
      });
      targetIdx = maxDayIdx;
    }

    const maxAmt = Math.max(...daysData.map((d) => d.amountRaw), 1);

    daysData.forEach((d, idx) => {
      const isSelected = idx === targetIdx;
      d.isHatched = !isSelected;
      d.amount = `-${curr.symbol}${d.amountRaw.toFixed(2)}`;

      if (isSelected) {
        d.isStacked = true;

        if (d.amountRaw > 0) {
          // Real proportional bar height (75px to 140px based on volume)
          const totalBarHeight = Math.min(140, Math.max(75, Math.round((d.amountRaw / maxAmt) * 115) + 25));
          d.total = totalBarHeight;

          const orangeAmt = d.categoryBreakdown["orange"] || 0;
          const greenAmt = d.categoryBreakdown["green"] || 0;
          const blueAmt = d.categoryBreakdown["blue"] || 0;

          // Hatch cap gets 16px at the top
          const hatchCapHeight = 16;
          const remainingHeight = Math.max(20, totalBarHeight - hatchCapHeight);

          // Calculate real pixel heights proportionally
          const blueHeight = Math.round((blueAmt / d.amountRaw) * remainingHeight);
          const greenHeight = Math.round((greenAmt / d.amountRaw) * remainingHeight);
          const orangeHeight = Math.max(0, remainingHeight - blueHeight - greenHeight);

          // Build dynamic segments with real values (ordered top to bottom)
          const segs = [{ type: "hatch-cap", height: hatchCapHeight, label: "Top Cap" }];
          if (blueHeight > 0) {
            segs.push({ type: "blue", height: blueHeight, label: "Services & Transit", amount: blueAmt });
          }
          if (greenHeight > 0) {
            segs.push({ type: "green", height: greenHeight, label: "Tech & Transfers", amount: greenAmt });
          }
          if (orangeHeight > 0) {
            segs.push({ type: "orange", height: orangeHeight, label: "Shopping & Food", amount: orangeAmt });
          }

          d.segments = segs;
        } else {
          // Zero spend on this day
          d.total = 22;
          d.segments = [{ type: "hatch-cap", height: 22, label: "No Spend" }];
        }
      } else {
        // Non-selected hatched bar
        d.total = d.amountRaw > 0
          ? Math.min(100, Math.max(20, Math.round((d.amountRaw / maxAmt) * 85)))
          : 18;
      }
    });

    const activeDay = daysData[targetIdx];

    return {
      selectedDayIndex: targetIdx,
      selectedAmount: activeDay.amount,
      days: daysData,
    };
  }

  // ==========================================
  // RECURRING SUBSCRIPTIONS TRACKER
  // ==========================================

  getSubscriptionsSummary() {
    const curr = this.getCurrency();
    const recurringTxs = this.data.transactions.filter(
      (t) => t.isRecurring && t.type === "expense"
    );

    let monthlyTotal = 0;
    const items = recurringTxs.map((t) => {
      let monthlyCost = t.amount;
      if (t.billingCycle === "weekly") monthlyCost = t.amount * 4.33;
      else if (t.billingCycle === "yearly") monthlyCost = t.amount / 12;
      monthlyTotal += monthlyCost;

      return {
        id: t.id,
        title: t.title,
        category: t.category,
        amountRaw: t.amount,
        amountFormatted: `${curr.symbol}${t.amount.toFixed(2)}`,
        monthlyCostRaw: monthlyCost,
        monthlyCostFormatted: `${curr.symbol}${monthlyCost.toFixed(2)}`,
        billingCycle: t.billingCycle || "monthly",
        date: t.date,
      };
    });

    return {
      count: items.length,
      monthlyTotalRaw: monthlyTotal,
      monthlyTotalFormatted: `${curr.symbol}${monthlyTotal.toFixed(2)}`,
      items,
    };
  }

  // ==========================================
  // EXPORT TO CSV
  // ==========================================

  exportToCsv() {
    const curr = this.getCurrency();
    const txs = this.getTransactions();
    if (!txs || txs.length === 0) {
      return { success: false, count: 0 };
    }

    const headers = [
      "Transaction ID",
      "Date",
      "Title",
      "Type",
      "Category",
      "Amount",
      "Currency",
      "Is Recurring",
      "Billing Cycle",
      "Notes",
    ];

    const escapeCsv = (str) => {
      const val = str === undefined || str === null ? "" : String(str);
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const rows = txs.map((t) => [
      escapeCsv(t.id),
      escapeCsv(t.date),
      escapeCsv(t.title),
      escapeCsv(t.type),
      escapeCsv(t.category),
      escapeCsv(t.amount.toFixed(2)),
      escapeCsv(curr.code),
      escapeCsv(t.isRecurring ? "Yes" : "No"),
      escapeCsv(t.isRecurring ? t.billingCycle || "monthly" : "N/A"),
      escapeCsv(t.notes || ""),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const todayStr = getIsoDate(0);
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vault_transactions_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, count: txs.length };
  }
}

export const store = new FinanceStore();
