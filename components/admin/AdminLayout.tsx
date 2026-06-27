'use client';
import { AdminSidebar } from './AdminSidebar';
export function AdminLayout({children}:{children:React.ReactNode}){return <div className="min-h-screen bg-black p-4 text-white"><div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[280px_1fr]"><AdminSidebar/><main>{children}</main></div></div>}
