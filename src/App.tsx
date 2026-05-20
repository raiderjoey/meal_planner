import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import RecipeLibrary from './pages/Recipes/RecipeLibrary';
import RecipeCreator from './pages/Recipes/RecipeCreator';
import ShoppingList from './pages/ShoppingList/ShoppingList';
import Pantry from './pages/Pantry/Pantry';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/recipes" element={<RecipeLibrary />} />
          <Route path="/recipes/new" element={<RecipeCreator />} />
          <Route path="/pantry" element={<Pantry />} />
          <Route path="/ingredients" element={<div>Ingredients Page (Coming Soon)</div>} />
          <Route path="/shopping-list" element={<ShoppingList />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
