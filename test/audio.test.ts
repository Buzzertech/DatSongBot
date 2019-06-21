import { getTracksFromSoundcloud } from '../src/audio';
import nock from 'nock';
import { tracks } from './__fixtures__/index.fixture';

describe('audio', () => {
  describe('#getTracksFromSoundcloud', () => {
    it('should fetch a list of song and pick a song out of the subset', async () => {
      nock('https://api.soundcloud.com')
        .get(/\/tracks/)
        .once()
        .reply(200, tracks);

      const song = await getTracksFromSoundcloud();
      expect(song).toMatchSnapshot();
    });

    it('pick a song with highest playback_count + likes', async () => {
      nock('https://api.soundcloud.com')
        .get(/\/tracks/)
        .once()
        .reply(200, [
          {
            downloadable: true,
            playback_count: 200,
            likes: 20,
            id: 1,
            duration: 5000,
            title: 'Song A',
          },
          {
            downloadable: true,
            playback_count: 201,
            likes: 29,
            id: 2,
            duration: 6000,
            title: 'Song B',
          },
        ]);

      const song = await getTracksFromSoundcloud();
      expect(song.id).toEqual(2);
    });

    it('only pick songs which have a duration of <5 mins', async () => {
      nock('https://api.soundcloud.com')
        .get(/\/tracks/)
        .once()
        .reply(200, [
          {
            downloadable: true,
            playback_count: 200,
            likes: 20,
            id: 1,
            duration: 5000,
            title: 'Song A',
          },
          {
            downloadable: true,
            playback_count: 201,
            likes: 29,
            id: 2,
            duration: 70 * 5 * 1000,
            title: 'Song B',
          },
        ]);

      const song = await getTracksFromSoundcloud();
      expect(song.id).toEqual(1);
    });
  });
});
