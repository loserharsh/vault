<div align="center">

  <h1>🏴‍☠️ Vault</h1>
  <p><strong>A minimalist, high-contrast personal finance & ledger PWA built with pure vanilla web technologies.</strong></p>

  <p>
    <a href="https://loserharsh.github.io/vault/"><strong>Explore the Live Demo »</strong></a>
  </p>

  <p>
    <a href="https://loserharsh.github.io/vault/">
      <img src="https://img.shields.io/badge/Live%20Demo-Available-000000?style=for-the-badge&logo=githubpages&logoColor=white" alt="Live Demo" />
    </a>
    <img src="https://img.shields.io/badge/Vanilla%20JS-100%25-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="Vanilla JS" />
    <img src="https://img.shields.io/badge/PWA-100%25%20Offline-blueviolet?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA Ready" />
    <img src="https://img.shields.io/badge/Zero%20Dependencies-No%20Frameworks-success?style=for-the-badge" alt="Zero Dependencies" />
  </p>

</div>

---

## 💡 About The Project

**Vault** is a lightweight, client-side personal finance tracker designed with a stark, modern, high-contrast fintech aesthetic.

Many finance web applications rely on heavy frameworks, complex build steps, or remote databases for simple personal bookkeeping. **Vault** demonstrates a minimalist, native web approach:
- **Zero build steps**: No Webpack, Vite, Babel, or compilation required to run.
- **Zero frameworks**: Built entirely using native HTML5, CSS3, and modern modular ES6 JavaScript.
- **100% Offline Capable**: Powered by a Cache-First Service Worker (`sw.js`) that lets you track finances even on airplane mode.
- **Local persistence**: Stores data securely in the browser's `localStorage` for instantaneous load times and zero cloud lock-in.
- **Installable PWA**: Works like a native mobile app on iOS and Android with anchored navigation and touch-optimized controls.
- **Playful Character**: Comes preloaded with One Piece-inspired minimalist chibi avatars and Grand Line Berries (`฿`) as the default currency (with full real-world multi-currency switching).

---

## ⚡ Key Features

### 📷 Camera Receipt Scanner (OCR & Auto-Fill)
Snap a photo of any shopping receipt or invoice directly inside the app:
- **Custom Viewfinder UI**: High-contrast dark camera viewfinder with rounded viewport, tactile circular shutter button, and front/rear camera switcher.
- **Laser Scanner Animation**: Real-time visual scan feedback while the receipt is being analyzed.
- **On-Device OCR & Rule-Based Parser**: Automatically extracts the store name, total amount, transaction date, and infers the category, pre-filling the transaction sheet with an attached image proof preview.
- **Photo Upload Fallback**: Upload receipts directly from your phone gallery or files if camera access is unavailable.

### 📥 Export Ledger to CSV
Need your data in Excel or Google Sheets?
- One-click export button located in the **Activity Screen** and **Sidebar Navigation Menu**.
- Generates a standard RFC 4180 `.csv` spreadsheet containing Transaction IDs, Dates, Titles, Amounts, Currencies, Recurring Cycles, Categories, and Notes.

### 🔁 Recurring Subscriptions & Fixed Commitments Tracker
- **Smart Toggle**: Mark any expense as a recurring subscription with **Monthly**, **Weekly**, or **Yearly** billing cycles.
- **Recurring Monthly Income**: Record recurring salaries or freelance retainers.
- **Monthly Burn Card**: Analytics calculates your exact fixed monthly commitment (e.g. `฿84.50 / mo`) with individual breakdown rows.
- **Feed Badges**: Recurring transactions feature distinct cycle badges (`🔁 Monthly`, `🔁 Weekly`, `🔁 Yearly`) across your feed.

### 📊 Dynamic Stacked Analytics Bar Chart
- **Real Calculated Values**: Weekday spending bars (`M`, `T`, `W`, `T`, `F`, `S`, `S`) dynamically compute the exact proportional segment heights based on your actual spending categories.
- **Signature Visual Hierarchy**:
  - **Hatched Cap**: Top miscellaneous cap.
  - **Sky Blue**: Services, transit, and entertainment.
  - **Fresh Green**: Technology, transfers, and health.
  - **Coral / Orange**: Food, drinks, and shopping.
- **Interactive Day Selection**: Tap any weekday to inspect that day's real category breakdown and active currency tooltip badge.

### 💳 Negative Balance Support
- Account balance naturally reflects real financial health and can go negative (`-₹710.00` or `-$120.00`) when expenses exceed funding, with distinct accent styling.

### 🏴‍☠️ One Piece Theme & Multi-Currency Switcher
Track your treasure in **One Piece Berries (`฿`)** or switch instantly to real-world currencies:
- **One Piece Berries (`฿`)** *(Default)*
- **US Dollar (`$`)**
- **Indian Rupee (`₹`)**
- **Euro (`€`)**
- **British Pound (`£`)**

### 🎨 Minimalist Chibi Avatars
Personalize your profile with hand-drawn minimalist chibi doodle avatars:
> **Luffy • Zoro • Sanji • Chopper • Trafalgar Law • Portgas D. Ace • Shanks • Nami**

### 🔄 Device Sync & Backup Key
Easily migrate or back up your entire Vault between your computer and mobile phone using a single secure offline Base64 sync code — no accounts or external servers needed.

---

## 🧭 App Navigation

| Tab | Purpose |
|:---|:---|
| **🏠 Home** | Overview of total balance, live spending spline chart, quick action cards (*Send, Receive, Invest, Subscriptions*), and latest transactions. |
| **📈 Analytics** | Dynamic category-stacked weekday bar chart, spending category progress bars, recurring monthly commitments burn card, and monthly income vs expenses. |
| **💰 Deposit** | Dedicated funding page with quick preset pills (`+50`, `+100`, `+250`, `+500`, `+1000`) and funding methods. |
| **📋 Activity** | Searchable transaction ledger with instant filtering (*All, Expenses, Income*), tap-to-edit sheets, and CSV export. |

---

## 🚀 Getting Started

### Try it in Your Browser
The easiest way to experience Vault is via GitHub Pages:  
👉 **[Launch Vault](https://loserharsh.github.io/vault/)**

---

### Run Locally

Because Vault uses native ES modules and zero build tools, you can start the local server in one simple command:

```bash
# 1. Clone the repository
git clone https://github.com/loserharsh/vault.git

# 2. Enter the project folder
cd vault

# 3. Start the server
npm start
```

Open **`http://localhost:3000`** in your browser.

> **Tip**: If port 3000 is occupied, the built-in server automatically switches to the next available port (e.g. 3001) without crashing. You can also view it on your phone by opening `http://<YOUR_LOCAL_IP>:3000` while connected to the same Wi-Fi.

---

## 🛠️ Tech Stack & Architecture

- **Markup**: Semantic HTML5 with PWA manifest (`manifest.json`)
- **Styling**: Pure CSS3 (CSS Custom Properties, Flexbox, Grid, Dynamic Viewport Units, Hatched SVG Patterns)
- **Scripting**: Modular ES6 JavaScript (Native `import`/`export`, reactive pub-sub store pattern)
- **Offline Engine**: Service Worker (`sw.js`) with Cache-First strategy
- **OCR Engine**: On-demand Tesseract OCR with heuristic regex fallbacks
- **Storage**: Browser `localStorage` with safety checks and import/export backup

---

## 👤 Author

**Harsh**
- GitHub: [@loserharsh](https://github.com/loserharsh)
- Project Repository: [loserharsh/vault](https://github.com/loserharsh/vault)
- Live Web Application: [loserharsh.github.io/vault](https://loserharsh.github.io/vault/)

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more details.
