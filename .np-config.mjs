export default {
  branch: "main",
  access: "public",
  registry: "https://registry.npmjs.org",
  // With Yarn Berry, `yarn npm publish` doesn't accept a directory argument.
  // Publish from the repo root and rely on `package.json#files` to include `dist/`.
};
