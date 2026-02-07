import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://digitalpixora.com'; 

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',      // Backend routes chupao
        '/admin/',    // Admin panel chupao
        '/private/',  // Private files chupao
        // '/_next/', ❌ REMOVED: Never block Next.js internals for SEO!
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}