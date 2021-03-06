# Changelog


# [1.3.0](https://github.com/Buzzertech/DatSongBot/compare/v1.2.4...v1.3.0) (2020-01-08)


### Features

* optionally use provided track instead of picking random track ([#70](https://github.com/Buzzertech/DatSongBot/issues/70)) ([1c9b2db](https://github.com/Buzzertech/DatSongBot/commit/1c9b2dbb158fa916420b25a76f526ebb5eeae8a6))

## [1.2.4](https://github.com/Buzzertech/DatSongBot/compare/v1.2.3...v1.2.4) (2020-01-08)


### Bug Fixes

* avoid passing client id to the media url ([b42ddf5](https://github.com/Buzzertech/DatSongBot/commit/b42ddf5e68a31632a1537644a88f09af25f02d3d))

## [1.2.3](https://github.com/Buzzertech/DatSongBot/compare/v1.2.2...v1.2.3) (2020-01-08)


### Bug Fixes

* use newer soundcloud apis ([#69](https://github.com/Buzzertech/DatSongBot/issues/69)) ([a0bf57b](https://github.com/Buzzertech/DatSongBot/commit/a0bf57bfffe69a6032a594d6881c5f715fa17db1))
* **serverless-config:** use correct runtime enum value ([14d1a36](https://github.com/Buzzertech/DatSongBot/commit/14d1a36ad95bd8451540ad0a6f855a8178f0786f))

## [1.2.2](https://github.com/Buzzertech/DatSongBot/compare/v1.2.1...v1.2.2) (2019-12-31)


### Bug Fixes

* pick download url ([286ac8d](https://github.com/Buzzertech/DatSongBot/commit/286ac8de4338e0919753808afc17fa1d2d26d8a7))

## [1.2.1](https://github.com/Buzzertech/DatSongBot/compare/v1.2.0...v1.2.1) (2019-12-29)


### Bug Fixes

* pick stream url if download url is undefined ([#65](https://github.com/Buzzertech/DatSongBot/issues/65)) ([0b4d254](https://github.com/Buzzertech/DatSongBot/commit/0b4d254d2b1bdabedfd2adee3668e6b85233d4a0))

# [1.2.0](https://github.com/Buzzertech/DatSongBot/compare/v1.1.1...v1.2.0) (2019-12-28)


### Bug Fixes

* **get-tracks-fn:** pick song uri ([798480e](https://github.com/Buzzertech/DatSongBot/commit/798480e))
* **video:** pick song input from download uri ([#54](https://github.com/Buzzertech/DatSongBot/issues/54)) ([64bdbe1](https://github.com/Buzzertech/DatSongBot/commit/64bdbe1))


### Features

* bump @types/fluent-ffmpeg to v2.1.13 ([#63](https://github.com/Buzzertech/DatSongBot/issues/63)) ([eae62fc](https://github.com/Buzzertech/DatSongBot/commit/eae62fc))

## [1.1.1](https://github.com/Buzzertech/DatSongBot/compare/v1.1.0...v1.1.1) (2019-06-25)


### Bug Fixes

* **config:** add SENTRY_DSN as an env var to serverless config ([a7eecbf](https://github.com/Buzzertech/DatSongBot/commit/a7eecbf))

# [1.1.0](https://github.com/Buzzertech/DatSongBot/compare/v1.0.0...v1.1.0) (2019-06-25)


### Features

* **error-tracking:** add sentry ([#2](https://github.com/Buzzertech/DatSongBot/issues/2)) ([c9b8223](https://github.com/Buzzertech/DatSongBot/commit/c9b8223))

# 1.0.0 (2019-06-23)


### Bug Fixes

* artistName not transforming ([97751ef](https://github.com/Buzzertech/DatSongBot/commit/97751ef))
* **circleci:** using latest-browsers image ([17a195a](https://github.com/Buzzertech/DatSongBot/commit/17a195a))
* set the pixel threshold to 0.08 ([781320a](https://github.com/Buzzertech/DatSongBot/commit/781320a))
* update snapshots ([2bf4bb8](https://github.com/Buzzertech/DatSongBot/commit/2bf4bb8))
* upload not working ([413b0d4](https://github.com/Buzzertech/DatSongBot/commit/413b0d4))
* use chrome-aws-lambda ([03542ee](https://github.com/Buzzertech/DatSongBot/commit/03542ee))
* use node 10.9 ([7ab2ad5](https://github.com/Buzzertech/DatSongBot/commit/7ab2ad5))


### Features

* add circleci config ([0520dd3](https://github.com/Buzzertech/DatSongBot/commit/0520dd3))
* add ffmpeg installer ([e6bf223](https://github.com/Buzzertech/DatSongBot/commit/e6bf223))
* add googleapis lib ([c750ec2](https://github.com/Buzzertech/DatSongBot/commit/c750ec2))
* **main:** update the main function to carry out different processes ([90ad773](https://github.com/Buzzertech/DatSongBot/commit/90ad773))
* configure deployments and add semantic release ([f2b00a9](https://github.com/Buzzertech/DatSongBot/commit/f2b00a9))
* init project ([c635f20](https://github.com/Buzzertech/DatSongBot/commit/c635f20))
* **audio:** add fn to fetch audio tracks and pick one track ([782a338](https://github.com/Buzzertech/DatSongBot/commit/782a338))
* **config:** add config for fetching audio ([ff63798](https://github.com/Buzzertech/DatSongBot/commit/ff63798))
* **images:** add util fn to generate unsplash url ([c9350a1](https://github.com/Buzzertech/DatSongBot/commit/c9350a1))
* **video:** process video and background image for the video ([9f90ee6](https://github.com/Buzzertech/DatSongBot/commit/9f90ee6))
* **video:** upload to youtube ([afab794](https://github.com/Buzzertech/DatSongBot/commit/afab794))
