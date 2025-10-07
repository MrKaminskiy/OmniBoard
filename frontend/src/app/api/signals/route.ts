import { NextRequest, NextResponse } from 'next/server'
// import { createClient } from '@/lib/supabase-server'

export const runtime = 'edge'

const CTSS_API_URL = process.env.NEXT_PUBLIC_CTSS_API_URL || 'https://ctss-production.up.railway.app'
const CTSS_API_KEY = process.env.CTSS_API_KEY

// Функция для получения текущих цен с Binance
async function getCurrentPrice(symbol: string): Promise<number | null> {
  try {
    console.log(`🔍 Fetching price for symbol: ${symbol}`);
    const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}`;
    console.log(`🌐 Request URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OmniBoard/1.0'
      },
      // Добавляем timeout
      signal: AbortSignal.timeout(5000)
    });
    
    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.warn(`Failed to fetch price for ${symbol}: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.warn(`Error response body: ${errorText}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`📊 Raw response for ${symbol}:`, data);
    
    const price = parseFloat(data.price);
    console.log(`✅ Successfully parsed price for ${symbol}: $${price}`);
    return price;
  } catch (error) {
    console.error(`❌ Error fetching price for ${symbol}:`, error);
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

// Функция для группировки сигналов по парам и обработки отмены
function groupSignalsByPair(signals: any[]) {
  const groups = new Map();
  
  signals.forEach(signal => {
    const pairKey = signal.pair;
    
    if (!groups.has(pairKey)) {
      groups.set(pairKey, []);
    }
    
    groups.get(pairKey).push(signal);
  });
  
  // Обрабатываем отмену сигналов (LONG → SHORT на том же ТФ)
  groups.forEach((pairSignals, pair) => {
    // Сортируем по времени создания (новые сверху)
    pairSignals.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    const activeSignals = new Map(); // timeframe -> signal
    
    pairSignals.forEach((signal: any) => {
      const tfKey = signal.timeframe;
      
      if (activeSignals.has(tfKey)) {
        const existingSignal = activeSignals.get(tfKey);
        
        // Если направление отличается, отменяем старый сигнал
        if (existingSignal.direction !== signal.direction) {
          existingSignal.status = 'CANCELLED';
          console.log(`🚫 Cancelled signal ${existingSignal.id} (${existingSignal.direction}) due to opposite ${signal.direction}`);
        }
      }
      
      // Добавляем/обновляем активный сигнал для этого ТФ
      activeSignals.set(tfKey, signal);
    });
  });
  
  return groups;
}

// Функция для удаления дубликатов сигналов (по hash)
function removeDuplicateSignals(signals: any[]) {
  const seen = new Set();
  const unique = [];
  
  for (const signal of signals) {
    const hash = signal.raw_data?.hash || `${signal.pair}-${signal.timeframe}-${signal.created_at}`;
    if (!seen.has(hash)) {
      seen.add(hash);
      unique.push(signal);
    } else {
      console.log(`🔄 Skipping duplicate signal: ${signal.id} (hash: ${hash})`);
    }
  }
  
  return unique;
}

export async function GET(request: NextRequest) {
  console.log('🚀 Starting /api/signals request')
  
  try {
    console.log('📋 Request URL:', request.url)
    console.log('🔑 CTSS API URL:', CTSS_API_URL)
    console.log('🔑 CTSS API Key available:', !!CTSS_API_KEY)
    
    if (!CTSS_API_KEY) {
      console.error('❌ CTSS_API_KEY environment variable is not set')
      return NextResponse.json({ 
        error: 'CTSS API key not configured. Please check environment variables.' 
      }, { status: 500 });
    }
    
    console.log('🔑 CTSS API Key (first 10 chars):', CTSS_API_KEY.substring(0, 10) + '...')

    // Получаем параметры запроса
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // По умолчанию 20
    const offset = parseInt(searchParams.get('offset') || '0')
    const pair = searchParams.get('pair')
    const status = searchParams.get('status')
    const direction = searchParams.get('direction')
    const timeframe = searchParams.get('timeframe') // Убираем дефолт, показываем все

    console.log('📊 Request params:', { limit, offset, pair, status, direction, timeframe })

    // Формируем URL для запроса к CTSS API
    // CTSS API не поддерживает лимит, поэтому получаем все данные и применяем лимит на нашей стороне
    const ctssUrl = new URL(`${CTSS_API_URL}/api/signals`)
    
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

    console.log('🌐 Making request to CTSS:', ctssUrl.toString())
    console.log('🔑 Request headers:', { ...headers, 'X-API-Key': '***' })

    const ctssResponse = await fetch(ctssUrl.toString(), { headers });

    console.log('📡 CTSS response status:', ctssResponse.status)
    console.log('📡 CTSS response headers:', Object.fromEntries(ctssResponse.headers.entries()))

    if (!ctssResponse.ok) {
      console.error('❌ CTSS API error:', ctssResponse.status, ctssResponse.statusText)
      const errorData = await ctssResponse.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ CTSS error data:', errorData)
      return NextResponse.json({ error: errorData.error || 'Failed to fetch signals from CTSS' }, { status: ctssResponse.status });
    }

    const ctssData = await ctssResponse.json();
    console.log('✅ CTSS response received')
    console.log('📊 CTSS data structure:', {
      hasData: !!ctssData.data,
      dataLength: ctssData.data?.length || 0,
      count: ctssData.count,
      success: ctssData.success,
      firstSignal: ctssData.data?.[0] ? {
        id: ctssData.data[0].id,
        pair: ctssData.data[0].parsed_pair,
        direction: ctssData.data[0].parsed_direction
      } : null
    })

    if (!ctssData.data || !Array.isArray(ctssData.data)) {
      console.error('❌ Invalid CTSS data format:', ctssData)
      return NextResponse.json({ error: 'Invalid data format from CTSS' }, { status: 500 });
    }

    console.log('🔄 Starting data transformation...')
    
    // Преобразуем данные CTSS в формат OmniBoard
    const transformedSignals = ctssData.data.map(transformCTSSSignal);
    
    // Удаляем дубликаты сигналов
    const uniqueSignals = removeDuplicateSignals(transformedSignals);
    console.log(`🔄 Removed duplicates: ${transformedSignals.length} → ${uniqueSignals.length}`);

    console.log('🔄 Grouping signals by pair...')
    
    // Группируем сигналы по парам
    const groupedSignals = groupSignalsByPair(uniqueSignals);

    console.log('💰 Fetching current prices...')
    
    // Получаем текущие цены для уникальных пар
    const uniquePairs = [...new Set(uniqueSignals.map(s => s.pair))];
    const pricePromises = uniquePairs.map(async (pair) => {
      const price = await getCurrentPrice(pair); // pair уже содержит USDT
      return { pair, price };
    });
    
    const prices = await Promise.all(pricePromises);
    const priceMap = new Map(prices.map(p => [p.pair, p.price]));
    
    // Добавляем текущие цены и процентные изменения
    uniqueSignals.forEach(signal => {
      signal.current_price = priceMap.get(signal.pair) || null;
      if (signal.entry_price && signal.current_price) {
        signal.price_change_percent = calculatePriceChange(signal.entry_price, signal.current_price);
      }
    });

    // Применяем фильтры на нашей стороне
    let filteredSignals = uniqueSignals;
    
    if (pair) {
      filteredSignals = filteredSignals.filter(signal => 
        signal.pair.toLowerCase().includes(pair.toLowerCase())
      );
    }
    
    if (status) {
      filteredSignals = filteredSignals.filter(signal => 
        signal.status === status
      );
    }
    
    if (direction) {
      filteredSignals = filteredSignals.filter(signal => 
        signal.direction === direction
      );
    }
    
    if (timeframe) {
      filteredSignals = filteredSignals.filter(signal => 
        signal.timeframe === timeframe
      );
    }

    // Применяем пагинацию после фильтрации
    const paginatedSignals = filteredSignals.slice(offset, offset + limit);

    console.log('✅ Processing completed:', {
      originalCount: ctssData.data.length,
      transformedCount: uniqueSignals.length,
      groupedPairs: groupedSignals.size,
      firstTransformed: uniqueSignals[0] ? {
        id: uniqueSignals[0].id,
        pair: uniqueSignals[0].pair,
        direction: uniqueSignals[0].direction,
        tpLevelsCount: uniqueSignals[0].tp_levels.length,
        currentPrice: uniqueSignals[0].current_price,
        priceChange: uniqueSignals[0].price_change_percent
      } : null
    })

    const response = {
      success: true,
      data: paginatedSignals,
      groupedByPair: Object.fromEntries(groupedSignals),
      count: filteredSignals.length,
      pagination: {
        limit,
        offset,
        total: filteredSignals.length,
        hasMore: offset + limit < filteredSignals.length
      }
    };

    console.log('🚀 Returning response:', {
      success: response.success,
      dataLength: response.data.length,
      groupedPairs: Object.keys(response.groupedByPair).length,
      count: response.count
    })

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('💥 Fatal error in /api/signals:', {
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