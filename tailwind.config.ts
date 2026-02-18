import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// AZ Brand
				'az-red': '#DB0021',

				// Semantic data colors
				'success': '#22C55E',
				'warning': '#F59E0B',
				'danger': '#EF4444',
				'info': '#3B82F6',

				// Chart colors
				'chart-az': '#DB0021',
				'chart-opponent': '#6B7280',
				'chart-accent-1': '#3B82F6',
				'chart-accent-2': '#8B5CF6',
				'chart-accent-3': '#F59E0B',

				// Design system tokens
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
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
				}
			},
			fontFamily: {
				'headline': ['Outfit', 'system-ui', 'sans-serif'],
				'body': ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
				'sans': ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
				'mono': ['"JetBrains Mono"', 'monospace'],
			},
			fontSize: {
				'app-title': ['1.5rem', { lineHeight: '1.3', fontWeight: '700' }],
				'app-heading': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
				'app-subheading': ['0.9375rem', { lineHeight: '1.4', fontWeight: '600' }],
				'app-body': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
				'app-body-strong': ['0.875rem', { lineHeight: '1.5', fontWeight: '600' }],
				'app-small': ['0.8125rem', { lineHeight: '1.4', fontWeight: '400' }],
				'app-tiny': ['0.6875rem', { lineHeight: '1.3', fontWeight: '500' }],
				'app-data': ['0.875rem', { lineHeight: '1.5', fontWeight: '500' }],
				'app-data-lg': ['1.75rem', { lineHeight: '1.2', fontWeight: '700' }],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'pulse-live': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.4' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-live': 'pulse-live 1.5s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
