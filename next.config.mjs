/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GITHUB_SECRET_KEY: process.env.GITHUB_TOKEN,
    OPENAI_SECRET_KEY: process.env.OPENAI_API_KEY,
  },
}
export default nextConfig;
