/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            { hostname: 'localhost' },
            { hostname: '*.up.railway.app' },
            { hostname: '*.vercel.app' },
        ],
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    },
};

export default nextConfig;