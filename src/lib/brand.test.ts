import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { APP_NAME, APP_TAGLINE } from "./brand.ts";

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) files.push(...walk(path));
    else if (/\.(tsx|ts|md)$/.test(entry)) files.push(path);
  }
  return files;
}

describe("rename", () => {
  it("uses B and S for the product name", () => {
    assert.equal(APP_NAME, "B and S");
    assert.equal(APP_TAGLINE, "Barbers and Salons");
  });

  it("does not leave the old public name or a processor wordmark in the product", () => {
    const retired = ["Hair", "Stylist"].join(" ");
    const wordmark = ["Squ", "are"].join("");
    const product = [...walk("src/components"), ...walk("src/routes"), "src/lib/brand.ts", "README.md"];
    const sources = walk("src").filter((file) => !file.endsWith(".test.ts"));
    const oldName = sources.filter((file) => readFileSync(file, "utf8").includes(retired));
    const branded = product.filter((file) => readFileSync(file, "utf8").includes(wordmark));
    assert.deepEqual(oldName, []);
    assert.deepEqual(branded, []);
  });
});
