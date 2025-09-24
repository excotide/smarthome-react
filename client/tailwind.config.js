// tailwind.config.js
export default {
  darkMode: "class", // penting! bukan 'media'
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // path Vite React
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
