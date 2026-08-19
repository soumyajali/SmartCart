// Intentional failure for testing the application's error handling.
throw new Error('Intentional test error: sampleProducts failed to load.');

export const sampleCategories = [
  ['Smartphones', 'Galaxy S24 5G', 'Samsung', 68999],
  ['Laptops', 'MacBook Air M2', 'Apple', 89990],
  ['Audio', 'WH-1000XM5 Headphones', 'Sony', 29999],
  ['Gaming', 'PlayStation 5 Slim Console', 'Sony', 44990],
  ['Televisions', '4K QLED Smart TV', 'Samsung', 52990],
  ['Cameras', 'EOS R50 Mirrorless Camera', 'Canon', 67990],
  ['Smartwatches', 'Galaxy Watch 7', 'Samsung', 24999],
  ['Tablets', 'iPad Air', 'Apple', 54990],
  ['Computer Accessories', 'Mechanical Wireless Keyboard', 'Logitech', 8999],
  ['Kitchen Appliances', 'Air Fryer', 'Philips', 9999],
  ['Refrigerators', 'Double Door Refrigerator', 'LG', 37990],
  ['Washing Machines', 'Front Load Washing Machine', 'Bosch', 32990],
  ['Air Conditioners', '1.5 Ton Inverter AC', 'Daikin', 42990],
  ['Home Furniture', 'Ergonomic Office Chair', 'Green Soul', 12999],
  ['Home Decor', 'Modern Floor Lamp', 'IKEA', 4999],
  ["Men's Fashion", 'Slim Fit Casual Shirt', 'Levi’s', 1799],
  ["Women's Fashion", 'Floral Midi Dress', 'Mango', 2999],
  ['Footwear', 'Running Shoes', 'ASICS', 6499],
  ['Beauty & Personal Care', 'Vitamin C Face Serum', 'Minimalist', 599],
  ['Health & Fitness', 'Smart Weighing Scale', 'HealthSense', 1499],
  ['Sports & Outdoors', 'Yoga Mat', 'Boldfit', 999],
  ['Books', 'Atomic Habits', 'James Clear', 499],
  ['Toys & Games', 'LEGO Classic Creative Box', 'LEGO', 2499],
  ['Baby Care', 'Premium Baby Diapers', 'Pampers', 1199],
  ['Groceries', 'Cold Pressed Groundnut Oil', 'Fortune', 399],
  ['Pet Supplies', 'Adult Dog Food', 'Pedigree', 1799],
  ['Automotive', 'Portable Tyre Inflator', 'Michelin', 2999],
  ['Office Supplies', 'Ink Tank Printer', 'HP', 12999],
  ['Travel Accessories', 'Hard Shell Cabin Trolley', 'American Tourister', 5499],
  ['Jewellery', 'Sterling Silver Pendant', 'GIVA', 2199],
];

// Offline catalogue photos. Live API results always replace these with the
// retailer image_url returned alongside the retailer product link.
const sampleCategoryImages = {
  Smartphones: '/products/samsung-galaxy-s24.png',
  Laptops: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85',
  Audio: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85',
  Gaming: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=85',
  Televisions: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=85',
  Cameras: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85',
  Smartwatches: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85',
  Tablets: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=85',
  'Computer Accessories': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85',
  'Kitchen Appliances': 'https://images.unsplash.com/photo-1585515656973-3b4c4a0e6d6b?auto=format&fit=crop&w=900&q=85',
  Refrigerators: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=900&q=85',
  'Washing Machines': 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=900&q=85',
  'Air Conditioners': 'https://images.unsplash.com/photo-1631545806609-96b1d52af9a6?auto=format&fit=crop&w=900&q=85',
  'Home Furniture': 'https://images.unsplash.com/photo-1505843490538-5133c6c6d7e1?auto=format&fit=crop&w=900&q=85',
  'Home Decor': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85',
  "Men's Fashion": 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
  "Women's Fashion": 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85',
  Footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85',
  'Beauty & Personal Care': 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=85',
  'Health & Fitness': 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=900&q=85',
  'Sports & Outdoors': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=900&q=85',
  Books: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85',
  'Toys & Games': 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=900&q=85',
  'Baby Care': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=85',
  Groceries: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85',
  'Pet Supplies': 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=900&q=85',
  Automotive: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=85',
  'Office Supplies': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85',
  'Travel Accessories': 'https://images.unsplash.com/photo-1553531889-56cf72c0d7f1?auto=format&fit=crop&w=900&q=85',
  Jewellery: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85',
};

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const productVariants = [
  'Essential', 'Classic', 'Standard', 'Select', 'Plus', 'Premium', 'Pro', 'Max', 'Ultra', 'Elite',
  'Lite', 'Advance', 'Signature', 'Limited Edition', 'Smart', 'Eco', 'Everyday', 'Performance', 'Comfort', 'Travel',
  'Home', 'Studio', 'Sport', 'Compact', 'Large', 'Mini', 'Value Pack', 'New Edition', '2026 Edition', 'Best Seller',
];

