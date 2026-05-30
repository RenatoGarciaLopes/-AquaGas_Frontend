import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { it, expect, describe } from "vitest";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();

function projectFiles() {
  return execFileSync("rg", ["--files", "src"], {
    cwd: ROOT,
    encoding: "utf8",
  })
    .trim()
    .split("\n")
    .filter((file) => /\.(ts|tsx)$/.test(file));
}

function featureName(file: string) {
  const match = file.match(/^src\/features\/([^/]+)\//);
  return match?.[1] ?? null;
}

function imports(file: string) {
  const content = readFileSync(join(ROOT, file), "utf8");
  return Array.from(
    content.matchAll(/from\s+["']@\/features\/([^/"']+)\//g),
    (match) => match[1],
  );
}

describe("architecture import boundaries", () => {
  it("features não importam outras features", () => {
    const violations = projectFiles().flatMap((file) => {
      const owner = featureName(file);
      if (!owner) return [];
      return imports(file)
        .filter((target) => target !== owner)
        .map((target) => `${relative(ROOT, join(ROOT, file))} -> ${target}`);
    });

    expect(violations).toEqual([]);
  });

  it("shared não depende de features, exceto bridges de auth já existentes", () => {
    const allowed = new Set([
      "src/shared/hooks/use-has-role.ts",
      "src/shared/providers/auth-provider.tsx",
      "src/shared/ui/topbar-client.tsx",
    ]);

    const violations = projectFiles()
      .filter((file) => file.startsWith("src/shared/"))
      .filter((file) => !allowed.has(file))
      .flatMap((file) =>
        imports(file).map((target) => `${file} -> features/${target}`),
      );

    expect(violations).toEqual([]);
  });
});
