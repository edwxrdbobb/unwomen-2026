import { readdir, writeFile } from "fs/promises";
import { join, extname, basename } from "path";
import { fileURLToPath } from "url";
import { execFile } from "child_process";
import { promisify } from "util";

const exec = promisify(execFile);

const CLOUD_NAME = "dd0qjs0t3";
const UPLOAD_PRESET = "unwomen_unsigned";
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const IMAGE_DIR = join(__dirname, "../public/wetransfer_a9c83146c06826d69cc5583f581b4b85-jpg_2026-05-29_1901");
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

async function getImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getImages(fullPath)));
    } else if (IMAGE_EXTS.has(extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

async function uploadFile(filePath, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { stdout } = await exec("curl", [
        "-s",
        "-X", "POST",
        "-F", `file=@${filePath}`,
        "-F", `upload_preset=${UPLOAD_PRESET}`,
        "-F", "folder=unwomen/products",
        UPLOAD_URL,
      ], { maxBuffer: 10 * 1024 * 1024 });

      const data = JSON.parse(stdout);
      if (data.error) throw new Error(data.error.message);
      return data.secure_url;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

async function main() {
  const images = await getImages(IMAGE_DIR);
  console.log(`Found ${images.length} images. Uploading to Cloudinary...\n`);

  const results = [];
  let done = 0;
  let failed = 0;

  for (const filePath of images) {
    try {
      const url = await uploadFile(filePath);
      results.push({ file: basename(filePath), url });
      done++;
      console.log(`[${done + failed}/${images.length}] OK  ${url}`);
    } catch (err) {
      failed++;
      console.error(`[${done + failed}/${images.length}] FAIL  ${basename(filePath)}: ${err.message}`);
      results.push({ file: basename(filePath), url: null, error: err.message });
    }
  }

  const outPath = join(__dirname, "../cloudinary-upload-results.json");
  await writeFile(outPath, JSON.stringify(results, null, 2));

  console.log(`\nDone: ${done} uploaded, ${failed} failed.`);
  console.log(`Results saved to cloudinary-upload-results.json`);
}

main().catch(console.error);
