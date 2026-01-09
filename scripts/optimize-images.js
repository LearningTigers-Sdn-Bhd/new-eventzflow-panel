const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

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

async function optimizeDirectory(dirPath, displayName) {
  if (!fs.existsSync(dirPath)) {
    console.log(c.red + "  ✕ Directory not found: " + displayName + c.reset);
    console.log();
    return { success: 0, total: 0, saved: 0 };
  }

  const files = fs.readdirSync(dirPath);
  const imageFiles = files.filter((file) => /\.(jpg|jpeg|png)$/i.test(file));

  if (imageFiles.length === 0) {
    console.log(c.dim + "  No images to optimize in " + displayName + c.reset);
    console.log();
    return { success: 0, total: 0, saved: 0 };
  }

  console.log(c.gray + "  ──────────────────────────────────────────────────────" + c.reset);
  console.log(c.dim + "  Target" + c.reset + "     " + c.white + displayName + c.reset);
  console.log(c.dim + "  Images" + c.reset + "     " + c.white + `${imageFiles.length} files` + c.reset);
  console.log(c.dim + "  Settings" + c.reset + "   " + c.white + `${MAX_WIDTH}px max · ${QUALITY}% quality` + c.reset);
  console.log(c.gray + "  ──────────────────────────────────────────────────────" + c.reset);
  console.log();

  let totalSaved = 0;
  let successCount = 0;

  for (const file of imageFiles) {
    const inputPath = path.join(dirPath, file);
    const outputName = file.replace(/\.(jpg|jpeg|png)$/i, ".webp");
    const outputPath = path.join(dirPath, outputName);

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
        c.white + file.padEnd(30) + c.reset +
        c.dim + `${inputSizeMB} MB` + c.reset +
        c.gray + " → " + c.reset +
        c.yellow + `${outputSizeKB} KB` + c.reset +
        c.dim + `  -${reduction}%` + c.reset
      );
    } catch (error) {
      console.log(
        c.red + "  ✕ " + c.reset +
        c.white + file.padEnd(30) + c.reset +
        c.dim + error.message + c.reset
      );
    }
  }

  console.log();
  return { success: successCount, total: imageFiles.length, saved: totalSaved };
}

async function optimizeImagesRecursive(basePath, displayBase) {
  const entries = fs.readdirSync(basePath, { withFileTypes: true });
  let totalSuccess = 0;
  let totalFiles = 0;
  let totalSaved = 0;

  // First, optimize images in current directory
  const result = await optimizeDirectory(basePath, displayBase);
  totalSuccess += result.success;
  totalFiles += result.total;
  totalSaved += result.saved;

  // Then recursively process subdirectories
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subPath = path.join(basePath, entry.name);
      const subDisplay = `${displayBase}/${entry.name}`;
      const subResult = await optimizeImagesRecursive(subPath, subDisplay);
      totalSuccess += subResult.success;
      totalFiles += subResult.total;
      totalSaved += subResult.saved;
    }
  }

  return { success: totalSuccess, total: totalFiles, saved: totalSaved };
}

async function main() {
  printHeader();

  // Get target directory from command line argument
  const targetArg = process.argv[2];
  
  let directories = [];
  
  if (targetArg === 'services') {
    directories = [
      {
        path: path.join(__dirname, "../public/images/services"),
        name: "public/images/services"
      }
    ];
  } else if (targetArg === 'homepage') {
    directories = [
      {
        path: path.join(__dirname, "../public/images/homepage"),
        name: "public/images/homepage"
      }
    ];
  } else if (targetArg === 'all') {
    directories = [
      {
        path: path.join(__dirname, "../public/images/homepage"),
        name: "public/images/homepage"
      },
      {
        path: path.join(__dirname, "../public/images/services"),
        name: "public/images/services"
      }
    ];
  } else {
    // Default: optimize all images
    directories = [
      {
        path: path.join(__dirname, "../public/images"),
        name: "public/images"
      }
    ];
  }

  let grandTotalSuccess = 0;
  let grandTotalFiles = 0;
  let grandTotalSaved = 0;

  for (const dir of directories) {
    const result = await optimizeImagesRecursive(dir.path, dir.name);
    grandTotalSuccess += result.success;
    grandTotalFiles += result.total;
    grandTotalSaved += result.saved;
  }

  const totalSavedMB = (grandTotalSaved / 1024 / 1024).toFixed(1);

  console.log(c.gray + "  ──────────────────────────────────────────────────────" + c.reset);
  console.log(
    c.dim + "  Completed" + c.reset + "  " +
    c.green + `${grandTotalSuccess}/${grandTotalFiles} images` + c.reset +
    c.gray + "   " + c.reset +
    c.dim + "Saved" + c.reset + "  " +
    c.yellow + `${totalSavedMB} MB` + c.reset
  );
  console.log();
}

main();
