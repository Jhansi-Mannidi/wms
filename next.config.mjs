/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the dev server's HMR/dev-resource channel to be reached over the LAN.
  // Without this, opening the app on the network URL (e.g. http://192.168.x.x:3001)
  // gets its /_next/webpack-hmr requests blocked, React never hydrates, and every
  // button on every page silently does nothing.
  allowedDevOrigins: ['192.168.168.198', '*.local'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
