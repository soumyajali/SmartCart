const categoryColors = {
  Smartphones: ['#dbeafe', '#1d4ed8'], Laptops: ['#ede9fe', '#6d28d9'], Audio: ['#fce7f3', '#be185d'],
  Gaming: ['#dcfce7', '#15803d'], Televisions: ['#e0f2fe', '#0369a1'], Cameras: ['#fef3c7', '#b45309'],
  Smartwatches: ['#e0e7ff', '#4338ca'], Tablets: ['#f3e8ff', '#9333ea'], Footwear: ['#ffedd5', '#c2410c'],
};

export const createProductPlaceholder = (category = 'Product', name = 'Product') => {
  const [background, foreground] = categoryColors[category] || ['#f1f5f9', '#334155'];
  const label = String(category).slice(0, 18);
  const title = String(name).slice(0, 28);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <rect width="600" height="600" rx="48" fill="${background}"/>
    <rect x="128" y="104" width="344" height="300" rx="36" fill="${foreground}" opacity=".15"/>
    <path d="M210 330h180l-28-126H238z" fill="${foreground}" opacity=".9"/>
    <circle cx="300" cy="248" r="58" fill="${background}" opacity=".9"/>
    <text x="300" y="476" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="${foreground}">${label}</text>
    <text x="300" y="518" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="${foreground}" opacity=".8">${title}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const useProductImageFallback = (event, category, name) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = createProductPlaceholder(category, name);
};
