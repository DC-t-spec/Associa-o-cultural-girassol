const repoName = 'Associa-o-cultural-girassol';
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
const githubPagesPath = `/${repoName}`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  ...(isGitHubPages
    ? {
        basePath: githubPagesPath,
        assetPrefix: `${githubPagesPath}/`,
      }
    : {}),
};

export default nextConfig;
