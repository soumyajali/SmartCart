import { useCompare } from '../context/CompareContext';
import { useNavigate, Link } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { createProductPlaceholder, useProductImageFallback } from '../utils/productImage';

const ComparePage = () => {
  const { compareItems, removeFromCompare } = useCompare();
  const navigate = useNavigate();

  if (compareItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>No products selected for comparison</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please select products from the search results.</p>
        <button onClick={() => navigate('/search')} className="btn-primary">Go to Search</button>
      </div>
    );
  }

  // Calculate Best Values
  let bestPriceId = null;
  let bestRatingId = null;
  
  if (compareItems.length > 0) {
    // Flatten all listings to find absolute best
    const allListings = compareItems.flatMap(p => 
      p.listings.map(l => ({ ...l, parent_id: p.product_id }))
    );
    
    if (allListings.length > 0) {
      const bestPriceListing = allListings.reduce((min, curr) => curr.price < min.price ? curr : min);
      bestPriceId = bestPriceListing.parent_id;

      const bestRatingListing = allListings.reduce((max, curr) => curr.rating > max.rating ? curr : max);
      bestRatingId = bestRatingListing.parent_id;
    }
  }

  // Prepare Data for Radar Chart
  const radarData = [
    { subject: 'Trust Score', fullMark: 100 },
    { subject: 'Rating', fullMark: 5 },
    { subject: 'Availability', fullMark: 100 },
    { subject: 'Price Value', fullMark: 100 },
    { subject: 'Popularity', fullMark: 100 }
  ];

  if (compareItems.length > 0) {
    const maxPrice = Math.max(...compareItems.flatMap(p => p.listings.map(l => l.price)));
    
    radarData.forEach(metric => {
      compareItems.forEach((product, idx) => {
        const topListing = product.listings.reduce((prev, curr) => prev.rating > curr.rating ? prev : curr);
        const bestPriceListing = product.listings.reduce((min, curr) => curr.price < min.price ? curr : min);
        
        if (metric.subject === 'Trust Score') metric[`product${idx}`] = 85 + Math.random() * 10; // Mocked or from API
        if (metric.subject === 'Rating') metric[`product${idx}`] = topListing.rating;
        if (metric.subject === 'Availability') metric[`product${idx}`] = bestPriceListing.availability === 'In Stock' ? 100 : 20;
        if (metric.subject === 'Price Value') metric[`product${idx}`] = ((maxPrice - bestPriceListing.price) / maxPrice) * 100 + 50; // Higher is better
        if (metric.subject === 'Popularity') metric[`product${idx}`] = Math.min((topListing.review_count / 1000) * 100, 100);
      });
    });
  }

  const RADAR_COLORS = ['#3b82f6', '#ef4444', '#22c55e']; // Blue, Red, Green

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Product Comparison</h2>
        <button onClick={() => navigate('/search')} className="btn-outline">Back to Search</button>
      </div>

      {compareItems.length > 1 && (
        <div className="card" style={{ padding: '2rem', marginBottom: '3rem', backgroundColor: '#fff', height: '400px' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Multi-Dimensional Analysis</h3>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
              <RechartsTooltip />
              <Legend verticalAlign="bottom" height={36}/>
              {compareItems.map((product, idx) => (
                <Radar 
                  key={product.product_id}
                  name={product.name.substring(0, 20) + '...'} 
                  dataKey={`product${idx}`} 
                  stroke={RADAR_COLORS[idx % RADAR_COLORS.length]} 
                  fill={RADAR_COLORS[idx % RADAR_COLORS.length]} 
                  fillOpacity={0.3} 
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ display: 'flex', overflowX: 'auto', gap: '1.5rem', paddingBottom: '2rem' }}>
        {/* Features Label Column */}
        <div style={{ flexShrink: 0, width: '200px', display: 'flex', flexDirection: 'column', marginTop: '300px' }}>
          <div className="compare-row-label">Platforms</div>
          <div className="compare-row-label">Best Price</div>
          <div className="compare-row-label">Highest Rating</div>
          <div className="compare-row-label">Best Availability</div>
          <div className="compare-row-label">Category</div>
          <div className="compare-row-label">Brand</div>
        </div>

        {/* Product Columns */}
        {compareItems.map(product => {
          const bestListing = product.listings.reduce((prev, curr) => prev.price < curr.price ? prev : curr);
          const topRating = product.listings.reduce((prev, curr) => prev.rating > curr.rating ? prev : curr);

          return (
            <div key={product.product_id} className="card" style={{ flexShrink: 0, width: '300px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', padding: '1rem', height: '250px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button 
                  onClick={() => removeFromCompare(product.product_id)}
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', cursor: 'pointer', zIndex: 10 }}
                >
                  ✕
                </button>
                <img src={product.image_url || createProductPlaceholder(product.category, product.name)} alt={product.name} onError={(event) => useProductImageFallback(event, product.category, product.name)} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              </div>
              
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', height: '100px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>{product.name}</h3>
                {product.product_id === bestPriceId && <span className="badge badge-success" style={{ marginTop: '0.5rem' }}>Best Value Winner</span>}
              </div>

              {/* Data Rows */}
              <div className="compare-row-data">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {product.listings.map(l => (
                    <span key={l.id} className="badge badge-warning" style={{ fontSize: '0.65rem' }}>{l.platform}</span>
                  ))}
                </div>
              </div>

              <div className="compare-row-data" style={{ fontWeight: '700', color: product.product_id === bestPriceId ? 'var(--success)' : 'inherit' }}>
                ₹{bestListing.price.toLocaleString('en-IN')}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>via {bestListing.platform}</div>
              </div>

              <div className="compare-row-data" style={{ fontWeight: '600', color: product.product_id === bestRatingId ? 'var(--primary)' : 'inherit' }}>
                ★ {topRating.rating.toFixed(1)}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({topRating.review_count} reviews)</div>
              </div>

              <div className="compare-row-data">
                <span style={{ color: bestListing.availability === 'In Stock' ? 'var(--success)' : 'var(--danger)' }}>
                  {bestListing.availability}
                </span>
              </div>

              <div className="compare-row-data">{product.category}</div>
              <div className="compare-row-data">{product.brand}</div>

              <div style={{ padding: '1rem', marginTop: 'auto' }}>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%' }}
                  onClick={() => navigate(`/products/${product.product_id}`, { state: { product } })}
                >
                  View Product Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .compare-row-label {
          padding: 1rem;
          height: 80px;
          display: flex;
          align-items: center;
          font-weight: 600;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-color);
        }
        .compare-row-data {
          padding: 1rem;
          height: 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-bottom: 1px solid var(--border-color);
        }
      `}</style>
    </div>
  );
};

export default ComparePage;
