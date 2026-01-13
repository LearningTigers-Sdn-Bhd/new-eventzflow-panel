"use client";

import { motion } from "framer-motion";
import { ArrowUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResourcesListEnd() {
	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className="w-full bg-black py-16 text-white md:py-20">
			<motion.div
				initial={{ opacity: 0, y: 50 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
				className="container mx-auto flex flex-col items-center justify-between gap-10 px-4 md:flex-row md:px-8 lg:max-w-7xl"
			>
				<div className="flex flex-row items-center justify-center gap-6 md:justify-start">
					<div className="flex shrink-0 items-center justify-center">
						<CheckCircle className="size-16 text-white md:size-20 lg:size-24" />
					</div>
					<div className="flex flex-col items-start justify-start">
						<h3 className="font-black text-3xl text-white uppercase tracking-tighter md:text-4xl lg:text-5xl">
							All Content Loaded
						</h3>
						<p className="ps-1 text-base text-stone-400 tracking-tight lg:text-lg">
							You've reached the end of the list.
						</p>
					</div>
				</div>

				<Button
					onClick={scrollToTop}
					className="group h-14 shrink-0 cursor-pointer rounded-none border border-white bg-transparent px-8 font-bold text-lg text-white uppercase tracking-tighter transition-colors hover:bg-white hover:text-black"
				>
					Back to Top
					<div className="ml-3 overflow-hidden">
						<ArrowUp className="size-5 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0" />
					</div>
				</Button>
			</motion.div>
		</div>
	);
}
