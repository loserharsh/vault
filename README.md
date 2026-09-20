# Strata Finance — Personal Finance Dashboard & Vault

A personal finance mobile web application built with **pure HTML5, CSS3, and modular ES6 JavaScript** (no React, Vue, or build frameworks).

---

## 📱 App Navigation (3 Core Tabs)

The application is organized into 3 tabs in the native bottom bar:
1. **Home**: Total balance (starts at $0.00), Vault ID badge, time filters (This week / This month / 3 months / 6 months), hatched spending spline chart, quick action grid (Send, Deposit, Invest, Analytics), and recent activity feed.
2. **Analytics**: Weekday hatched stacked bar chart, spending by category breakdown with progress bars, and income vs expenses comparison.
3. **Activity**: Complete transaction history with live search, filter pills (All / Expenses / Income), and tap-to-edit/delete modal.

---

## 🔐 First-Time Launch: $0.00 Balance & Vault ID Deposit

- **Starts at $0.00 Money**: On first launch, the vault starts with **$0.00**.
- **Unique Vault ID**: Every account is assigned an identification number (e.g. `VLT-7492-AX`) displayed in the header with a 1-tap copy button.
- **Deposit to Activate**: An activation banner prompts you to deposit funds using your Vault ID:
  - Methods: **Direct Wire**, **Bank ACH**, **Debit Card**, **Instant Crypto**.
  - Depositing immediately unlocks the vault, increases the balance, and logs the initial deposit in Activity.
- **Test Reset**: Tap your profile avatar in the top right to open the account drawer and click **"🔄 Reset Account to $0.00"** to reset and test the fresh onboarding experience at any time.

---

## 🚀 How to Run on Your Phone

1. In your terminal at `c:\Users\harshw\Desktop\new app`, run:
   ```bash
   npm start
   ```
2. Open the Wi-Fi address printed in the terminal on your phone (e.g. `http://192.168.x.x:3000`).
3. (Optional) Tap **Share ➔ "Add to Home Screen"** on iOS or **"Install App"** on Android to run full-screen as an app.
