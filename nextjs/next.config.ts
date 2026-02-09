// nextjs/next.config.ts

import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Point to the new request.ts file location
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl(nextConfig);
