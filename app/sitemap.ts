import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://numediakaranganyar.my.id',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
   {
      url: `https://numediakaranganyar.my.id/berita`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }
  ]
}