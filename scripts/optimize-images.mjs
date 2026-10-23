/**
 * optimize-images.mjs
 * ===================
 *
 * Sharp-based WebP image preprocessing script.
 * Modular CLI utility to convert JPG/PNG images to WebP.
 *
 * Usage:
 *   bun scripts/optimize-images.mjs [inputDirOrFile] [outputDir]
 *   bun scripts/optimize-images.mjs -i <path> -o <path> [-q 100] [-m 2000]
 *
 * Examples:
 *   bun scripts/optimize-images.mjs
 *   bun scripts/optimize-images.mjs raw-photos public/images
 *   bun scripts/optimize-images.mjs photo.png public/images
 *   bun scripts/optimize-images.mjs -i assets/banner.jpg -o public/images/banner.webp --quality 90
 */

import sharp from "sharp";
import { readdir, mkdir } from "fs/promises";
import { join, parse, resolve } from "path";
import fs from "fs";

export const DEFAULT_INPUT = "images-sources";
export const DEFAULT_OUTPUT = "public/images";
export const DEFAULT_QUALITY = 100;
export const DEFAULT_MAX_SIZE = 2000;

const IMAGE_EXTENSIONS_REGEX = /\.(jpe?g|png)$/i;

/**
 * Optimizes a single image file to WebP.
 *
 * @param {string} inputFilePath - Path to source image (jpg/png)
 * @param {string} outputFilePath - Destination path for .webp file
 * @param {object} [options]
 * @param {number} [options.quality=100] - WebP quality (1-100)
 * @param {number} [options.maxSize=2000] - Max long-edge dimension in pixels
 * @returns {Promise<{inputPath: string, outputPath: string, originalSize: number, optimizedSize: number}>}
 */
export async function optimizeImage(inputFilePath, outputFilePath, options = {}) {
  const { quality = DEFAULT_QUALITY, maxSize = DEFAULT_MAX_SIZE } = options;

  const img = sharp(inputFilePath);
  const metadata = await img.metadata();

  let pipeline = img;
  const longEdge = Math.max(metadata.width || 0, metadata.height || 0);

  if (longEdge > maxSize) {
    const scale = maxSize / longEdge;
    const w = Math.round((metadata.width || 0) * scale);
    const h = Math.round((metadata.height || 0) * scale);
    pipeline = pipeline.resize(w, h);
  }

  // Ensure target folder exists
  const targetDir = parse(outputFilePath).dir;
  if (targetDir) {
    await mkdir(targetDir, { recursive: true });
  }

  await pipeline
    .webp({ quality, effort: 6 })
    .toFile(outputFilePath);

  const originalSize = fs.statSync(inputFilePath).size;
  const optimizedSize = fs.statSync(outputFilePath).size;

  return {
    inputPath: inputFilePath,
    outputPath: outputFilePath,
    originalSize,
    optimizedSize,
  };
}

/**
 * Recursively scans and optimizes all JPG/PNG images in a directory.
 *
 * @param {string} inputDir - Root input directory
 * @param {string} outputDir - Root output directory
 * @param {object} [options]
 * @param {string} [subDir=""] - Internal recursion subdirectory
 * @returns {Promise<{processed: number, totalOriginal: number, totalOptimized: number}>}
 */
export async function optimizeDirectory(inputDir, outputDir, options = {}, subDir = "") {
  const currentInputDir = join(inputDir, subDir);
  const currentOutputDir = join(outputDir, subDir);

  await mkdir(currentOutputDir, { recursive: true });

  const entries = await readdir(currentInputDir, { withFileTypes: true });
  const stats = { processed: 0, totalOriginal: 0, totalOptimized: 0 };

  for (const entry of entries) {
    const entryPath = join(subDir, entry.name);
    if (entry.isDirectory()) {
      const subStats = await optimizeDirectory(inputDir, outputDir, options, entryPath);
      stats.processed += subStats.processed;
      stats.totalOriginal += subStats.totalOriginal;
      stats.totalOptimized += subStats.totalOptimized;
    } else if (entry.isFile() && IMAGE_EXTENSIONS_REGEX.test(entry.name)) {
      const { name } = parse(entry.name);
      const inputPath = join(inputDir, entryPath);
      const outputPath = join(outputDir, join(subDir, `${name}.webp`));

      const result = await optimizeImage(inputPath, outputPath, options);
      stats.processed += 1;
      stats.totalOriginal += result.originalSize;
      stats.totalOptimized += result.optimizedSize;

      const pct = ((1 - result.optimizedSize / result.originalSize) * 100).toFixed(1);
      console.log(
        `${entryPath}: ${(result.originalSize / 1024).toFixed(0)}KB → ${(result.optimizedSize / 1024).toFixed(0)}KB (${pct}% saved)`
      );
    }
  }

  return stats;
}

