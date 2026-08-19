import { useCompare } from '../context/CompareContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Heart, Scale } from 'lucide-react';
import { useState } from 'react';
import MagneticButton from './animations/MagneticButton';
import { createProductPlaceholder, useProductImageFallback } from '../utils/productImage';

const ProductCard = ({ product }) => {
  const { compareItems, addToCompare, removeFromCompare } = useCompare();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  const isSelected = compareItems.some(item => item.product_id === product.product_id);
  
  const lowestPriceListing = product.listings.reduce((prev, curr) =>
    prev.price < curr.price ? prev : curr
  );
  const bestListing = product.listings.find(listing => listing.is_recommended) || lowestPriceListing;

  const handleViewDetails = () => {
    navigate(`/products/${product.product_id}`, { state: { product } });
  };

  return (
    <motion.article 
      className="product-card"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{ y: isHovered ? -4 : 0 }}
      transition={{ duration: 0.25 }}
      onClick={handleViewDetails}
      data-cursor="view"
    >
      <div className="product-card__media">
        <div className="product-card__badges">
          {product.smartcart_choice && <span className="product-card__badge">SmartCart assured</span>}
          {lowestPriceListing.discount > 0 && <span className="product-card__discount">{lowestPriceListing.discount}% off</span>}
        </div>
        <button className="product-card__icon-button" aria-label="Add to wishlist" onClick={(e) => e.stopPropagation()}>
          <Heart size={18} strokeWidth={2} />
        </button>
        <motion.img 
          animate={{ scale: isHovered ? 1.06 : 1, y: isHovered ? -5 : 0 }}
          transition={{ duration: 0.35 }}
          src={product.image_url || createProductPlaceholder(product.category, product.name)}
          alt={`${product.brand} ${product.name}`} 
          className="product-card__image"
          onError={(event) => useProductImageFallback(event, product.category, product.name)}
        />
      </div>
      <div className="product-card__body">
        <p className="product-card__eyebrow">{product.brand} / {product.category}</p>
        <h3 className="product-card__title">{product.name}</h3>
        <div className="product-card__rating-row">
          {product.adjusted_rating || bestListing.rating > 0 ? <>
            <span className="product-card__rating">{product.adjusted_rating ? product.adjusted_rating.toFixed(1) : Number(bestListing.rating).toFixed(1)} ★</span>
            <span>({bestListing.review_count.toLocaleString('en-IN')} reviews)</span>
          </> : <span>Retailer rating unavailable</span>}
          {product.aggregate_trust_score && <strong>AI {product.aggregate_trust_score}</strong>}
        </div>
        <div className="product-card__price-row">
          <div>
            <span className="product-card__price">₹{lowestPriceListing.price.toLocaleString('en-IN')}</span>
            {lowestPriceListing.discount > 0 && <span className="product-card__usual">₹{lowestPriceListing.original_price.toLocaleString('en-IN')}</span>}
          </div>
          <span className="product-card__lowest">Best offer: {bestListing.platform}</span>
        </div>
        <div className="product-card__stores">
          {product.listings.slice(0, 3).map(listing => (
            <span key={listing.id}><b>{listing.platform}</b> ₹{listing.price.toLocaleString('en-IN')}{listing.is_recommended ? ' • Best value' : ''}</span>
          ))}
        </div>
        <div className="product-card__actions">
          <MagneticButton
            className="btn-primary"
            style={{ flex: 1, padding: '0.75rem 1rem', fontSize: '0.72rem' }}
            onClick={(e) => { e.stopPropagation(); window.open(bestListing.product_url || '#', '_blank', 'noopener,noreferrer'); }}
          >
            BUY NOW <ArrowUpRight size={15} />
          </MagneticButton>
          <button className={isSelected ? 'product-card__compare product-card__compare--active' : 'product-card__compare'} aria-label="Compare product" onClick={(e) => { e.stopPropagation(); if (isSelected) removeFromCompare(product.product_id); else addToCompare(product); }}>
            <Scale size={17} />
          </button>
        </div>
      </div>
      <div className="product-card__compare-label">{isSelected ? 'Added to compare' : 'Add to compare'}</div>
    </motion.article>
  );
};

export default ProductCard;
