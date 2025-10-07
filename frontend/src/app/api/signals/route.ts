import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

const CTSS_API_URL = process.env.NEXT_PUBLIC_CTSS_API_URL || 'https://ctss-production.up.railway.app'
// const CTSS_API_KEY = process.env.CTSS_API_KEY // CTSS API is currently open, no key needed

export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('API: No user found, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('API: User authenticated:', user.email)

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

    // if (CTSS_API_KEY) {
    //   headers['X-API-Key'] = CTSS_API_KEY;
    // }

    console.log('API: Fetching from CTSS:', ctssUrl.toString())

    const ctssResponse = await fetch(ctssUrl.toString(), { headers });

    if (!ctssResponse.ok) {
      const errorData = await ctssResponse.json();
      console.error('CTSS API error:', errorData)
      return NextResponse.json({ error: errorData.error || 'Failed to fetch signals from CTSS' }, { status: ctssResponse.status });
    }

    const data = await ctssResponse.json();
    console.log('API: Successfully fetched signals:', data.data?.length || 0)
    return NextResponse.json({ success: true, data: data.data, count: data.count });

  } catch (error: any) {
    console.error('Error in /api/signals:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}