/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["res.cloudinary.com"], // ✅ Allow Cloudinary images
    },
};

export default nextConfig;
