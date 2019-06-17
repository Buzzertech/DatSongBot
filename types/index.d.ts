declare module '@ffmpeg-installer/ffmpeg' {
  interface Installer {
    path: string;
    version: string;
    url: string;
  }

  var installer: Installer;

  export = installer;
}
