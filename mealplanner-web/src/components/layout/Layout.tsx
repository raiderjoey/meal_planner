import React from 'react';
import { NavLink } from 'react-router-dom';
import { IconButton } from '../ui';

const NavLinkItem = ({ to, children, end = false }: { to: string, children: React.ReactNode, end?: boolean }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => 
      `font-label-md text-label-md transition-colors ${
        isActive 
          ? 'text-primary border-b-2 border-primary pb-1 font-bold' 
          : 'text-on-surface-variant hover:text-primary'
      }`
    }
  >
    {children}
  </NavLink>
);

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface pb-20 md:pb-0">
      {/* TopNavBar */}
      <header className="bg-surface shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 w-full max-w-[1280px] mx-auto">
          <div className="text-headline-md font-headline-md font-bold text-primary">HarvestPlan</div>
          
          <nav className="hidden md:flex items-center gap-md">
            <NavLinkItem to="/" end>Dashboard</NavLinkItem>
            <NavLinkItem to="/library">Library</NavLinkItem>
            <NavLinkItem to="/prep-list">Prep List</NavLinkItem>
            <NavLinkItem to="/shopping-list">Shopping List</NavLinkItem>
          </nav>

          <div className="flex items-center gap-base">
            <div className="relative hidden lg:block mr-md">
              <input 
                type="text" 
                placeholder="Search recipes..." 
                className="bg-surface-container-low border-none rounded-full px-6 py-2 text-body-sm w-64 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
              />
              <span className="material-symbols-outlined absolute right-3 top-2 text-on-surface-variant">search</span>
            </div>
            <IconButton icon="notifications" />
            <IconButton icon="account_circle" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-lg">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 w-full md:hidden flex justify-around items-center px-4 py-3 bg-surface shadow-[0px_-4px_20px_rgba(54,57,57,0.05)] z-50 rounded-t-xl">
        <NavLink
          to="/"
          end
          className={({ isActive }) => 
            `flex flex-col items-center justify-center px-5 py-1 transition-all duration-200 rounded-full ${
              isActive ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'
            }`
          }
        >
          <span className="material-symbols-outlined">calendar_today</span>
          <span className="font-label-sm text-label-sm">Plan</span>
        </NavLink>
        <NavLink
          to="/library"
          className={({ isActive }) => 
            `flex flex-col items-center justify-center px-5 py-1 transition-all duration-200 rounded-full ${
              isActive ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'
            }`
          }
        >
          <span className="material-symbols-outlined">restaurant_menu</span>
          <span className="font-label-sm text-label-sm">Library</span>
        </NavLink>
        <NavLink
          to="/prep-list"
          className={({ isActive }) => 
            `flex flex-col items-center justify-center px-5 py-1 transition-all duration-200 rounded-full ${
              isActive ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'
            }`
          }
        >
          <span className="material-symbols-outlined">checklist</span>
          <span className="font-label-sm text-label-sm">Prep</span>
        </NavLink>
        <NavLink
          to="/shopping-list"
          className={({ isActive }) => 
            `flex flex-col items-center justify-center px-5 py-1 transition-all duration-200 rounded-full ${
              isActive ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'
            }`
          }
        >
          <span className="material-symbols-outlined">shopping_cart</span>
          <span className="font-label-sm text-label-sm">Shop</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <footer className="bg-tertiary-container mt-xl">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop py-lg w-full max-w-[1280px] mx-auto text-on-tertiary-container">
          <div className="flex flex-col items-center md:items-start mb-base md:mb-0">
            <span className="font-headline-sm text-headline-sm">HarvestPlan</span>
            <p className="font-body-sm text-body-sm opacity-80 mt-1">© 2024 HarvestPlan. Rooted in health.</p>
          </div>
          <div className="flex gap-md">
            <a href="#" className="font-body-sm text-body-sm opacity-80 hover:opacity-100 hover:text-primary transition-opacity">Privacy Policy</a>
            <a href="#" className="font-body-sm text-body-sm opacity-80 hover:opacity-100 hover:text-primary transition-opacity">Terms of Service</a>
            <a href="#" className="font-body-sm text-body-sm opacity-80 hover:opacity-100 hover:text-primary transition-opacity">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
