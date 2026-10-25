// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
module.exports = {
  // Static export for Cloudflare Workers (assets-only Worker serves ./out).
  output: 'export',
  images: {
    domains: ['rdl.ink'],
    // next/image optimization needs a server; with a static export the
    // images are served as-is.
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    config.module.rules.push({
      test: /\.md|\.mdx|\.webp$/,
      use: 'raw-loader',
    });

    return config;
  },
};
