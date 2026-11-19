export type UserRole = "SUPER_ADMIN" | "STORE_OWNER" | "CUSTOMER";

export type PaymentMethod = "PIX" | "CREDIT_CARD" | "BOLETO";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  phone?: string | null;
}

export interface StoreTheme {
  id: string;
  storeId: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  fontTitle: string;
  fontBody: string;
}

export interface HowToBuy {
  id: string;
  storeId: string;
  step: number;
  icon: string;
  title: string;
  subtitle: string;
}

export interface Category {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  createdAt?: string;
}

export interface Store {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  about?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  instagram?: string | null;
  whatsapp?: string | null;
  couponCode?: string | null;
  couponValue?: number | null;
  isActive: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  theme?: StoreTheme | null;
  howToBuy?: HowToBuy[];
  categories?: Category[];
}

export interface ProductVariation {
  id: string;
  productId: string;
  type: string;
  value: string;
  stock: number;
}

export interface Product {
  id: string;
  storeId: string;
  categoryId?: string | null;
  name: string;
  description?: string | null;
  price: number;
  comparePrice?: number | null;
  images: string[];
  isActive: boolean;
  stock: number;
  installments?: number | null;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  variations?: ProductVariation[];
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface OrderAddress {
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface OrderItem {
  id?: string;
  productId: string;
  quantity: number;
  price: number;
  variation?: string | null;
  product?: Product;
}

export interface Order {
  id: string;
  storeId: string;
  customerId?: string | null;
  status: OrderStatus;
  paymentMethod?: PaymentMethod | null;
  total: number;
  discount: number;
  couponCode?: string | null;
  notes?: string | null;
  whatsappSent: boolean;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  address?: OrderAddress | null;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface CreateOrderInput {
  storeSlug: string;
  items: Array<{
    productId: string;
    quantity: number;
    variation?: string;
  }>;
  couponCode?: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  address?: OrderAddress;
}
