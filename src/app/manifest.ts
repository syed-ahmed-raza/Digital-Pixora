import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Digital Pixora | Architecting Digital Dominance',
    short_name: 'Pixora',
    description: 'A premium software house forging advanced digital ecosystems with Next.js, AI, and 3D WebGL.',
    start_url: '/',
    display: 'standalone', 
    orientation: 'portrait',
    background_color: '#020202',
    theme_color: '#020202', 
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-512.png', 
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
    ],
    categories: ['business', 'technology', 'design'],
  }
}