const featuredProducts = [
  {
    product_id: 'sample-sony-xm5',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    brand: 'Sony',
    category: 'Electronics',
    description: 'Noise-cancelling wireless headphones.',
    image_url: 'https://m.media-amazon.com/images/I/61%2BOigWtPQL._SL1500_.jpg',
    smartcart_choice: true,
    recommendation_score: 91,
    listings: [
      { id: 'sample-sony-amazon', platform: 'Amazon', seller: 'Appario Retail', price: 29999, original_price: 34990, discount: 14, rating: 4.4, review_count: 1248, availability: 'In Stock', product_url: 'https://www.amazon.in/', is_recommended: true },
      { id: 'sample-sony-flipkart', platform: 'Flipkart', seller: 'SuperComNet', price: 30499, original_price: 34990, discount: 13, rating: 4.3, review_count: 850, availability: 'In Stock', product_url: 'https://www.flipkart.com/' },
      { id: 'sample-sony-reliance', platform: 'Reliance Digital', seller: 'Reliance', price: 29799, original_price: 34990, discount: 15, rating: 4.2, review_count: 320, availability: 'Limited Stock', product_url: 'https://www.reliancedigital.in/' },
    ],
  },
  {
    product_id: 'sample-samsung-s23',
    name: 'Samsung Galaxy S23 Ultra',
    brand: 'Samsung',
    category: 'Smartphones',
    description: 'Premium Android smartphone.',
    image_url: 'https://m.media-amazon.com/images/I/71lD7eNdW-L._SX679_.jpg',
    recommendation_score: 88,
    listings: [
      { id: 'sample-samsung-amazon', platform: 'Amazon', seller: 'STPL', price: 104999, original_price: 124999, discount: 16, rating: 4.6, review_count: 3210, availability: 'In Stock', product_url: 'https://www.amazon.in/', is_recommended: true },
      { id: 'sample-samsung-flipkart', platform: 'Flipkart', seller: 'MobilesHub', price: 105999, original_price: 124999, discount: 15, rating: 4.5, review_count: 2100, availability: 'In Stock', product_url: 'https://www.flipkart.com/' },
    ],
  },
  {
    product_id: 'sample-macbook-air-m2',
    name: 'Apple MacBook Air M2',
    brand: 'Apple',
    category: 'Laptops',
    description: 'Lightweight laptop with Apple M2 chip.',
    image_url: 'https://m.media-amazon.com/images/I/71f5Eu5lJ4L._SX679_.jpg',
    recommendation_score: 86,
    listings: [
      { id: 'sample-macbook-amazon', platform: 'Amazon', seller: 'Appario Retail', price: 109900, original_price: 114900, discount: 4, rating: 4.8, review_count: 5600, availability: 'In Stock', product_url: 'https://www.amazon.in/', is_recommended: true },
      { id: 'sample-macbook-flipkart', platform: 'Flipkart', seller: 'RetailNet', price: 111990, original_price: 114900, discount: 3, rating: 4.7, review_count: 1800, availability: 'In Stock', product_url: 'https://www.flipkart.com/' },
    ],
  },
];

const categoryProducts = sampleCategories.flatMap(([category, name, brand, basePrice], categoryIndex) =>
  productVariants.map((variant, variantIndex) => {
    const index = categoryIndex * productVariants.length + variantIndex;
    const id = `sample-${slugify(category)}-${variantIndex + 1}`;
    const productName = `${brand} ${name} ${variant}`;
    const price = Math.max(99, Math.round(basePrice * (0.82 + variantIndex * 0.018)));
    const rating = Number((4.1 + (index % 8) * 0.1).toFixed(1));

    return {
      product_id: id,
      name: productName,
      brand,
      category,
      description: `Sample ${category.toLowerCase()} product for offline price comparison.`,
      image_url: sampleCategoryImages[category],
      smartcart_choice: index === 0,
      recommendation_score: 90 - (index % 10),
      listings: [
        { id: `${id}-amazon`, platform: 'Amazon', seller: 'Sample Seller', price, original_price: Math.round(price * 1.12), discount: 11, rating, review_count: 300 + index * 83, availability: 'In Stock', product_url: `https://www.amazon.in/s?k=${encodeURIComponent(productName)}`, is_recommended: true },
        { id: `${id}-flipkart`, platform: 'Flipkart', seller: 'Sample Seller', price: price + Math.max(50, Math.round(price * 0.03)), original_price: Math.round(price * 1.12), discount: 8, rating: Math.max(0, rating - 0.1), review_count: 220 + index * 61, availability: 'In Stock', product_url: `https://www.flipkart.com/search?q=${encodeURIComponent(productName)}` },
        { id: `${id}-reliance`, platform: 'Reliance Digital', seller: 'Sample Seller', price: price + Math.max(100, Math.round(price * 0.05)), original_price: Math.round(price * 1.12), discount: 6, rating: Math.max(0, rating - 0.2), review_count: 110 + index * 41, availability: 'Limited Stock', product_url: `https://www.reliancedigital.in/search?q=${encodeURIComponent(productName)}` },
      ],
    };
  }),
);

const sampleProducts = [...featuredProducts, ...categoryProducts];

export const findSampleProducts = (query = '', category = '') => {
  const term = (category || query).trim().toLowerCase();
  if (!term) return sampleProducts;

  return sampleProducts.filter((product) =>
    [product.name, product.brand, product.category].some((value) => value.toLowerCase().includes(term)),
  );
};

export default sampleProducts;
