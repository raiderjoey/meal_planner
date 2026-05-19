import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="main-layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">HarvestPlan</Link>
          <nav className="nav">
            <NavLink 
              to="/" 
              className="nav-link"
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/ingredients" 
              className="nav-link"
            >
              Ingredients
            </NavLink>
            <NavLink 
              to="/shopping-list" 
              className="nav-link"
            >
              Shopping List
            </NavLink>
          </nav>
          <div className="header-actions">
            <div className="search-container">
              <input type="text" placeholder="Search recipes..." className="search-input" />
              <span className="material-symbols-outlined search-icon">search</span>
            </div>
            <button className="icon-button">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="icon-button">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">HarvestPlan</span>
            <p className="footer-copyright">© 2024 HarvestPlan. Rooted in health.</p>
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
