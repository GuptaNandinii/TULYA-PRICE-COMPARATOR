const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Store Chromium inside the project directory so it persists in Render/production
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
