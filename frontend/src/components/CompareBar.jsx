import { useNavigate } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { motion, AnimatePresence } from 'framer-motion';
import { createProductPlaceholder, useProductImageFallback } from '../utils/productImage';

const CompareBar = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {compareItems.length > 0 && (
        <motion.div 
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderTop: '1px solid var(--border-color)',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.1)',
            padding: '1.5rem 5vw',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 9000
          }}
        >
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', letterSpacing: '0.1em' }}>COMPARE ({compareItems.length}/4)</h4>
            
            <AnimatePresence>
              {compareItems.map(item => (
                <motion.div 
                  key={item.product_id} 
                  initial={{ opacity: 0, x: -20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, width: 0, margin: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.5rem 1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--surface)',
                    minWidth: '220px',
                    maxWidth: '250px'
                  }}
                >
                  <img 
                    src={item.image_url || createProductPlaceholder(item.category, item.name)}
                    alt={item.name} 
                    style={{ width: '40px', height: '40px', objectFit: 'contain', mixBlendMode: 'multiply' }}
                    onError={(event) => useProductImageFallback(event, item.category, item.name)}
                  />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      ₹{Math.min(...item.listings.map(l => l.price)).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCompare(item.product_id)}
                    style={{ color: 'var(--text-muted)', fontSize: '1.2rem', padding: '0.2rem', marginLeft: 'auto' }}
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={clearCompare} style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clear All</button>
            <motion.button 
              whileHover={{ scale: compareItems.length >= 2 ? 1.05 : 1 }}
              whileTap={{ scale: compareItems.length >= 2 ? 0.95 : 1 }}
              onClick={() => navigate('/compare')} 
              className="btn-primary"
              disabled={compareItems.length < 2}
              style={{ opacity: compareItems.length < 2 ? 0.5 : 1, padding: '1rem 2rem', cursor: compareItems.length < 2 ? 'not-allowed' : 'pointer' }}
            >
              {compareItems.length < 2 ? 'SELECT AT LEAST 2' : 'COMPARE NOW →'}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompareBar;
