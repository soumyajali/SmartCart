import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchProducts } from '../services/productApi';
import ProductCard from '../components/ProductCard';
import sampleProducts, { findSampleProducts } from '../data/sampleProducts';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usingSamples, setUsingSamples] = useState(false);

  // Filters State
  const [sortOption, setSortOption] = useState('relevance');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults(category ? findSampleProducts('', category) : sampleProducts);
        setUsingSamples(true);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await searchProducts(query);
        const liveProducts = data.products || [];
        setResults(liveProducts.length ? liveProducts : findSampleProducts(query));
        setUsingSamples(liveProducts.length === 0);
      } catch (err) {
        setResults(findSampleProducts(query));
        setUsingSamples(true);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    // Debounce is mostly for typing, but since we search on Enter/submit in Navbar, we just fetch.
    fetchResults();
  }, [query, category]);

  // Apply Filters & Sorting
  useEffect(() => {
    let current = [...results];

    // Filter by Rating
    if (minRating > 0) {
      current = current.filter(p => {
        const bestListing = getBestListing(p.listings);
        return bestListing && bestListing.rating >= minRating;
      });
    }

    // Filter by Platform
    if (selectedPlatforms.length > 0) {
      current = current.filter(p => 
        p.listings.some(l => selectedPlatforms.includes(l.platform))
      );
    }

    // Sort
    if (sortOption === 'price_asc') {
      current.sort((a, b) => getBestListing(a.listings).price - getBestListing(b.listings).price);
    } else if (sortOption === 'price_desc') {
      current.sort((a, b) => getBestListing(b.listings).price - getBestListing(a.listings).price);
    } else if (sortOption === 'rating_desc') {
      current.sort((a, b) => getBestListing(b.listings).rating - getBestListing(a.listings).rating);
    }

    setFilteredResults(current);
  }, [results, sortOption, selectedPlatforms, minRating]);

  const getBestListing = (listings) => {
    if (!listings || listings.length === 0) return null;
    return listings.reduce((prev, curr) => (prev.price < curr.price ? prev : curr));
  };

  const handlePlatformChange = (platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  return (
    <div className="catalog-page">
      {/* Sidebar Filters */}
      <aside className="catalog-filters">
        <div className="catalog-filters__heading"><span>Refine results</span><span className="catalog-filters__count">{filteredResults.length}</span></div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Sort By</h4>
          <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
            className="catalog-select"
          >
            <option value="relevance">Recommended</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Highest Rating</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Platform</h4>
          {['Amazon', 'Flipkart', 'Reliance Digital'].map(platform => (
            <label key={platform} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input 
                type="checkbox" 
                checked={selectedPlatforms.includes(platform)}
                onChange={() => handlePlatformChange(platform)}
              />
              {platform}
            </label>
          ))}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Rating</h4>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input type="radio" name="rating" checked={minRating === 4} onChange={() => setMinRating(4)} /> 4★ & above
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input type="radio" name="rating" checked={minRating === 3} onChange={() => setMinRating(3)} /> 3★ & above
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input type="radio" name="rating" checked={minRating === 0} onChange={() => setMinRating(0)} /> Any Rating
          </label>
        </div>
      </aside>

      {/* Main Area */}
      <main className="catalog-results">
        <div className="catalog-header">
          <div>
          <p className="catalog-kicker">COMPARE & SAVE</p>
          <h2>
            {query ? `Search results for "${query}"` : category || 'Product Catalog'}
          </h2>
          <p>{filteredResults.length} products with live retailer prices</p>
          {usingSamples && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.35rem' }}>Offline catalogue — images are representative and retailer prices are sample data.</p>}
          </div>
          <button className="catalog-view-button" onClick={() => { setMinRating(0); setSelectedPlatforms([]); setSortOption('relevance'); }}>Reset filters</button>
        </div>

        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {/* Skeleton Loading State */}
            {[1, 2, 3].map(i => (
              <div key={i} className="card" style={{ padding: '1rem', height: '350px', backgroundColor: '#f1f5f9', animation: 'pulse 1.5s infinite' }}>
                <div style={{ height: '150px', backgroundColor: '#e2e8f0', marginBottom: '1rem', borderRadius: 'var(--radius-sm)' }}></div>
                <div style={{ height: '20px', backgroundColor: '#e2e8f0', marginBottom: '0.5rem', borderRadius: 'var(--radius-sm)', width: '80%' }}></div>
                <div style={{ height: '20px', backgroundColor: '#e2e8f0', marginBottom: '1rem', borderRadius: 'var(--radius-sm)', width: '60%' }}></div>
                <div style={{ height: '30px', backgroundColor: '#e2e8f0', borderRadius: 'var(--radius-sm)', width: '40%' }}></div>
              </div>
            ))}
          </div>
        )}
        
        {error && !loading && (
          <div style={{ padding: '2rem', backgroundColor: 'var(--danger)', color: 'white', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem' }}>Something went wrong</h3>
            <p>{error}</p>
            <button className="btn-outline" style={{ marginTop: '1rem', borderColor: 'white', color: 'white' }} onClick={() => window.location.reload()}>Try Again</button>
          </div>
        )}

        {!loading && !error && filteredResults.length > 0 && (
          <div className="product-grid">
            {filteredResults.map(product => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}

        {!loading && !error && filteredResults.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1rem' }}>{query ? 'No products found' : 'Search for a product to compare'}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {query ? "We couldn't find products matching your filters." : 'Use the search bar to compare live prices and retailer reviews.'}
            </p>
            {query && <button className="btn-primary" onClick={() => { setMinRating(0); setSelectedPlatforms([]); setSortOption('relevance'); }}>Clear Filters</button>}
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
