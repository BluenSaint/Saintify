declare module "instagram-web-api" {
  export class Instagram {
    constructor(config: {
      username: string;
      password: string;
    });

    login(): Promise<void>;
    publishPhoto(params: {
      caption: string;
      image: string;
    }): Promise<any>;
    getMediaLikes(mediaId: string): Promise<any[]>;
  }
}
