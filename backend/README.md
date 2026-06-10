# Chapra Basket Backend

Production-oriented API starter for Chapra Basket quick commerce.

## Run locally

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The mobile app expects `EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1`.

## Structure

- `src/routes`: versioned REST route modules by domain.
- `src/controllers`: request handlers and validation contracts.
- `src/services`: business logic for OTP, cart, orders, payments, tracking.
- `src/realtime`: Socket.IO rooms, events, and live update fanout.
- `src/db/schema.sql`: PostgreSQL launch schema.

## Implemented starter routes

- `POST /api/v1/auth/send-otp`
- `POST /api/v1/auth/verify-otp`
- `GET /api/v1/products`
- `GET /api/v1/products/featured`
- `GET /api/v1/cart`
- `POST /api/v1/cart/items`
- `POST /api/v1/cart/validate`
- `GET /api/v1/orders`
- `POST /api/v1/orders`
- `GET /api/v1/orders/:id/tracking`
- `PATCH /api/v1/orders/:id/status`
- `POST /api/v1/payments/create-order`
- `POST /api/v1/payments/verify`
- `GET /api/v1/notifications`
- `POST /api/v1/rider/location`

## Socket events

Rooms:

- `user:{userId}`
- `order:{orderId}`
- `rider:{riderId}`

Events:

- `order:created`
- `order:accepted`
- `order:packed`
- `order:picked`
- `order:out_for_delivery`
- `order:delivered`
- `order:cancelled`
- `rider:location`
- `eta:update`
- `chat:message`
- `payment:success`
- `payment:failed`
- `notification:push`
