const r2Hostname = process.env.R2_PUBLIC_URL
  ? (() => {
      try {
        return new URL(process.env.R2_PUBLIC_URL).hostname;
      } catch {
        return undefined;
      }
    })()
  : undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
