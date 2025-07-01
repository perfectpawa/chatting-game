import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  const { userId } = await req.json()
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  const supabase = await supabaseServer()

  // 1. Check for another waiting user (not this user)
  const { data: waitingUsers, error: waitingError } = await supabase
    .from('waiting_users')
    .select('id')
    .neq('id', userId)
    .order('created_at', { ascending: true })
    .limit(1)

  if (waitingError) {
    return NextResponse.json({ error: waitingError.message }, { status: 500 })
  }

  if (waitingUsers && waitingUsers.length > 0) {
    const matchedUserId = waitingUsers[0].id
    // Remove matched user from waiting_users
    await supabase.from('waiting_users').delete().eq('id', matchedUserId)
    // Create chat session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert({ owner_id: matchedUserId, guest_id: userId, waiting_guest: false, ended: false, is_ai: false })
      .select()
      .single()
    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 })
    }
    // // Optionally: Remove this user from waiting_users if present
    await supabase.from('waiting_users').delete().eq('id', userId)

    // Return session info
    return NextResponse.json({ matched: true, session })
  } else {
    // No waiting user, add this user to waiting_users
    const { error: insertError } = await supabase
      .from('waiting_users')
      .upsert({ id: userId })
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
    return NextResponse.json({ matched: false })
  }
} 

export async function DELETE(req: NextRequest) {
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  const supabase = await supabaseServer();
  const { error } = await supabase.from('waiting_users').delete().eq('id', userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
} 