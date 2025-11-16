// tailwind.config.js
export default {
  darkMode: "class", // penting! bukan 'media'
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // path Vite React
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Noto Sans", "Ubuntu", "Cantarell", "Helvetica Neue", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
