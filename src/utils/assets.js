// Helper function to get correct asset path for both local and production
export const getAssetPath = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // In production, Vite will set BASE_URL to '/WriteAqua/'
  // In development, it will be '/'
  return `${import.meta.env.BASE_URL}${cleanPath}`;
};
