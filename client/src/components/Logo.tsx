import { motion } from "framer-motion";

export default function Logo() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center items-center my-8"
    >
      <h2 className="font-alex text-2xl md:text-3xl text-[#E67E00] tracking-wider">
        Adi Keller Photography
      </h2>
    </motion.div>
  );
}