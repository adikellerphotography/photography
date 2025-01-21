
import { ImageMapping } from './types';

export const facebookMapping: ImageMapping[] = [
  {
    id: 1,
    imagePath: '/assets/facebook_posts_image/bat_mitsva/1.jpg',
    category: 'bat_mitsva',
    facebookPost: {
      imageId: 1,
      webUrl: 'https://www.facebook.com/adi.keller.16/posts/pfbid0AdZNygWpqm9eNFCZsUjZDvfmJb1v7Pt8dEwd1Qk6rXoD2pAdNyuqrjwHK5zyxxT1l',
      appUrl: 'fb://post/pfbid0AdZNygWpqm9eNFCZsUjZDvfmJb1v7Pt8dEwd1Qk6rXoD2pAdNyuqrjwHK5zyxxT1l',
      category: 'bat_mitsva'
    }
  },
  // Add all other mappings following the same structure
];

export const getCategoryImages = (category: string) => {
  return facebookMapping.filter(mapping => mapping.category === category);
};
