export function coinsToUSD(coins) {
  // Worker withdrawal rule: 20 coins = 1 USD
  return Number((coins / 20).toFixed(2))
}

export function usdToBuyerCoins(usd) {
  // Buyer purchase rule: 1 USD = 10 coins
  return Math.floor(usd * 10)
}

export const COIN_PACKAGES = [
  { coins: 10, amountUSD: 1 },
  { coins: 150, amountUSD: 10 },
  { coins: 500, amountUSD: 20 },
  { coins: 1000, amountUSD: 35 },
]

export function isValidCoinPackage(coins, amountUSD) {
  return COIN_PACKAGES.some(
    (p) => p.coins === coins && p.amountUSD === amountUSD
  )
}
