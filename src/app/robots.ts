import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {

  const baseUrl = 'https://digitalpixora.com'; 

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/private/', 
        '/api/',      
        '/_next/',    
        '/admin/'     
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}