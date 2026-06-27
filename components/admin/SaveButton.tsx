'use client';
export function SaveButton(props:{label?:string;children?:React.ReactNode}){return <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-zinc-300">{props.children ?? props.label ?? 'SaveButton'}</div>}
