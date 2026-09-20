/**
 * Mock / Placeholder Data Store for Strata Finance Prototype
 */

export const mockData = {
  account: {
    brandName: "Strata",
    tagline: "Modern capital, made fluid.",
    user: {
      name: "Alex Thorne",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    totalBalance: "$24,850.00",
  },

  // Spending analytics keyed by time range tab
  timeRanges: {
    "1 week": {
      spendingAmount: "$1,054.25",
      trendLabel: "+12.5% vs last week",
      labels: ["M", "T", "W", "T", "F", "S", "S"],
      // Spline points normalized (0 - 100 height)
      points: [15, 45, 36, 62, 34, 72, 45],
      highlightIndex: 5, // Saturday / peak pin
    },
    "1 month": {
      spendingAmount: "$4,820.50",
      trendLabel: "+8.4% vs last month",
      labels: ["W1", "W2", "W3", "W4", "W5"],
      points: [25, 40, 58, 48, 65],
      highlightIndex: 3,
    },
    "3 months": {
      spendingAmount: "$13,910.00",
      trendLabel: "-2.1% vs last quarter",
      labels: ["May", "Jun", "Jul"],
      points: [40, 65, 52],
      highlightIndex: 1,
    },
    "6 months": {
      spendingAmount: "$27,450.00",
      trendLabel: "+14.8% vs last period",
      labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      points: [30, 48, 42, 60, 55, 78],
      highlightIndex: 5,
    },
  },

  // Recent Recipients
  recipients: [
    {
      id: "add",
      isAdd: true,
      name: "Add",
    },
    {
      id: "rec-1",
      name: "Amalia",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "rec-2",
      name: "Lukas",
      initials: "LM",
    },
    {
      id: "rec-3",
      name: "Jonas",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "rec-4",
      name: "Tia",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "rec-5",
      name: "Elena",
      initials: "ER",
    },
    {
      id: "rec-6",
      name: "Kev",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
  ],

  // Transactions analytics bar chart
  barChart: {
    selectedDayIndex: 4, // Friday (F)
    selectedAmount: "-$78.89",
    days: [
      { day: "M", total: 42, isHatched: true, amount: "-$34.20" },
      { day: "T", total: 30, isHatched: true, amount: "-$22.50" },
      { day: "W", total: 58, isHatched: true, amount: "-$48.10" },
      { day: "T", total: 72, isHatched: true, amount: "-$61.00" },
      {
        day: "F",
        total: 94,
        isStacked: true,
        amount: "-$78.89",
        segments: [
          { type: "orange", height: 48, label: "Shopping / Clothing", amount: "$47.49" },
          { type: "green", height: 22, label: "Transfers", amount: "$23.99" },
          { type: "blue", height: 28, label: "Services", amount: "$7.41" },
          { type: "hatch", height: 16, label: "Other" },
        ],
      },
      { day: "S", total: 64, isHatched: true, amount: "-$55.00" },
      { day: "S", total: 78, isHatched: true, amount: "-$66.30" },
    ],
  },

  // Category breakdown cards
  categories: [
    {
      title: "Transfers",
      amount: "$23.99",
      percentage: "20%",
      indicator: "green",
    },
    {
      title: "Clothing",
      amount: "$47.49",
      percentage: "40%",
      indicator: "orange",
    },
  ],

  // Transaction history feed
  transactionGroups: [
    {
      dateHeader: "Thursday, July 22",
      items: [
        {
          id: "tx-1",
          merchant: "Apple",
          category: "Technology",
          logoType: "dark",
          iconChar: "",
          amount: "-$9.99",
          rebate: "+$2.00",
        },
        {
          id: "tx-2",
          merchant: "Uber",
          category: "Taxi & Transit",
          logoType: "dark",
          iconText: "Uber",
          amount: "-$23.99",
          rebate: "+$12.00",
        },
        {
          id: "tx-3",
          merchant: "Starbucks",
          category: "Restaurants & Coffee",
          logoType: "green",
          iconChar: "☕",
          amount: "-$16.49",
          rebate: "+$6.00",
        },
        {
          id: "tx-4",
          merchant: "Figma",
          category: "Design Tools",
          logoType: "dark",
          iconChar: "❖",
          amount: "-$15.00",
          rebate: "+$3.00",
        },
      ],
    },
  ],

  // Virtual Cards for the welcome / showcase
  cards: [
    {
      id: "card-1",
      variant: "card-blue",
      type: "Multi-use virtual",
      last4: "*5621",
      expiry: "Exp. 12/28",
    },
    {
      id: "card-2",
      variant: "card-orange",
      type: "Physical Black Metal",
      last4: "*6432",
      expiry: "Exp. 07/29",
    },
    {
      id: "card-3",
      variant: "card-black",
      type: "Executive Titanium",
      last4: "*3216",
      expiry: "Exp. 04/28",
    },
    {
      id: "card-4",
      variant: "card-hatched",
      type: "Crypto Vault",
      last4: "*5678",
      expiry: "Exp. 04/27",
    },
  ],
};
