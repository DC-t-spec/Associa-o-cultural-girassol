'use client';
import { motion } from 'framer-motion'; import { cn } from '@/lib/utils';
export function Card({children,className}:{children:React.ReactNode;className?:string}){return <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-80px'}} whileHover={{y:-6}} className={cn('rounded-3xl border border-white/10 bg-zinc-900/60 p-6 shadow-2xl backdrop-blur',className)}>{children}</motion.div>}
