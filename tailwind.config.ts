import type { Config } from "tailwindcss";

// all in fixtures is set to tailwind v3 as interims solutions

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			// Angel主题颜色
  			'angel-primary': '#8B5CF6',
  			'angel-secondary': '#EC4899',
  			'angel-accent': '#06B6D4',
  			'angel-gold': '#F59E0B',
  			'angel-gold-light': '#FCD34D'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'float': {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-20px)'
  				}
  			},
  			'float-delayed': {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-15px)'
  				}
  			},
  			'float-slow': {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-10px)'
  				}
  			},
  			'glow': {
  				'0%, 100%': {
  					boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
  				},
  				'50%': {
  					boxShadow: '0 0 40px rgba(139, 92, 246, 0.8)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'float': 'float 6s ease-in-out infinite',
  			'float-delayed': 'float-delayed 8s ease-in-out infinite',
  			'float-slow': 'float-slow 10s ease-in-out infinite',
  			'glow': 'glow 2s ease-in-out infinite'
  		},
  		backgroundImage: {
  			'gradient-primary': 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
  			'gradient-secondary': 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
  			'gradient-gold': 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
  			'gradient-premium': 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #06B6D4 100%)'
  		},
  		textColor: {
  			'gradient-primary': 'transparent',
  			'gradient-gold': 'transparent'
  		},
  		backdropBlur: {
  			'xs': '2px'
  		},
  		boxShadow: {
  			'3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.25)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
