/**
 * Interactive Modals, Bottom Sheet Forms, and Event Handlers
 */

import { store, CATEGORIES, CURRENCIES } from "./store.js";

/**
 * Toast notification pill
 */
export function showToast(message, duration = 2800) {
  let toast = document.querySelector(".toast-notice");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast-notice";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-success)">
      <polyline points="20 6 9 17 4 12" />
    </svg>
    <span>${message}</span>
  `;

  toast.classList.add("show");
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

/**
 * Opens a bottom sheet modal inside the mobile app shell
 */
export function openBottomSheet(containerElement, title, contentHtml) {
  const target = containerElement || document.querySelector(".mobile-app-shell") || document.body;
  let overlay = target.querySelector(".bottom-sheet-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "bottom-sheet-overlay";
    target.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="bottom-sheet">
      <div class="sheet-handle"></div>
      <div class="sheet-header">
        <div class="sheet-title">${title}</div>
        <button class="sheet-close-btn" aria-label="Close modal">✕</button>
      </div>
      <div class="sheet-body">
        ${contentHtml}
      </div>
    </div>
  `;

  // Animate open
  requestAnimationFrame(() => {
    overlay.classList.add("open");
  });

  const closeBtn = overlay.querySelector(".sheet-close-btn");
  const handleClose = () => {
    overlay.classList.remove("open");
  };

  closeBtn.addEventListener("click", handleClose);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) handleClose();
  });

  return overlay;
}

/**
 * Opens the Add or Edit Transaction Bottom Sheet Modal
 */
export function openTransactionModal(txId = null) {
  const appShell = document.querySelector(".mobile-app-shell") || document.body;
  const isEdit = Boolean(txId);
  const existingTx = isEdit ? store.getTransactionById(txId) : null;
  const curr = store.getCurrency();

  const todayStr = new Date().toISOString().split("T")[0];
  const initialType = existingTx ? existingTx.type : "expense";
  const initialAmount = existingTx ? existingTx.amount.toFixed(2) : "";
  const initialTitle = existingTx ? existingTx.title : "";
  const initialCategory = existingTx ? existingTx.category : "Food & Drinks";
  const initialDate = existingTx ? existingTx.date : todayStr;
  const initialNotes = existingTx ? existingTx.notes || "" : "";

  const modalHtml = `
    <!-- Type Switcher -->
    <div class="form-type-toggle" id="tx-form-type-toggle">
      <button type="button" class="type-toggle-btn ${initialType === "expense" ? "active" : ""}" data-type="expense">
        Expense
      </button>
      <button type="button" class="type-toggle-btn ${initialType === "income" ? "active" : ""}" data-type="income">
        Income
      </button>
    </div>

    <!-- Amount Hero Input -->
    <div class="form-amount-hero">
      <span class="form-currency-symbol">${curr.symbol}</span>
      <input type="number" step="0.01" min="0.01" class="form-amount-input" id="tx-amount-input" placeholder="0.00" value="${initialAmount}" autofocus />
    </div>

    <!-- Title / Merchant -->
    <div class="input-group">
      <label class="input-label">Title / Merchant</label>
      <input type="text" class="input-field" id="tx-title-input" placeholder="e.g. Starbucks, Uber, Salary..." value="${initialTitle}" />
    </div>

    <!-- Category Selector -->
    <div class="input-group">
      <label class="input-label">Category</label>
      <select class="input-field" id="tx-category-select">
        ${Object.keys(CATEGORIES)
          .map(
            (cat) => `
          <option value="${cat}" ${cat === initialCategory ? "selected" : ""}>
            ${CATEGORIES[cat].icon} ${cat}
          </option>
        `
          )
          .join("")}
      </select>
    </div>

    <!-- Date Picker -->
    <div class="input-group">
      <label class="input-label">Date</label>
      <input type="date" class="input-field" id="tx-date-input" value="${initialDate}" />
    </div>

    <!-- Notes -->
    <div class="input-group">
      <label class="input-label">Notes (optional)</label>
      <input type="text" class="input-field" id="tx-notes-input" placeholder="Add a memo..." value="${initialNotes}" />
    </div>

    <!-- Action Buttons -->
    <button class="btn-primary" id="btn-save-transaction" style="margin-top: 14px;">
      ${isEdit ? "Save Changes" : "Add Transaction"}
    </button>

    ${
      isEdit
        ? `<button type="button" class="btn-delete-tx" id="btn-delete-transaction">Delete Transaction</button>`
        : ""
    }
  `;

  const overlay = openBottomSheet(appShell, isEdit ? "Edit Transaction" : "New Transaction", modalHtml);

  // Type Toggle Button Handler
  const typeBtns = overlay.querySelectorAll(".type-toggle-btn");
  let currentType = initialType;
  typeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      typeBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentType = btn.dataset.type;

      // Filter category select based on type
      const catSelect = overlay.querySelector("#tx-category-select");
      if (catSelect) {
        catSelect.innerHTML = Object.keys(CATEGORIES)
          .filter((k) => CATEGORIES[k].type === currentType)
          .map((cat) => `<option value="${cat}">${CATEGORIES[cat].icon} ${cat}</option>`)
          .join("");
      }
    });
  });

  // Save Transaction
  const saveBtn = overlay.querySelector("#btn-save-transaction");
  saveBtn?.addEventListener("click", () => {
    const amountVal = parseFloat(overlay.querySelector("#tx-amount-input").value);
    const titleVal = overlay.querySelector("#tx-title-input").value.trim();
    const categoryVal = overlay.querySelector("#tx-category-select").value;
    const dateVal = overlay.querySelector("#tx-date-input").value || todayStr;
    const notesVal = overlay.querySelector("#tx-notes-input").value.trim();

    if (!amountVal || amountVal <= 0) {
      showToast("Please enter a valid amount");
      overlay.querySelector("#tx-amount-input").focus();
      return;
    }

    if (!titleVal) {
      showToast("Please enter a title or merchant");
      overlay.querySelector("#tx-title-input").focus();
      return;
    }

    const curr = store.getCurrency();
    if (isEdit) {
      store.updateTransaction(txId, {
        type: currentType,
        amount: amountVal,
        title: titleVal,
        category: categoryVal,
        date: dateVal,
        notes: notesVal,
      });
      showToast("Transaction updated!");
    } else {
      store.addTransaction({
        type: currentType,
        amount: amountVal,
        title: titleVal,
        category: categoryVal,
        date: dateVal,
        notes: notesVal,
      });
      showToast(`Added ${currentType === "income" ? "+" : "-"}${curr.symbol}${amountVal.toFixed(2)} to ${titleVal}`);
    }

    overlay.classList.remove("open");
  });

  // Delete Transaction
  if (isEdit) {
    const deleteBtn = overlay.querySelector("#btn-delete-transaction");
    deleteBtn?.addEventListener("click", () => {
      store.deleteTransaction(txId);
      showToast("Transaction deleted");
      overlay.classList.remove("open");
    });
  }
}

