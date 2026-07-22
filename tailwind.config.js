/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1F262E',      // Основной тёмный фон / шапка
          slate: '#455A78',     // Вторичный сине-серый
          soft: '#98B0D3',      // Мягкий голубой / акценты
          accent: '#EAB87C',    // Тёплый песчано-золотой / кнопки
          terracotta: '#8E583A' // Терракотовый / ховеры и важно
        }
      }
    },
  },
  plugins: [],
}