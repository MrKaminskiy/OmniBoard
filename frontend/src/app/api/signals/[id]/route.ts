import { NextRequest, NextResponse } from 'next/server'
// import { createClient } from '@/lib/supabase-server'

const CTSS_API_URL = process.env.NEXT_PUBLIC_CTSS_API_URL || 'https://ctss-production.up.railway.app'
const CTSS_API_KEY = process.env.CTSS_API_KEY

// Функция для получения текущих цен с Binance
async function getCurrentPrice(symbol: string): Promise<number | null> {
  try {
    const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

// Функция для расчета процентного изменения
function calculatePriceChange(entryPrice: number, currentPrice: number): string {
  if (!entryPrice || !currentPrice) return '';
  
  const change = ((currentPrice - entryPrice) / entryPrice) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

// Функция для преобразования данных CTSS в формат OmniBoard
function transformCTSSSignal(ctssSignal: any) {
  console.log('🔄 Transforming signal:', ctssSignal.id, ctssSignal.parsed_pair)
  
  // Парсим TP levels из строки JSON
  let tpLevels = [];
  try {
    if (ctssSignal.parsed_tp_levels) {
      console.log('📊 Parsing TP levels:', ctssSignal.parsed_tp_levels)
      const parsed = JSON.parse(ctssSignal.parsed_tp_levels);
      tpLevels = parsed.map((tp: any, index: number) => ({
        level: index + 1,
        price: parseFloat(tp.price),
        hit: tp.status === 'HIT',
        hit_at: tp.status === 'HIT' ? tp.hit_at : undefined,
        confidence: parseFloat(tp.confidence) // Каждый TP имеет свой confidence
      }));
      console.log('✅ Parsed TP levels:', tpLevels)
    }
  } catch (error) {
    console.error('❌ Error parsing TP levels:', error, 'Raw data:', ctssSignal.parsed_tp_levels)
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

  const transformed = {
    id: ctssSignal.id.toString(),
    source: 'telegram' as const,
    pair: ctssSignal.parsed_pair || 'UNKNOWN',
    timeframe: ctssSignal.parsed_timeframe,
    direction: ctssSignal.parsed_direction as 'LONG' | 'SHORT',
    entry_price: ctssSignal.parsed_entry_price ? parseFloat(ctssSignal.parsed_entry_price) : undefined,
    dca_price: ctssSignal.parsed_dca_price ? parseFloat(ctssSignal.parsed_dca_price) : undefined,
    stop_loss: ctssSignal.parsed_stop_loss ? parseFloat(ctssSignal.parsed_stop_loss) : undefined,
    tp_levels: tpLevels,
    current_price: undefined, // Будет заполнено позже
    price_change_percent: undefined, // Будет рассчитано позже
    status: status as 'ACTIVE' | 'TP_HIT' | 'SL_HIT' | 'CLOSED' | 'CANCELLED',
    confidence: undefined, // Убираем общий confidence, так как он у каждого TP
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

  console.log('✅ Transformed signal:', transformed.id, transformed.pair, transformed.direction)
  return transformed;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🚀 Starting /api/signals/[id] request for ID:', params.id)
    
    if (!CTSS_API_KEY) {
      console.error('❌ CTSS_API_KEY environment variable is not set')
      return NextResponse.json({ 
        error: 'CTSS API key not configured. Please check environment variables.' 
      }, { status: 500 });
    }

    const { id: signalId } = params

    // Делаем запрос к CTSS API для получения конкретного сигнала
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (CTSS_API_KEY) {
      headers['X-API-Key'] = CTSS_API_KEY;
    }

    console.log(`🌐 Fetching signal ${signalId} from CTSS: ${CTSS_API_URL}/api/signals/${signalId}`)

    const ctssResponse = await fetch(`${CTSS_API_URL}/api/signals/${signalId}`, { headers });

    console.log('📡 CTSS response status:', ctssResponse.status)

    if (!ctssResponse.ok) {
      let errorData = {};
      try {
        errorData = await ctssResponse.json();
      } catch (jsonError) {
        console.error('Failed to parse CTSS error response as JSON for single signal:', jsonError);
        errorData = { error: ctssResponse.statusText || 'Unknown error from CTSS' };
      }
      console.error('❌ CTSS API error for single signal:', errorData)
      return NextResponse.json({ error: errorData.error || 'Failed to fetch signal from CTSS' }, { status: ctssResponse.status });
    }

    const ctssData = await ctssResponse.json();
    console.log('✅ CTSS response received for signal:', ctssData.data?.id)

    if (!ctssData.data) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 });
    }

    // Преобразуем данные CTSS в формат OmniBoard
    const transformedSignal = transformCTSSSignal(ctssData.data);

    // Получаем текущую цену
    console.log('💰 Fetching current price for:', transformedSignal.pair)
    const currentPrice = await getCurrentPrice(transformedSignal.pair);
    transformedSignal.current_price = currentPrice;

    // Рассчитываем процентное изменение
    if (transformedSignal.entry_price && currentPrice) {
      transformedSignal.price_change_percent = calculatePriceChange(transformedSignal.entry_price, currentPrice);
    }

    console.log('✅ Signal details processed:', {
      id: transformedSignal.id,
      pair: transformedSignal.pair,
      direction: transformedSignal.direction,
      currentPrice: transformedSignal.current_price,
      priceChange: transformedSignal.price_change_percent
    })

    return NextResponse.json({ 
      success: true, 
      data: transformedSignal 
    });

  } catch (error: any) {
    console.error(`💥 Fatal error in /api/signals/${params.id}:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}