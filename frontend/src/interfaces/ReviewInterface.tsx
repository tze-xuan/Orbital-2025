export interface Review {
  id: number;
  rating: number;
  comment: string;
  avgPricePerPax: number | null;
  created_at: string;
  username: string;
}