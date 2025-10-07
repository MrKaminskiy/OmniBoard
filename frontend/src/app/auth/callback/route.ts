import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Создаем профиль пользователя, если его нет
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            subscription_tier: 'free',
            created_at: new Date().toISOString(),
          })
        
        if (profileError) {
          console.error('Error creating user profile:', profileError)
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Если есть ошибка, перенаправляем на страницу входа
  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate user`)
}
