// currencyUtils.js
import User from "../models/user.model.js";

// Map of country codes to their respective currencies
const countryCurrencyMap = {
  // Major currencies
  US: { code: 'usd', symbol: '$' },
  IN: { code: 'inr', symbol: '₹' },
  GB: { code: 'gbp', symbol: '£' },
  EU: { code: 'eur', symbol: '€' },
  CA: { code: 'cad', symbol: '$' },
  AU: { code: 'aud', symbol: '$' },
  JP: { code: 'jpy', symbol: '¥' },
  CN: { code: 'cny', symbol: '¥' },
  TH: { code: 'thb', symbol: '฿' },
  FR: { code: 'eur', symbol: '€' },
  ES: { code: 'eur', symbol: '€' },
  ID: { code: 'idr', symbol: 'Rp' },
  // Add more countries as needed
};

// Default currency if country is not found
const DEFAULT_CURRENCY = { code: 'usd', symbol: '$' };

/**
 * Get currency details based on user's country
 * @param {string} userId - User ID to fetch country from
 * @returns {Promise<Object>} - Currency details (code and symbol)
 */
export const getUserCurrency = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.country) {
      return DEFAULT_CURRENCY;
    }

    // Handle both 2-letter country codes and full country names
    const countryCode = user.country.length === 2 
      ? user.country.toUpperCase() 
      : user.country.substring(0, 2).toUpperCase();
    
    return countryCurrencyMap[countryCode] || DEFAULT_CURRENCY;
  } catch (error) {
    console.error("Error getting user currency:", error);
    return DEFAULT_CURRENCY;
  }
};

/**
 * Convert amount from one currency to another
 * Uses a simple API for exchange rates (replace with your preferred provider)
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<number>} - Converted amount
 */
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    // Skip conversion if currencies are the same
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // Example using a free exchange rate API
    // Replace with your preferred provider (e.g., Stripe has currency conversion capabilities)
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
    const data = await response.json();
    
    if (data.rates && data.rates[toCurrency]) {
      return amount * data.rates[toCurrency];
    }
    
    return amount; // Fallback if conversion fails
  } catch (error) {
    console.error("Currency conversion error:", error);
    return amount; // Return original amount if conversion fails
  }
};

/**
 * Determine the display currency for a user
 * @param {Object} user - User object containing country info
 * @returns {Object} - Currency details (code and symbol)
 */
export const getDisplayCurrency = (user) => {
  if (!user || !user.country) {
    return DEFAULT_CURRENCY;
  }
  
  const countryCode = user.country.length === 2 
    ? user.country.toUpperCase() 
    : user.country.substring(0, 2).toUpperCase();
  
  return countryCurrencyMap[countryCode] || DEFAULT_CURRENCY;
};

/**
 * Format amount to display with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - Currency code
 * @returns {string} - Formatted amount with symbol
 */
export const formatAmountWithCurrency = (amount, currencyCode) => {
  let currency = DEFAULT_CURRENCY;
  
  // Find currency by code
  for (const country in countryCurrencyMap) {
    if (countryCurrencyMap[country].code === currencyCode) {
      currency = countryCurrencyMap[country];
      break;
    }
  }
  
  // Format based on currency
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2
  });
  
  return formatter.format(amount);
};