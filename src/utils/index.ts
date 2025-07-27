import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { deferUntilNextTick } from './deferUntilNextTick';
export { normalizeTokenAddressFor1inch, isNativeToken } from './tokenUtils';
