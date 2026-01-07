export default {
  git: {
    commitMessage: "release: v${version}",
    tagName: "v${version}",
    requireCleanWorkingDir: true,
    requireUpstream: true,
  },
  github: {
    release: true,
  },
  npm: {
    publish: true,
  },
  hooks: {
    "before:init": ["yarn prettier . --check", "yarn tsc --noEmit"],
    "after:bump": "yarn build",
  },
};
