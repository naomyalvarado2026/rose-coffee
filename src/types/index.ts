export type UserRole = 'admin' | 'customer' | 'editor' | 'staff';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  email?: string | null;
  permissions_override?: Record<string, { view: boolean; edit: boolean }> | null;
  photo_url?: string | null;
  created_at: string;
  updated_at: string;
  banned?: boolean;
}

export type ProductType = 'physical' | 'digital';
export type OrderStatus = 'pending_payment' | 'paid' | 'ready_for_pickup' | 'completed' | 'cancelled';

export interface ProductVariant {
  id: string;
  product_id: string;
  color_name: string | null;
  color_hex: string | null;
  size: string | null;
  cloudinary_image_url: string | null;
  stock: number;
  price_adjustment: number;
  created_at?: string;
}

export interface ProductDigitalAsset {
  id: string;
  product_id: string;
  drive_link: string;
  instructions: string | null;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  category: string;
  type?: ProductType;
  features?: any; // JSONB array of features/specs
  cover_image_url?: string | null;
  deleted_at?: string | null;
  ar_model_url?: string | null;
  ar_poster_url?: string | null;
  ar_enabled?: boolean;
  ar_experience_id?: string | null;
  stock_min?: number;
  created_at: string;
  product_variants?: ProductVariant[];
  product_digital_assets?: ProductDigitalAsset | null;
  product_ar_models?: ProductARModel | ProductARModel[] | null;
}

export interface Order {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  total: number;
  status: OrderStatus;
  payment_method?: string;
  payment_voucher_url?: string | null;
  notes?: string;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  price: number;
  products?: Product;
  product_variants?: ProductVariant | null;
}

export interface FormResponse {
  id: string;
  block_id: string;
  page_id: string;
  user_id: string | null;
  member_name: string | null;
  member_email: string | null;
  answers: Record<string, any>;
  score: number;
  max_score: number;
  created_at: string;
}

export interface CloudinaryAsset {
  public_id: string;
  secure_url: string;
  resource_type: 'image' | 'video' | 'raw';
  format: string;
}

export type LogoVariant = 'cuadrado' | 'circular' | 'vertical' | 'horizontal';
export type LogoColorMode = 'color' | 'blanco_y_negro' | 'blanco_solido' | 'negro_solido';

export interface Logo {
  id: string;
  variant: LogoVariant;
  color_mode: LogoColorMode;
  format: string;
  storage_path: string;
  created_at: string;
}

export interface ProductARModel {
  id: string;
  product_id: string;
  glb_url: string;
  usdz_url?: string | null;
  ar_scale?: 'fixed' | 'auto';
  shadow_intensity?: number;
  xr_environment?: boolean;
  auto_rotate?: boolean;
  camera_controls?: boolean;
  hotspots?: ARHotspot[];
  video_url?: string | null;
  video_target_material?: string | null;
  created_at: string;
}

export interface ARHotspot {
  id: string;
  position: string; // "x y z"
  normal: string; // "x y z"
  label: string;
  type: 'info' | 'price' | 'allergen';
}

export interface ARTarget {
  id: string;
  name: string;
  mind_file_url: string;
  description?: string | null;
  created_at: string;
}

export interface ARTargetMapping {
  id: string;
  target_id: string;
  target_index: number;
  product_id?: string | null;
  video_url?: string | null;
  video_chromakey?: boolean;
  created_at: string;
}

export type ARExperienceType = 'MODEL_3D' | 'VIDEO_AR' | 'MIXED_EXPERIENCE';
export type ARExperienceCategory = 'PRODUCT' | 'VIDEO' | 'ANIMATION';

export interface ARExperience {
  id: string;
  name: string;
  type: ARExperienceType;
  category: ARExperienceCategory;
  preview_image?: string | null;
  model_url?: string | null;
  video_url?: string | null;
  scale?: { x: number; y: number; z: number } | null;
  position?: { x: number; y: number; z: number } | null;
  rotation?: string | null;
  animation_settings?: Record<string, any> | null;
  enabled?: boolean;
  product_id?: string | null;
  views_count?: number;
  interaction_count?: number;
  purchase_clicks_count?: number;
  created_at: string;
}

