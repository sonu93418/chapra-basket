# 🛒 Blink Box

**Fast Delivery. Everyday Essentials.** — A hyperlocal grocery & essentials delivery app built for speed.

Blink Box connects customers with instant delivery of groceries, fresh produce, dairy, medicines, snacks and more — right to their doorstep. The app also includes a full **Rider Dashboard** for delivery partners.

---

## ✨ Features

### 👤 Customer App
- 🏠 **Home Feed** — Banners, categories, featured & fresh products
- 🔍 **Search** — Real-time product search with recent & trending suggestions
- 📦 **Categories** — Browse all product categories
- 🛒 **Cart** — Add, increment, decrement, remove items + coupon support
- 💳 **Checkout** — Address selection, payment method, order placement
- 📋 **Orders** — Order history with live status tracking
- 📍 **Order Tracking** — Step-by-step delivery tracking
- ❤️ **Wishlist** — Save products for later
- 👤 **Profile** — Manage account, addresses, coupons, referrals
- 💰 **Wallet** — Balance, transactions, add money
- 🔔 **Notifications** — Order updates, offers, system alerts
- 🎟️ **Coupons** — Browse & apply discount codes
- 🤝 **Referral** — Invite friends, earn rewards
- ⚙️ **Settings** — App preferences & account management

### 🛵 Rider App
- 📊 **Dashboard** — Today's earnings, trips, hours, online toggle
- 📬 **Order Requests** — Accept/decline with payout & distance info
- 📜 **History** — Past deliveries with earnings summary
- 💰 **Wallet** — Rider earnings & payout history
- 👤 **Profile** — Vehicle info, KYC status, ratings

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Expo](https://expo.dev) ~55 (React Native) |
| Routing | [Expo Router](https://expo.github.io/router) v3 (file-based) |
| State | [Redux Toolkit](https://redux-toolkit.js.org) + React Redux |
| Language | TypeScript ~5.9 |
| Fonts | [Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro) via `@expo-google-fonts` |
| Icons/UI | Emoji-based icons + custom components |
| Animations | `react-native-reanimated` 4 |
| Gestures | `react-native-gesture-handler` |
| Location | `expo-location` |
| Notifications | `expo-notifications` |
| Images | `expo-image` |

---

## 📁 Project Structure

```
blink-box/
├── app/                        # Expo Router screens
│   ├── _layout.tsx             # Root layout (Provider, fonts, splash)
│   ├── index.tsx               # Entry redirect
│   ├── (auth)/                 # Auth flow (splash, onboarding, login, OTP, user-type)
│   ├── (customer)/             # Customer tab navigator (home, categories, search, orders, profile)
│   ├── (rider)/                # Rider tab navigator (dashboard, history, wallet, profile)
│   ├── product/[id].tsx        # Product detail page
│   ├── category/[slug].tsx     # Category product listing
│   ├── order/[id].tsx          # Order detail
│   ├── order-tracking/[id].tsx # Live order tracking
│   ├── wallet.tsx              # Customer wallet
│   ├── wishlist.tsx            # Wishlist screen
│   ├── addresses.tsx           # Saved addresses
│   ├── coupons.tsx             # Coupon browser
│   ├── notifications.tsx       # Notification centre
│   ├── referral.tsx            # Referral programme
│   ├── settings.tsx            # App settings
│   └── help.tsx                # Help & support
│
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── product/            # ProductCard, QuantitySelector
│   │   ├── cart/               # ViewCartBar
│   │   └── ui/                 # Button, AppSafeAreaView
│   ├── features/               # Redux slices
│   │   ├── auth/               # authSlice
│   │   ├── cart/               # cartSlice
│   │   ├── rider/              # riderSlice
│   │   └── wishlist/           # wishlistSlice
│   ├── store/                  # Redux store configuration
│   ├── data/                   # Mock data (products, categories, orders)
│   ├── hooks/                  # useAppDispatch, useAppSelector
│   ├── theme/                  # Colors, typography, spacing, shadows
│   └── types/                  # TypeScript interfaces & types
│
├── assets/                     # App icons, splash screen
├── app.json                    # Expo configuration
├── babel.config.js             # Babel + module-resolver config
├── tsconfig.json               # TypeScript config
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 18
- [npm](https://www.npmjs.com) ≥ 9
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- [Expo Go](https://expo.dev/client) app on your Android/iOS device (for testing)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/sonu93418/blink-box.git
cd blink-box

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

### Running the App

```bash
# Start Expo dev server (scan QR with Expo Go)
npm start

# Run on Android emulator / device
npm run android

# Run on iOS simulator (macOS only)
npm run ios

# Run in browser (limited functionality)
npm run web
```

---

## 🏗 Architecture

```
User Action
    │
    ▼
Screen (app/*.tsx)
    │  dispatches actions / reads state
    ▼
Redux Store  ◄──── Slices (auth, cart, rider, wishlist)
    │
    ▼
Mock Data (src/data/mockData.ts)   ←── Replace with real API calls
```

> **Note:** All data is currently mocked via `src/data/mockData.ts`. The next step is connecting to a real backend (Node.js / Firebase / Supabase).

---

## 📱 Screens Overview

### Auth Flow
`Splash → Onboarding → Login (Phone) → OTP Verify → User Type Selection`

### Customer Flow
`Home → Categories / Search → Product Detail → Cart → Checkout → Order Tracking`

### Rider Flow
`Dashboard (Online Toggle) → Order Request → Delivery → History & Earnings`

---

## 🔧 TypeScript Check

```bash
npm run ts-check
# or
npx tsc --noEmit
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit changes: `git commit -m "feat: add your feature"`
4. Push to branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 👨‍💻 Author

**Sonu Kumar Ray**  
📧 sonukumarray1009@gmail.com  
🐙 [@sonu93418](https://github.com/sonu93418)

---

*Built with ❤️ for fast delivery ⚡*
