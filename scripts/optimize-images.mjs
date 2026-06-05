import sharp from "sharp";
import { readdir, mkdir } from "fs/promises";
import { join, parse } from "path";
import fs from "fs";

const INPUT_DIR = "images-sources";
const OUTPUT_DIR = "public/images";

async function optimizeDir(subDir = "") {
  const currentInputDir = join(INPUT_DIR, subDir);
  const currentOutputDir = join(OUTPUT_DIR, subDir);

  // Ensure output dir exists
  await mkdir(currentOutputDir, { recursive: true });

  const entries = await readdir(currentInputDir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(subDir, entry.name);
    if (entry.isDirectory()) {
      await optimizeDir(entryPath);
    } else if (entry.isFile() && /\.jpe?g$/i.test(entry.name)) {
      const { name } = parse(entry.name);
      const inputPath = join(INPUT_DIR, entryPath);
      const outputPath = join(OUTPUT_DIR, join(subDir, `${name}.webp`));

      const img = sharp(inputPath);
      const metadata = await img.metadata();

      let pipeline = img;
      const longEdge = Math.max(metadata.width, metadata.height);

      if (longEdge > 2000) {
        const scale = 2000 / longEdge;
        const w = Math.round(metadata.width * scale);
        const h = Math.round(metadata.height * scale);
        pipeline = pipeline.resize(w, h);
      }

      await pipeline
        .webp({ quality: 100, effort: 6 })
        .toFile(outputPath);

      const orig = fs.statSync(inputPath).size;
      const opt = fs.statSync(outputPath).size;
      const pct = ((1 - opt / orig) * 100).toFixed(1);
      console.log(`${entryPath}: ${(orig / 1024).toFixed(0)}KB → ${(opt / 1024).toFixed(0)}KB (${pct}% saved)`);
    }
  }
}

async function main() {
  await optimizeDir();
}

main().catch(console.error);
