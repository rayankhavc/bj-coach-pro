/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        felt: {
          DEFAULT: '#0c3a2b',
          deep: '#062017',
          light: '#145741',
        },
        rail: '#221410',
        brass: {
          DEFAULT: '#c9a24b',
          dim: '#8f7434',
        },
        cream: {
          DEFAULT: '#f0e7d0',
          dim: '#b9ae92',
        },
        ink: '#20160a',
        card: '#faf6ea',
        suit: {
          red: '#b23a32',
          black: '#241f18',
        },
        ok: '#54b178',
        bad: '#d65c4e',
        dbl: '#5a93c9',
        spl: '#a07bd6',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      maxWidth: {
        app: '480px',
      },
      keyframes: {
        deal: {
          from: { transform: 'translateY(-14px) rotate(-3deg)', opacity: '0' },
          to: { transform: 'none', opacity: '1' },
        },
      },
      animation: {
        deal: 'deal 0.18s ease-out',
      },
    },
  },
  plugins: [],
}
