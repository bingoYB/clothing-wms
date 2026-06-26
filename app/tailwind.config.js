/** Tailwind CSS 配置 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1440px' },
    },
    extend: {
      fontFamily: {
        // 数据表格与正文的极致可读性字体
        sans: ['Inter', 'system-ui', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        // 赋予大标题/数字排版的 Editorial 时尚气质
        display: ['Georgia', 'Playfair Display', 'Times New Roman', 'serif'], 
      },
      colors: {
        // 极简纯黑作为主品牌色/强调色
        brand: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#000000', // 主操作按钮色
          600: '#000000',
          700: '#000000',
          800: '#000000',
          900: '#000000',
        },
        // 纯净的无极灰
        ink: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5', // Hairline 边框色
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
      },
      boxShadow: {
        // 移除复杂的阴影，替换为极简的悬浮反馈
        hover: '0 10px 30px -10px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
