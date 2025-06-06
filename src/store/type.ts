export interface ProductType {
  id: string; // Unique identifier for the product
  title: string;
  description: string;
  price: number;
  condition: "new" | "used";
  category: string;
  location: string;
  currency: string;
  created_at: string;
  updated_at: string;
  likeCount: number;
  commentCount: number;
  images: Array<{ image: string; alt_text: string | null }>;
}
export interface Location {
  id: number;
  region: string;
  district: string;
}

export interface Comment {
  service_id?: number;
  id: number;
  user: User;
  text: string;
  created_at: string;
}

export interface Image {
  id?: number;
  image: string;
  alt_text: string | null;
}

export interface UserInfo {
  result: boolean;
  data: User;
}
export interface User {
  id: number;
  username: string;
  phone_number: string;
  user_type: string;
  location: Location;
  profile_image: {
    image: string;
    alt_text: string | null | "";
  };
  is_active: boolean;
}

export interface Category {
  id: number;
  key: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  icon: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  category: Category;
  likeCount: number;
  location: Location;
  comments: Comment[];
  images: Image[];
  userName: User;
  created_at: string;
  updated_at: string;
}

export interface ServiceResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Service[];
}

interface ProductImage {
  id?: number;
  image: string;
  alt_text: string | null;
}
export interface Category {
  id: number;
  key: string;
  name_uz: string;
  name_en: string;
  name_ru: string;
}
export interface UserLocation {
  id: number;
  region: string;
  district: string;
}
export interface Region {
  region: string;
  districts: string[];
}
export interface AllLocationList {
  success: boolean;
  regions: Region[];
}
export interface RegionsList {
  success: boolean;
  regions: { region: string }[];
}
export interface DistrictsList {
  success: boolean;
  districts: { district: string; id: number }[];
}
export interface ProductResponse {
  count: number;
  next: string;
  previous: string;
  results: Product[];
}
export interface SingleService {
  success: boolean;
  service: Service;
  recommended_services: Service[];
}
export interface SingleProduct {
  success: boolean;
  product: Product;
  recommended_products: Product[];
}
export interface Product {
  id: number;
  title: string;
  description: string;
  category: Category;
  location: UserLocation;
  condition?: string;
  created_at: string;
  price: string;
  currency: string;
  in_stock: boolean;
  rating: string;
  images: ProductImage[];
  likeCount: number;
  commentCount: number;
  userName: User;
  userAddress: string | null;
}

export interface SingleProductProps {
  product: Product;
}

export type RootStackParamList = {
  Home: undefined; // No parameters for the Home screen
  ProductDetail: { product: Product }; // 'product' is passed as a parameter to ProductDetail
  // Add more screens and their respective params here
};

export interface LoginInfo {
  phone_number: string;
  password: string;
}
export interface LocationInfo {
  country: string | null;
  region: string | null;
  district: string | null;
}
export interface RegisterInfo {
  username: string;
  phone_number: string;
  password: string;
  user_type: string;
  location_id: number;
}
