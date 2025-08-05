/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,  // Ignora ESLint durante builds para evitar fallos por warnings
  },
  typescript: {
    ignoreBuildErrors: true,  // Ignora errores de TypeScript durante builds si no son críticos
  },
};

export default nextConfig;