module.exports = {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',

    [
      '@semantic-release/changelog',
      {
        changelogTitle: `# Changelog\n`,
        changelogFile: 'CHANGELOG.md',
      },
    ],

    // deploy the function
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'yarn deploy',
      },
    ],

    '@semantic-release/git',

    // publish the release to github with assets
    '@semantic-release/github',
  ],
};
