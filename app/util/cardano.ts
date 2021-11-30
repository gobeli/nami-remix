import type { Responses } from "@blockfrost/blockfrost-js";


export function lovelaceToAda(amount?: number): string {
  if (!amount || isNaN(amount)) {
    return '';
  }
  return (amount / 1_000_000).toFixed(2);
}

export function getLovelace(address: Responses['address_content']): { unit: string; quantity: string; } | undefined {
  return address.amount?.find(a => a.unit === 'lovelace');
}

export function toHex(payload: string) {
  const payloadL = unescape(encodeURIComponent(payload));
  return [...payloadL].reduce((acc, char) => acc + char.charCodeAt(0).toString(16), '');
}