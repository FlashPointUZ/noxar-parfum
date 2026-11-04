export type Department =
  | 'atirlar'
  | 'body-fragrance'
  | 'deodorants'
  | 'perfume-oils'
  | 'home-fragrance'
  | 'bath-shower'
  | 'accessories'
  | 'gift-sets'
  | string;

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
  family: 'amber' | 'woody' | 'floral' | 'fresh' | string;
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
  active?: boolean;
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
  order_number?: string;
  customer_name: string;
  phone?: string;
  customer_phone?: string;
  address?: string;
  customer_address?: string;
  items?: OrderItem[];
  total: number;
  payment_method?: 'cash' | 'card' | 'payme' | string;
  payment_status?: 'pending' | 'paid';
  order_status?: 'pending' | 'processing' | 'delivered' | 'cancelled' | string;
  status?: string;
  shipping_method?: 'standart' | 'express' | 'pickup' | string;
  delivery_method?: string;
  created_at?: string;
}

export interface Review {
  id: string;
  product_id: string;
  reviewer?: string;
  customer_name?: string;
  rating: number;
  text?: string;
  review_text?: string;
  status: 'pending' | 'approved' | 'rejected' | string;
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

export interface SiteContent {
  announcement: {
    text: string;
    active: boolean;
  };
  hero: {
    badge: string;
    title_line1: string;
    title_highlight: string;
    title_line2: string;
    subtitle: string;
    cta_primary: string;
    cta_secondary: string;
    image_url?: string;
  };
  new_collection: {
    badge: string;
    title: string;
    title_highlight: string;
    link_text: string;
  };
  catalog: {
    badge: string;
    title: string;
    title_highlight: string;
    subtitle: string;
  };
  brand_story: {
    badge: string;
    title: string;
    title_highlight: string;
    title_line2: string;
    description: string;
    city_country: string;
    card_title: string;
    showroom_name: string;
    showroom_address: string;
    maps_url: string;
  };
  testimonials: {
    badge: string;
    title: string;
    title_highlight: string;
    subtitle: string;
  };
  contacts: {
    phone: string;
    telegram: string;
    instagram: string;
    footer_slogan: string;
    showroom_address: string;
  };
}
