import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/hooks/use-language";
import { SiFacebook } from "react-icons/si";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";

interface SessionLink {
  url: string;
  number: number;
}

interface SessionGroup {
  name: string;
  links: SessionLink[];
}

async function fetchImages(category: string): Promise<SessionLink[]> {
  const response = await fetch(`/api/sessions/${category}`);
  if (!response.ok) throw new Error('Failed to fetch images');
  return response.json();
}

const sessionGroups: SessionGroup[] = [
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
  {
    name: "Kids",
    links: [
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02Nwnu3uaiwq6ex2srEYMB7t5CegtPsWZDR4SqHrfSk6ieBsS98Ck4EbugqR3nAa7fl", number: 1 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0qg93Ny4PfyuBULd6nYLfZGT764V2YDH7ygTdL2JLpfhcLzNosVQuNwiFfYpftW1wl", number: 2 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid027UxY2N4PLSv9rzMZhjoACbHoZ2ZfiPtRSQZDDNkHNvZ4uALrwhX23hq2TJpE4VYfl", number: 3 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02fwxbmzqc8CjW3BBrg5va22MyQ1J8JT73eA4nZo6q4TNA5yWxxiXzAKsaKyGAcggQl", number: 4 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid023t3G9ttdCqMkg9z515ofwKnSXFxjzzTQaHJtRAzhn1VvR7VmzEWSj5fCSwBJiXXSl", number: 5 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid031tpdprkELq9rDTgSHso6CTPYmS2pTtXRyRUNsorBtCzK11aSdqRsrykcc8TLPpnkl", number: 6 },
    ]
  },
  {
    name: "Family",
    links: [
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0wd8m6RuYEUTkqFDd96s5iyhoXrpj5ig3e9zRgiAfzVFau1EyaWBpFjuAGuitxnX6l", number: 1 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0piDxpSGtBvrFWGZbPmo71ye9uq25AhyaT2Mwn2MR4riavuRS9UMUswcoYbNPei83l", number: 2 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0ekinYjEey9fzvANpDLsuWZcoa71UCaqpqTNLYQAZQP45kvYYPeGLJ2xReU8Pu4iil", number: 3 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid037orHnCjEWhAm9pPUSrAdGYsh6HS16gvNKKoMUa2wdXR8mjGWTHMPYRdAU1ZzisZAl", number: 4 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0jMrCtTKPmBshGx28yAj28CU5DPT9giv1HfKvNnK8hyWJdaxUrDrq9XRhmbxxjnjAl", number: 5 },
    ]
  },
  {
    name: "Big Family",
    links: [
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0stTjcLWgM9Qbkks3rYeWVhcPgWogPGPmSXtGCiXHWoP998EnuSapX2MFTuHDGgRal", number: 1 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid022g32LkTzHEYwrhq13Qv9GY82byWc6UCxyXdJX1RUC2vBvsLHjAmKxkZ63cJs4fPFl", number: 2 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0ytBnTdb6GznsuVir2CagsMMCoQN237uLzt4EtqzEpYWUafpwvi4YtaAU2TU8uT4Wl", number: 3 },
    ]
  },
  {
    name: "Sweet 16",
    links: [
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02tm8jm9owgKyvnif7niCSJY9Wmz2JaBV5BK55mwd3TDF9d83en8soatoUgXMAzL5sl", number: 1 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0ZiGmqTzjvDM5qUkm6jzojReM6YU1ipHB9mjTGCJeFvj9eqgzcTwTNBzgPku19Nql", number: 2 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0LH9kU9n1oiqrknNxaRYuzzXx6KaxcVVotgVTdvoAeovxoe3jdNgHMtfu62wY4GjFl", number: 3 },
    ]
  },
  {
    name: "Purim",
    links: [
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0hZE4AJHJPA4sXxhZ26NhdLCm2VQS91RT5b5yFzTQvZfeoaZ9CVoSWQxBJbb33Wadl", number: 1 },
    ]
  },
  {
    name: "Pregnancy",
    links: [
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02nmjh4TzrXw83g5V4iwrfG7FZCShHrC3UCK7Egb9JbjBB5tC3Pc9rezRptHkgJYf2l", number: 1 },
    ]
  },
  {
    name: "Feminine",
    links: [
      { url: "https://www.facebook.com/dalia.zvikler/posts/pfbid02waJ1fwPEfTadroXp2HYtqgruo4ucaZRQf9YexZDiXy36YGMWujErcx7rqkSpg9EFl", number: 1 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0GJcFw5tgBJxcEwmc1DF7wgoAQRkti5ibTr5eQYGNGEgXjKHxx7khJsmm1Shsy4p2l", number: 2 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0YP9u8uDKNCRjPp77FFHGaKukJrhHteo5VRuKPCMhvFZEc1BkS4U3zpfJssfS1STHl", number: 3 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02Yty5B1MdP1cLDi8FmYc3DjaN6AdUos3mXb6HqUHgNPM3vJ8JQiK6kUgPLoMgySmzl", number: 4 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02jvW4sq5quwNVNiPWu9ZgdqPMtFEXBx6auUiPDYRh8QLnD5RdQ2Ng9cTE6ajK3pETl", number: 5 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0q7A7mm8TJghcmzx5nALMBvqTL5tE9BYwY5W3jLCbw52YNCCTLBYjY7GVRtYHmj66l", number: 6 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0LvW3PTtwJsG5Wn3HuUYjiSTHCHbbFpDLBCWJgocm3fdAEZe6cGwLANEuREujYwb8l", number: 7 },
    ]
  },
  {
    name: "Yoga",
    links: [
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0Jz1q6iX56EC2GrS5UdLy4yx78FsMXTNa3zouW6VjqKNKZx8dj76ExhGargh6ZEAWl", number: 1 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0211iJ9ERsJBzKZ65EryzvgVxMqBr1TQe13MjNooMyfs1v9eok7dJnuK51WFDuxjkdl", number: 2 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02jCnQeQmwGzabGgHDPvY1jzAR3hHfcVw7f6YS8aCZbvt9kE8asVZ9n1j59mWnk2cRl", number: 3 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02RPmKG96dzBT6A1JByg5yHh9BrtZBMdDyTyAvmkEFaV2hzAEVnWQSKWZAkQyE1HgFl", number: 4 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02qPsDJnLukcsKha1Buq3tYiyeR8BadaWFDw21XhP3t4bhorZwShmxsk5nf5ENa6Jtl", number: 5 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0WAHZRkdFtfj6ZFiW4rkTGWsX4jkwCiFcrn45YeQKGHfKXpJfTP2SZyJUGUR5tGKal", number: 6 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid027axv5WZzQ2hgVZLQqK1ST4aFKWBs33EGLpcTBmEHggEvHStbshq2ShUCTAY52zSPl", number: 7 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0Me11RF4CFaUKbSQ5W9K5RyAx8gAmBYyFUrZPhKHZ2Erdg2NDcVwP8bVR69PFXotHl", number: 8 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02nHZUJBH11yejgdNQB2VyxCuzjnqYhFfnCjwbQM3YiC68dYBqkSkcFsKS7gKFNPZSl", number: 9 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0YzeWYmW565icpJ3672rfMQSTss6qyVkqg62cDQ1gyyNbVn8fokwKmy4rDCdm5918l", number: 10 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02A7k618aBxw81FCHRZRc2wvsL7VU2LyJuZ61iMpi1F8NKz1ePRCxqmDV4tVZ3QXtBl", number: 11 },
    ]
  },
  {
    name: "Modeling",
    links: [
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0wR7zz8tL7QgnyTrvCaLeEV6DC1obhxQECXukNRfPpD3LN4FUXAKhQPUqgBweXYa4l", number: 1 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02FiXxTs9vwENBvpemXFrP3CtrB9uezNBfDwQJ9wf718Np19Q7zNgWNX1a5dv89p9sl", number: 2 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid037PVmR1RVV5NEVAw3fB5uCF5ChRvkebiiZMtEtGMxSnBphV1BcLubqRRkYDEtk9ocl", number: 3 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02FLoTHXxnC1BXDwgmVgq2M51aWruyAYAGmD9DdKSh3KgigsKCCpYtuZsX8dZnRYX6l", number: 4 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0WQbN1Y8qMBDcGwVVErv87ydMq2qBuDMY1QWAcrtzSfZdcVRrx81cr6LrMM4HmQ2zl", number: 5 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0378Rg2GuhDCxdJ2TtaNhmtgsRiH3hZ8obejJsFKs8hVGFGDfMqw4WhCA5yhqQ7TKjl", number: 6 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0aT4qTRuriTmHNfLYceWubeLYYbHwFQkR7P7Q8hrJCrViXeWJCjLNGauFcLdKSGqNl", number: 7 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02QP1XK73tXW2MHiQvncaUgHmPvA9y1P29S87P2eKXwgjPABowUAFtE9atbDTXi8xul", number: 8 },
    ]
  },
  {
    name: "Bar Mitsva",
    links: [
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02xdnAC3JMLTsdV5tkycYqmv2fxUbeXHZRhaJgi41QwCTf4FiiLECQ9WknNrvawnSMl", number: 1 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0ADeC9JEBXd6Xrgqk43sC6WxS6AnJmNizZgLgrtNymyhMrbK98eMxao6UpvYYXawfl", number: 2 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0MUVxYr2uKdwKXyqMLqxWaFtQGBztiAdZLKKMSFnmni8ZWzScbL9S4o54aKmTFJfXl", number: 3 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0283Pp9nrYuGhS1WMKGhrVnbM7cwz854rvJi5Vfgf54a3ZBVBxoQkYKfjPUj96qk2pl", number: 4 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0VPHrH231ZjhffkjT31Qx3u3H2db5oRNqgwfF3UtYFLeyiZbffacFTzruYeKP4wC9l", number: 5 },
    ]
  }
];

