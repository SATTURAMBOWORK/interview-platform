import { motion } from "framer-motion";

const Skeleton = ({ className }) => {
  return (
    <motion.div
      className={`bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 ${className}`}
      animate={{ backgroundPositionX: ["0%", "100%"] }}
      transition={{
        repeat: Infinity,
        duration: 1.2,
        ease: "linear",
      }}
      style={{
        backgroundSize: "200% 100%",
      }}
    />
  );
};

export default Skeleton;
