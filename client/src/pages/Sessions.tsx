import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { ArrowUp, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SessionLink {
  url: string;
  number: number;
}

interface SessionGroup {
  name: string;
  links: SessionLink[];
}

const sessionGroups: SessionGroup[] = [
  {
    name: "Bat Mitzvah",
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
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02HBAx8w5GRYa6z9ia97zvqeBhJCmuWjmT7ok35gWV9z9wJF4H2U8bn62B8nrzMN4sl", number: 14 },
    ]
  },
  {
    name: "Bar Mitzvah",
    links: [
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02xdnAC3JMLTsdV5tkycYqmv2fxUbeXHZRhaJgi41QwCTf4FiiLECQ9WknNrvawnSMl", number: 1 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0ADeC9JEBXd6Xrgqk43sC6WxS6AnJmNizZgLgrtNymyhMrbK98eMxao6UpvYYXawfl", number: 2 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0MUVxYr2uKdwKXyqMLqxWaFtQGBztiAdZLKKMSFnmni8ZWzScbL9S4o54aKmTFJfXl", number: 3 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0283Pp9nrYuGhS1WMKGhrVnbM7cwz854rvJi5Vfgf54a3ZBVBxoQkYKfjPUj96qk2pl", number: 4 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0VPHrH231ZjhffkjT31Qx3u3H2db5oRNqgwfF3UtYFLeyiZbffacFTzruYeKP4wC9l", number: 5 },
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
    name: "Femininity",
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
];

const capitalizeWords = (str: string) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export default function Sessions() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    number: number;
    groupName: string;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Bat Mitzvah");
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToGroup = (groupName: string) => {
    const element = groupRefs.current[groupName];
    if (element) {
      const headerOffset = 160; // Increased offset to account for categories bar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      setSelectedCategory(groupName);
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageClick = (
    event: React.MouseEvent | React.TouchEvent,
    link: SessionLink,
    groupName: string,
  ) => {
    event.preventDefault();
    window.open(link.url, '_blank'); // Opens the Facebook link in a new tab
  };


  useEffect(() => {
    const handlePopState = () => {
      setIsDialogOpen(false);
      setSelectedImage(null);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background to-background/80 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`container mx-auto px-4 py-16 ${
          language === "he" ? "rtl" : "ltr"
        }`}
      >
        <h1 className="text-2xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#FF9500] to-[#FF5A00]">
          {t("sessions.title")}
        </h1>

        <nav className="sticky top-0 z-50 backdrop-blur-lg border-b mb-8 py-3 bg-background/60">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2">
              {sessionGroups.map((group) => (
                <Button
                  key={group.name}
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollToGroup(group.name)}
                  className={`rounded-full transition-all duration-300 ${
                    selectedCategory === group.name
                      ? "bg-[#FF9500] text-black font-medium hover:bg-[#FF9500]/90"
                      : "hover:bg-primary/10"
                  }`}
                >
                  {language === "he" ? t(`sessions.${group.name}`) : capitalizeWords(group.name)}
                </Button>
              ))}
            </div>
          </div>
        </nav>

        <div className="space-y-12">
          {sessionGroups.map((group) => (
            <motion.div
              key={group.name}
              ref={(el) => (groupRefs.current[group.name] = el)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10 overflow-hidden"
            >
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#FF9500] to-[#FF5A00]">
                    {language === "he"
                      ? t(`sessions.${group.name}`)
                      : capitalizeWords(group.name)}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={scrollToTop}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {group.links.map((link, index) => (
                    <motion.a
                      key={`${group.name}-${link.number}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-square cursor-pointer group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute inset-0 rounded-xl overflow-hidden bg-black/20">
                        <img
                          src={`/attached_assets/facebook_posts_image/${group.name.replace(/\s+/g, "_")}/${link.number}.jpg`}
                          alt={`${group.name} session ${link.number}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            const retryCount = Number(img.dataset.retryCount || 0);
                            const maxRetries = 3;
                            
                            if (retryCount < maxRetries) {
                              img.dataset.retryCount = String(retryCount + 1);
                              const baseUrl = window.location.origin;
                              const paths = [
                                `/attached_assets/facebook_posts_image/${group.name.replace(/\s+/g, "_")}/${link.number}.jpg`,
                                `${baseUrl}/attached_assets/facebook_posts_image/${group.name.replace(/\s+/g, "_")}/${link.number}.jpg`,
                                `/assets/facebook_posts_image/${group.name.replace(/\s+/g, "_")}/${link.number}.jpg`,
                                `${baseUrl}/assets/facebook_posts_image/${group.name.replace(/\s+/g, "_")}/${link.number}.jpg`
                              ];
                              setTimeout(() => {
                                img.src = paths[retryCount] + '?retry=' + Date.now();
                              }, Math.min(1000 * retryCount, 3000));
                            } else {
                              img.src = '/my_site_logo.png';
                              img.classList.add('opacity-50');
                            }
                          }}
                          onLoad={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.classList.remove('opacity-50');
                            delete img.dataset.retryCount;
                            img.style.opacity = '1';
                          }}
                          style={{
                            opacity: 0,
                            transition: 'opacity 0.3s ease-in-out',
                            backgroundColor: 'rgba(0,0,0,0.05)'
                          }}
                          loading={index < 8 ? "eager" : "lazy"}
                          decoding={index < 8 ? "sync" : "async"}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/90 backdrop-blur-lg">
          <AnimatePresence>
            {selectedImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-full h-full flex items-center justify-center p-4"
              >
                <motion.img
                  src={selectedImage.url}
                  alt={`${selectedImage.groupName} session ${selectedImage.number}`}
                  className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 20 }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 rounded-full bg-black/50 hover:bg-black/70"
                  onClick={() => setIsDialogOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      <motion.button
        className={`fixed bottom-6 right-6 p-3 rounded-full bg-[#FF9500] text-black shadow-lg transition-all ${
          scrollY > 200 ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
        onClick={scrollToTop}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ArrowUp className="h-5 w-5" />
      </motion.button>
    </div>
  );
}