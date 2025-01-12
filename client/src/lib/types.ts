export interface Photo {
  id: number;
  title: string;
  description?: string;
  category: string;
  imageUrl: string;
  uploadedAt: Date;
  displayOrder: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  displayOrder: number;
}
