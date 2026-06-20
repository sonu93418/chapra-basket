import { customAlphabet } from 'nanoid';
import { demoAddress, orders, products } from '../data/demoStore.js';
import { Order, OrderStatus, PaymentMethod } from '../types/domain.js';
import { pool } from '../config/db.js';

const makeId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

export async function listOrders(customerId: string): Promise<Order[]> {
  if (pool) {
    try {
      const res = await pool.query(
        `SELECT o.*, a.label as addr_label, a.full_address, a.landmark, a.city, a.state, a.pincode
         FROM orders o
         LEFT JOIN addresses a ON o.address_id = a.id
         WHERE o.customer_id = $1
         ORDER BY o.created_at DESC`,
        [customerId]
      );
      const ordersList: Order[] = [];

      for (const row of res.rows) {
        // Fetch items for this order
        const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [row.id]);
        const items = itemsRes.rows.map(itemRow => ({
          id: itemRow.id,
          productId: itemRow.product_id,
          name: itemRow.name,
          price: Number(itemRow.price),
          quantity: itemRow.quantity,
          unit: itemRow.unit,
          imageUrl: itemRow.image_url,
        }));

        ordersList.push({
          id: row.id,
          orderNumber: row.order_number,
          customerId: row.customer_id,
          riderId: row.rider_id || undefined,
          status: row.status as OrderStatus,
          subtotal: Number(row.subtotal),
          deliveryFee: Number(row.delivery_fee),
          platformFee: Number(row.platform_fee),
          discount: Number(row.coupon_discount),
          couponDiscount: Number(row.coupon_discount),
          total: Number(row.total),
          paymentMethod: row.payment_method as PaymentMethod,
          paymentStatus: row.payment_status,
          estimatedMinutes: row.estimated_minutes,
          deliveryOtp: row.delivery_otp,
          createdAt: row.created_at,
          confirmedAt: row.confirmed_at || undefined,
          deliveredAt: row.delivered_at || undefined,
          cancelledAt: row.cancelled_at || undefined,
          address: {
            id: row.address_id,
            userId: row.customer_id,
            fullName: row.customer_name || 'Customer',
            phoneNumber: row.customer_phone || '9876543210',
            addressLine1: row.address_line_1 || 'Sadar Bazaar',
            addressLine2: row.address_line_2 || undefined,
            landmark: row.landmark || undefined,
            city: row.city || 'Chapra',
            state: row.state || 'Bihar',
            postalCode: row.postal_code || '841301',
            country: 'India',
            latitude: Number(row.latitude || 25.774),
            longitude: Number(row.longitude || 84.7374),
            isDefault: false,
          },
          items,
        });
      }
      return ordersList;
    } catch (err: any) {
      console.warn('[DB Orders] listOrders failed, using mock fallback:', err.message);
    }
  }

  return orders.filter(order => order.customerId === customerId);
}

export async function getOrder(id: string): Promise<Order | null> {
  if (pool) {
    try {
      const res = await pool.query(
        `SELECT o.*, a.label as addr_label, a.full_address, a.landmark, a.city, a.state, a.pincode
         FROM orders o
         LEFT JOIN addresses a ON o.address_id = a.id
         WHERE o.id = $1`,
        [id]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [row.id]);
        const items = itemsRes.rows.map(itemRow => ({
          id: itemRow.id,
          productId: itemRow.product_id,
          name: itemRow.name,
          price: Number(itemRow.price),
          quantity: itemRow.quantity,
          unit: itemRow.unit,
          imageUrl: itemRow.image_url,
        }));

        return {
          id: row.id,
          orderNumber: row.order_number,
          customerId: row.customer_id,
          riderId: row.rider_id || undefined,
          status: row.status as OrderStatus,
          subtotal: Number(row.subtotal),
          deliveryFee: Number(row.delivery_fee),
          platformFee: Number(row.platform_fee),
          discount: Number(row.coupon_discount),
          couponDiscount: Number(row.coupon_discount),
          total: Number(row.total),
          paymentMethod: row.payment_method as PaymentMethod,
          paymentStatus: row.payment_status,
          estimatedMinutes: row.estimated_minutes,
          deliveryOtp: row.delivery_otp,
          createdAt: row.created_at,
          confirmedAt: row.confirmed_at || undefined,
          deliveredAt: row.delivered_at || undefined,
          cancelledAt: row.cancelled_at || undefined,
          address: {
            id: row.address_id,
            userId: row.customer_id,
            fullName: row.customer_name || 'Customer',
            phoneNumber: row.customer_phone || '9876543210',
            addressLine1: row.address_line_1 || 'Sadar Bazaar',
            addressLine2: row.address_line_2 || undefined,
            landmark: row.landmark || undefined,
            city: row.city || 'Chapra',
            state: row.state || 'Bihar',
            postalCode: row.postal_code || '841301',
            country: 'India',
            latitude: Number(row.latitude || 25.774),
            longitude: Number(row.longitude || 84.7374),
            isDefault: false,
          },
          items,
        };
      }
    } catch (err: any) {
      console.warn('[DB Orders] getOrder failed, using mock fallback:', err.message);
    }
  }

  return orders.find(order => order.id === id) || null;
}

