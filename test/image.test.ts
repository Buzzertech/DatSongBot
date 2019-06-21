import { getUnsplashPhoto } from '../src/image';
import nock from 'nock';
import { imageData } from './__fixtures__/index.fixture';

describe('image', () => {
  describe('#getUnsplashPhoto', () => {
    it('will fetch a random image', async () => {
      nock('https://api.unsplash.com')
        .get(/photos\/random/)
        .once()
        .reply(200, imageData);

      const image = await getUnsplashPhoto('');
      expect(image).toMatchSnapshot();
    });
  });
});
