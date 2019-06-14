import {
  generateImage,
  prepareSvg,
  launchPage,
  closePage,
  processVideo,
} from './video';
import { getTracksFromSoundcloud } from './audio';
import { getUnsplashUrl } from './image';
import { resolve } from 'path';

const test = async () => {
  launchPage();
  const song = await getTracksFromSoundcloud();
  const svgContent = prepareSvg(
    getUnsplashUrl(song.tag_list),
    song.title.replace(/(")|(')|(\.)/g, ''),
    song.user.username
  );
  await generateImage(svgContent);
  await processVideo(song, resolve(__dirname, '../assets/out.png'));
};

test().catch(e => {
  console.log('errored');
  console.error(e);
  closePage();
});