/**
 * Parses CLI arguments.
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    input: null,
    output: null,
    quality: DEFAULT_QUALITY,
    maxSize: DEFAULT_MAX_SIZE,
    help: false,
  };

  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-h" || arg === "--help") {
      parsed.help = true;
    } else if (arg === "-i" || arg === "--input") {
      parsed.input = args[++i];
    } else if (arg === "-o" || arg === "--output") {
      parsed.output = args[++i];
    } else if (arg === "-q" || arg === "--quality") {
      parsed.quality = parseInt(args[++i], 10) || DEFAULT_QUALITY;
    } else if (arg === "-m" || arg === "--max-size") {
      parsed.maxSize = parseInt(args[++i], 10) || DEFAULT_MAX_SIZE;
    } else if (!arg.startsWith("-")) {
      positional.push(arg);
    }
  }

  if (!parsed.input && positional.length > 0) {
    parsed.input = positional[0];
  }
  if (!parsed.output && positional.length > 1) {
    parsed.output = positional[1];
  }

  parsed.input = parsed.input || DEFAULT_INPUT;
  parsed.output = parsed.output || DEFAULT_OUTPUT;

  return parsed;
}

function printUsage() {
  console.log(`
Usage:
  bun scripts/optimize-images.mjs [inputDirOrFile] [outputDir]
  bun scripts/optimize-images.mjs -i <path> -o <path> [options]

Options:
  -i, --input <path>      Input directory or image file (default: "${DEFAULT_INPUT}")
  -o, --output <path>     Output directory or .webp file (default: "${DEFAULT_OUTPUT}")
  -q, --quality <num>     WebP quality 1-100 (default: ${DEFAULT_QUALITY})
  -m, --max-size <num>    Max edge dimension in pixels (default: ${DEFAULT_MAX_SIZE})
  -h, --help              Show this help message
`);
}

async function main() {
  const { input, output, quality, maxSize, help } = parseArgs();

  if (help) {
    printUsage();
    return;
  }

  if (!fs.existsSync(input)) {
    console.warn(`⚠️  Input path "${input}" does not exist.`);
    console.log(`Provide an input directory or image file:`);
    printUsage();
    return;
  }

  const stat = fs.statSync(input);
  const options = { quality, maxSize };

  console.log(`Starting image optimization:`);
  console.log(`  Source:  ${input}`);
  console.log(`  Target:  ${output}`);
  console.log(`  Quality: ${quality}, Max long-edge: ${maxSize}px\n`);

  if (stat.isDirectory()) {
    const stats = await optimizeDirectory(input, output, options);
    if (stats.processed === 0) {
      console.log(`No JPG/PNG images found in "${input}".`);
    } else {
      const totalPct = ((1 - stats.totalOptimized / stats.totalOriginal) * 100).toFixed(1);
      console.log(
        `\n✨ Optimized ${stats.processed} images: ${(stats.totalOriginal / 1024 / 1024).toFixed(1)}MB → ${(stats.totalOptimized / 1024 / 1024).toFixed(1)}MB (${totalPct}% saved)`
      );
    }
  } else if (stat.isFile()) {
    if (!IMAGE_EXTENSIONS_REGEX.test(input)) {
      console.error(`Error: "${input}" is not a supported image file (.jpg, .jpeg, .png).`);
      process.exit(1);
    }

    let targetFile;
    if (output.toLowerCase().endsWith(".webp")) {
      targetFile = output;
    } else {
      const { name } = parse(input);
      targetFile = join(output, `${name}.webp`);
    }

    const res = await optimizeImage(input, targetFile, options);
    const pct = ((1 - res.optimizedSize / res.originalSize) * 100).toFixed(1);
    console.log(
      `✨ ${input} → ${res.outputPath}: ${(res.originalSize / 1024).toFixed(0)}KB → ${(res.optimizedSize / 1024).toFixed(0)}KB (${pct}% saved)`
    );
  }
}

// Run only if executed directly
const isDirectExecution =
  Boolean(import.meta.main) ||
  (Boolean(process.argv[1]) && resolve(process.argv[1]) === resolve(import.meta.filename || ""));

if (isDirectExecution) {
  main().catch((err) => {
    console.error("Image optimization failed:", err);
    process.exit(1);
  });
}
