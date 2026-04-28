/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	transpilePackages: ['@exec/shared', '@exec/db', '@exec/jobs'],
	experimental: {
		typedRoutes: true,
	},
};

export default nextConfig;
