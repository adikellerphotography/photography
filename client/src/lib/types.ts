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
  firstPhoto?: {
    imageUrl: string;
    thumbnailUrl?: string;
  };
}

export type TranslationKey = keyof typeof translations['en'];
export interface FacebookPost {
  imageId: number;
  webUrl: string;
  appUrl: string;
  category: string;
}

export interface ImageMapping {
  id: number;
  imagePath: string;
  category: string;
  facebookPost: FacebookPost;
}
