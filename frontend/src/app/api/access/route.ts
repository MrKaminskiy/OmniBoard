import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.ACCESS_PASSWORD;

    if (!correctPassword) {
      return NextResponse.json(
        { success: false, error: 'Пароль доступа не настроен' },
        { status: 500 }
      );
    }

    if (password === correctPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'Неверный пароль' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Access check error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка проверки пароля' },
      { status: 500 }
    );
  }
}
