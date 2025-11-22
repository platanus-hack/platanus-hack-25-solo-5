export function getCountryFromE164(phoneNumber: string): string {
  if (!phoneNumber) return "US";

  const cleaned = phoneNumber.replace(/\D/g, '');

  const countryCodeMap: Record<string, string> = {
    '1': 'US',
    '52': 'MX',
    '56': 'CL',
    '54': 'AR',
    '57': 'CO',
    '51': 'PE',
    '55': 'BR',
    '58': 'VE',
  };

  for (const [code, country] of Object.entries(countryCodeMap)) {
    if (cleaned.startsWith(code)) {
      return country;
    }
  }

  return 'US';
}
