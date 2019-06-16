import axios from 'axios';
import config from './config';
import { imageLogger } from './lib/utils';

export interface IUnsplashResponse {
  id: string;
  created_at: string;
  updated_at: string;
  width: number;
  height: number;
  color: string;
  downloads: number;
  likes: number;
  liked_by_user: boolean;
  description: string;
  urls: Record<
    'raw' | 'full' | 'regular' | 'small' | 'thumb' | 'custom',
    string
  >;
  links: Record<'self' | 'html' | 'download' | 'download_location', string>;
  user: {
    id: string;
    updated_at: string;
    username: string;
    name: string;
    portfolio_url: string;
    bio: string;
    location: string;
    total_likes: number;
    total_photos: number;
    total_collections: number;
    instagram_username: string;
    twitter_username: string;
    links: Record<'self' | 'html' | 'photos' | 'likes' | 'portfolio', string>;
  };
}

export const getUnsplashPhoto = async (tags: string) => {
  imageLogger('fetching random photo from unsplash');
  const { data: imageData } = await axios.get<IUnsplashResponse>(
    `https://api.unsplash.com/photos/random`,
    {
      params: {
        client_id: config.UNSPLASH_ACCESS_KEY,
        query: ['nature', ...tags.split(' ')].join(','),
        orientation: 'landscape',
        w: 1920,
        h: 1080,
      },
    }
  );
  imageLogger(`fetched photo from unsplash - ${imageData.links.html}`);
  return imageData;
};
