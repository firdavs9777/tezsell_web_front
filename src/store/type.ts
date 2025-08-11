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
  location_id?: number;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  property_type:
    | "apartment"
    | "house"
    | "townhouse"
    | "villa"
    | "commercial"
    | "office"
    | "land"
    | "warehouse";
  listing_type: "sale" | "rent";
  owner: number;
  agent?: number;
  user_location?: number;
  address: string;
  district: string;
  city: string;
  region: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  square_meters: number;
  floor?: number;
  total_floors?: number;
  year_built?: number;
  parking_spaces: number;
  price: number;
  price_per_sqm?: number;
  currency: string;
  has_balcony: boolean;
  has_garage: boolean;
  has_garden: boolean;
  has_pool: boolean;
  has_elevator: boolean;
  is_furnished: boolean;
  metro_distance?: number;
  school_distance?: number;
  hospital_distance?: number;
  shopping_distance?: number;
  is_active: boolean;
  is_featured: boolean;
  is_sold: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface RealEstateAgent {
  id: number;
  user: User;
  agency_name: string;
  licence_number: string;
  is_verified: boolean;
  rating: number;
  total_sales: number;
  years_experience: number;
  specialization: string;
  created_at: string;
  verified_at?: string;
  verified_by?: number;
  rejection_reason?: string;
  rejected_at?: string;
  rejected_by?: number;
}

export interface PropertyInquiry {
  id: number;
  property: string;
  user: number;
  inquiry_type: "viewing" | "info" | "offer" | "callback";
  message: string;
  preferred_contact_time?: string;
  offered_price?: number;
  is_responded: boolean;
  created_at: string;
}

export interface BecomeAgentRequest {
  agency_name: string;
  licence_number: string;
  years_experience: number;
  specialization: string;
  token?: string;
}

export interface BecomeAgentResponse {
  id: number;
  user: number;
  agency_name: string;
  licence_number: string;
  is_verified: boolean;
  rating: number;
  total_sales: number;
  years_experience: number;
  specialization: string;
  created_at: string;
  message?: string;
}

export interface AgentStatus {
  is_agent: boolean;
  agent_id?: number;
  is_verified?: boolean;
  application_status?: "pending" | "approved" | "rejected";
  rejection_reason?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapStatistics {
  total_properties: number;
  avg_price: number;
  price_range: {
    min: number;
    max: number;
  };
  property_types: Array<{
    type: string;
    count: number;
  }>;
}

export interface LocationChoices {
  districts: Array<{ value: string; label: string }>;
  cities: Array<{ value: string; label: string }>;
  regions: Array<{ value: string; label: string }>;
}

export interface PropertyStats {
  total_properties: number;
  total_for_sale: number;
  total_for_rent: number;
  avg_price_sale: number;
  avg_price_rent: number;
  most_popular_district: string;
  recent_properties_count: number;
}

export interface GetPropertiesQueryParams {
  page?: number;
  limit?: number;
  property_type?: string;
  listing_type?: string;
  min_price?: number;
  max_price?: number;
  district?: string;
  city?: string;
  bedrooms?: number;
  bathrooms?: number;
  search?: string;
}

export interface GetAgentsQueryParams {
  page?: number;
  limit?: number;
  is_verified?: boolean;
  specialization?: string;
  min_rating?: number;
  search?: string;
  ordering?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}
