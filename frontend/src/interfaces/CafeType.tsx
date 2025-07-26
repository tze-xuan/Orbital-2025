export interface CafeType {
  cafeName: string;
  cafeLocation: string;
  id: number;
  lat?: string | number;
  lng?: string | number;
  relevanceScore?: number;
  avg_rating?: number;
  avg_price_per_pax?: number;
  opening_hours?: string; // to update to compulsory when updated
  review_count: number;
}
