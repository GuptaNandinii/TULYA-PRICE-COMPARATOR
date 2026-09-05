'use server';

import type { ProductResult } from '@/server/scrapers/utils';

export async function comparePrices(productName: string): Promise<ProductResult[]> {
  if (!productName || productName.trim().length === 0) {
    return [];
  }

  console.log(`🔍 Starting live price comparison for: "${productName}"`);

  try {
    const { runAllScrapers } = await import("@/server/scrapers/scraper");
    const items = await runAllScrapers(productName);
    return items || [];
  } catch (error) {
    console.error('💥 Error in comparePrices:', error);
    return [];
  }
}

export async function retryScraper(site: string, productName: string): Promise<ProductResult | null> {
  if (!productName || productName.trim().length === 0) {
    return null;
  }

  try {
    let result: ProductResult | null = null;

    switch (site) {
      case 'Amazon': {
        const { scrapeAmazon } = await import('@/server/scrapers/amazon');
        const results = await scrapeAmazon(productName);
        result = results[0] || null;
        break;
      }
      case 'Flipkart': {
        const { scrapeFlipkart } = await import('@/server/scrapers/flipkart');
        const results = await scrapeFlipkart(productName);
        result = results[0] || null;
        break;
      }
      case 'GeM': {
        const { scrapeGeM } = await import('@/server/scrapers/gem');
        const results = await scrapeGeM(productName);
        result = results[0] || null;
        break;
      }
      case 'Snapdeal': {
        const { scrapeSnapdeal } = await import('@/server/scrapers/snapdeal');
        const results = await scrapeSnapdeal(productName);
        result = results[0] || null;
        break;
      }
      default:
        return null;
    }

    return result;
  } catch (error) {
    console.error(`Error retrying ${site}:`, error);
    return null;
  }
}
