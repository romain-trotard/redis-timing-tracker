const isProduction = process.env.VERCEL_ENV === 'production';

const siteUrl = isProduction ? `https://www.${process.env.VERCEL_URL}` : 'http://localhost:3000';

export default siteUrl;
