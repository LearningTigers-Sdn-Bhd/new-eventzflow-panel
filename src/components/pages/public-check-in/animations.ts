import type { Variants } from "framer-motion";

export const containerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.05, delayChildren: 0.1 },
	},
	exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const itemVariants: Variants = {
	hidden: { opacity: 0, y: 10 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { type: "spring", stiffness: 400, damping: 30 },
	},
};
