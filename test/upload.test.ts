import { uploadVideo } from '../src/upload';
import { youtube_v3 } from 'googleapis';
import { GaxiosResponse } from 'gaxios';
import { tracks, imageData } from './__fixtures__/index.fixture';
import { Track } from 'audio';
import { createFileSync } from 'fs-extra';

type VideoResponse = Partial<GaxiosResponse<youtube_v3.Schema$Video>>;

describe('upload', () => {
  describe('#uploadVideo', () => {
    beforeAll(() => createFileSync('/tmp/out.mp4'));
    it('will read and upload the video to youtube', async () => {
      const insertMock = jest.fn<Promise<VideoResponse>, any>().mockReturnValue(
        Promise.resolve({
          data: {
            id: '123',
          },
        })
      );

      const youtubeClient = {
        videos: {
          insert: insertMock,
        },
      };

      const response = await uploadVideo(
        '/tmp/out.mp4',
        tracks[0] as Track,
        imageData,
        (<unknown>youtubeClient) as youtube_v3.Youtube
      );
      expect(response.data.id).toEqual('123');
      expect(insertMock).toHaveBeenCalled();
    });
  });
});
