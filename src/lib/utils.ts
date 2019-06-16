import debug from 'debug';

export const imageLogger = debug('imageLogger');
export const audioLogger = debug('audioLogger');
export const videoLogger = debug('videoLogger');
export const uploadLogger = debug('uploadLogger');

export const durationToSeconds = (d: string) =>
  d
    .split(':')
    .map(e => parseInt(e))
    .reduce(
      (prev, curr, index) => (prev = prev + (index === 2 ? curr : curr * 60))
    );
