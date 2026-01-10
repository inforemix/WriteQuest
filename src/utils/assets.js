// Helper function to get correct asset path for both local and production
export const getAssetPath = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Vite automatically sets BASE_URL based on vite.config.js base setting
  // In development: '/'
  // In production: same base as configured (default: '/')
  return `${import.meta.env.BASE_URL}${cleanPath}`;
};
