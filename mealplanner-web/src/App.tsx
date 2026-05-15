import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WeekView from './pages/WeekView';
import ShoppingList from './pages/ShoppingList';
import MealLibrary from './pages/MealLibrary';
import PrepList from './pages/PrepList';
import Layout from './components/layout/Layout';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<WeekView />} />
          <Route path="/library" element={<MealLibrary />} />
          <Route path="/prep-list" element={<PrepList />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
