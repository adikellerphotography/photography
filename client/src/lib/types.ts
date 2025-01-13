export interface Photo {
  id: number;
  title: string;
  description?: string;
  category: string;
  imageUrl: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  displayOrder: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  displayOrder: number;
  thumbnailUrl?: string;
}

// This is used in conjunction with the translations defined in lib/translations.ts
export type TranslationKey = string;