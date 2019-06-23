import {
  generateImage,
  prepareSvg,
  launchPage,
  closePage,
  processVideo,
} from './video';
import { getTracksFromSoundcloud } from './audio';
import { getUnsplashPhoto } from './image';
import { videoLogger } from './lib/utils';
import { Handler } from 'aws-lambda';
import { uploadVideo, connectToYoutube } from './upload';

const IMAGE_OUTPUT = '/tmp/out.png';
const VIDEO_OUTPUT = '/tmp/out.mp4';

export const main: Handler = async () => {
  try {
    await launchPage();
    const youtubeClient = connectToYoutube();
    const song = await getTracksFromSoundcloud();
    const image = await getUnsplashPhoto(song.tag_list);
    const svgContent = prepareSvg(
      image.urls.custom,
      song.title.replace(/(")|(')|(\.)/g, ''),
      song.user.username
    );
    await generateImage(IMAGE_OUTPUT, svgContent);
    await processVideo(VIDEO_OUTPUT, song, IMAGE_OUTPUT);
    const response = await uploadVideo(
      VIDEO_OUTPUT,
      song,
      image,
      await youtubeClient
    );

    videoLogger(`Video has been uploaded!`);
    videoLogger(`Youtube video id - ${response.data.id}`);

    closePage();
  } catch (e) {
    console.error(e);
  }
};
