import { motion } from "framer-motion";
import SocialLinks from "@/components/SocialLinks";
import { useTranslation } from "@/hooks/use-translation";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="max-w-3xl mx-auto">
          {/* Portrait Image Section */}
          <div className="mb-12 w-full max-w-[280px] mx-auto">
            <AspectRatio ratio={1}>
              <div className="relative w-full h-full overflow-hidden rounded-full border-4 border-background shadow-xl">
                <img
                  src="/assets/IMG_1133.jpg"
                  alt=""
                  className="object-cover w-full h-full"
                />
              </div>
            </AspectRatio>
          </div>

          <h1 className="text-3xl font-bold mb-8">About Me</h1>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <div>
              <p className="text-lg leading-relaxed">
                Welcome to my photography world. I'm passionate about capturing life's precious moments 
                and turning them into lasting memories. Since 2018, I've dedicated myself to professional 
                photography, creating timeless images that speak to the heart.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">My Approach</h2>
              <p className="text-lg leading-relaxed">
                Every photo session is unique, and I strive to create a comfortable and enjoyable experience. 
                I meticulously prepare for each session, bringing tailored posing ideas designed to reveal 
                your authentic personality. My sessions are conducted exclusively outdoors, utilizing natural 
                light to create soft, flattering photographs that capture genuine moments and tell your 
                personal story.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Style</h2>
              <p className="text-lg leading-relaxed">
                My photography style is clean, classic, and elegantly sophisticated. I believe in the power 
                of simplicity and timelessness, creating images that will be cherished for generations. 
                Attention to detail is paramount – from the subtle play of light and shadow to the careful 
                composition of each shot. I focus on revealing the essence of each subject through carefully 
                crafted, emotionally resonant imagery.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Experience</h2>
              <p className="text-lg leading-relaxed">
                With professional experience since 2018, I specialize in various photographic styles 
                including family portraits, events, and artistic photography. My years of expertise have 
                refined my ability to create stunning visual narratives that capture the depth and beauty 
                of human experiences. Each session is an opportunity to transform fleeting moments into 
                lasting, meaningful memories.
              </p>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Connect With Me</h2>
            <SocialLinks />
          </div>
        </div>
      </motion.div>
    </div>
  );
}