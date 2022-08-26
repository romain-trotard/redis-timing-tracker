const isProduction = process.env.VERCEL_ENV === 'production';

const siteUrl = isProduction ? `https://www.${process.env.NEXT_PUBLIC_DOMAIN_NAME}` : 'http://localhost:3000';

export default siteUrl;
