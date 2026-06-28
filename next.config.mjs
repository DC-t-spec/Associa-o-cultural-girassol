const repo = 'Associa-o-cultural-girassol';
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
const githubPagesPath = `/${repo}`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  ...(isGitHubPages
    ? {
        basePath: githubPagesPath,
        assetPrefix: `${githubPagesPath}/`,
      }
    : {}),
};

export default nextConfig;
