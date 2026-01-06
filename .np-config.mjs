export default {
  access: "public",
  // With Yarn Berry, `yarn npm publish` doesn't accept a directory argument.
  // Publish from the repo root and rely on `package.json#files` to include `dist/`.
};
