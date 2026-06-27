import type { Config } from 'tailwindcss';
const config: Config = {content:['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}','./lib/**/*.{ts,tsx}'],theme:{extend:{colors:{sun:'#F7B500',ember:'#f97316',night:'#050505'},fontFamily:{display:['var(--font-playfair)'],sans:['var(--font-inter)']},boxShadow:{glow:'0 0 70px rgba(247,181,0,.32)'}}},plugins:[]};
export default config;
