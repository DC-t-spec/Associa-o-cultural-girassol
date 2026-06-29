import type { Metadata } from 'next';import { PublicFiti } from '@/components/PublicFiti';
export const metadata:Metadata={title:'FITI – Festival Internacional Teatro de Inverno',description:'Página oficial do FITI, festival internacional de teatro promovido pela Associação Cultural Girassol, com programação, companhias, oficinas, arquivo, parceiros e informações para imprensa.'};
export default function FitiPage(){return <PublicFiti/>}
