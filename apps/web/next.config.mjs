/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	transpilePackages: ['@exec/shared', '@exec/db'],
	experimental: {
		typedRoutes: true,
	},
};

export default nextConfig;
