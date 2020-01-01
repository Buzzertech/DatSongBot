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

export const pipe = <
  InitialValue = any,
  ReturnValue = any,
  Action extends Function = any
>(
  fns: Action[]
) => async (initialValue: InitialValue): Promise<ReturnValue> => {
  let result = initialValue;

  for await (let fn of fns) {
    result = await fn(result);
  }

  return (<unknown>result) as ReturnValue;
};