/**
 * Opens the Deposit With ID Bottom Sheet Modal
 */
export function openDepositWithIdModal(prefilledVaultId = null) {
  const appShell = document.querySelector(".mobile-app-shell") || document.body;
  const currentVaultId = prefilledVaultId || store.data.account.vaultId;
  const curr = store.getCurrency();

  const content = `
    <div style="padding: 4px 0 10px;">
      <!-- Vault ID Display & Copy -->
      <div class="input-group">
        <label class="input-label">Deposit Target Vault ID</label>
        <div style="display: flex; gap: 8px;">
          <input type="text" class="input-field" id="deposit-vault-id" value="${currentVaultId}" style="font-family: var(--font-display); font-weight: 700; letter-spacing: 0.05em;" />
          <button type="button" class="action-pill-btn" id="btn-copy-vault-id" style="flex-shrink: 0; padding: 0 14px;">Copy</button>
        </div>
      </div>

      <!-- Amount Input -->
      <div class="form-amount-hero" style="margin: 14px 0 18px;">
        <span class="form-currency-symbol">${curr.symbol}</span>
        <input type="number" step="10" min="1" class="form-amount-input" id="deposit-amount-input" placeholder="0.00" value="500.00" autofocus />
      </div>

      <!-- Deposit Method Selector -->
      <div class="input-group">
        <label class="input-label">Funding Method</label>
        <div class="method-chip-grid" id="deposit-method-grid">
          <button type="button" class="method-chip-btn active" data-method="Direct Wire">🏦 Direct Wire</button>
          <button type="button" class="method-chip-btn" data-method="Bank ACH">🏛️ Bank ACH</button>
          <button type="button" class="method-chip-btn" data-method="Debit Card">💳 Debit Card</button>
          <button type="button" class="method-chip-btn" data-method="Instant Crypto">⚡ Crypto / USD</button>
        </div>
      </div>

      <!-- Notes -->
      <div class="input-group">
        <label class="input-label">Memo / Reference</label>
        <input type="text" class="input-field" id="deposit-memo-input" placeholder="Initial funding deposit" value="Initial Vault Activation" />
      </div>

      <button class="btn-primary" id="btn-submit-deposit" style="margin-top: 14px;">
        Complete Deposit & Activate
      </button>
    </div>
  `;

  const overlay = openBottomSheet(appShell, "Deposit Funds with ID", content);

  // Copy Vault ID
  overlay.querySelector("#btn-copy-vault-id")?.addEventListener("click", () => {
    const idVal = overlay.querySelector("#deposit-vault-id").value;
    navigator.clipboard?.writeText(idVal);
    showToast(`Copied Vault ID: ${idVal}`);
  });

  // Method Selection
  let selectedMethod = "Direct Wire";
  overlay.querySelectorAll(".method-chip-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      overlay.querySelectorAll(".method-chip-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedMethod = btn.dataset.method;
    });
  });

  // Submit Deposit
  overlay.querySelector("#btn-submit-deposit")?.addEventListener("click", () => {
    const amountVal = parseFloat(overlay.querySelector("#deposit-amount-input").value);
    const idVal = overlay.querySelector("#deposit-vault-id").value.trim() || currentVaultId;
    const memoVal = overlay.querySelector("#deposit-memo-input").value.trim();

    if (!amountVal || amountVal <= 0) {
      showToast("Please enter a valid deposit amount");
      return;
    }

    store.depositWithId({
      vaultId: idVal,
      amount: amountVal,
      method: selectedMethod,
      notes: memoVal,
    });

    overlay.classList.remove("open");
    showToast(`✔ Deposited ${curr.symbol}${amountVal.toFixed(2)} to ${idVal}! Vault activated.`);
  });
}

