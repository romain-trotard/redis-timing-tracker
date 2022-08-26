const isProduction = process.env.VERCEL_ENV === 'production';

const siteUrl = isProduction ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

export default siteUrl;
