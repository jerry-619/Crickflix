import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import CategoryPage from './pages/CategoryPage';
import MatchPlayer from './pages/MatchPlayer';
import Categories from './pages/Categories';
import LiveMatches from './pages/LiveMatches';
import TestVideo from './components/TestVideo';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blogs" element={<Blogs />} />
      <Route path="/blogs/:slug" element={<BlogDetail />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/live" element={<LiveMatches />} />
      <Route path="/category/:slug" element={<CategoryPage />} />
      <Route path="/match/:id" element={<MatchPlayer />} />
      <Route path="/test-video" element={<TestVideo />} />
    </Routes>
  );
};

export default AppRoutes; 