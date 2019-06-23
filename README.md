<img align="center" alt="datsongbot_cover" src="https://res.cloudinary.com/buzzertech/image/upload/v1561311297/cover.png" />

# DatSongBot 🎵

[![CircleCI](https://circleci.com/gh/Buzzertech/JerryQuu/tree/master.svg?style=svg)](https://circleci.com/gh/Buzzertech/JerryQuu/tree/master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
![](https://img.shields.io/github/release/buzzertech/datsongbot.svg)

DatSongBot is a friendly, geek bot which uploads a music "video" to YouTube everyday. The track is picked from soundcloud. The bot uploads trap or chill music. This bot is written entirely in Typescript and runs on node. P.S. - None of these videos uploaded to YouTube are monetized

## Tech used

DatSongBot runs on node and uses these few technologies to make things happen:

- [ffmpeg](https://ffmpeg.org) - we use this library to encode videos
- [puppeteer](https://github.com/GoogleChrome/puppeteer) - to generate static image to be used in the video
- [AWS Lambda](https://aws.amazon.com/lambda/) - The bot runs on a node v8.10 lambda paired with a cloudwatch event which runs everyday at a specified time

## Third party services

- ### Soundcloud
  DatSongBot uses the [soundcloud's tracks](https://developers.soundcloud.com/docs/api/reference#tracks) API which returns a bunch of songs to choose from. Now, the bot simply picks a song based on certain criterias.
- ### Unsplash

  We use the tags added to this song to fetch a stock image. The stock image library that the bot prefers is [Unsplash](https://unsplash.com/developers) (Unsplash has a great API + the entire image library has a bunch of free, amazing images). You can even use their [source api](https://source.unsplash.com) which returns a random image directly instead of a json response. I am using the integral api instead because it returns other metadata such as uploader's user id, name, etc. so that the photographer can be credited in the video's description.

- ### YouTube
  Ofcourse, we use YouTube's v3 API to upload videos to the platform. You can read up a little more about how the insert api works here - https://developers.google.com/youtube/v3/docs/videos/insert

## Try it yourself

Prerequisite: Make sure the below env vars are set before running the bot -

- `SOUNDCLOUD_CLIENT_ID` - Soundcloud has shut down its developer application program but there is still a workaround to get a client id for your apps. [Check this answer on stackoverflow](https://stackoverflow.com/a/43962626)
- `UNSPLASH_ACCESS_KEY` - Get the unsplash access key from here - https://unsplash.com/developers
- `YOUTUBE_REFRESH_TOKEN`, `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET` - YouTube's API requires you to be authenticated using its OAuth2 client. To get all these three auth keys refer this [stackoverflow answer](https://stackoverflow.com/a/19766913)

Once done, clone the repo and run

```bash
$ yarn
```

Once all the dependencies are installed, you can use the following command to run the function locally using the [serverless](https://github.com/serverless/serverless) framework

```bash
$ yarn dev
```

### Deploy (AWS Lambda)

If you have the awscli installed locally, make sure you've configured the credentials i.e. Access Key ID and Secret Access Key on your machine

```bash
$ aws configure
```

Or

```bash
$ export AWS_ACCESS_KEY_ID=*
$ export AWS_SECRET_ACCESS_KEY=*
```

Once done, you can run

```bash
$ yarn deploy
```

After the lambda function is created and deployed, there are couple more steps needed to be followed.

So, the problem here is that puppeteer runs on chromium which needs around 300-400mb of storage space which is not possible on a lambda (cause lambda's 50mb limit.) Now, to run puppeteer on a lambda, we use [chrome-aws-lambda](https://github.com/alixaxel/chrome-aws-lambda/) which provides a brotli compressed binary of chromium which is mere 33 mb! We also need the ffmpeg binary which is installed using [@ffmpeg-installer](https://github.com/kribblo/node-ffmpeg-installer) - the linux-x64 binary bundled with this library is of ~60mb. I've deployed these two dependencies using aws layers ([read more](https://www.freecodecamp.org/news/lambda-layers-2f80b9211318/))

## Run tests

```bash
$ yarn test
```

## Motivation

I love listening songs on soundcloud and it is one amazing music library with great artists who put in a sheer amount of time and energy into their work to entertain us. Thousands of songs are uploaded to soundcloud everyday but only a few of them get to share the spotlight. The goal here is to build a community which loves listening to chill/trap music and also would like to give new artists a chance!

Also, before getting into programming, I used to make a bunch of **how-to** YouTube Videos and I must've had edited and rendered ~100 videos till date but never knew what went along under the hood. This project helped me understand a little about how videos/audio are encoded and stuff!

## Contribute

Issues and PRs are most welcomed! If you are submitting a PR, make sure you are following these [commit message conventions](https://gist.github.com/stephenparish/9941e89d80e2bc58a153)

## License

MIT