/**
 * Opens User Account & Vault ID Management Drawer
 */
export function openAccountDrawer() {
  const appShell = document.querySelector(".mobile-app-shell") || document.body;
  const user = store.data.user;
  const metrics = store.getMetrics();

  const content = `
    <div style="padding: 10px 0 16px; text-align: center;">
      <div style="width: 64px; height: 64px; border-radius: 50%; overflow: hidden; margin: 0 auto 12px; border: 3px solid #FFF; box-shadow: var(--shadow-md);">
        <img src="${user.avatar}" alt="${user.name}" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <div style="font-family: var(--font-display); font-size: 20px; font-weight: 700;">${user.name}</div>
      <div style="font-size: 13px; color: var(--color-slate); margin-bottom: 16px;">Personal Vault Account</div>

      <div style="background: #F5F5F2; border-radius: 20px; padding: 14px; margin-bottom: 18px; text-align: left;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--color-slate); text-transform: uppercase;">Your Vault ID</span>
          <button type="button" id="btn-drawer-copy-id" style="font-size: 12px; font-weight: 700; color: var(--color-primary);">Copy ID</button>
        </div>
        <div style="font-family: var(--font-display); font-size: 18px; font-weight: 800; letter-spacing: 0.05em; color: var(--color-dark);">
          ${metrics.vaultId}
        </div>
      </div>

      <button class="btn-primary" id="btn-drawer-deposit" style="margin-bottom: 10px;">
        Deposit Funds with ID
      </button>

      <button type="button" class="btn-delete-tx" id="btn-drawer-reset" style="background: #F0F0ED; color: var(--color-dark);">
        🔄 Reset Account to $0.00 (First-Time Test)
      </button>
    </div>
  `;

  const overlay = openBottomSheet(appShell, "My Vault & Identity", content);

  overlay.querySelector("#btn-drawer-copy-id")?.addEventListener("click", () => {
    navigator.clipboard?.writeText(metrics.vaultId);
    showToast(`Copied Vault ID: ${metrics.vaultId}`);
  });

  overlay.querySelector("#btn-drawer-deposit")?.addEventListener("click", () => {
    overlay.classList.remove("open");
    setTimeout(() => openDepositWithIdModal(metrics.vaultId), 200);
  });

  overlay.querySelector("#btn-drawer-reset")?.addEventListener("click", () => {
    overlay.classList.remove("open");
    setTimeout(() => openResetConfirmModal(), 200);
  });
}

/**
 * Opens Reset Account to $0.00 Modal with Username PIN / confirmation protection
 */
