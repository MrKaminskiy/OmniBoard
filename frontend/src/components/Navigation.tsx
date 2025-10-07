'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function Navigation() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="navbar navbar-expand-md navbar-dark" style={{ 
      backgroundColor: '#206bc4',
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div className="container-xl">
        <Link href="/" className="navbar-brand" style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          color: 'white'
        }}>
          🚀 OmniBoard
        </Link>
        
        <div className="navbar-nav ms-auto" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} style={{
            color: isActive('/') ? 'white' : 'rgba(255,255,255,0.8)',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            textDecoration: 'none',
            backgroundColor: isActive('/') ? 'rgba(255,255,255,0.1)' : 'transparent',
            transition: 'all 0.2s ease'
          }}>
            📊 Market
          </Link>
          
          {user ? (
            <>
              <Link href="/signals" className={`nav-link ${isActive('/signals') ? 'active' : ''}`} style={{
                color: isActive('/signals') ? 'white' : 'rgba(255,255,255,0.8)',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                backgroundColor: isActive('/signals') ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.2s ease'
              }}>
                📡 Signals
              </Link>
              <Link href="/journal" className={`nav-link ${isActive('/journal') ? 'active' : ''}`} style={{
                color: isActive('/journal') ? 'white' : 'rgba(255,255,255,0.8)',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                backgroundColor: isActive('/journal') ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.2s ease'
              }}>
                📈 Journal
              </Link>
              <Link href="/media" className={`nav-link ${isActive('/media') ? 'active' : ''}`} style={{
                color: isActive('/media') ? 'white' : 'rgba(255,255,255,0.8)',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                backgroundColor: isActive('/media') ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.2s ease'
              }}>
                💬 Media
              </Link>
            </>
          ) : (
            <>
              <Link href="/signals" className="nav-link" style={{
                color: 'rgba(255,255,255,0.5)',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                cursor: 'not-allowed'
              }}>
                📡 Signals <span className="badge bg-warning text-dark ms-1">Premium</span>
              </Link>
              <Link href="/journal" className="nav-link" style={{
                color: 'rgba(255,255,255,0.5)',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                cursor: 'not-allowed'
              }}>
                📈 Journal <span className="badge bg-warning text-dark ms-1">Premium</span>
              </Link>
              <Link href="/media" className="nav-link" style={{
                color: 'rgba(255,255,255,0.5)',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                cursor: 'not-allowed'
              }}>
                💬 Media <span className="badge bg-warning text-dark ms-1">Premium</span>
              </Link>
            </>
          )}

          {/* User Menu */}
          <div className="dropdown">
            {loading ? (
              <div className="nav-link" style={{ color: 'rgba(255,255,255,0.8)' }}>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              </div>
            ) : user ? (
              <>
                <button
                  className="btn btn-outline-light dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ border: '1px solid rgba(255,255,255,0.3)' }}
                >
                  <i className="ti ti-user me-1"></i>
                  {user.email?.split('@')[0]}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" href="/profile">
                      <i className="ti ti-user me-2"></i>
                      Профиль
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" href="/pricing">
                      <i className="ti ti-crown me-2"></i>
                      Тарифы
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="ti ti-logout me-2"></i>
                      Выйти
                    </button>
                  </li>
                </ul>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link href="/auth/login" className="btn btn-outline-light" style={{ border: '1px solid rgba(255,255,255,0.3)' }}>
                  Войти
                </Link>
                <Link href="/auth/signup" className="btn btn-light">
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
