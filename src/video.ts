import ffmpeg from 'fluent-ffmpeg';
import { PickedTrack } from './audio';
import chromium from 'chrome-aws-lambda';
import { Browser, LaunchOptions } from 'puppeteer';
import config from './config';
import { IUnsplashResponse } from 'image';
import { imageLogger, videoLogger, durationToSeconds } from './lib/utils';
import installer from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(installer.path);

let window: Browser;

export const launchPage = async (opts?: LaunchOptions) =>
  (window = await chromium.puppeteer.launch({
    ...opts,
    args: [...(opts && opts.args ? opts.args : []), ...chromium.args],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
  }));

export const closePage = async () => window && (await window.close());

export const prepareSvg = (
  bgUrl: string,
  songName: string,
  artistName: string
) => {
  let textX = '10%';

  if (songName.length > 20) {
    textX = '2%';
  }

  imageLogger(`Preparing svg string for background`);

  return `
		<style>html,body{margin: 0; padding: 0;}</style>
		<link href="https://fonts.googleapis.com/css?family=Poppins&display=swap&text=${songName.toUpperCase()}${artistName.toUpperCase()}" rel="stylesheet">
		<svg viewBox="0 0 1920 1080" lang="en-US" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<linearGradient id="bottomGrad" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" style="stop-color:rgb(255,255,255);stop-opacity:0" />
					<stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:.8;" />
				</linearGradient>
			</defs>
			<image href="${bgUrl}" x="0" y="0" width="100%" height="100%" />
			<rect x="0" y="40%" width="100%" height="60%" fill="url(#bottomGrad)"/>
			<text x="${textX}" style="font-family: 'Poppins', arial; font-weight: bold; font-size: 5em;" y="90%" fill="white">${songName.toUpperCase()}</text>
			<text x="${textX}" style="font-family: 'Poppins', arial; font-size: 3em; font-weight: 300;" y="95%" fill="white">${artistName.toUpperCase()}</text>
		</svg>
	`;
};

export const generateImage = async (outputPath: string, content: string) => {
  imageLogger('Launching page in puppeteer');
  const page = await window.newPage();
  imageLogger('Loading svg content into the page');
  await page.setContent(content);
  imageLogger('Loaded svg content into the page');
  await page.setViewport({ width: 1920, height: 1080, isLandscape: true });
  imageLogger(`Processing screenshot`);
  await page.screenshot({
    omitBackground: true,
    fullPage: true,
    path: outputPath,
  });
  imageLogger(`Background image prepared and saved`);
  await window.close();
};

export const processVideo = (
  outputPath: string,
  song: Pick<PickedTrack, 'duration' | 'uri'>,
  image: string
): Promise<void> => {
  videoLogger('Starting to process video');
  videoLogger(`Approx. duration of the video - ${song.duration} ms`);

  const processChain = ffmpeg(image)
    .inputFPS(30)
    //@ts-ignore
    .loop()
    .withSize('1920x1080')
    .input(`${song.uri}/download?client_id=${config.SOUNDCLOUD_CLIENT_ID}`)
    .outputOption('-shortest')
    .videoCodec('libx264')
    .videoBitrate(10000, true)
    .audioCodec('aac')
    .audioBitrate(384)
    .outputOption('-pix_fmt yuv420p')
    .outputFPS(30)
    .videoFilters(
      `fade=in:st=0:d=3,fade=out:st=${song.duration / 1000 - 2}:d=1`
    );

  return new Promise((resolve, reject) => {
    processChain
      .on('start', () => videoLogger(`ffmpeg has begun processing the video`))
      .on('progress', function(progress: { timemark: string }) {
        const duration = durationToSeconds(progress.timemark) * 1000;
        videoLogger(`Current progress - ${(duration / song.duration) * 100}%`);
      })
      .on('end', resolve)
      .on('error', reject)
      .save(outputPath);
  });
};

export const getDescription = (
  songTitle: string,
  song: PickedTrack,
  imageData: IUnsplashResponse
) => `${songTitle}

⭐️ DatSongBot brings you another fresh, new music by ${song.user.username} for you to enjoy!

Listen to this song on Soundcloud:
▶️${song.permalink_url}

Follow ${song.user.username} on Soundcloud:
🔉${song.user.permalink_url}

The background image used in this video is provided by ${imageData.user.name} from Unsplash:
🔗Follow ${imageData.user.name} on Unsplash - ${imageData.user.links.html}
📂Download this background - ${imageData.links.html}

🎵 DatSongBot is a bot built by Buzzertech (https://buzzertech.com) which picks a new, trending song from soundcloud and uploads it to YouTube. This is an experimental tool. With that being said, be sure to subscribe to DatSongBot on YouTube and turn on notifications 'cause we post new music daily on this channel!

❌ DatSongBot doesn't owns this music nor the image used in this video. Just for entertainment purposes only!

Cheers 🎵
  `;
