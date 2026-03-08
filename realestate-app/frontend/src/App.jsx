import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import PropertyDetails from './pages/PropertyDetails';
import PropertyComparison from './pages/PropertyComparison';
import FamilyProfile from './pages/FamilyProfile';
import AboutUs from './pages/AboutUs';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/compare" element={<PropertyComparison />} />
        <Route path="/family-profile" element={<FamilyProfile />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
    </BrowserRouter>
  );
}
