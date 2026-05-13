import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Calendar, ShoppingCart } from 'lucide-react';
import WeekView from './pages/WeekView';
import ShoppingList from './pages/ShoppingList';

const getNavLinkClass = (isActive: boolean, color: 'indigo' | 'purple') =>
  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
    isActive
      ? `border-${color}-500 text-gray-900`
      : `border-transparent text-gray-500 hover:text-gray-700 hover:border-${color}-300`
  }`;

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <nav className="bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-indigo-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    Meal Planner
                  </span>
                </div>
                <div className="ml-8 flex space-x-8">
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) => getNavLinkClass(isActive, 'indigo')}
                  >
                    <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                    Week View
                  </NavLink>
                  <NavLink
                    to="/shopping-list"
                    className={({ isActive }) => getNavLinkClass(isActive, 'purple')}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2 text-purple-500" />
                    Shopping List
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<WeekView />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
