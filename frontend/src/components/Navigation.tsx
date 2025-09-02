'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

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
        
        <div className="navbar-nav ms-auto" style={{ display: 'flex', gap: '0.5rem' }}>
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
        </div>
      </div>
    </nav>
  );
}
