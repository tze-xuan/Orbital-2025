export interface CafeType {
  cafeName: string;
  cafeLocation: string;
  id: number;
  lat?: string | number;
  lng?: string | number;
  relevanceScore?: number;
  averageRating: number;
  reviewCount: number;
}
