import { launchPage, closePage, prepareSvg, generateImage } from '../src/video';
import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

describe('video', () => {
  describe('#launchPage', () => {
    let launchSpy: jest.SpyInstance;

    afterEach(async () => {
      await closePage();
    });

    beforeAll(() => {
      launchSpy = jest.spyOn(puppeteer, 'launch');
    });

    afterAll(() => jest.restoreAllMocks());

    it('create a new browser instance', async () => {
      await launchPage();
      expect(launchSpy).toHaveBeenCalled();
    });
  });

  describe('#closePage', () => {
    let closePageSpy: jest.SpyInstance;

    beforeAll(async () => {
      const window = await launchPage();
      closePageSpy = jest.spyOn(window, 'close');
    });

    afterAll(() => jest.restoreAllMocks());

    it('will close the browser', async () => {
      await closePage();
      expect(closePageSpy).toHaveBeenCalled();
    });
  });

  describe('#prepareSvg', () => {
    it('execute the template and return a svg string', () => {
      const svgString = prepareSvg('google.com', 'Sandstorm', 'Darude');
      expect(svgString).toMatchSnapshot();
    });
  });

  describe('#generateImage', () => {
    let svgStr: string;

    beforeAll(async () => {
      await launchPage();
      svgStr = prepareSvg(
        'https://placehold.it/1920x1080',
        'Sandstorm',
        'Darude'
      );
    });

    afterAll(async () => await closePage());

    it('generate a png image', async () => {
      await generateImage('/tmp/out.png', svgStr);
      const image = await fs.readFile('/tmp/out.png');
      expect(image).toMatchImageSnapshot();
    });
  });

  describe('#processVideo', () => {});
});
