import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import ComparePage from './pages/ComparePage';
import CompareBar from './components/CompareBar';
import ProductDetails from './pages/ProductDetails';
import Analytics from './pages/Analytics';
import Preloader from './components/animations/Preloader';
import CustomCursor from './components/animations/CustomCursor';
import Chatbot from './components/animations/Chatbot';
import Footer from './components/Footer';

// Wrapper for AnimatePresence to work with Routes
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition><Home /></PageTransition>
        } />
        <Route path="/search" element={
          <PageTransition><Search /></PageTransition>
        } />
        <Route path="/compare" element={
          <PageTransition><ComparePage /></PageTransition>
        } />
        <Route path="/products/:id" element={
          <PageTransition><ProductDetails /></PageTransition>
        } />
        <Route path="/analytics" element={
          <PageTransition><Analytics /></PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
};

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Router>
      <CustomCursor />
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      
      {!isLoading && (
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <AnimatedRoutes />
          </main>
          <Footer />
          <CompareBar />
          <Chatbot />
        </div>
      )}
    </Router>
  );
}

export default App;
