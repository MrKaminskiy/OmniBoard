import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

const CTSS_API_URL = process.env.NEXT_PUBLIC_CTSS_API_URL || 'http://localhost:5001'
const CTSS_API_KEY = process.env.CTSS_API_KEY

export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем подписку пользователя
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_tier, subscription_expires_at')
      .eq('id', user.id)
      .single()

    if (!profile || profile.subscription_tier === 'free') {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 })
    }

    // Проверяем, не истекла ли подписка
    if (profile.subscription_expires_at && new Date(profile.subscription_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Subscription expired' }, { status: 403 })
    }

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

    // Делаем запрос к CTSS API
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (CTSS_API_KEY) {
      headers['Authorization'] = `Bearer ${CTSS_API_KEY}`
    }

    const response = await fetch(ctssUrl.toString(), {
      method: 'GET',
      headers,
      cache: 'no-store', // Отключаем кэширование для real-time данных
    })

    if (!response.ok) {
      console.error('CTSS API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch signals from CTSS' },
        { status: response.status }
      )
    }

    const ctssData = await response.json()

    // Преобразуем данные CTSS в формат OmniBoard
    const transformedSignals = ctssData.data?.map((signal: any) => ({
      id: signal.id.toString(),
      source: 'telegram' as const,
      pair: signal.parsed_pair,
      timeframe: signal.parsed_timeframe,
      direction: signal.parsed_direction,
      entry_price: signal.parsed_entry_price,
      dca_price: signal.parsed_dca_price,
      stop_loss: signal.parsed_stop_loss ? parseFloat(signal.parsed_stop_loss) : null,
      tp_levels: signal.parsed_tp_levels ? 
        signal.parsed_tp_levels.split(',').map((price: string, index: number) => ({
          level: index + 1,
          price: parseFloat(price.trim()),
          hit: false, // TODO: Определять по статусу сигнала
        })) : [],
      current_price: null, // TODO: Получать из price monitor
      status: signal.status || 'ACTIVE',
      confidence: signal.confidence,
      raw_data: {
        message_text: signal.message_text,
        message_date: signal.message_date,
        raw_text: signal.raw_text,
      },
      metadata: {
        channel_id: signal.channel_id,
        message_id: signal.message_id,
        hash: signal.hash,
      },
      created_at: signal.created_at,
      updated_at: signal.updated_at,
    })) || []

    return NextResponse.json({
      success: true,
      data: transformedSignals,
      count: transformedSignals.length,
      total: ctssData.count || transformedSignals.length,
    })

  } catch (error) {
    console.error('Signals API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
