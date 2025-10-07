import { createMiddlewareClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

// Защищенные пути (требуют авторизации)
const protectedPaths = ['/signals', '/journal', '/media', '/profile', '/settings']

// Публичные пути (не требуют авторизации)
const publicPaths = ['/', '/auth/login', '/auth/signup', '/pricing', '/access', '/api/access']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Парольная защита временно отключена
  // const accessPassword = process.env.ACCESS_PASSWORD;
  // const isAccessPage = path === '/access';
  // const isApiAccess = path === '/api/access';
  
  // if (accessPassword && !isAccessPage && !isApiAccess) {
  //   const hasAccess = request.cookies.get('omniboard-access')?.value === accessPassword;
    
  //   if (!hasAccess) {
  //     const redirectUrl = new URL('/access', request.url);
  //     return NextResponse.redirect(redirectUrl);
  //   }
  // }

  const { supabase, response } = createMiddlewareClient(request)

  // Проверяем, является ли путь защищенным
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p))
  const isPublicPath = publicPaths.includes(path)

  // Если это защищенный путь, проверяем авторизацию
  if (isProtectedPath) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        // Перенаправляем на страницу входа
        const redirectUrl = new URL('/auth/login', request.url)
        redirectUrl.searchParams.set('redirectTo', path)
        return NextResponse.redirect(redirectUrl)
      }

      // Проверяем подписку для премиум функций
      if (path.startsWith('/signals') || path.startsWith('/journal') || path.startsWith('/media')) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('subscription_tier, subscription_expires_at')
          .eq('id', session.user.id)
          .single()

        if (!profile || profile.subscription_tier === 'free') {
          // Перенаправляем на страницу с тарифами
          const redirectUrl = new URL('/pricing', request.url)
          redirectUrl.searchParams.set('redirectTo', path)
          return NextResponse.redirect(redirectUrl)
        }

        // Проверяем, не истекла ли подписка
        if (profile.subscription_expires_at && new Date(profile.subscription_expires_at) < new Date()) {
          const redirectUrl = new URL('/pricing', request.url)
          redirectUrl.searchParams.set('redirectTo', path)
          redirectUrl.searchParams.set('expired', 'true')
          return NextResponse.redirect(redirectUrl)
        }
      }
    } catch (error) {
      console.error('Middleware auth error:', error)
      const redirectUrl = new URL('/auth/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Если пользователь авторизован и пытается попасть на страницы входа/регистрации,
  // перенаправляем на главную
  if (isPublicPath && (path === '/auth/login' || path === '/auth/signup')) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      // Игнорируем ошибки для публичных страниц
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}