export function openResetConfirmModal(onResetDone) {
  const appShell = document.querySelector(".mobile-app-shell") || document.body;
  const user = store.data.user;
  const expectedUsername = (user.name || "Vault User").trim();

  const content = `
    <div style="padding: 4px 0 12px;">
      <!-- Warning Header Icon & Title -->
      <div style="text-align: center; margin-bottom: 16px;">
        <div style="width: 54px; height: 54px; border-radius: 50%; background: #FDECEA; color: #E74C3C; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 10px;">
          ⚠️
        </div>
        <div style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--color-dark);">
          Reset Vault to $0.00
        </div>
        <div style="font-size: 13px; color: var(--color-slate); margin-top: 6px; line-height: 1.4;">
          This will wipe all transactions, spending history, and return balance to $0.00 (first-time state).
        </div>
      </div>

      <!-- Security Verification Input -->
      <div style="background: #FFFFFF; border: 1.5px solid var(--color-border); border-radius: 16px; padding: 14px; margin-bottom: 16px;">
        <div style="font-size: 12px; font-weight: 700; color: var(--color-slate); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px;">
          Security Verification
        </div>
        <div style="font-size: 14px; color: var(--color-dark); margin-bottom: 10px; line-height: 1.3;">
          Type "<strong style="color: var(--color-primary);">${expectedUsername}</strong>" to confirm:
        </div>
        <input
          type="text"
          class="input-field"
          id="reset-username-confirm-input"
          placeholder="Type ${expectedUsername} here..."
          autocomplete="off"
          autocorrect="off"
          style="background: #F8F8F5; border: 1.5px solid var(--color-border); font-weight: 600;"
        />
        <div id="reset-error-msg" style="font-size: 12px; color: #E74C3C; margin-top: 6px; display: none; font-weight: 600;">
          Username does not match. Please type "${expectedUsername}".
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; gap: 10px;">
        <button type="button" class="btn-secondary" id="btn-cancel-reset" style="flex: 1;">
          Cancel
        </button>
        <button type="button" class="btn-primary" id="btn-confirm-reset" style="flex: 1; background: #E74C3C; border-color: #E74C3C; opacity: 0.45; cursor: not-allowed;" disabled>
          Reset to $0.00
        </button>
      </div>
    </div>
  `;

  const overlay = openBottomSheet(appShell, "Confirm Vault Reset", content);
  const inputEl = overlay.querySelector("#reset-username-confirm-input");
  const confirmBtn = overlay.querySelector("#btn-confirm-reset");
  const cancelBtn = overlay.querySelector("#btn-cancel-reset");
  const errorMsg = overlay.querySelector("#reset-error-msg");

  // Real-time verification: unlock button as soon as username matches
  inputEl?.addEventListener("input", (e) => {
    const val = e.target.value.trim();
    if (val.toLowerCase() === expectedUsername.toLowerCase()) {
      confirmBtn.removeAttribute("disabled");
      confirmBtn.style.opacity = "1";
      confirmBtn.style.cursor = "pointer";
      if (errorMsg) errorMsg.style.display = "none";
    } else {
      confirmBtn.setAttribute("disabled", "true");
      confirmBtn.style.opacity = "0.45";
      confirmBtn.style.cursor = "not-allowed";
    }
  });

  // Pressing Enter triggers confirm
  inputEl?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !confirmBtn.hasAttribute("disabled")) {
      confirmBtn.click();
    }
  });

  cancelBtn?.addEventListener("click", () => {
    overlay.classList.remove("open");
  });

  confirmBtn?.addEventListener("click", () => {
    const val = inputEl.value.trim();
    if (val.toLowerCase() !== expectedUsername.toLowerCase()) {
      if (errorMsg) errorMsg.style.display = "block";
      return;
    }

    // Execute complete zero reset
    store.resetAccountToZero();
    overlay.classList.remove("open");
    showToast("✔ Vault reset to $0.00! First-time state restored.");
    if (typeof onResetDone === "function") {
      onResetDone();
    }
  });

  // Focus input automatically
  setTimeout(() => inputEl?.focus(), 250);
}

/**
 * Opens User Profile & PFP Editor Modal
 */
