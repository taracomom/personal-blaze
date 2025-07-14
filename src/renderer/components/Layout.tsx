import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { APP_NAME } from '@/shared/constants';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">{APP_NAME}</div>
          <div className="sidebar-subtitle">Text Expander</div>
        </div>
        
        <nav className="sidebar-nav">
          <Link 
            to="/" 
            className={`nav-item ${isActive('/') ? 'active' : ''}`}
          >
            📋 Dashboard
          </Link>
          <Link 
            to="/snippet/new" 
            className={`nav-item ${isActive('/snippet') ? 'active' : ''}`}
          >
            ➕ New Snippet
          </Link>
          <Link 
            to="/settings" 
            className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
          >
            ⚙️ Settings
          </Link>
        </nav>
      </aside>
      
      <main className="main-content">
        <header className="header">
          <h1>Personal Blaze</h1>
        </header>
        
        <div className="content">
          {children}
        </div>
      </main>
    </div>
  );
};