import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Digital Pixora',
    short_name: 'Pixora',
    description: 'Engineering Digital Dominance',
    start_url: '/',
    display: 'standalone',
    background_color: '#020202',
    theme_color: '#050505',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}