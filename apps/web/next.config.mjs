/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	transpilePackages: ['@exec/shared', '@exec/db', '@exec/jobs', '@exec/ai'],
	experimental: {
		typedRoutes: true,
	},
};

export default nextConfig;
