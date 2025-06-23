import { NextResponse } from 'next/server';
import { supabaseServer } from '@/utils/supabase/server';

export async function POST(req: Request) {
  const { user1, user2 } = await req.json();
  if (!user1 || !user2) {
    return NextResponse.json({ error: 'Missing user IDs' }, { status: 400 });
  }
  const supabase = await supabaseServer();

  // Create chat session
  const { data: session, error: sessionError } = await supabase
    .from('chat_sessions')
    .insert({ user_1: user1, user_2: user2, ended: false, is_ai: false })
    .select('id')
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: sessionError?.message || 'Failed to create session' }, { status: 500 });
  }

  // Remove both users from waiting_user
  const { error: removeError } = await supabase
    .from('waiting_user')
    .delete()
    .in('id', [user1, user2]);

  if (removeError) {
    return NextResponse.json({ error: removeError.message }, { status: 500 });
  }

  return NextResponse.json({ sessionId: session.id });
} 