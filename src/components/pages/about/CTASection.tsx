"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SMOOTH_EASE } from "@/lib/constants/animation";

export default function CTASection() {
	return (
		<section className="bg-white px-6 py-24 md:py-32">
			<div className="mx-auto max-w-4xl text-center">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8, ease: SMOOTH_EASE }}
				>
					<p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-black/40">
						Let's Connect
					</p>
					<h2 className="mb-6 font-black text-3xl uppercase tracking-tighter text-black sm:text-4xl md:text-5xl lg:text-6xl">
						Want to learn more?
					</h2>
					<p className="mb-10 text-lg text-black/70 max-w-2xl mx-auto leading-relaxed md:text-xl">
						Whether you're planning your first event or managing many, we'd
						love to hear from you. No pressure, no sales pitch—just real
						conversation.
					</p>

					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<a
							href="https://wa.me/60177268130"
							target="_blank"
							rel="noopener noreferrer"
							className="w-full sm:w-auto border border-black bg-white px-8 py-4 text-center text-xs font-bold tracking-widest text-black transition-all duration-300 hover:bg-[#23c460] hover:border-[#23c460] hover:text-white"
						>
							CHAT ON WHATSAPP
						</a>
						<Link
							href="/contact"
							className="w-full sm:w-auto border border-black bg-black px-8 py-4 text-center text-xs font-bold tracking-widest text-white transition-all duration-300 hover:bg-[#2766ec] hover:border-[#2766ec]"
						>
							CONTACT US
						</Link>
					</div>

					<div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-base text-black/60 md:gap-8">
						<span className="flex items-center gap-2">
							<span className="text-black">✓</span> Real humans respond
						</span>
						<span className="hidden h-1 w-1 rounded-full bg-black/30 md:block" />
						<span className="flex items-center gap-2">
							<span className="text-black">✓</span> No pushy sales tactics
						</span>
						<span className="hidden h-1 w-1 rounded-full bg-black/30 md:block" />
						<span className="flex items-center gap-2">
							<span className="text-black">✓</span> Quick & friendly replies
						</span>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