export async function createOrder(params: {
  customerId: string;
  items: { productId: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  couponDiscount?: number;
  addressId?: string;
}): Promise<Order> {
  const { customerId, items, paymentMethod, couponDiscount = 0, addressId } = params;

  if (pool) {
    try {
      await pool.query('BEGIN');

      // Fetch products to calculate subtotal
      const orderItemsList = [];
      let subtotal = 0;

      for (const item of items) {
        const prodRes = await pool.query('SELECT * FROM products WHERE id = $1', [item.productId]);
        if (prodRes.rows.length === 0) throw new Error(`Product not found: ${item.productId}`);
        const product = prodRes.rows[0];

        if (!product.is_active) throw new Error(`Product is not active: ${product.name}`);
        if (item.quantity > product.stock_quantity) throw new Error(`Only ${product.stock_quantity} units left for ${product.name}`);

        // Decrement stock
        await pool.query('UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2', [item.quantity, item.productId]);

        const price = Number(product.price);
        orderItemsList.push({
          productId: product.id,
          name: product.name,
          price,
          quantity: item.quantity,
          unit: product.unit,
          imageUrl: Array.isArray(product.images) ? product.images[0] : JSON.parse(product.images || '[]')[0],
        });
        subtotal += price * item.quantity;
      }

      const deliveryFee = subtotal >= 299 ? 0 : 25;
      const platformFee = 5;
      const total = subtotal + deliveryFee + platformFee - couponDiscount;
      const orderNo = `CB-${new Date().getFullYear()}-${makeId()}`;
      const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));

      // Fetch active default address if addressId not provided
      let finalAddressId = addressId;
      if (!finalAddressId) {
        const addrRes = await pool.query('SELECT id FROM addresses WHERE user_id = $1 ORDER BY is_default DESC LIMIT 1', [customerId]);
        if (addrRes.rows.length > 0) finalAddressId = addrRes.rows[0].id;
      }

      // Insert Order
      const insertOrderRes = await pool.query(
        `INSERT INTO orders (order_number, customer_id, address_id, status, subtotal, delivery_fee, platform_fee, coupon_discount, total, payment_method, payment_status, estimated_minutes, delivery_otp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [
          orderNo,
          customerId,
          finalAddressId || null,
          'pending',
          subtotal,
          deliveryFee,
          platformFee,
          couponDiscount,
          total,
          paymentMethod,
          paymentMethod === 'cod' ? 'pending' : 'success',
          30,
          deliveryOtp,
        ]
      );
      const dbOrder = insertOrderRes.rows[0];

      // Insert Order Items
      const createdItems = [];
      for (const oi of orderItemsList) {
        const oiRes = await pool.query(
          `INSERT INTO order_items (order_id, product_id, name, price, quantity, unit, image_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [dbOrder.id, oi.productId, oi.name, oi.price, oi.quantity, oi.unit, oi.imageUrl]
        );
        createdItems.push({
          id: oiRes.rows[0].id,
          productId: oiRes.rows[0].product_id,
          name: oiRes.rows[0].name,
          price: Number(oiRes.rows[0].price),
          quantity: oiRes.rows[0].quantity,
          unit: oiRes.rows[0].unit,
          imageUrl: oiRes.rows[0].image_url,
        });
      }

      await pool.query('COMMIT');

      // Fetch full address object to return
      let addressDetails = demoAddress;
      if (finalAddressId) {
        const fullAddrRes = await pool.query('SELECT * FROM addresses WHERE id = $1', [finalAddressId]);
        if (fullAddrRes.rows.length > 0) {
          const r = fullAddrRes.rows[0];
          addressDetails = {
            id: r.id,
            userId: r.user_id,
            fullName: r.full_name,
            phoneNumber: r.phone_number,
            addressLine1: r.address_line_1,
            addressLine2: r.address_line_2 || undefined,
            landmark: r.landmark || undefined,
            city: r.city,
            state: r.state,
            postalCode: r.postal_code,
            country: r.country,
            latitude: Number(r.latitude),
            longitude: Number(r.longitude),
            isDefault: r.is_default,
          };
        }
      }

      return {
        id: dbOrder.id,
        orderNumber: dbOrder.order_number,
        customerId: dbOrder.customer_id,
        status: dbOrder.status,
        subtotal: Number(dbOrder.subtotal),
        deliveryFee: Number(dbOrder.delivery_fee),
        platformFee: Number(dbOrder.platform_fee),
        discount: Number(dbOrder.coupon_discount),
        couponDiscount: Number(dbOrder.coupon_discount),
        total: Number(dbOrder.total),
        paymentMethod: dbOrder.payment_method,
        paymentStatus: dbOrder.payment_status,
        estimatedMinutes: dbOrder.estimated_minutes,
        deliveryOtp: dbOrder.delivery_otp,
        createdAt: dbOrder.created_at,
        address: addressDetails,
        items: createdItems,
      };
    } catch (err: any) {
      await pool.query('ROLLBACK');
      console.warn('[DB Orders] createOrder transaction failed, using mock fallback:', err.message);
    }
  }

  // Mock Fallback
  const orderItems = params.items.map((item, index) => {
    const product = products.find(candidate => candidate.id === item.productId);
    if (!product || !product.isActive) throw new Error(`Product not available: ${item.productId}`);
    if (item.quantity > product.stockQuantity) throw new Error(`${product.name} is out of stock`);
    return {
      id: `oi-${Date.now()}-${index}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      unit: product.unit,
      imageUrl: product.images[0],
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= 299 ? 0 : 25;
  const platformFee = 5;

  const order: Order = {
    id: `ord-${Date.now()}`,
    orderNumber: `CB-${new Date().getFullYear()}-${makeId()}`,
    customerId: params.customerId,
    address: demoAddress,
    items: orderItems,
    status: 'pending',
    subtotal,
    deliveryFee,
    platformFee,
    discount: couponDiscount,
    couponDiscount,
    total: subtotal + deliveryFee + platformFee - couponDiscount,
    paymentMethod: params.paymentMethod,
    paymentStatus: params.paymentMethod === 'cod' ? 'pending' : 'success',
    estimatedMinutes: 30,
    deliveryOtp: String(Math.floor(1000 + Math.random() * 9000)),
    createdAt: new Date().toISOString(),
  };

  orders.unshift(order);
  return order;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  if (pool) {
    try {
      const now = new Date().toISOString();
      let query = 'UPDATE orders SET status = $1';
      const params = [status, orderId];

      if (status === 'confirmed') query += ', confirmed_at = NOW()';
      if (status === 'delivered') query += ', delivered_at = NOW(), payment_status = \'success\'';
      if (status === 'cancelled') query += ', cancelled_at = NOW()';

      query += ' WHERE id = $2 RETURNING *';

      const res = await pool.query(query, params);
      if (res.rows.length > 0) {
        const orderRow = res.rows[0];
        if (status === 'delivered') {
          await checkAndTriggerReferralReward(orderRow.customer_id);
        }
        const fullOrder = await getOrder(orderId);
        if (fullOrder) return fullOrder;
      }
    } catch (err: any) {
      console.warn('[DB Orders] updateOrderStatus failed, using mock:', err.message);
    }
  }

  const order = orders.find(o => o.id === orderId);
  if (!order) throw new Error('Order not found');

  order.status = status;
  const now = new Date().toISOString();
  if (status === 'confirmed') order.confirmedAt = now;
  if (status === 'delivered') {
    order.deliveredAt = now;
    order.paymentStatus = 'success';
  }
  if (status === 'cancelled') order.cancelledAt = now;

  return order;
}

export async function cancelOrder(orderId: string): Promise<Order> {
  return await updateOrderStatus(orderId, 'cancelled');
}

async function checkAndTriggerReferralReward(customerId: string) {
  if (!pool) return;
  try {
    const refRes = await pool.query(
      "SELECT * FROM referrals WHERE referred_user_id = $1 AND status = 'pending'",
      [customerId]
    );
    if (refRes.rows.length > 0) {
      const referral = refRes.rows[0];
      const referrerId = referral.referrer_id;

      await pool.query(
        "UPDATE referrals SET status = 'completed', reward_amount = 50 WHERE id = $1",
        [referral.id]
      );

      await pool.query(
        "INSERT INTO wallets (user_id, balance) VALUES ($1, 50) ON CONFLICT (user_id) DO UPDATE SET balance = wallets.balance + 50",
        [referrerId]
      );

      await pool.query(
        "INSERT INTO wallet_transactions (user_id, type, amount, description) VALUES ($1, 'credit', 50, 'Referral reward for inviting friend')",
        [referrerId]
      );
    }
  } catch (err: any) {
    console.error('[Referral] Reward trigger failed:', err.message);
  }
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: 'pending' | 'success' | 'failed'
): Promise<Order | null> {
  if (pool) {
    try {
      const res = await pool.query(
        'UPDATE orders SET payment_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [paymentStatus, orderId]
      );
      if (res.rows.length > 0) {
        return getOrder(orderId);
      }
    } catch (err: any) {
      console.warn('[DB Orders] updateOrderPaymentStatus failed:', err.message);
    }
  }

  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.paymentStatus = paymentStatus;
    return order;
  }
  return null;
}
