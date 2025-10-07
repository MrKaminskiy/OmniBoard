import { NextRequest, NextResponse } from 'next/server'
// import { createClient } from '@/lib/supabase-server'

const CTSS_API_URL = process.env.NEXT_PUBLIC_CTSS_API_URL || 'https://ctss-production.up.railway.app'
// Используем API ключ для OmniBoard из терминала
const CTSS_API_KEY = 'sh3WPGHqnRAujaEwUQ3N0b5JfAyfn_AjJb0fzB4KCcg'

// Функция для преобразования данных CTSS в формат OmniBoard
function transformCTSSSignal(ctssSignal: any) {
  // Парсим TP levels из строки JSON
  let tpLevels = [];
  try {
    if (ctssSignal.parsed_tp_levels) {
      const parsed = JSON.parse(ctssSignal.parsed_tp_levels);
      tpLevels = parsed.map((tp: any, index: number) => ({
        level: index + 1,
        price: parseFloat(tp.price),
        hit: tp.status === 'HIT',
        hit_at: tp.status === 'HIT' ? tp.hit_at : undefined
      }));
    }
  } catch (error) {
    console.error('Error parsing TP levels:', error);
  }

  // Определяем статус сигнала на основе TP levels
  let status = 'ACTIVE';
  if (tpLevels.length > 0) {
    const allHit = tpLevels.every((tp: any) => tp.hit);
    const someHit = tpLevels.some((tp: any) => tp.hit);
    
    if (allHit) {
      status = 'TP_HIT';
    } else if (someHit) {
      status = 'ACTIVE'; // Частично выполнен
    }
  }

  return {
    id: ctssSignal.id.toString(),
    source: 'telegram' as const,
    pair: ctssSignal.parsed_pair || 'UNKNOWN',
    timeframe: ctssSignal.parsed_timeframe,
    direction: ctssSignal.parsed_direction as 'LONG' | 'SHORT',
    entry_price: ctssSignal.parsed_entry_price ? parseFloat(ctssSignal.parsed_entry_price) : undefined,
    dca_price: ctssSignal.parsed_dca_price ? parseFloat(ctssSignal.parsed_dca_price) : undefined,
    stop_loss: ctssSignal.parsed_stop_loss ? parseFloat(ctssSignal.parsed_stop_loss) : undefined,
    tp_levels: tpLevels,
    current_price: undefined, // Будет добавлено позже через price monitor
    status: status as 'ACTIVE' | 'TP_HIT' | 'SL_HIT' | 'CLOSED',
    confidence: ctssSignal.confidence ? parseFloat(ctssSignal.confidence) : undefined,
    raw_data: {
      channel_id: ctssSignal.channel_id,
      message_id: ctssSignal.message_id,
      raw_text: ctssSignal.raw_text,
      hash: ctssSignal.hash
    },
    metadata: {
      ts: ctssSignal.ts,
      channel_id: ctssSignal.channel_id,
      message_id: ctssSignal.message_id
    },
    created_at: ctssSignal.created_at,
    updated_at: ctssSignal.updated_at
  };
}

export async function GET(request: NextRequest) {
  try {
    // Временно отключаем проверку авторизации для тестирования
    // const supabase = createClient()
    // const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // if (authError || !user) {
    //   console.log('API: No user found, returning 401')
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // console.log('API: User authenticated:', user.email)

    // Временно отключаем проверку подписки до настройки базы данных
    // const { data: profile } = await supabase
    //   .from('user_profiles')
    //   .select('subscription_tier, subscription_expires_at')
    //   .eq('id', user.id)
    //   .single()

    // if (!profile || profile.subscription_tier === 'free') {
    //   return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 })
    // }

    // // Проверяем, не истекла ли подписка
    // if (profile.subscription_expires_at && new Date(profile.subscription_expires_at) < new Date()) {
    //   return NextResponse.json({ error: 'Subscription expired' }, { status: 403 })
    // }

    // Получаем параметры запроса
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const pair = searchParams.get('pair')
    const status = searchParams.get('status')
    const direction = searchParams.get('direction')
    const timeframe = searchParams.get('timeframe')

    // Формируем URL для запроса к CTSS API
    const ctssUrl = new URL(`${CTSS_API_URL}/api/signals`)
    ctssUrl.searchParams.set('limit', limit.toString())
    ctssUrl.searchParams.set('offset', offset.toString())
    
    if (pair) ctssUrl.searchParams.set('pair', pair)
    if (status) ctssUrl.searchParams.set('status', status)
    if (direction) ctssUrl.searchParams.set('direction', direction)
    if (timeframe) ctssUrl.searchParams.set('timeframe', timeframe)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Добавляем API ключ
    if (CTSS_API_KEY) {
      headers['X-API-Key'] = CTSS_API_KEY;
    }

    console.log('API: Fetching from CTSS:', ctssUrl.toString())
    console.log('API: Using API Key:', CTSS_API_KEY.substring(0, 10) + '...')

    const ctssResponse = await fetch(ctssUrl.toString(), { headers });

    if (!ctssResponse.ok) {
      const errorData = await ctssResponse.json().catch(() => ({ error: 'Unknown error' }));
      console.error('CTSS API error:', errorData)
      return NextResponse.json({ error: errorData.error || 'Failed to fetch signals from CTSS' }, { status: ctssResponse.status });
    }

    const ctssData = await ctssResponse.json();
    console.log('API: Successfully fetched signals from CTSS:', ctssData.data?.length || 0)

    // Преобразуем данные CTSS в формат OmniBoard
    const transformedSignals = ctssData.data.map(transformCTSSSignal);

    return NextResponse.json({ 
      success: true, 
      data: transformedSignals, 
      count: ctssData.count 
    });

  } catch (error: any) {
    console.error('Error in /api/signals:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}