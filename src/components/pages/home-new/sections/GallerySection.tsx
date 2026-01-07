"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const smoothEase = [0.25, 0.46, 0.45, 0.94];

const galleryImages = [
  {
    src: "/images/homepage/Gallery1.jpg",
    alt: "EventzFlow in action - Event check-in",
  },
  {
    src: "/images/homepage/Gallery2.jpg",
    alt: "EventzFlow in action - Conference networking",
  },
  {
    src: "/images/homepage/Gallery3.jpg",
    alt: "EventzFlow in action - Exhibition booth",
  },
];

const GallerySection: React.FC = () => {
  return (
    <section className="bg-black px-6 py-24 md:py-32 lg:px-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: smoothEase }}
          className="mb-16"
        >
          <h2 className="font-black text-5xl uppercase tracking-tighter text-white md:text-6xl lg:text-7xl">
            See EventzFlow
            <br />
            In Action
          </h2>
          <p className="mt-4 text-sm text-white/50 md:text-base">
            Real events, real results. Here&apos;s a glimpse of what we do.
          </p>
        </motion.div>

        {/* Gallery Grid - Staggered Layout */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.src}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: index * 0.15,
                ease: smoothEase,
              }}
              className={`group relative overflow-hidden ${
                index === 1 ? "md:mt-24 md:h-[500px]" : "md:h-[400px]"
              } h-[300px]`}
            >
              {/* Image number badge */}
              <div className="absolute left-4 top-4 z-10 text-xs font-medium text-white/60">
                0{index + 1}
              </div>

              {/* Image */}
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
