import {
  Chapter,
  ChapterData,
  Content,
  ContentSource,
  Form,
  ImageRequestHandler,
  PagedResult,
  PageLinkResolver,
  Property,
  RunnerInfo,
  RunnerPreferenceProvider,
  UIPicker,
  UITextField
} from "@suwatte/daisuke";

export class Target 
  implements 
    // ContentSource, 
    // ImageRequestHandler, 
    RunnerPreferenceProvider
    // PageLinkResolver 
  {
    info: RunnerInfo = {
      name: "Suwayomi",
      id: "app.suwayomi",
      version: 0.1,
      thumbnail: "suwayomi.png",
      website: "https://github.com/Suwayomi/Suwayomi-Server",
      supportedLanguages: [],
  };
  getContent(contentId: string): Promise<Content> {
    throw new Error("Method not implemented.");
  }
  getChapters(contentId: string): Promise<Chapter[]> {
    throw new Error("Method not implemented.");
  }
  getChapterData(contentId: string, chapterId: string): Promise<ChapterData> {
    throw new Error("Method not implemented.");
  }
  // getSearchResults(query: SearchRequest): Promise<PagedResult> {
  //   throw new Error("Method not implemented.");
  // }
  getSourceTags(): Promise<Property[]> {
    throw new Error("Method not implemented.");
  }
  async getPreferenceMenu(): Promise<Form> {
    return {
      sections: [
        {
          header: "Server URL",
          footer: "The URL of the Suwayomi server",
          children: [
            UITextField({
              id: "suwayomi_url",
              title: "URL:",
              value: (await ObjectStore.string("suwayomi_url")) ?? "http://127.0.0.1:4567",
              async didChange(value) {
                return ObjectStore.set("suwayomi_url", value);
              },
            }),
          ],
        },
        {
          header: "Username",
          footer: "Suwayomi username, if set",
          children: [
            UITextField({
              id: "suwayomi_username",
              title: "Username:",
              value: (await ObjectStore.string("suwayomi_username")) ?? "",
              async didChange(value) {
                return ObjectStore.set("suwayomi_username", value);
              },
            }),
          ],
        },
        {
          header: "Password",
          children: [
            UITextField({
              id: "suwayomi_password",
              title: "Password:",
              secure: true,
              value: (await ObjectStore.string("suwayomi_password")) ?? "",
              async didChange(value) {
                return ObjectStore.set("suwayomi_password", value);
              },
            }),
          ],
        },
      ],
    };
  }
}
