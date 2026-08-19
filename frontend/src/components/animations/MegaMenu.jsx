import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { sampleCategories } from '../../data/sampleProducts';

const MegaMenu = ({ isOpen, onClose }) => {
  const categories = sampleCategories.map(([name]) => ({ name, link: `/search?category=${encodeURIComponent(name)}` }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border-color)',
            padding: '3rem 5vw',
            zIndex: 90,
            boxShadow: 'var(--shadow-md)'
          }}
          onMouseLeave={onClose}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ gridColumn: 'span 1' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Shop by Category</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Discover AI verified products across all platforms.</p>
            </div>
            <div style={{ gridColumn: 'span 3', display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 + 0.1, duration: 0.3 }}
                >
                  <Link 
                    to={cat.link}
                    onClick={onClose}
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      display: 'block',
                      padding: '0.5rem 0',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    className="mega-menu-link"
                  >
                    {cat.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MegaMenu;
