export const getUnsplashUrl = (tags: string) =>
  `https://source.unsplash.com/1920x1080/?nature,${encodeURIComponent(
    tags.split(' ').join(',')
  )}`;
