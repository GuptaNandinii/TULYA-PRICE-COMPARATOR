"use server";

import { scrapeAmazon } from './amazon';
import { scrapeFlipkart } from './flipkart';
import { scrapeGeM } from './gem';
import { scrapeSnapdeal } from './snapdeal';
import { ProductResult } from './utils';

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T, name: string): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      console.warn(`⏱️ ${name} exceeded ${timeoutMs}ms limit, skipping...`);
      resolve(fallback);
    }, timeoutMs);
  });

  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }).catch((err) => {
      clearTimeout(timer);
      throw err;
    }),
    timeoutPromise,
  ]);
}

export async function runAllScrapers(query: string): Promise<ProductResult[]> {
  console.log(`🚀 Starting scraping for: "${query}"`);

  // Run all scrapers in parallel with a 12s safety timeout per scraper
  const results = await Promise.allSettled([
    withTimeout(scrapeAmazon(query), 12000, [], 'Amazon'),
    withTimeout(scrapeFlipkart(query), 12000, [], 'Flipkart'),
    withTimeout(scrapeGeM(query), 12000, [], 'GeM'),
    withTimeout(scrapeSnapdeal(query), 12000, [], 'Snapdeal'),
  ]);

  // Flatten all results and filter valid products
  const allProducts: ProductResult[] = [];

  results.forEach((result, index) => {
    const sites = ['Amazon', 'Flipkart', 'GeM', 'Snapdeal'];
    if (result.status === 'fulfilled') {
      const products = result.value;
      console.log(`✅ ${sites[index]}: Found ${products.length} products`);
      allProducts.push(...products);
    } else {
      const error = result.reason;
      console.error(`❌ ${sites[index]} failed:`, error instanceof Error ? error.message : String(error));
      if (error instanceof Error && error.stack) {
        console.error(`   Stack: ${error.stack.substring(0, 200)}`);
      }
    }
  });

  // Filter valid products (must have title and price)
  const validProducts = allProducts.filter(
    (p) => p && p.title && p.price && p.price !== 'Price not available'
  );

  // Sort by price (numeric, ascending)
  validProducts.sort((a, b) => {
    const priceA = parseInt(a.price.replace(/[^\d]/g, '')) || Infinity;
    const priceB = parseInt(b.price.replace(/[^\d]/g, '')) || Infinity;
    return priceA - priceB;
  });

  console.log(`📊 Total: ${validProducts.length} valid products from ${allProducts.length} found`);

  return validProducts;
}
