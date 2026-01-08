const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const IMAGES_DIR = path.join(__dirname, "../public/images/homepage");
const MAX_WIDTH = 1920;
const QUALITY = 90;

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  teal: "\x1b[38;5;43m",
  gray1: "\x1b[38;5;245m",
  gray2: "\x1b[38;5;250m",
  white: "\x1b[38;5;255m",
  green: "\x1b[38;5;114m",
  yellow: "\x1b[38;5;221m",
  red: "\x1b[38;5;203m",
  gray: "\x1b[38;5;240m",
};

function printHeader() {
  console.log();
  console.log(c.teal + "  █ █▄ ▄█ ▄▀▀▄ ▄▀▀▀ █▀▀  " + c.gray1 + "▄▀▀▄ █▀▀▄ ▀█▀ ▀█▀ █▄ ▄█ ▀█▀ ▀▀█ █▀▀" + c.reset);
  console.log(c.teal + "  █ █ ▀ █ █▀▀█ █ ▀█ █▀▀  " + c.gray2 + "█  █ █▀▀   █   █  █ ▀ █  █  ▄▀  █▀▀" + c.reset);
  console.log(c.teal + "  █ █   █ █  █ ▀▀▀▀ ▀▀▀  " + c.white + "▀▀▀  █    ▀▀▀ ▀▀▀ █   █ ▀▀▀ ▀▀▀ ▀▀▀" + c.reset);
  console.log();
  console.log(c.dim + "  Convert images to WebP format with optimized quality" + c.reset);
  console.log(c.dim + "                          sienz" + c.reset);
  console.log();
}

async function optimizeImages() {
  printHeader();

  const files = fs.readdirSync(IMAGES_DIR);
  const imageFiles = files.filter((file) => /\.(jpg|jpeg|png)$/i.test(file));

  console.log(c.gray + "  ──────────────────────────────────────────────────────" + c.reset);
  console.log(c.dim + "  Target" + c.reset + "     " + c.white + "public/images/homepage/" + c.reset);
  console.log(c.dim + "  Images" + c.reset + "     " + c.white + `${imageFiles.length} files` + c.reset);
  console.log(c.dim + "  Settings" + c.reset + "   " + c.white + `${MAX_WIDTH}px max · ${QUALITY}% quality` + c.reset);
  console.log(c.gray + "  ──────────────────────────────────────────────────────" + c.reset);
  console.log();

  let totalSaved = 0;
  let successCount = 0;

  for (const file of imageFiles) {
    const inputPath = path.join(IMAGES_DIR, file);
    const outputName = file.replace(/\.(jpg|jpeg|png)$/i, ".webp");
    const outputPath = path.join(IMAGES_DIR, outputName);

    const inputStats = fs.statSync(inputPath);
    const inputSizeMB = (inputStats.size / 1024 / 1024).toFixed(2);

    try {
      await sharp(inputPath)
        .resize(MAX_WIDTH, null, {
          withoutEnlargement: true,
          fit: "inside",
        })
        .webp({ quality: QUALITY })
        .toFile(outputPath);

      const outputStats = fs.statSync(outputPath);
      const outputSizeKB = (outputStats.size / 1024).toFixed(0);
      const saved = inputStats.size - outputStats.size;
      totalSaved += saved;
      successCount++;
      const reduction = ((saved / inputStats.size) * 100).toFixed(0);

      console.log(
        c.green + "  ● " + c.reset +
        c.white + file.padEnd(24) + c.reset +
        c.dim + `${inputSizeMB} MB` + c.reset +
        c.gray + " → " + c.reset +
        c.yellow + `${outputSizeKB} KB` + c.reset +
        c.dim + `  -${reduction}%` + c.reset
      );
    } catch (error) {
      console.log(
        c.red + "  ✕ " + c.reset +
        c.white + file.padEnd(24) + c.reset +
        c.dim + error.message + c.reset
      );
    }
  }

  const totalSavedMB = (totalSaved / 1024 / 1024).toFixed(1);

  console.log();
  console.log(c.gray + "  ──────────────────────────────────────────────────────" + c.reset);
  console.log(
    c.dim + "  Completed" + c.reset + "  " +
    c.green + `${successCount}/${imageFiles.length} images` + c.reset +
    c.gray + "   " + c.reset +
    c.dim + "Saved" + c.reset + "  " +
    c.yellow + `${totalSavedMB} MB` + c.reset
  );
  console.log();
}

optimizeImages();
