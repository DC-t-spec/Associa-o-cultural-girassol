import { NextResponse } from 'next/server'; import { supabase } from '@/lib/supabase';
export async function POST(request: Request){const payload=await request.json(); if(supabase){await supabase.from('fiti_applications').insert(payload)} return NextResponse.json({ok:true});}
