export interface Photo {
  id: number;
  title: string;
  description?: string;
  category: string;
  imageUrl: string;
  thumbnailUrl?: string;
  isLiked?: boolean;
  uploadedAt: Date;
  displayOrder: number;
  likesCount?: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  displayOrder: number;
  thumbnailImage?: string;
  firstPhoto?: {
    imageUrl: string;
    thumbnailUrl?: string;
  };
}

// This is used in conjunction with the translations defined in lib/translations.ts
export type TranslationKey = string;