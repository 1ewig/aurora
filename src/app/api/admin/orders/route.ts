import { NextResponse } from 'next/server';
import { pool } from '@/utils/db';
import { createServerInsforge } from '@/utils/insforge/server';
import { isAdmin } from '@/utils/auth';

export async function GET() {
  try {
    const insforge = await createServerInsforge();
    const { data, error } = await insforge.auth.getCurrentUser();

    if (error || !data?.user || !isAdmin(data.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await pool.query(`
      SELECT 
        id, 
        user_id as "userId", 
        order_number as "orderNumber", 
        items, 
        subtotal, 
        shipping, 
        tax, 
        total, 
        shipping_address as "shippingAddress", 
        status, 
        created_at as "createdAt"
      FROM orders
      ORDER BY created_at DESC
    `);

    const orders = result.rows.map(row => ({
      ...row,
      subtotal: Number(row.subtotal),
      shipping: Number(row.shipping),
      tax: Number(row.tax),
      total: Number(row.total),
    }));

    return NextResponse.json(orders);
  } catch (err) {
    console.error('Failed to list orders:', err);
    return NextResponse.json({ error: 'Failed to list orders' }, { status: 500 });
  }
}
