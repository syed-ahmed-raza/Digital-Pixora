import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/', // Jo pages aap hide rakhna chahte hain
    },
    sitemap: 'https://digital-pixora.vercel.app/sitemap.xml',
  }
}