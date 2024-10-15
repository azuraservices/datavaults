export interface VintageItem {
  id: number;
  name: string;
  category: string;
  year: string;
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number;
  image: string;
  salePrice?: number;
  saleDate?: string;
  createdAt: number;
}
