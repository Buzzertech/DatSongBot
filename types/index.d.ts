declare module '@ffmpeg-installer/ffmpeg' {
  interface Installer {
    path: string;
    version: string;
    url: string;
  }

  var installer: Installer;

  export = installer;
}

declare module NodeJS {
  interface Global {
    __rootdir__: string;
  }
}
