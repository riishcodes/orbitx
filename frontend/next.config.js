if (process.env.VERCEL === '1') {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl || !/^https:\/\//.test(apiUrl) || /\/\/(localhost|127\.0\.0\.1)([:/]|$)/.test(apiUrl)) {
        throw new Error('Set NEXT_PUBLIC_API_URL to the public HTTPS Render API URL before building on Vercel.')
    }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    poweredByHeader: false,
    compiler: {
        removeConsole: process.env.NODE_ENV === "production",
    },
    images: {
        domains: ['api.dicebear.com', 'avatars.githubusercontent.com'],
        unoptimized: true,
    },
    async redirects() {
        return [
            { source: '/profile/:slug', destination: '/profile?slug=:slug', permanent: false },
        ]
    },
    async headers() {
        return [{
            source: '/:path*',
            headers: [
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                { key: 'X-Frame-Options', value: 'DENY' },
            ],
        }]
    },
}

module.exports = nextConfig
