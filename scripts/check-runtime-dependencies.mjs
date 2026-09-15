import { readdir, readFile } from "node:fs/promises";

const packagesDirectory = new URL("../packages/", import.meta.url);
const internalScope = "@typescript-calendar-lib/";
const packageDirectories = await readdir(packagesDirectory, {
  withFileTypes: true,
});
const violations = [];

for (const directory of packageDirectories) {
  if (!directory.isDirectory()) continue;

  const packagePath = new URL(
    `${directory.name}/package.json`,
    packagesDirectory,
  );
  const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
  const externalDependencies = Object.keys(
    packageJson.dependencies ?? {},
  ).filter((name) => !name.startsWith(internalScope));

  for (const dependency of externalDependencies) {
    violations.push(`${packageJson.name}: ${dependency}`);
  }
}

if (violations.length > 0) {
  console.error("External runtime dependencies are not allowed:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log(
    "Runtime dependencies are limited to internal workspace packages.",
  );
}
