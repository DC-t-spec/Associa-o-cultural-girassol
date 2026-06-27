import { NextResponse } from 'next/server'; import { supabase } from '@/lib/supabase';
export async function POST(request: Request){const payload=await request.json(); if(supabase){await supabase.from('contact_messages').insert(payload)} return NextResponse.json({ok:true});}
