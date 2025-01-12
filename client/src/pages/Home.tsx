import { motion } from "framer-motion";
import PhotoGallery from "@/components/PhotoGallery";
import SocialLinks from "@/components/SocialLinks";

export default function Home() {
  return (
    <div className="min-h-screen pt-16">
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto text-center space-y-6"
        >
          <h1 className="text-4xl md:text-6xl font-bold">
            Capturing Life's Beautiful Moments
          </h1>
          <p className="text-lg text-muted-foreground">
            Professional photography services for all your special occasions
          </p>
          <SocialLinks />
        </motion.div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold mb-8">Featured Work</h2>
        <PhotoGallery />
      </section>
    </div>
  );
}
