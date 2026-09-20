/**
 * Mobile App Application Bootstrap & Reactive Store Binding
 */

import { store } from "./store.js";
import {
  renderHomeScreen,
  renderAnalyticsScreen,
  renderActivityScreen,
  renderDepositPage,
  renderSidebarDrawer,
} from "./screens.js";
import {
  setupInteractions,
  openTransactionModal,
  openSyncModal,
  openResetConfirmModal,
  openCurrencyModal,
  showToast,
} from "./interactions.js";

// Active Tab State ('home', 'analytics', 'activity', 'deposit')
let currentTab = "home";

/**
 * Open Sidebar Navigation Drawer
 */
export function openSidebar() {
  const drawer = document.querySelector("#mobile-side-drawer");
  const backdrop = document.querySelector("#drawer-backdrop");
  if (!drawer || !backdrop) return;
  renderSidebarDrawer(
    drawer,
    switchTab,
    closeSidebar,
    openSyncModal,
    () => openResetConfirmModal(() => switchTab("home")),
    openCurrencyModal
  );
  drawer.classList.add("open");
  backdrop.classList.add("open");
}

/**
 * Close Sidebar Navigation Drawer
 */
export function closeSidebar() {
  const drawer = document.querySelector("#mobile-side-drawer");
  const backdrop = document.querySelector("#drawer-backdrop");
  if (!drawer || !backdrop) return;
  drawer.classList.remove("open");
  backdrop.classList.remove("open");
}

/**
 * Switch active mobile navigation tab / screen
 */
export function switchTab(tabName) {
  currentTab = tabName;

  // Update nav bar tab button styling
  const navTabs = document.querySelectorAll(".nav-tab-item");
  navTabs.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  });

  // Update active screen visibility
  const screens = document.querySelectorAll(".app-screen");
  screens.forEach((screen) => {
    const isTarget = screen.id === `screen-${tabName}`;
    screen.classList.toggle("active", isTarget);
  });

  // Render content of newly activated tab
  refreshActiveScreen();

  // Scroll mobile viewport to top smoothly
  const scroller = document.querySelector(".app-screen-scroller");
  if (scroller) {
    scroller.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/**
 * Re-renders the currently active screen with freshest store data
 */
function refreshActiveScreen() {
  const homeContainer = document.querySelector("#screen-home");
  const analyticsContainer = document.querySelector("#screen-analytics");
  const activityContainer = document.querySelector("#screen-activity");
  const depositContainer = document.querySelector("#screen-deposit");

  const onAddTx = () => openTransactionModal(null);
  const onEditTx = (txId) => openTransactionModal(txId);
  const onOpenDeposit = () => switchTab("deposit");

  if (currentTab === "home" && homeContainer) {
    renderHomeScreen(
      homeContainer,
      switchTab,
      onAddTx,
      onEditTx,
      onOpenDeposit,
      openSidebar
    );
  } else if (currentTab === "analytics" && analyticsContainer) {
    renderAnalyticsScreen(analyticsContainer, onAddTx, onEditTx, openSidebar);
  } else if (currentTab === "activity" && activityContainer) {
    renderActivityScreen(activityContainer, onAddTx, onEditTx, openSidebar);
  } else if (currentTab === "deposit" && depositContainer) {
    renderDepositPage(
      depositContainer,
      (amount) => {
        showToast(`✔ Deposited $${amount.toFixed(2)} to your Vault!`);
        switchTab("home");
      },
      () => switchTab("home")
    );
  }
}

/**
 * Re-render all screens when store state changes (add / edit / delete / deposit)
 */
function onStoreChanged() {
  refreshActiveScreen();

  // If sidebar is currently open, re-render it to reflect new balance & vault details
  const drawer = document.querySelector("#mobile-side-drawer");
  if (drawer && drawer.classList.contains("open")) {
    renderSidebarDrawer(
      drawer,
      switchTab,
      closeSidebar,
      openSyncModal,
      () => openResetConfirmModal(() => switchTab("home")),
      openCurrencyModal
    );
  }
}

/**
 * Setup Bottom Navigation Bar
 */
function setupBottomNav() {
  const navTabs = document.querySelectorAll(".nav-tab-item");
  navTabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      if (tab) switchTab(tab);
    });
  });
}

// Bootstrap
document.addEventListener("DOMContentLoaded", () => {
  // Subscribe UI to store mutations (local storage changes, transaction adds/deletes)
  store.subscribe(onStoreChanged);

  // Setup tab navigation & global interactions
  setupBottomNav();
  setupInteractions((targetTab) => {
    switchTab(targetTab);
  });

  // Global listeners for Hamburger Menu and Sidebar Drawer
  document.addEventListener("click", (e) => {
    if (
      e.target.closest("#btn-menu") ||
      e.target.closest("#btn-analytics-menu") ||
      e.target.closest("#btn-activity-menu") ||
      e.target.closest(".btn-menu-trigger")
    ) {
      openSidebar();
      return;
    }

    if (e.target.closest("#btn-close-drawer") || e.target.closest("#drawer-backdrop")) {
      closeSidebar();
      return;
    }
  });

  // Initial render
  refreshActiveScreen();
  switchTab("home");

  // Re-adjust spline chart pin on resize
  window.addEventListener("resize", () => {
    if (currentTab === "home") {
      const homeContainer = document.querySelector("#screen-home");
      if (homeContainer) {
        renderHomeScreen(
          homeContainer,
          switchTab,
          () => openTransactionModal(null),
          (txId) => openTransactionModal(txId),
          () => switchTab("deposit"),
          openSidebar
        );
      }
    }
  });
});
