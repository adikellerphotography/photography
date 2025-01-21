import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { useIsMobile } from "@/hooks/use-mobile";

interface FacebookPost {
  imageId: number;
  webUrl: string;
  appUrl: string;
  category: string;
}

interface ImageMapping {
  id: number;
  imagePath: string;
  category: string;
  facebookPost: FacebookPost;
}

const useImageMapping = () => {
  const isMobile = useIsMobile();

  const getImagePath = (category: string, id: number) => {
    return `/assets/facebook_posts_image/${category}/${id}.jpg`;
  };

  const getFacebookUrl = (url: string) => {
    if (isMobile) {
      // Convert web URL to mobile app URL
      return url.replace('https://www.facebook.com/', 'fb://');
    }
    return url;
  };

  return { getImagePath, getFacebookUrl };
};

export default function Sessions() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { getImagePath, getFacebookUrl } = useImageMapping();
  const [selectedImage, setSelectedImage] = useState<ImageMapping | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleImageClick = (image: ImageMapping) => {
    const currentTime = Date.now();

    if (currentTime - lastClickTime < 300) {
      // Double click detected
      window.open(getFacebookUrl(image.facebookPost.webUrl), '_blank');
      setClickCount(0);
    } else {
      // Single click
      setSelectedImage(selectedImage?.id === image.id ? null : image);
    }

    setLastClickTime(currentTime);
  };

  const sessionGroups: any[] = [
  {
    name: "Bat Mitsva",
    links: [
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0AdZNygWpqm9eNFCZsUjZDvfmJb1v7Pt8dEwd1Qk6rXoD2pAdNyuqrjwHK5zyxxT1l", number: 1 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0Wv5Zw2GtAbd9n9cJJhSKYfnK9RKxkQwF4Nqm23uy4xC4ciwcDXoRkVVrKkrBvfWBl", number: 2 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid029Q8m9v24FnTLehCAzg7cgc4NAUoDTxdvvtuKFpSV18B5N9RJmadUVdrCcri8N2iFl", number: 3 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02pAYzLSW5XZsW9gkBMLWg7sSnDuVi1ESd958e1YD5h1u3Y9S1WviAfZXHzznd4zAwl", number: 4 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid032zVU11kqanfNEap8Q3iuJrbqo7zHzYY5dzFEb8yPJGR28csyd9H35Prn2vHR2h8Vl", number: 5 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid022Y4eqC1YMFya8idaR1mig9QBuWxJSn9mepr6eWdYA5vMoBLx42GKVVsTFBELR4wVl", number: 6 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid023g8ozZz6B2Fj4DhHmSCytg6u6sD2pSChkSx1S4cYxEUPBTXK7hCeEZvioMf49Fa1l", number: 7 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0igkZqu85Qa6o3iQwFwK6p2efGbpazYPZD8CXxVMm6HxxzRxuAA14Ztys8ZsBNX94l", number: 8 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0LfeZtfcVDEV2ZxxSCt1G4avHivUkkk89thqH9rT3ivSjDypgWHpbzF3V34ixKPgEl", number: 9 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02VC9hm89qSLXxxRNqDAdmwkdEiZgkXeVYZgkiJcG6MyoCVSUYQDW1qdHcs52JRLsfl", number: 10 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0AbV1GbY1N138PdEVes4CWAfQKZby4xJULmg5KLJYUN1zpmw7vs5yAhprL2TBmbkvl", number: 11 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid021Hf62pcxqcSWzZjsJ2UgZnz3TnjXTM4Xx6YtRTS1k1SS8bLQZxcjQDCCmHQhqQyrl", number: 12 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0RXdSHxLaGBm4RfgXhqYApXzdJQMEoyno9tykK2U4End79BTrdUTeGRcWebDrYGj4l", number: 13 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0HBAx8w5GRYa6z9ia97zvqeBhJCmuWjmT7ok35gWV9z9wJF4H2U8bn62B8nrzMN4l", number: 14 },
    ]
  },
  {
    name: "Horses",
    links: [
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02Lm7Ezp6A38F3EyYvEQaHPJhqK1bFoDzzCEM6rDhzonowES3Ssid4zvnncDj5ewnkl", number: 1 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0MUVxYr2uKdwKXyqMLqxWaFtQGBztiAdZLKKMSFnmni8ZWzScbL9S4o54aKmTFJfXl", number: 2 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0696LzKULgKHmEhjJL2NCyH57vi1b1TXasRHJ8iqbh2nvRu41SdpBFNmWFwMe8rayl", number: 3 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02pyqh6CJVWjSW7ahnXhHhSi2VU1h7wk3HZKrkD6GnXhuxxpCnXTWzxNXK8oE9MCRUl", number: 4 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0wXtiihgMfoKf4PwYDsR5N14ut9P85Q7FBnUDjyHcrGeZHatW9EsXeXzx1wu4vJ7Ql", number: 5 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0fSujz5LcmcmkihsBURYp51o1kqYiCRnkLREdCC86fMnfMVsbTbLTsUTfqqXUacL7l", number: 6 },
    ]
  },
  // ...rest of sessionGroups
];


  const categoryMappings: Record<string, string> = {
    'Kids': 'kids',
    'Bat Mitsva': 'bat_mitsva',
    'Bar Mitsva': 'bar_mitsva',
    'Family': 'family',
    'Big Family': 'big_family',
    'Horses': 'horses',
    'Modeling': 'modeling',
    'Feminine': 'feminine',
    'Sweet 16': 'sweet_16',
    'Purim': 'purim',
    'Pregnancy': 'pregnancy',
    'Yoga': 'yoga'
  };

  const [categoryGroups, setCategoryGroups] = useState({});

  useEffect(() => {
    const transformedGroups = {};
    sessionGroups.forEach(group => {
      const category = categoryMappings[group.name];
      transformedGroups[category] = group.links.map((link, index) => ({
        id: link.number,
        imagePath: getImagePath(category, link.number),
        category: category,
        facebookPost: {
          imageId: link.number,
          webUrl: link.url,
          appUrl: '', // Needs implementation based on app URL logic.
          category: category
        }
      }));
    });
    setCategoryGroups(transformedGroups);
  }, []);

  return (
    <div className="min-h-screen pt-8">
      <div className={`container mx-auto px-4 py-16 ${language === 'he' ? 'rtl' : 'ltr'}`}>
        <h1 className="text-3xl font-bold mb-8 text-[#FF9500]">
          {t("sessions.title")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gallery Section */}
          <div className="space-y-8">
            {Object.entries(categoryGroups).map(([category, images]) => (
              <div key={category} className="bg-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">
                  {t(`sessions.${category.replace('_', ' ')}`)}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <motion.div
                      key={image.id}
                      whileHover={{ scale: 1.05 }}
                      className="cursor-pointer"
                      onClick={() => handleImageClick(image)}
                    >
                      <img
                        src={image.imagePath}
                        alt={`${category} ${image.id}`}
                        className="w-full h-full object-cover rounded-lg"
                        loading="lazy"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Preview Section */}
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="lg:sticky lg:top-8 bg-background p-4 rounded-lg"
            >
              <img
                src={selectedImage.imagePath}
                alt={`Preview ${selectedImage.id}`}
                className="w-full h-auto rounded-lg"
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}