import type { Config } from 'tailwindcss';
const config: Config = {content:['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}','./lib/**/*.{ts,tsx}'],theme:{extend:{colors:{sun:'#f7c948',ember:'#f97316',night:'#050505'},fontFamily:{display:['var(--font-playfair)'],sans:['var(--font-inter)']},boxShadow:{glow:'0 0 60px rgba(249,115,22,.25)'}}},plugins:[]};
export default config;
