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

    const totalBalance = Math.max(0, allIncome - allExpenses);

    const periodTxs = this.filterByRange(rangeKey);
    const periodIncome = periodTxs
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const periodExpenses = periodTxs
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const trendLabel = periodExpenses > 0 ? "+12.5% vs last period" : "No spend yet";

    return {
      totalBalance: `${curr.symbol}${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      totalBalanceRaw: totalBalance,
      income: `${curr.symbol}${periodIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      expenses: `${curr.symbol}${periodExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      periodExpensesRaw: periodExpenses,
      periodIncomeRaw: periodIncome,
      trendLabel,
      vaultId: this.data.account.vaultId,
      currency: curr,
      currencyCode: curr.code,
      currencySymbol: curr.symbol,
      isActivated: this.data.account.isActivated && totalBalance > 0,
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

  getWeekdayBarData() {
    const daysData = [
      { day: "M", total: 0, amountRaw: 0 },
      { day: "T", total: 0, amountRaw: 0 },
      { day: "W", total: 0, amountRaw: 0 },
      { day: "T", total: 0, amountRaw: 0 },
      { day: "F", total: 0, amountRaw: 0 },
      { day: "S", total: 0, amountRaw: 0 },
      { day: "S", total: 0, amountRaw: 0 },
    ];

    const expenses = this.filterByRange("1 week").filter((t) => t.type === "expense");
    expenses.forEach((t) => {
      const d = new Date(t.date);
      const dayIdx = d.getDay();
      const mappedIdx = dayIdx === 0 ? 6 : dayIdx - 1;
      if (daysData[mappedIdx]) {
        daysData[mappedIdx].amountRaw += t.amount;
      }
    });

    const maxAmt = Math.max(...daysData.map((d) => d.amountRaw), 1);

    daysData.forEach((d) => {
      if (d.amountRaw > 0) {
        d.total = Math.min(100, Math.max(20, Math.round((d.amountRaw / maxAmt) * 90)));
        d.amount = `-$${d.amountRaw.toFixed(2)}`;
        d.isHatched = true;
      } else {
        d.total = 15;
        d.amount = "$0.00";
        d.isHatched = true;
      }
    });

    // Friday bar
    const friday = daysData[4];
    if (friday.amountRaw > 0) {
      friday.isStacked = true;
      friday.segments = [
        { type: "orange", height: 48, label: "Shopping" },
        { type: "green", height: 22, label: "Transfers" },
        { type: "blue", height: 28, label: "Services" },
        { type: "hatch", height: 16, label: "Other" },
      ];
    }

    return {
      selectedDayIndex: 4,
      selectedAmount: friday.amount,
      days: daysData,
    };
  }
}

export const store = new FinanceStore();
