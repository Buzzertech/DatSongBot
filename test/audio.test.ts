import {
  getTracksFromSoundcloud,
  getTranscodingForTrack,
  TrackMedia,
  Transcoding,
  getStreamUrlFromTranscoding,
} from '../src/audio';
import nock from 'nock';
import {
  tracks,
  tracksWithMediaTranscoding,
  mediaTranscodingURL,
} from './__fixtures__/index.fixture';

describe('audio', () => {
  describe('#getTranscodingForTrack', () => {
    type TranscodingResponse = Array<{
      media: TrackMedia;
    }>;

    it('should fetch transcodings for a track', async () => {
      nock('https://api-v2.soundcloud.com')
        .get(/\/tracks/)
        .once()
        .reply(200, <TranscodingResponse>(
          tracksWithMediaTranscoding.splice(0, 1)
        ));

      if (!tracks[0].id) throw 'Bad Fixture';

      expect(await getTranscodingForTrack(tracks[0].id)).toMatchSnapshot();
    });

    it('should pick the progressive, audio/mpeg transcoding', async () => {
      nock('https://api-v2.soundcloud.com')
        .get(/\/tracks/)
        .once()
        .reply(200, <TranscodingResponse>[
          {
            media: {
              transcodings: [
                {
                  format: {
                    mime_type: 'audio/mpeg',
                    protocol: 'progressive',
                  },
                  url: 'https://api-v2.soundcloud.com/media/',
                },
                {
                  format: {
                    mime_type: 'audio/ogg; codecs="opus"',
                    protocol: 'hls',
                  },
                },
              ],
            },
          },
        ]);

      const transcoding = await getTranscodingForTrack(123);
      expect(transcoding.format.mime_type).toEqual('audio/mpeg');
      expect(transcoding.format.protocol).toEqual('progressive');
    });

    it('should throw an error if no tracks are found', async () => {
      nock('https://api-v2.soundcloud.com')
        .get(/\/tracks/)
        .once()
        .reply(200, <TranscodingResponse>[]);

      try {
        await getTranscodingForTrack(123);
      } catch (error) {
        expect(error).toEqual(
          'v2 api responded with 0 tracks for track id - 123'
        );
      }
    });

    it('should throw an error if no transcodings are present for a track', async () => {
      nock('https://api-v2.soundcloud.com')
        .get(/\/tracks/)
        .once()
        .reply(200, <TranscodingResponse>[{ media: { transcodings: [] } }]);

      try {
        await getTranscodingForTrack(123);
      } catch (error) {
        expect(error).toEqual(
          'No transcodings found for this track (track id - 123)'
        );
      }
    });

    it('should throw an error if no suitable transcoding is found for a track', async () => {
      nock('https://api-v2.soundcloud.com')
        .get(/\/tracks/)
        .once()
        .reply(200, <TranscodingResponse>[
          {
            media: {
              transcodings: [
                {
                  format: {
                    protocol: 'hls',
                    mime_type: 'audio/mpeg',
                  },
                },
                {
                  format: {
                    protocol: 'hls',
                    mime_type: 'audio/ogg; codecs="opus"',
                  },
                },
              ],
            },
          },
        ]);

      try {
        await getTranscodingForTrack(123);
      } catch (error) {
        expect(error).toEqual(
          'No valid transcoding found for track (track id - 123)'
        );
      }
    });

    it('should throw an error if URL property for selected transcoding is undefined', async () => {
      const fixture = [
        {
          media: {
            transcodings: [
              {
                format: {
                  protocol: 'progressive',
                  mime_type: 'audio/mpeg',
                },
                url: '',
              },
            ],
          },
        },
      ];

      nock('https://api-v2.soundcloud.com')
        .get(/\/tracks/)
        .once()
        .reply(200, <TranscodingResponse>fixture);

      try {
        await getTranscodingForTrack(123);
      } catch (error) {
        expect(error).toEqual(
          `URL property is undefined for the selected transcoding ${JSON.stringify(
            fixture[0].media.transcodings[0],
            null,
            2
          )} (track id - 123)`
        );
      }
    });

    it('should throw an error if the media url is not soundcloud hosted', async () => {
      const fixture = [
        {
          media: {
            transcodings: [
              {
                format: {
                  protocol: 'progressive',
                  mime_type: 'audio/mpeg',
                },
                url: 'https://sample.com/',
              },
            ],
          },
        },
      ];

      nock('https://api-v2.soundcloud.com')
        .get(/\/tracks/)
        .once()
        .reply(200, <TranscodingResponse>fixture);

      try {
        await getTranscodingForTrack(123);
      } catch (error) {
        expect(error).toEqual(
          'Media URL is not a soundcloud url for track (track id - 123)'
        );
      }
    });
  });

  describe('#getStreamUrlFromTranscoding', () => {
    let transcoding: Transcoding;

    beforeAll(() => {
      if (tracksWithMediaTranscoding[0].media) {
        transcoding = tracksWithMediaTranscoding[0].media.transcodings[0];
      }
    });

    it('returns the stream url', async () => {
      nock(`https://api-v2.soundcloud.com`)
        .get(/\/media/)
        .once()
        .reply(200, <{ url: string }>mediaTranscodingURL);

      const response = await getStreamUrlFromTranscoding(transcoding, 123);

      expect(response).toEqual(mediaTranscodingURL.url);
    });

    it('throws an error if stream url is undefined or empty', async () => {
      nock(`https://api-v2.soundcloud.com`)
        .get(/\/media/)
        .once()
        .reply(200, <{ url: string }>{
          url: '',
        });

      try {
        await getStreamUrlFromTranscoding(transcoding, 123);
      } catch (error) {
        expect(error).toEqual(
          `No stream url found in the response of the transcoding API (track id - 123, media url - ${transcoding.url})`
        );
      }
    });
  });
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

    it('will fetch particular track document if TRACK_ID is set as an environment variable', async () => {
      Object.defineProperty(process.env, 'TRACK_ID', {
        value: tracks[2].id,
        writable: true,
      });

      nock(`https://api.soundcloud.com`)
        .get(RegExp(`/tracks/${tracks[2].id}`))
        .once()
        .reply(200, tracks[2]);

      const song = await getTracksFromSoundcloud();
      expect(song.id).toEqual(tracks[2].id);

      Object.assign(process.env, {
        TRACK_ID: undefined,
      });
    });
  });
});
