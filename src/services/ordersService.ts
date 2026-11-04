import { supabase } from '@/lib/supabase/client';
import { Order, OrderItem } from '@/types/database';

export interface CreateOrderInput {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  shippingMethod: string;
}

export const ordersService = {
  /**
   * Barcha buyurtmalarni Supabase dan yuklash
   */
  async fetchOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        if (typeof window !== 'undefined') {
          return JSON.parse(localStorage.getItem('noxar-orders') || '[]');
        }
        return [];
      }

      return data.map((o: any): Order => ({
        id: String(o.id),
        order_number: o.order_number || o.id?.slice(0, 8),
        customer_name: o.customer_name,
        customer_phone: o.customer_phone || o.phone,
        phone: o.phone || o.customer_phone,
        customer_address: o.customer_address || o.address,
        address: o.address || o.customer_address,
        total: Number(o.total || 0),
        status: o.status || o.order_status || 'pending',
        order_status: o.order_status || o.status || 'pending',
        payment_method: o.payment_method || 'cash',
        payment_status: o.payment_status || 'pending',
        shipping_method: o.shipping_method || 'standart',
        items: Array.isArray(o.items) ? o.items : [],
        created_at: o.created_at,
      }));
    } catch (err) {
      console.warn('ordersService.fetchOrders xatosi, local storage fallback:', err);
      if (typeof window !== 'undefined') {
        return JSON.parse(localStorage.getItem('noxar-orders') || '[]');
      }
      return [];
    }
  },

  /**
   * Foydalanuvchining o'z buyurtmalarini ismi va telefoni bo'yicha yuklash
   */
  async fetchCustomerOrders(fullName?: string, phone?: string): Promise<Order[]> {
    if (!fullName && !phone) return [];
    try {
      const conditions: string[] = [];
      if (fullName) conditions.push(`customer_name.eq.${fullName}`);
      if (phone) conditions.push(`customer_phone.eq.${phone}`, `phone.eq.${phone}`);

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(conditions.join(','))
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        if (typeof window !== 'undefined') {
          const local = JSON.parse(localStorage.getItem('noxar-orders') || '[]');
          return local.filter(
            (o: any) =>
              (fullName && o.customer_name === fullName) ||
              (phone && (o.phone === phone || o.customer_phone === phone))
          );
        }
        return [];
      }
      return data;
    } catch (_) {
      if (typeof window !== 'undefined') {
        return JSON.parse(localStorage.getItem('noxar-orders') || '[]');
      }
      return [];
    }
  },

  /**
   * Yangi buyurtma yaratish
   */
  async createOrder(input: CreateOrderInput): Promise<{ success: boolean; orderNumber: string; error?: any }> {
    const orderData = {
      order_number: input.orderNumber,
      customer_name: input.customerName,
      customer_phone: input.phone,
      phone: input.phone,
      customer_address: input.address,
      address: input.address,
      total: input.total,
      items: input.items,
      payment_method: input.paymentMethod,
      payment_status: 'pending',
      shipping_method: input.shippingMethod,
      status: 'pending',
      order_status: 'pending',
    };

    try {
      await supabase.from('orders').insert([orderData]);
    } catch (err) {
      console.warn('ordersService.createOrder offline/error, local fallback:', err);
    }

    // Har doim mahalliy storagega ham zaxira qilamiz
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('noxar-orders') || '[]');
      localStorage.setItem('noxar-orders', JSON.stringify([orderData, ...existing]));
    }

    return { success: true, orderNumber: input.orderNumber };
  },

  /**
   * Buyurtma holatini yangilash
   */
  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, order_status: status, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      return !error;
    } catch (_) {
      return false;
    }
  },

  /**
   * Buyurtmani o'chirish
   */
  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      return !error;
    } catch (_) {
      return false;
    }
  },
};
