<div align="center">

  <h1>🏴‍☠️ Vault</h1>
  <p><strong>A minimalist, high-contrast personal ledger and finance PWA built with pure vanilla web technologies.</strong></p>

  <p>
    <a href="https://loserharsh.github.io/vault/"><strong>Explore the Live Demo »</strong></a>
  </p>

  <p>
    <a href="https://loserharsh.github.io/vault/">
      <img src="https://img.shields.io/badge/Live%20Demo-Available-000000?style=for-the-badge&logo=githubpages&logoColor=white" alt="Live Demo" />
    </a>
    <img src="https://img.shields.io/badge/Vanilla%20JS-100%25-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="Vanilla JS" />
    <img src="https://img.shields.io/badge/PWA-Installable-blueviolet?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA Ready" />
    <img src="https://img.shields.io/badge/Zero%20Dependencies-No%20Frameworks-success?style=for-the-badge" alt="Zero Dependencies" />
  </p>

</div>

---

## 💡 About The Project

**Vault** is a lightweight, privacy-first personal finance tracker designed with a stark, modern, high-contrast fintech aesthetic. 

Most modern finance apps are bloated with heavy frameworks, tracking cookies, and mandatory sign-ups. **Vault** takes the opposite approach:
- **Zero build steps**: No Webpack, Vite, Babel, or npm installs required to run.
- **Zero frameworks**: Built entirely using native HTML5, CSS3, and modern modular ES6 JavaScript.
- **Privacy-first**: 100% client-side. Your financial ledger never leaves your browser's `localStorage`.
- **Installable PWA**: Works like a native mobile app on iOS and Android with anchored navigation and smooth touch controls.
- **Playful Character**: Comes preloaded with One Piece-inspired minimalist chibi avatars and Grand Line Berries (`฿`) as the default currency (with full multi-currency switching).

---

## ⚡ Key Highlights

### 📱 Native Mobile PWA Experience
Designed mobile-first with a locked bottom navigation bar that never jumps or stutters during scrolling. Install it directly from Safari or Chrome to your home screen for a full-screen, native-feeling app.

### 🏴‍☠️ One Piece Theme & Multi-Currency Switcher
Track your treasure in **One Piece Berries (`฿`)** or switch instantly to real-world currencies:
- **One Piece Berries (`฿`)** *(Default)*
- **US Dollar (`$`)**
- **Indian Rupee (`₹`)**
- **Euro (`€`)**
- **British Pound (`£`)**

All balances, spline charts, transaction logs, and deposit presets update dynamically in real time.

### 🎨 Chibi Doodle Avatars
Personalize your profile with hand-drawn minimalist chibi doodle avatars:
> **Luffy • Zoro • Sanji • Chopper • Trafalgar Law • Portgas D. Ace • Shanks • Nami**

You can also customize your display name or paste any custom profile picture URL.

### 💳 Peer Vault ID System
Every user is assigned a unique Vault ID (e.g. `VLT-7492-AX`). Test out peer transfers, send funds between virtual accounts, and track sent/received history seamlessly.

### 📊 Real-Time Analytics & Hatched Spline Charts
Custom HTML5 Canvas-powered interactive spending splines with timeframe selectors (*This week, This month, 3 months, 6 months*) and category breakdowns with visual progress bars.

### 🔒 Zero-Risk Ledger with PIN Protection
Want to start fresh? A built-in **Reset Vault to 0.00** feature requires you to type your exact username to confirm, preventing accidental data wipes.

---

## 🧭 App Walkthrough

| Tab | What it does |
|:---|:---|
| **🏠 Home** | High-level overview of total balance, live spending spline chart, quick transfer actions, and latest transactions. |
| **📈 Analytics** | Visual spending trends by weekday, categorical expenditure percentages, and income vs. expense balance. |
| **💰 Deposit** | Dedicated funding page with one-tap quick presets (`+50`, `+100`, `+250`, `+500`, `+1000`) or custom amounts. |
| **📋 Activity** | Searchable transaction feed with instant filtering (*All, Expenses, Income*) and tap-to-edit transaction sheets. |

---

## 🚀 Getting Started

### Try it in Your Browser
The easiest way to experience Vault is via GitHub Pages:  
👉 **[Launch Vault](https://loserharsh.github.io/vault/)**

---

### Run Locally

Because Vault uses native ES modules and zero build tools, all you need is any local static file server:

```bash
# 1. Clone the repository
git clone https://github.com/loserharsh/vault.git

# 2. Enter the project folder
cd vault

# 3. Start a server (pick any method you prefer):
# Using Python:
python -m http.server 3000

# Using Node:
node server.js

# Using npx:
npx serve .
```

Open `http://localhost:3000` in your browser.

---

## 🛠️ Tech Stack & Architecture

- **Markup**: Pure semantic HTML5
- **Styling**: Modern CSS3 (CSS Variables, Flexbox, CSS Grid, Safe-area Insets, Dynamic Viewport Units `dvh`)
- **Scripting**: Modular ES6 JavaScript (Native `import`/`export`, reactive pub-sub store pattern)
- **Visuals**: Native HTML5 Canvas rendering for responsive spline and bar charts
- **Storage**: Browser `localStorage` with initial seed state and safety locks
- **Offline / App Support**: Web App Manifest (`manifest.json`) and mobile standalone mode

---

## 🤝 Contributing

Contributions, feedback, and feature suggestions are always welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👤 Author

**Harsh**
- GitHub: [@loserharsh](https://github.com/loserharsh)
- Project Repository: [loserharsh/vault](https://github.com/loserharsh/vault)
- Live Web Application: [loserharsh.github.io/vault](https://loserharsh.github.io/vault/)

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more details.
