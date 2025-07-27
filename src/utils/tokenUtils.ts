export const NATIVE_TOKEN_ADDRESS_1INCH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const normalizeTokenAddressFor1inch = (address: string): string => {
  if (address === '0x0000000000000000000000000000000000000000') {
    return NATIVE_TOKEN_ADDRESS_1INCH;
  }

  if (address.toLowerCase() === NATIVE_TOKEN_ADDRESS_1INCH) {
    return NATIVE_TOKEN_ADDRESS_1INCH;
  }

  return address;
};

export const isNativeToken = (address: string): boolean => {
  const normalizedAddress = address.toLowerCase();
  return normalizedAddress === '0x0000000000000000000000000000000000000000' ||
    normalizedAddress === NATIVE_TOKEN_ADDRESS_1INCH;
};
