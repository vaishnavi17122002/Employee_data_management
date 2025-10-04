/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    // FIX: Changed from 'tailwindcss' to '@tailwindcss/postcss' 
    // This is the required plugin name for Tailwind CSS v4.x
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
