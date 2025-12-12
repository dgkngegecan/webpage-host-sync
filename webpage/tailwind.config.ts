import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",

                // Custom Colors from Legacy Design
                bg: {
                    primary: '#0a0a0a',
                    secondary: '#121212',
                    card: '#1a1a1a',
                    hover: '#252525',
                },
                accent: {
                    DEFAULT: '#00d4ff',
                    hover: '#00b8e6',
                },
                text: {
                    primary: '#ffffff',
                    secondary: '#b0b0b0',
                },
                border: '#2a2a2a',
                gradient: {
                    start: '#00d4ff',
                    end: '#7b2ff7',
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
};
export default config;