export function openProfileModal() {
  document.querySelector("#mobile-side-drawer")?.classList.remove("open");
  document.querySelector("#drawer-backdrop")?.classList.remove("open");
  const appShell = document.querySelector(".mobile-app-shell") || document.body;
  const user = store.data.user;

  const PRESET_AVATARS = [
    { name: "Luffy", tag: "Straw Hat", url: "assets/avatars/luffy.png" },
    { name: "Zoro", tag: "Swordsman", url: "assets/avatars/zoro.png" },
    { name: "Sanji", tag: "Chef", url: "assets/avatars/sanji.png" },
    { name: "Chopper", tag: "Doctor", url: "assets/avatars/chopper.png" },
    { name: "Law", tag: "Surgeon", url: "assets/avatars/law.png" },
    { name: "Ace", tag: "Fire Fist", url: "assets/avatars/ace.png" },
    { name: "Shanks", tag: "Emperor", url: "assets/avatars/shanks.png" },
    { name: "Nami", tag: "Navigator", url: "assets/avatars/nami.png" },
  ];

  const presetUrls = PRESET_AVATARS.map((p) => p.url);
  let selectedAvatar = user.avatar || "assets/avatars/luffy.png";

  const content = `
    <div style="padding: 4px 0 10px;">
      <!-- Hero Avatar Preview -->
      <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 18px;">
        <div style="position: relative; width: 88px; height: 88px;">
          <div style="width: 88px; height: 88px; border-radius: 50%; overflow: hidden; border: 3px solid var(--color-primary); box-shadow: var(--shadow-md); background: #FFFFFF;">
            <img id="profile-preview-img" src="${selectedAvatar}" alt="Profile Preview" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <label for="profile-file-input" style="position: absolute; bottom: -2px; right: -2px; width: 30px; height: 30px; border-radius: 50%; background: var(--color-dark); color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; box-shadow: var(--shadow-sm);" title="Upload photo from device">
            📷
          </label>
        </div>
        <div style="font-size: 12px; color: var(--color-slate); margin-top: 8px; font-weight: 500;">
          Select a One Piece doodle or tap 📷 to upload
        </div>
        <input type="file" id="profile-file-input" accept="image/*" style="display: none;" />
      </div>

      <!-- Display Name Input -->
      <div class="input-group">
        <label class="input-label">Your Display Name</label>
        <input type="text" class="input-field" id="profile-name-input" value="${user.name}" placeholder="e.g. Alex Thorne, Harsh..." />
      </div>

      <!-- One Piece Chibi Avatars 4x2 Grid -->
      <div class="input-group">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <label class="input-label" style="margin-bottom: 0;">One Piece Chibi Doodles</label>
          <span style="font-size: 11px; font-weight: 600; color: var(--color-primary); background: #FFF0EB; padding: 2px 7px; border-radius: 12px;">Official Line Art</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;" id="preset-avatars-grid">
          ${PRESET_AVATARS.map(
            (p) => `
            <div class="preset-avatar-chip ${p.url === selectedAvatar ? "active" : ""}" data-url="${p.url}" data-name="${p.name}" style="background: #FFFFFF; border: 2px solid ${p.url === selectedAvatar ? "var(--color-primary)" : "var(--color-border)"}; border-radius: 14px; padding: 6px 4px; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: all 0.15s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="width: 48px; height: 48px; border-radius: 50%; overflow: hidden; background: #FFFFFF;">
                <img src="${p.url}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
              <span style="font-size: 11px; font-weight: 700; color: var(--color-dark); margin-top: 4px; line-height: 1.1;">${p.name}</span>
              <span style="font-size: 9px; font-weight: 500; color: var(--color-slate);">${p.tag}</span>
            </div>
          `
          ).join("")}
        </div>
      </div>

      <!-- Currency Preference -->
      <div class="input-group">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <label class="input-label" style="margin-bottom: 0;">Currency</label>
          <span style="font-size: 11px; font-weight: 700; color: var(--color-primary);" id="profile-currency-label">${store.getCurrency().name}</span>
        </div>
        <div style="display: flex; gap: 8px; overflow-x: auto; padding: 2px 0 6px;" id="profile-currency-row">
          ${Object.values(CURRENCIES).map((c) => {
            const isSelected = c.code === (store.data.account.currency || "BERRY");
            return `
            <button type="button" class="action-pill-btn profile-curr-btn ${isSelected ? "active" : ""}" data-code="${c.code}" style="flex-shrink: 0; padding: 7px 12px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 6px; border: 1.5px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}; background: ${isSelected ? "#FFF0EB" : "#FFFFFF"}; color: ${isSelected ? "var(--color-primary)" : "var(--color-dark)"};">
              <span>${c.icon}</span>
              <span>${c.short}</span>
            </button>
          `;
          }).join("")}
        </div>
      </div>

      <!-- Custom Image URL -->
      <div class="input-group">
        <label class="input-label">Or Custom Image URL</label>
        <input type="url" class="input-field" id="profile-url-input" placeholder="https://..." value="${presetUrls.includes(user.avatar) ? "" : user.avatar}" />
      </div>

      <!-- Save Button -->
      <button class="btn-primary" id="btn-save-profile" style="margin-top: 10px;">
        Save Profile
      </button>
    </div>
  `;

  const overlay = openBottomSheet(appShell, "Edit Profile & Picture", content);

  const previewImg = overlay.querySelector("#profile-preview-img");
  const nameInput = overlay.querySelector("#profile-name-input");
  const urlInput = overlay.querySelector("#profile-url-input");
  const fileInput = overlay.querySelector("#profile-file-input");
  let selectedCurrCode = store.data.account.currency || "BERRY";

  // Currency option click in profile modal
  overlay.querySelectorAll(".profile-curr-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      overlay.querySelectorAll(".profile-curr-btn").forEach((b) => {
        b.style.borderColor = "var(--color-border)";
        b.style.background = "#FFFFFF";
        b.style.color = "var(--color-dark)";
      });
      btn.style.borderColor = "var(--color-primary)";
      btn.style.background = "#FFF0EB";
      btn.style.color = "var(--color-primary)";
      selectedCurrCode = btn.dataset.code;
      const cMeta = CURRENCIES[selectedCurrCode];
      const lbl = overlay.querySelector("#profile-currency-label");
      if (lbl && cMeta) lbl.textContent = cMeta.name;
    });
  });

  // Preset avatar click
  overlay.querySelectorAll(".preset-avatar-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      overlay.querySelectorAll(".preset-avatar-chip").forEach((c) => {
        c.style.borderColor = "var(--color-border)";
        c.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
      });
      chip.style.borderColor = "var(--color-primary)";
      chip.style.boxShadow = "0 0 0 1px var(--color-primary), 0 2px 6px rgba(240, 78, 35, 0.2)";
      selectedAvatar = chip.dataset.url;
      previewImg.src = selectedAvatar;
      if (urlInput) urlInput.value = "";
    });
  });

  // URL input
  urlInput?.addEventListener("input", (e) => {
    const val = e.target.value.trim();
    if (val) {
      selectedAvatar = val;
      previewImg.src = val;
      overlay.querySelectorAll(".preset-avatar-chip").forEach((c) => {
        c.style.borderColor = "transparent";
      });
    }
  });

  // Local File Upload
  fileInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        selectedAvatar = event.target.result;
        previewImg.src = selectedAvatar;
        overlay.querySelectorAll(".preset-avatar-chip").forEach((c) => {
          c.style.borderColor = "transparent";
        });
      };
      reader.readAsDataURL(file);
    }
  });

  // Save profile
  overlay.querySelector("#btn-save-profile")?.addEventListener("click", () => {
    const newName = nameInput.value.trim() || user.name;
    store.updateUserProfile({
      name: newName,
      avatar: selectedAvatar,
    });
    if (selectedCurrCode !== store.data.account.currency) {
      store.setCurrency(selectedCurrCode);
    }
    overlay.classList.remove("open");
    showToast(`✔ Profile updated: ${newName}`);
  });
}

