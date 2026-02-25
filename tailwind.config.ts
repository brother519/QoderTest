import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        border: 'hsl(var(--border))',
        // 俄罗斯方块颜色
        tetris: {
          i: 'hsl(var(--tetris-i))',
          o: 'hsl(var(--tetris-o))',
          t: 'hsl(var(--tetris-t))',
          s: 'hsl(var(--tetris-s))',
          z: 'hsl(var(--tetris-z))',
          j: 'hsl(var(--tetris-j))',
          l: 'hsl(var(--tetris-l))',
        }
      },
      boxShadow: {
        'neon': '0 0 5px var(--neon-glow), 0 0 20px var(--neon-glow)',
        'neon-strong': '0 0 10px var(--neon-glow), 0 0 40px var(--neon-glow), 0 0 80px var(--neon-glow)',
        'cell': 'inset 2px 2px 4px rgba(255,255,255,0.2), inset -2px -2px 4px rgba(0,0,0,0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'line-clear': 'lineClear 0.3s ease-out forwards',
        'drop': 'drop 0.1s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px var(--neon-glow), 0 0 10px var(--neon-glow)' },
          '100%': { boxShadow: '0 0 10px var(--neon-glow), 0 0 30px var(--neon-glow), 0 0 50px var(--neon-glow)' },
        },
        lineClear: {
          '0%': { transform: 'scaleX(1)', opacity: '1' },
          '50%': { transform: 'scaleX(1.1)', opacity: '0.8' },
          '100%': { transform: 'scaleX(0)', opacity: '0' },
        },
        drop: {
          '0%': { transform: 'translateY(-10px)', opacity: '0.5' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      fontFamily: {
        'game': ['Orbitron', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
