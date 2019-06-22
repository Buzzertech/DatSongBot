import { google, youtube_v3 } from 'googleapis';
import config from './config';
import { videoLogger } from './lib/utils';
import { getDescription } from './video';
import { stat, createReadStream } from 'fs-extra';
import { PickedTrack } from './audio';
import { IUnsplashResponse } from './image';
import { addDays } from 'date-fns';

export const connectToYoutube = async () => {
  const oauthclient = new google.auth.OAuth2({
    clientId: config.YOUTUBE_CLIENT_ID,
    clientSecret: config.YOUTUBE_CLIENT_SECRET,
  });

  oauthclient.setCredentials({
    refresh_token: config.YOUTUBE_REFRESH_TOKEN,
  });

  const { token: access_token } = await oauthclient.getAccessToken();

  oauthclient.setCredentials({
    access_token,
  });

  return google.youtube({ version: 'v3', auth: oauthclient });
};

export const uploadVideo = async (
  videoPath: string,
  song: PickedTrack,
  imageData: IUnsplashResponse,
  youtubeClient: youtube_v3.Youtube
) => {
  const { size: totalVideoByteSize } = await stat(videoPath);

  const songTitle =
    song.title.replace(/(")|(')|(\.)/g, '').trim() + ` | ${song.user.username}`;

  videoLogger(`Preparing the video description`);

  const description = getDescription(songTitle, song, imageData);

  return youtubeClient.videos.insert(
    {
      part: 'snippet, status',
      requestBody: {
        snippet: {
          title: songTitle,
          description,
          categoryId: '10',
          tags: [...song.tag_list.split(' '), 'DatSongBot', 'ZeonBot', 'Music'],
          defaultLanguage: 'en',
        },
        status: {
          embeddable: false,
          privacyStatus: 'private',
          license: 'youtube',
          publishAt: addDays(new Date(), 4).toISOString(),
        },
      },
      media: {
        body: createReadStream(videoPath),
      },
    },
    {
      onUploadProgress: progress => {
        videoLogger(
          `Video upload progress - ${new Number(
            (progress.bytesRead / totalVideoByteSize) * 100
          ).toFixed(2)}%`
        );
      },
    }
  );
};
