

export interface ProductType {
  id: string;  // Unique identifier for the product
  title: string;
  description: string;
  price: number;
  condition: 'new' | 'used';
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
  id: number;
  user: number;
  text: string;
  created_at: string;
}

export interface Image {
  image: string;
  alt_text: string | null;
}

export interface User {
  id: number;
  username: string;
  phone_number: string;
  user_type: string;
  location: Location;
  is_active: boolean;
}

export interface Category {
  id: number;
  key: string;
  name: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  category: Category;
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
  image: string;
  alt_text: string | null;
}
export interface Category {
  id: number,
  key: string,
  name: string
}
export interface UserLocation {
  id: number;
  region: string;
  district: string;
}
interface Region {
  region: string;
  districts: string[];
}
export interface AllLocationList {
  success: boolean,
  regions: Region[]
}
export interface RegionsList {
  success: boolean,
  regions:{ region: string } []
}
export interface DistrictsList {
  success: boolean,
  districts:{ district: string } []
}
export interface ProductResponse {
  count: number,
  next: string,
  previous: string,
  results: Product[]
}
export interface Product {
  id: number;
  title: string;
  description: string;
  category: Category;
  location: UserLocation;
  created_at: string;
  price: number;
  currency: string;
  in_stock: boolean;
  rating: number;
  images: ProductImage[];
  likeCount: number;
  commentCount: number;
  userName: string;
  userAddress: string;
}

export interface SingleProductProps {
  product: Product;
}

export type RootStackParamList = {
  Home: undefined; // No parameters for the Home screen
  ProductDetail: { product: Product }; // 'product' is passed as a parameter to ProductDetail
  // Add more screens and their respective params here
};