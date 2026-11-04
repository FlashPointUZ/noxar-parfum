export type Department =
  | 'atirlar'
  | 'body-fragrance'
  | 'deodorants'
  | 'perfume-oils'
  | 'home-fragrance'
  | 'bath-shower'
  | 'accessories';

export type Gender = 'erkaklar' | 'ayollar' | 'unisex';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  amount: number;
  notes: string;
  categories: string[];
  department: Department;
  gender?: Gender;
  family: 'amber' | 'woody' | 'floral' | 'fresh';
  volume: string;
  rating: number;
  popularity: number;
  art: 'black-art' | 'cream-art' | 'rose-art' | string;
  badge?: string;
  discount?: number;
  top: string;
  heart: string;
  base: string;
  description: string;
  usage: string;
  features: string[];
  stock: number;
  image?: string;
  video?: string;
}

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: string;
  amount: number;
  art: string;
  image?: string;
  quantity: number;
  selectedVolume?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  amount: number;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  payment_method: 'cash' | 'card' | 'payme';
  payment_status: 'pending' | 'paid';
  order_status: 'processing' | 'delivered' | 'cancelled';
  shipping_method: 'standart' | 'express' | 'pickup';
  created_at?: string;
}

export interface Review {
  id: string;
  product_id: string;
  reviewer: string;
  rating: number;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface PromoCode {
  id?: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  percent?: number;
  minOrder?: number;
  expires?: string;
  limit?: number;
}
