import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import type { FinalStatus, ValidationUser } from '@/lib/client-validation/epics';

interface ValidationPayload {
  epicId: string;
  epicTitle: string;
  userName: ValidationUser;
  answers: Record<string, { status: string; comment?: string }>;
  generalComment: string;
  finalStatus: FinalStatus;
  finalComment: string;
  pendencias: string;
  progressPercent: number;
}

export async function GET(request: NextRequest) {
  try {
    const userName = request.nextUrl.searchParams.get('userName');
    const epicId = request.nextUrl.searchParams.get('epicId');

    if (!userName) {
      return NextResponse.json({ error: 'userName e obrigatorio' }, { status: 400 });
    }

    const supabase = (await createAdminClient()) as any;
    let query = supabase
      .from('epic_validation_responses')
      .select(
        'epic_id, epic_title, user_name, answers, general_comment, final_status, final_comment, pendencias, progress_percent, updated_at'
      )
      .eq('user_name', userName)
      .order('epic_id', { ascending: true });

    if (epicId) {
      query = query.eq('epic_id', epicId).limit(1);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (epicId) {
      return NextResponse.json({ data: data?.[0] ?? null });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro inesperado' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as ValidationPayload;

    if (!payload.epicId || !payload.userName) {
      return NextResponse.json({ error: 'epicId e userName sao obrigatorios' }, { status: 400 });
    }

    const supabase = (await createAdminClient()) as any;
    const { data, error } = await supabase
      .from('epic_validation_responses')
      .upsert(
        {
          epic_id: payload.epicId,
          epic_title: payload.epicTitle,
          user_name: payload.userName,
          answers: payload.answers,
          general_comment: payload.generalComment,
          final_status: payload.finalStatus,
          final_comment: payload.finalComment,
          pendencias: payload.pendencias,
          progress_percent: payload.progressPercent,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'epic_id,user_name' }
      )
      .select(
        'epic_id, epic_title, user_name, answers, general_comment, final_status, final_comment, pendencias, progress_percent, updated_at'
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro inesperado' },
      { status: 500 }
    );
  }
}
