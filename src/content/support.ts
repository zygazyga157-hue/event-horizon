/**
 * Support configuration
 * PayPal and crypto donation settings
 */
export const SUPPORT = {
  paypalDonateUrl: process.env.NEXT_PUBLIC_PAYPAL_DONATE_URL ?? "",
  btcAddress: process.env.NEXT_PUBLIC_BTC_ADDRESS ?? "",
  bchAddress: process.env.NEXT_PUBLIC_BCH_ADDRESS ?? "",
};
