import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, User, ShoppingBag } from 'lucide-react';
import SearchOverlay from './animations/SearchOverlay';
import MegaMenu from './animations/MegaMenu';
import CartSlider from './CartSlider';
import ProfileSlider from './ProfileSlider';

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const { scrollY } = useScroll();
  
  // Navbar animations
  const navHeight = useTransform(scrollY, [0, 100], ['100px', '70px']);
  const navBackground = useTransform(scrollY, [0, 100], ['rgba(245, 245, 245, 0)', 'rgba(255, 255, 255, 0.85)']);
  const navBlur = useTransform(scrollY, [0, 100], ['blur(0px)', 'blur(12px)']);
  const navBorder = useTransform(scrollY, [0, 100], ['1px solid rgba(229, 229, 229, 0)', '1px solid rgba(229, 229, 229, 1)']);
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.85]);

  return (
    <>
      <motion.nav 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: navHeight,
          backgroundColor: navBackground,
          backdropFilter: navBlur,
          WebkitBackdropFilter: navBlur,
          borderBottom: navBorder,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 5vw',
        }}
      >
        <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
          <motion.div style={{ scale: logoScale, originX: 0 }}>
            <Link to="/" style={{ 
              fontSize: '1.8rem', 
              fontWeight: 900, 
              color: 'var(--primary)',
              letterSpacing: '-0.05em',
              fontStyle: 'italic'
            }}>
              smartcart
            </Link>
          </motion.div>
          
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link to="/" style={{ fontWeight: 600, fontSize: '0.9rem' }}>HOME</Link>
            <div 
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', height: '100%', display: 'flex', alignItems: 'center' }}
            >
              CATEGORIES
            </div>
            <Link to="/compare" style={{ fontWeight: 600, fontSize: '0.9rem' }}>COMPARE</Link>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button onClick={() => setIsSearchOpen(true)} aria-label="Search">
            <Search size={22} strokeWidth={1.5} />
          </button>
          <button onClick={() => setIsProfileOpen(true)} aria-label="User Account">
            <User size={22} strokeWidth={1.5} />
          </button>
          <button onClick={() => setIsCartOpen(true)} aria-label="Cart">
            <ShoppingBag size={22} strokeWidth={1.5} />
          </button>
        </div>
        
        <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
      </motion.nav>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartSlider isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <ProfileSlider isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};

export default Navbar;
