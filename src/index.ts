import {
  generateImage,
  prepareSvg,
  launchPage,
  closePage,
  processVideo,
  uploadVideo,
} from './video';
import { getTracksFromSoundcloud } from './audio';
import { getUnsplashPhoto } from './image';
import { resolve } from 'path';
import { videoLogger } from './lib/utils';

const test = async () => {
  launchPage();
  const song = await getTracksFromSoundcloud();
  const image = await getUnsplashPhoto(song.tag_list);
  const svgContent = prepareSvg(
    image.urls.custom,
    song.title.replace(/(")|(')|(\.)/g, ''),
    song.user.username
  );
  await generateImage(svgContent);
  await processVideo(song, resolve(__dirname, '../assets/out.png'));
  const response = await uploadVideo(song, image);

  videoLogger(`Video has been uploaded!`);
  videoLogger(`Youtube video id - ${response.data.id}`);
};

test().catch(e => {
  console.log('errored');
  console.error(e);
  closePage();
});
