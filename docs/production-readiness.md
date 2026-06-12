# Blink Box Production Readiness

## UI and UX Report

- Current app has strong visual direction, but many screens still rely on mock state and hard-coded status text.
- Bottom navigation now follows the quick-commerce pattern: Home, Categories, Orders, Cart, Profile.
- Search, checkout, and order confirmation are now secondary workflow screens instead of bottom tabs.
- Notifications now use SVG icons and shared Redux state for in-app real-time updates.

## Navigation Plan

- Top navigation: location, ETA, search, notifications, offers.
- Bottom navigation: Home, Categories, Orders, Cart, Profile.
- Secondary tabs: Orders uses Active and Past; Categories can expand into Grocery, Fruits, Vegetables, Dairy.
- Deep links: order details and tracking stay outside customer tabs for focused task flow.

## Real-Time Architecture

- Mobile root mounts a real-time bridge after auth token availability.
- Socket.IO events update Redux orders, rider locations, payments, and notifications.
- Backend uses `user:{id}`, `order:{id}`, and `rider:{id}` rooms.
- Tracking screen subscribes to the specific order room for rider location and status changes.

## OTP Architecture

- Backend exposes send and verify OTP routes.
- Development mode returns `123456` for testing.
- Production can plug into MSG91, Twilio, or Firebase Auth inside `otp.service.ts`.
- Required production hardening: provider callback logs, IP/device rate limits, resend timer, max verification attempts, and OTP auto-read on Android.

## Payment Architecture

- Backend exposes Razorpay order creation, verification, and webhook endpoints.
- Mobile payment service dynamically loads Razorpay and falls back to mock payment in development.
- Production needs webhook signature verification, retry state, refund table, and payment reconciliation jobs.

## Tracking Architecture

- Backend emits rider GPS via `rider:location` and `eta:update`.
- Current mobile map is a visual placeholder; production should add `react-native-maps`, Google Directions, geofencing, and background rider location.
- Database schema includes `rider_locations` for audit/history.

## API Structure

- Auth, users/profile, addresses, products, stores, cart, orders, payments, tracking, notifications, reviews, referrals, wallet, rider, admin.
- Routes are versioned under `/api/v1`.
- Controllers validate request payloads with Zod.

## Database Structure

- PostgreSQL schema includes users, addresses, stores, categories, products, coupons, carts, orders, order items, payments, rider locations, notifications, wallets, referrals, and reviews.

## Performance Plan

- Use RTK Query caching for products/orders.
- Add paginated product lists and infinite scroll.
- Use optimized CDN images and thumbnails.
- Keep cart and active order data locally cached for poor-network recovery.
- Add background sync for failed cart/order/payment updates.

## Production Checklist

- Install mobile real-time/payment dependencies.
- Replace mock OTP with provider integration.
- Replace in-memory backend store with PostgreSQL repositories.
- Add auth guards and role-based authorization to every protected route.
- Add inventory locks during checkout.
- Verify Razorpay webhooks and store raw payment events.
- Add push notifications through FCM/APNS.
- Add observability: request logs, error tracking, metrics, and uptime checks.
- Add automated tests for cart validation, order lifecycle, payment verification, and socket events.