/**
 * Opens Send Money / Payment Modal
 */
export function openSendModal() {
  document.querySelector("#mobile-side-drawer")?.classList.remove("open");
  document.querySelector("#drawer-backdrop")?.classList.remove("open");
  const appShell = document.querySelector(".mobile-app-shell") || document.body;
  const metrics = store.getMetrics();
  const curr = store.getCurrency();

  const content = `
    <div style="padding: 4px 0 10px;">
      <!-- Available Balance Pill -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: #F5F5F2; padding: 10px 14px; border-radius: 14px;">
        <span style="font-size: 12px; color: var(--color-slate); font-weight: 600;">Available Balance</span>
        <span style="font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--color-dark);">${metrics.totalBalance}</span>
      </div>

      <!-- Amount Hero Input -->
      <div class="form-amount-hero" style="margin: 8px 0 16px;">
        <span class="form-currency-symbol">${curr.symbol}</span>
        <input type="number" step="1" min="1" class="form-amount-input" id="send-amount-input" placeholder="0.00" autofocus />
      </div>

      <!-- Recipient / Merchant -->
      <div class="input-group">
        <label class="input-label">Recipient / Merchant</label>
        <input type="text" class="input-field" id="send-recipient-input" placeholder="e.g. John Doe, Landlord, Uber..." />
      </div>

      <!-- Category -->
      <div class="input-group">
        <label class="input-label">Category</label>
        <select class="input-field" id="send-category-select">
          ${Object.keys(CATEGORIES)
            .filter((k) => CATEGORIES[k].type === "expense")
            .map((cat) => `<option value="${cat}">${CATEGORIES[cat].icon} ${cat}</option>`)
            .join("")}
        </select>
      </div>

      <!-- Memo -->
      <div class="input-group">
        <label class="input-label">Note (optional)</label>
        <input type="text" class="input-field" id="send-memo-input" placeholder="e.g. Rent, coffee, dinner split..." />
      </div>

      <!-- Action Button -->
      <button class="btn-primary" id="btn-submit-send" style="margin-top: 10px;">
        Send Payment
      </button>
    </div>
  `;

  const overlay = openBottomSheet(appShell, "Send Money", content);

  const recipientInput = overlay.querySelector("#send-recipient-input");
  const amtInput = overlay.querySelector("#send-amount-input");
  const catSelect = overlay.querySelector("#send-category-select");
  const memoInput = overlay.querySelector("#send-memo-input");

  // Submit Send
  overlay.querySelector("#btn-submit-send")?.addEventListener("click", () => {
    const amt = parseFloat(amtInput.value);
    const recipient = recipientInput.value.trim();
    const category = catSelect.value;
    const memo = memoInput.value.trim();

    if (!amt || amt <= 0) {
      showToast("Please enter an amount to send");
      amtInput.focus();
      return;
    }

    if (!recipient) {
      showToast("Please enter a recipient or merchant");
      recipientInput.focus();
      return;
    }

    store.sendMoney({
      recipient,
      amount: amt,
      category,
      notes: memo,
    });

    overlay.classList.remove("open");
    showToast(`✔ Sent ${curr.symbol}${amt.toFixed(2)} to ${recipient}!`);
  });
}

