import { motion } from "framer-motion";
import clsx from "clsx";
import { spacing, layout, borders, cn } from "../styles/spacing.js";

const ItemLayout = ({ children, className }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      whileInView={{ scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className={clsx(
        "custom-bg",
        spacing.card.padding,
        borders.rounded.xl,
        layout.flex.center,
        "space-y-8",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default ItemLayout;
