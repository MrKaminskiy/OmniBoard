'use client';

import { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  timeframe: string;
  height?: number;
  width?: string;
}

export default function TradingViewWidget({ 
  symbol, 
  timeframe, 
  height = 400, 
  width = "100%" 
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Очищаем предыдущий виджет
    containerRef.current.innerHTML = '';

    // Создаем скрипт для TradingView
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView && containerRef.current) {
        new window.TradingView.widget({
          width: width,
          height: height,
          symbol: `BINANCE:${symbol}`,
          interval: getInterval(timeframe),
          timezone: "Etc/UTC",
          theme: "light",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: containerRef.current.id,
          studies: [
            // Можно добавить индикаторы
          ],
          // Настройки для отметок TP/SL
          drawing_tools: {
            enabled: true,
            tools: [
              { name: "horizontal_line" },
              { name: "text" }
            ]
          }
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      // Очистка при размонтировании
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, timeframe, height, width]);

  // Конвертируем таймфрейм в формат TradingView
  const getInterval = (tf: string): string => {
    const intervalMap: { [key: string]: string } = {
      '1m': '1',
      '5m': '5',
      '15m': '15',
      '30m': '30',
      '1h': '60',
      '4h': '240',
      '1d': '1D',
      '1w': '1W'
    };
    return intervalMap[tf] || '60'; // По умолчанию 1h
  };

  return (
    <div 
      id={`tradingview_${symbol}_${timeframe}`}
      ref={containerRef}
      style={{ width, height }}
      className="tradingview-widget-container"
    />
  );
}

// Добавляем типы для TradingView
declare global {
  interface Window {
    TradingView: {
      widget: new (options: any) => any;
    };
  }
}
