import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Aapka main domain URL
  const baseUrl = 'https://digital-pixora.vercel.app'; 

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1, // Main page ko sabse zyada priority
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Agar future mein blog ya projects add karein toh unhe yahan map kar sakte hain
  ]
}