const capitalizeWords = (str: string) => {
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const categoryMappings: Record<string, string> = {
  'kids': 'attached_assets/facebook_posts_image/kids',
  'Bat Mitsva': 'attached_assets/facebook_posts_image/bat_mitsva',
  'Family': 'attached_assets/facebook_posts_image/family',
  'Horses': 'attached_assets/facebook_posts_image/horses',
  'Modeling': 'attached_assets/facebook_posts_image/modeling',
  'Women': 'attached_assets/facebook_posts_image/feminine',
  'Yoga': 'attached_assets/facebook_posts_image/yoga'
};

export default function MySessions() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<{ url: string; number: number; groupName: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const clickTimer = useRef<number>(0);
  const [groups, setGroups] = useState<SessionGroup[]>([]);

  useEffect(() => {
    async function loadImages() {
      const categories = ['Bat_Mitsva', 'Family', 'Horses', 'Kids', 'Modeling', 'Women', 'Yoga'];
      const loadedGroups = await Promise.all(
        categories.map(async (category) => {
          try {
            const images = await fetchImages(category);
            return {
              name: category.replace('_', ' '),
              links: images
            };
          } catch (error) {
            console.error(`Error loading ${category} images:`, error);
            return null;
          }
        })
      );
      setGroups(loadedGroups.filter((g): g is SessionGroup => g !== null));
    }
    loadImages();
  }, []);

  const getFacebookUrl = (url: string) => {
    if (isMobile) {
      const postId = url.split('/posts/')[1];
      // For iOS
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        return `fb://post/${postId}`;
      }
      // For Android
      if (/Android/.test(navigator.userAgent)) {
        return `fb://facewebmodal/f?href=${encodeURIComponent(url)}`;
      }
    }
    return url;
  };

  const handleImageClick = (event: React.MouseEvent | React.TouchEvent, link: SessionLink, groupName: string) => {
    event.preventDefault();
    const now = Date.now();

    if (clickTimer.current && (now - clickTimer.current) < 300) {
      // Double click/tap detected
      if (isMobile) {
        window.open(link.url, '_blank', 'noopener,noreferrer');
      } else {
        window.open(link.url, '_blank', 'noopener,noreferrer');
      }
      clickTimer.current = 0;
    } else {
      // Single click/tap behavior
      if (clickTimer.current === 0) {
        clickTimer.current = now;
        setTimeout(() => {
          if (clickTimer.current !== 0) {
            setSelectedImage({ 
              url: `/assets/${categoryMappings[groupName] || groupName.toLowerCase().replace(' ', '_')}/${String(link.number).padStart(3, '0')}.jpeg`,
              number: link.number, 
              groupName 
            });
            setIsDialogOpen(true);
          }
          clickTimer.current = 0;
        }, 300);
      }
    }
  };

  return (
    <div className="min-h-screen pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`container mx-auto px-4 py-16 ${language === 'he' ? 'rtl text-right' : 'ltr text-left'}`}
      >
        <h1 className="text-3xl font-bold mb-4 text-[#FF9500]">
          {t("sessions.title")}
        </h1>
        <div className={`flex items-center gap-2 mb-8 ${language === 'he' ? 'justify-end' : ''}`}>
          <SiFacebook className="text-[#1877F2] w-6 h-6 animate-pulse" />
          <span className="text-foreground font-semibold">{t("sessions.description")}</span>
        </div>
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.name} className={`bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-white/30 ${language === 'he' ? 'rtl' : 'ltr'}`}>
              <div className="mb-4">
                <h2 className="text-2xl font-semibold">{language === 'he' ? t(`sessions.${group.name}`) : capitalizeWords(group.name)}</h2>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {group.links.map((link, idx) => {
                  const shouldLoad = idx < 3 || document.visibilityState === 'visible';
                  return (
                    <div
                      key={link.url}
                      className="relative cursor-pointer"
                      onClick={(e) => handleImageClick(e, link, group.name)}
                    >
                    <motion.div
                      className="relative aspect-square w-full overflow-hidden rounded-lg"
                      transition={{ duration: 0.2 }}
                    >
                      {["Bat Mitsva", "Bar Mitsva", "Horses", "Kids", "Family", "Big Family", "Sweet 16", "Purim", "Pregnancy", "Feminine", "Yoga", "Modeling"].includes(group.name) ? (
                        <>
                          <div className="absolute inset-0 animate-pulse bg-muted duration-200 transition-opacity" 
                               style={{ animationDuration: '0.8s' }} />
                          <img 
                            src={shouldLoad ? `/assets/${categoryMappings[group.name] || group.name.toLowerCase().replace(' ', '_')}/${String(link.number).padStart(3, '0')}.jpeg${isMobile ? '?no_watermark=true' : ''}?nocache=${Date.now()}` : ''}
                            data-src={`/assets/${categoryMappings[group.name] || group.name.toLowerCase().replace(' ', '_')}/${String(link.number).padStart(3, '0')}.jpeg${isMobile ? '?no_watermark=true' : ''}?nocache=${Date.now()}`}
                            alt={`${group.name} session ${link.number}`}
                            className="w-full h-full object-cover relative z-10 transition-opacity duration-200"
                            loading="lazy"
                            onLoad={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.opacity = '1';
                              target.previousElementSibling?.remove();
                            }}
                            style={{ opacity: 0 }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.backgroundColor = 'rgba(0, 0, 0, 0.03)';
                            }}
                          />
                        </>
                      ) : (
                        <div 
                          className="w-full h-full rounded-lg"
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.03)'
                          }}
                        />
                      )}
                    </motion.div>
                  </div>
                );
              })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] !p-0 border-none bg-transparent shadow-none" onInteractOutside={() => setIsDialogOpen(false)}>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative w-full h-full flex items-center justify-center"
              onClick={() => setIsDialogOpen(false)}
            >
              <img
                src={selectedImage.url}
                alt={`${selectedImage.groupName} session ${selectedImage.number}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}