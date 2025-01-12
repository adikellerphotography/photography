import { motion } from "framer-motion";
import SocialLinks from "@/components/SocialLinks";

export default function About() {
  return (
    <div className="min-h-screen pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">About Me</h1>
          
          <div className="prose prose-gray max-w-none">
            <p>
              Welcome to my photography world. I'm passionate about capturing life's precious moments
              and turning them into lasting memories.
            </p>
            
            <h2>My Approach</h2>
            <p>
              Every photo session is unique, and I strive to create a comfortable and enjoyable
              experience while capturing authentic moments that tell your story.
            </p>
            
            <h2>Experience</h2>
            <p>
              With years of experience in professional photography, I specialize in various styles
              including family portraits, events, and artistic photography.
            </p>
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
