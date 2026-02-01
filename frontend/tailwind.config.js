/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        proxmox: {
          orange: '#E57000',
          blue: '#0081C6',
          dark: '#1F2937',
        },
      },
    },
  },
  plugins: [],
}