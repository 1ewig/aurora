import sharp from "sharp";
import { readdir, mkdir } from "fs/promises";
import { join, parse } from "path";

const INPUT_DIR = "public/images";
const OUTPUT_DIR = "public/images";

async function main() {
  const files = await readdir(INPUT_DIR);
  const jpegs = files.filter((f) => /\.jpe?g$/i.test(f));

  for (const file of jpegs) {
    const { name } = parse(file);
    const inputPath = join(INPUT_DIR, file);
    const outputPath = join(OUTPUT_DIR, `${name}.webp`);

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

    const { size: orig } = await import("fs").then((f) =>
      f.promises.stat(inputPath)
    );
    const { size: opt } = await import("fs").then((f) =>
      f.promises.stat(outputPath)
    );
    const pct = ((1 - opt / orig) * 100).toFixed(1);
    console.log(`${file}: ${(orig / 1024).toFixed(0)}KB → ${(opt / 1024).toFixed(0)}KB (${pct}% saved)`);
  }
}

main().catch(console.error);
