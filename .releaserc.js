module.exports = {
  branches: [
    {
      name: 'main',
      prerelease: 'alpha'
    }
  ],
  repositoryUrl: 'https://github.com/tidusjar/OctoBar.git',
  tagFormat: 'v${version}',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
        tarballDir: 'dist'
      }
    ],
    '@semantic-release/github'
  ]
};
