# Image Optimization Scripts

This directory contains scripts to optimize images for better performance and SEO.

## 📦 Convert Images to WebP

The `optimize-images.js` script converts PNG, JPG, and JPEG images to WebP format with optimal compression.

### Usage

```bash
# Optimize all service images (recommended)
npm run optimize:services

# Optimize homepage images only
npm run optimize:homepage

# Optimize both homepage and services
npm run optimize:all

# Optimize all images in public/images/
npm run optimize:images
```

### What It Does

- ✅ Converts PNG/JPG/JPEG → WebP
- ✅ Resizes images to max 1920px width
- ✅ Applies 90% quality compression
- ✅ Recursively processes subdirectories
- ✅ Shows file size reduction for each image
- ✅ Keeps original files (creates .webp alongside)

### Example Output

```
  █ █▄ ▄█ ▄▀▀▄ ▄▀▀▀ █▀▀   ▄▀▀▄ █▀▀▄ ▀█▀ ▀█▀ █▄ ▄█ ▀█▀ ▀▀█ █▀▀
  █ █ ▀ █ █▀▀█ █ ▀█ █▀▀   █  █ █▀▀   █   █  █ ▀ █  █  ▄▀  █▀▀
  █ █   █ █  █ ▀▀▀▀ ▀▀▀   ▀▀▀  █    ▀▀▀ ▀▀▀ █   █ ▀▀▀ ▀▀▀ ▀▀▀

  Convert images to WebP format with optimized quality
                          sienz

  ──────────────────────────────────────────────────────
  Target     public/images/services/hero
  Images     8 files
  Settings   1920px max · 90% quality
  ──────────────────────────────────────────────────────

  ● ApplessWebPortal.png         1.2 MB → 345 KB  -71%
  ● AttendeeManagement.png       1.5 MB → 412 KB  -72%
  ● BusinessMatching.png         1.3 MB → 389 KB  -70%
  ● CheckInBadgePrinting.png     1.4 MB → 398 KB  -71%
  ● EventAnalytics.png           1.6 MB → 445 KB  -72%
  ● EventRegistration.png        1.5 MB → 421 KB  -72%
  ● ExhibitorManagement.png      1.4 MB → 402 KB  -71%
  ● LuckyDraw.png                1.3 MB → 378 KB  -71%

  ──────────────────────────────────────────────────────
  Completed  8/8 images   Saved  8.2 MB

```

### Benefits

- **70-75% smaller** file sizes
- **Faster page loads** = better SEO
- **Better Core Web Vitals** scores
- **Improved mobile performance**

## 🚀 After Converting

All service page image paths have already been updated to use `.webp` format:

- ✅ All 8 service hero images
- ✅ Lucky draw showcase images (wheel, slot, box)

Just run the script to convert the actual image files!

## 📝 Notes

- Original PNG/JPG files are **not deleted** automatically
- You can delete them manually after verifying WebP images work
- WebP is supported by **95%+ of browsers**
- Next.js Image component handles WebP optimization automatically

