import { NextRequest, NextResponse } from 'next/server'
// import { createClient } from '@/lib/supabase-server'

const CTSS_API_URL = process.env.NEXT_PUBLIC_CTSS_API_URL || 'https://ctss-production.up.railway.app'
// const CTSS_API_KEY = process.env.CTSS_API_KEY // CTSS API is currently open, no key needed

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Временно отключаем проверку авторизации для тестирования
    // const supabase = createClient()
    // const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // if (authError || !user) {
    //   console.log('API: No user found for signal details, returning 401')
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // console.log('API: User authenticated for signal details:', user.email)

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

    const { id: signalId } = await params

    // Делаем запрос к CTSS API
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // if (CTSS_API_KEY) {
    //   headers['X-API-Key'] = CTSS_API_KEY;
    // }

    console.log('API: Fetching signal details from CTSS:', `${CTSS_API_URL}/api/signals/${signalId}`)

    const ctssResponse = await fetch(`${CTSS_API_URL}/api/signals/${signalId}`, { headers });

    if (!ctssResponse.ok) {
      const errorData = await ctssResponse.json();
      console.error('CTSS API error for signal details:', errorData)
      return NextResponse.json({ error: errorData.error || 'Failed to fetch signal from CTSS' }, { status: ctssResponse.status });
    }

    const data = await ctssResponse.json();
    console.log('API: Successfully fetched signal details')
    return NextResponse.json({ success: true, data: data.data });

  } catch (error: any) {
    console.error(`Error in /api/signals/${params}:`, error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}