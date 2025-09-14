import {
  Chapter,
  ChapterData,
  Content,
  PagedResult,
  Property,
  SearchRequest,
  Source,
  SourceInfo,
} from "@suwatte/daisuke";

export class Target extends Source {
  info: SourceInfo = {
    name: "Template Source",
    id: "com.template",
    version: 1,
    thumbnail: "default.png",
    website: "https://template.com",
    supportedLanguages: [],
    nsfw: false,
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
  getSearchResults(query: SearchRequest): Promise<PagedResult> {
    throw new Error("Method not implemented.");
  }
  getSourceTags(): Promise<Property[]> {
    throw new Error("Method not implemented.");
  }
}
