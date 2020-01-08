import { main } from '../src/index';
import {
  tracks,
  imageData,
  tracksWithMediaTranscoding,
  mediaTranscodingURL,
} from './__fixtures__/index.fixture';
import { connectToYoutube, uploadVideo } from '../src/upload';
import {
  getTracksFromSoundcloud,
  Track,
  getTranscodingForTrack,
  getStreamUrlFromTranscoding,
} from '../src/audio';
import { getUnsplashPhoto } from '../src/image';
import { prepareSvg, generateImage, processVideo } from '../src/video';
import { youtube } from 'googleapis/build/src/apis/youtube';

jest.mock('../src/upload', () => ({
  connectToYoutube: jest.fn().mockImplementation(() => youtube),
  uploadVideo: jest.fn().mockResolvedValue({
    data: {
      id: 'abc',
    },
  }),
}));

jest.mock('../src/audio', () => ({
  getTracksFromSoundcloud: jest.fn().mockImplementation(async () => tracks[0]),
  getTranscodingForTrack: jest
    .fn()
    .mockImplementation(async (track_id: number) =>
      tracksWithMediaTranscoding.find(track => track.id === track_id)
    ),
  getStreamUrlFromTranscoding: jest
    .fn()
    .mockImplementation(async () => mediaTranscodingURL.url),
}));

jest.mock('../src/image', () => ({
  getUnsplashPhoto: jest.fn().mockImplementation(async () => imageData),
}));

jest.mock('../src/video');

describe('#main', () => {
  it('will fetch audio, create a video and upload it', async () => {
    await main();
    expect(connectToYoutube).toHaveBeenCalled();
    expect(getTracksFromSoundcloud).toHaveBeenCalled();
    expect(getUnsplashPhoto).toHaveBeenCalledWith(tracks[0].tag_list);

    expect(getTranscodingForTrack).toHaveBeenCalledWith(tracks[0].id);
    expect(getStreamUrlFromTranscoding).toHaveBeenCalled();

    expect(prepareSvg).toHaveBeenCalledWith(
      imageData.urls.custom,
      (tracks[0].title || '').replace(/(")|(')|(\.)/g, ''),
      (tracks[0].user as Track['user']).username
    );
    expect(generateImage).toHaveBeenCalledWith(
      '/tmp/out.png',
      prepareSvg(
        imageData.urls.custom,
        (tracks[0].title || '').replace(/(")|(')|(\.)/g, ''),
        (tracks[0].user as Track['user']).username
      )
    );
    expect(processVideo).toHaveBeenCalledWith(
      '/tmp/out.mp4',
      tracks[0],
      '/tmp/out.png'
    );

    expect(uploadVideo).toHaveBeenCalledWith(
      '/tmp/out.mp4',
      { ...tracks[0], media_url: mediaTranscodingURL.url },
      imageData,
      youtube
    );
  });
});
