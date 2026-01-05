/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 统一色系：基于图片中的四个颜色
        primary: {
          dark: '#1e3a5f',      // 深蓝色（最左边）
          DEFAULT: '#3b82c7',    // 中蓝色（第二个）
          light: '#06b6d4',      // 青绿色/青色（第三个）
          pale: '#a7d8e8',       // 浅青色/水色（最右边）
        },
      },
    },
  },
  plugins: [],
}