/**
 * Opens Dedicated Currency Selector Modal
 */
export function openCurrencyModal() {
  document.querySelector("#mobile-side-drawer")?.classList.remove("open");
  document.querySelector("#drawer-backdrop")?.classList.remove("open");
  const appShell = document.querySelector(".mobile-app-shell") || document.body;
  const currentCurr = store.getCurrency();

  const content = `
    <div style="padding: 4px 0 10px;">
      <div style="font-size: 13px; color: var(--color-slate); margin-bottom: 14px; font-weight: 500;">
        Choose your active currency for balances, transactions, and charts:
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;" id="currency-options-list">
        ${Object.values(CURRENCIES)
          .map(
            (c) => `
          <div class="currency-option-item ${c.code === currentCurr.code ? "active" : ""}" data-code="${c.code}" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 14px; border: 2px solid ${c.code === currentCurr.code ? "var(--color-primary)" : "var(--color-border)"}; background: #FFFFFF; cursor: pointer; transition: all 0.15s ease;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="font-size: 24px; width: 40px; height: 40px; border-radius: 50%; background: #F8F8F5; display: flex; align-items: center; justify-content: center;">
                ${c.icon}
              </div>
              <div>
                <div style="font-weight: 700; font-size: 14px; color: var(--color-dark);">
                  ${c.name}
                </div>
                <div style="font-size: 12px; color: var(--color-slate); font-weight: 600;">
                  Symbol: <span style="color: var(--color-primary); font-weight: 800; font-size: 13px;">${c.symbol}</span>
                </div>
              </div>
            </div>
            <div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid ${c.code === currentCurr.code ? "var(--color-primary)" : "var(--color-border)"}; display: flex; align-items: center; justify-content: center; background: ${c.code === currentCurr.code ? "var(--color-primary)" : "transparent"}; color: #FFFFFF; font-size: 13px; font-weight: 800;">
              ${c.code === currentCurr.code ? "✓" : ""}
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;

  const overlay = openBottomSheet(appShell, "Currency Settings", content);

  overlay.querySelectorAll(".currency-option-item").forEach((item) => {
    item.addEventListener("click", () => {
      const code = item.dataset.code;
      store.setCurrency(code);
      overlay.classList.remove("open");
      const selected = CURRENCIES[code] || CURRENCIES.BERRY;
      showToast(`✔ Currency set to ${selected.name} (${selected.symbol})!`);
    });
  });
}

/**
 * Opens Device Sync & Backup Key Modal (Option 2)
 */
