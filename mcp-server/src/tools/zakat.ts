/**
 * Zakat Calculator tool: F11
 *
 * Calculates zakat based on gold/silver nisab (universal standard).
 * Supports cash, gold, silver, and trade goods.
 * Currency-agnostic — user enters values in their local currency.
 */

// Nisab values in grams (universal Islamic standard)
const NISAB_GOLD_GRAMS = 85;    // 85 grams of gold
const NISAB_SILVER_GRAMS = 595; // 595 grams of silver
const ZAKAT_RATE = 0.025;       // 2.5%

export interface ZakatInput {
  cash: number;
  goldGrams: number;
  silverGrams: number;
  tradeGoods: number;
  goldPricePerGram: number;    // in user's currency
  silverPricePerGram: number;  // in user's currency
  currency: string;
}

export interface ZakatOutput {
  totalWealth: number;
  goldValue: number;
  silverValue: number;
  nisabGold: number;
  nisabSilver: number;
  nisabUsed: "gold" | "silver";
  nisabThreshold: number;
  isObligated: boolean;
  zakatPayable: number;
}

export function calculateZakat(input: ZakatInput): ZakatOutput {
  const goldValue = input.goldGrams * input.goldPricePerGram;
  const silverValue = input.silverGrams * input.silverPricePerGram;
  const totalWealth = input.cash + goldValue + silverValue + input.tradeGoods;

  const nisabGold = NISAB_GOLD_GRAMS * input.goldPricePerGram;
  const nisabSilver = NISAB_SILVER_GRAMS * input.silverPricePerGram;

  // Use silver nisab (lower threshold, more beneficial to poor) per majority scholarly opinion
  const nisabUsed: "gold" | "silver" = "silver";
  const nisabThreshold = nisabSilver;

  const isObligated = totalWealth >= nisabThreshold;
  const zakatPayable = isObligated ? Math.round(totalWealth * ZAKAT_RATE * 100) / 100 : 0;

  return {
    totalWealth: Math.round(totalWealth * 100) / 100,
    goldValue: Math.round(goldValue * 100) / 100,
    silverValue: Math.round(silverValue * 100) / 100,
    nisabGold: Math.round(nisabGold * 100) / 100,
    nisabSilver: Math.round(nisabSilver * 100) / 100,
    nisabUsed,
    nisabThreshold: Math.round(nisabThreshold * 100) / 100,
    isObligated,
    zakatPayable,
  };
}

export function formatZakatResult(input: ZakatInput, zakat: ZakatOutput, currency: string): string {
  const c = currency.toUpperCase();

  const lines = [
    `💰 *Zakat Calculator*`,
    ``,
    `📊 *Total Wealth: ${zakat.totalWealth.toLocaleString()} ${c}*`,
    ``,
    `💵 Cash: ${input.cash.toLocaleString()} ${c}`,
    `🥇 Gold: ${input.goldGrams}g = ${zakat.goldValue.toLocaleString()} ${c}`,
    `🥈 Silver: ${input.silverGrams}g = ${zakat.silverValue.toLocaleString()} ${c}`,
    input.tradeGoods > 0 ? `📦 Trade Goods: ${input.tradeGoods.toLocaleString()} ${c}` : null,
    ``,
    `⚖️ Nisab (Silver, 595g): *${zakat.nisabThreshold.toLocaleString()} ${c}*`,
    `⚖️ Nisab (Gold, 85g): ${zakat.nisabGold.toLocaleString()} ${c}`,
    ``,
  ].filter(Boolean) as string[];

  if (!zakat.isObligated) {
    lines.push(
      `❌ *Zakat is not obligatory* — wealth below nisab.`,
      `📏 Need ${(zakat.nisabThreshold - zakat.totalWealth).toLocaleString()} ${c} more.`,
      ``,
      `_Using silver nisab per majority scholarly opinion._`
    );
  } else {
    lines.push(
      `✅ *Zakat is obligatory!*`,
      `💸 *Payable: ${zakat.zakatPayable.toLocaleString()} ${c}* (2.5%)`,
      ``,
      `_Using silver nisab per majority scholarly opinion._`
    );
  }

  return lines.join("\n");
}
