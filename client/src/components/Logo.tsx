import { motion } from "framer-motion";

export default function Logo() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center items-center my-8"
    >
      <h2 className="font-logo text-4xl md:text-5xl text-[#C0C0C0] tracking-wider">
        Adi Keller Photography
      </h2>
    </motion.div>
  );
}