export function openSyncModal() {
  document.querySelector("#mobile-side-drawer")?.classList.remove("open");
  document.querySelector("#drawer-backdrop")?.classList.remove("open");
  const appShell = document.querySelector(".mobile-app-shell") || document.body;

  const currentSyncKey = store.exportSyncKey();

  const content = `
    <div style="padding: 4px 0 12px;">
      <div style="font-size: 13px; color: var(--color-slate); margin-bottom: 16px; line-height: 1.5;">
        Use your <strong>Sync Key</strong> to transfer all your transactions, balance, name, and profile picture between your phone and computer.
      </div>

      <!-- Export / Your Sync Key Box -->
      <div class="app-card" style="padding: 14px; background: #F5F5F2; margin-bottom: 16px; border: 1px solid var(--color-border);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--color-slate); text-transform: uppercase;">Your Sync Key</span>
          <button type="button" class="action-pill-btn" id="btn-copy-sync-key" style="padding: 4px 10px; font-size: 11px; background: var(--color-primary); color: #fff; border: none;">
            📋 Copy Sync Key
          </button>
        </div>
        <textarea id="sync-key-display" readonly style="width: 100%; height: 64px; font-family: monospace; font-size: 11px; background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 10px; padding: 8px; resize: none; word-break: break-all; color: var(--color-dark);">${currentSyncKey}</textarea>
      </div>

      <!-- Restore on Another Device Section -->
      <div class="app-card" style="padding: 14px; border: 1px solid var(--color-border);">
        <div style="font-size: 13px; font-weight: 700; color: var(--color-dark); margin-bottom: 4px;">Restore on this Device</div>
        <div style="font-size: 12px; color: var(--color-slate); margin-bottom: 10px;">Paste a Sync Key from your other device to load your finances here.</div>
        
        <textarea id="sync-key-input" placeholder="Paste your Sync Key here..." style="width: 100%; height: 64px; font-family: monospace; font-size: 11px; background: #F8F8F6; border: 1px solid var(--color-border); border-radius: 10px; padding: 8px; resize: none; margin-bottom: 10px;"></textarea>

        <button class="btn-primary" id="btn-apply-sync-key" style="padding: 12px;">
          📲 Restore & Sync Data
        </button>
      </div>
    </div>
  `;

  const overlay = openBottomSheet(appShell, "Device Sync & Backup", content);

  // Copy sync key
  overlay.querySelector("#btn-copy-sync-key")?.addEventListener("click", () => {
    navigator.clipboard?.writeText(currentSyncKey).catch(() => {});
    showToast("✔ Sync Key copied! Paste it on your other device.");
  });

  // Restore sync key
  overlay.querySelector("#btn-apply-sync-key")?.addEventListener("click", () => {
    const inputVal = overlay.querySelector("#sync-key-input").value.trim();
    if (!inputVal) {
      showToast("Please paste a Sync Key first");
      return;
    }

    const ok = store.importSyncKey(inputVal);
    if (ok) {
      overlay.classList.remove("open");
      showToast("✔ Finances successfully restored on this device!");
    } else {
      showToast("❌ Invalid Sync Key code. Please re-copy.");
    }
  });
}

/**
 * Initializes global interactive events
 */
export function setupInteractions(switchScreenFn) {
  const appShell = document.querySelector(".mobile-app-shell") || document.body;

  document.addEventListener("click", (e) => {
    // Quick Send Action -> Open Clean Send Payment Modal
    if (e.target.closest("#btn-action-send")) {
      openSendModal();
      return;
    }

    // Any Deposit triggers -> Navigate to Dedicated Deposit Page
    if (
      e.target.closest("#btn-action-deposit") ||
      e.target.closest("#btn-banner-deposit") ||
      e.target.closest("#btn-card-deposit") ||
      e.target.closest("#btn-empty-deposit") ||
      e.target.closest("#btn-action-receive")
    ) {
      if (typeof switchScreenFn === "function") {
        switchScreenFn("deposit");
      }
      return;
    }

    // Quick Invest Action
    if (e.target.closest("#btn-action-invest")) {
      openBottomSheet(
        appShell,
        "Investments & Yield",
        `
        <div style="padding: 6px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div>
              <div style="font-size: 12px; color: var(--color-slate);">Total Portfolio Value</div>
              <div style="font-family: var(--font-display); font-size: 26px; font-weight: 700;">$32,450.80</div>
            </div>
            <div class="trend-badge">+18.4% YTD</div>
          </div>
          <div class="category-mini-card" style="margin-bottom: 12px;">
            <div class="category-mini-top">
              <span class="category-indicator-dot green"></span>
              <span class="category-mini-amount">$24,100.00</span>
            </div>
            <div class="category-mini-bottom">
              <span>Index Vault & Yield</span>
              <span>4.8% APY</span>
            </div>
          </div>
          <button class="btn-primary" id="btn-deposit-invest" style="margin-top: 10px;">
            Add Capital
          </button>
        </div>
      `
      );
      return;
    }

    // Header avatar or drawer user profile clicked -> Open Profile Modal to edit Name & PFP
    if (
      e.target.closest(".header-avatar") ||
      e.target.closest("#btn-user-avatar") ||
      e.target.closest("#btn-drawer-profile") ||
      e.target.closest("#drawer-user-box")
    ) {
      openProfileModal();
      return;
    }

    // Drawer Device Sync clicked -> Open Sync Modal
    if (e.target.closest("#btn-drawer-sync")) {
      openSyncModal();
      return;
    }
  });
}
