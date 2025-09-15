import {
  CatalogRating,
  Chapter,
  ChapterData,
  Content,
  ContentProgressState,
  ContentSource,
  DirectoryConfig,
  DirectoryRequest,
  Form,
  ImageRequestHandler,
  NetworkRequest,
  PagedResult,
  PageLinkResolver,
  ProgressSyncHandler,
  Property,
  RunnerInfo,
  RunnerPreferenceProvider,
  UIPicker,
  UITextField,
  UIToggle,
} from "@suwatte/daisuke";

import { 
  GetAllCategoriesQuery, 
  GetMangaQuery, 
  GetMangaChaptersQuery,
  GetChapterPagesQuery,
} from "./gql";

import { genAuthHeader, matchMangaStatus } from "./utils";

export class Target 
  implements 
    ContentSource, 
    ImageRequestHandler, 
    RunnerPreferenceProvider
  {
    info: RunnerInfo = {
      id: "tin.suwayomi",
      name: "Suwayomi",
      version: 0.1,
      thumbnail: "suwayomi.png",
      website: "https://github.com/Suwayomi/Suwayomi-Server",
      supportedLanguages: ["UNIVERSAL"],
      rating: CatalogRating.SAFE,
    };

    baseUrl = "";
    apiUrl = "";
    client = new NetworkClient();

    async getDirectory(request: DirectoryRequest): Promise<PagedResult> {
      // loading suwayomi server URL here and when getting manga at getContent() to refresh if it is changed in config
      // those seem to be the two possible access points of suwayomi
      this.baseUrl = await ObjectStore.string("suwayomi_url") ?? "http://127.0.0.1:4567";
      this.apiUrl = this.baseUrl + "/api/graphql";

      const response = await this.client.request(
        {
          url: this.apiUrl,
          method: "POST",
          body: {
            "query": GetAllCategoriesQuery,
          },
          headers: {
            "authorization": `Basic ${genAuthHeader(
              await ObjectStore.string("suwayomi_username"), 
              await ObjectStore.string("suwayomi_password")
            )}`,
            "Content-Type": "application/json"
          },
        }
      )

      const parsedJson = JSON.parse(response.data);

      const highlights = parsedJson.data.categories.nodes[0].mangas.nodes.map(
        (entry: { id: number; title: string; thumbnailUrl: string; }) => {
        // thumbnailUrl is relative to the Suwayomi server URL
        const imageUrl = this.baseUrl + entry.thumbnailUrl;
        return {
          id: entry.id.toString(),
          title: entry.title,
          cover: imageUrl,
        };
      });

      return {
        results: highlights,
        isLastPage: true,
      }
    }

    async getDirectoryConfig(_configID?: string | undefined,): Promise<DirectoryConfig> {
      return {};
    }

    async getContent(contentId: string): Promise<Content> {
      this.baseUrl = await ObjectStore.string("suwayomi_url") ?? "http://127.0.0.1:4567";
      this.apiUrl = this.baseUrl + "/api/graphql";

      const response = await this.client.request(
        {
          url: this.apiUrl,
          method: "POST",
          body: {
            "query": GetMangaQuery(contentId),
          },
          headers: {
            "authorization": `Basic ${genAuthHeader(
              await ObjectStore.string("suwayomi_username"),
              await ObjectStore.string("suwayomi_password")
            )}`,
            "Content-Type": "application/json"
          },
        }
      )

      const parsedJson = JSON.parse(response.data);
      const entry = parsedJson.data.manga;

      const properties: Property[] = [];
      properties.push(
        {
          id: "genres",
          title: "Genres",
          tags: entry.genre.map((genre: string) => {
            return {
              id: genre,
              title: genre,
            };
          })
        }
      )

      return {
        title: entry.title,
        cover: this.baseUrl + entry.thumbnailUrl,
        webUrl: `${this.baseUrl}/manga/${entry.id}`, // api seems to provide wrong local url
        status: matchMangaStatus(entry.status),
        creators: entry.author.split(", "),
        summary: entry.description,
        properties: properties, 
      };
    }

    async getChapters(contentId: string): Promise<Chapter[]> {
      const response = await this.client.request(
        {
          url: this.apiUrl,
          method: "POST",
          body: {
            "query": GetMangaChaptersQuery(contentId),
          },
          headers: {
            "authorization": `Basic ${genAuthHeader(
              await ObjectStore.string("suwayomi_username"),
              await ObjectStore.string("suwayomi_password")
            )}`,
            "Content-Type": "application/json"
          },
        }
      )

      const parsedJson = JSON.parse(response.data);

      const chapters: Chapter[] = [];

      for (let chapterIndex = 0; chapterIndex < parsedJson.data.manga.chapters.nodes.length; chapterIndex ++) {
        const chapter = parsedJson.data.manga.chapters.nodes[chapterIndex];
        chapters.push(
          {
            chapterId: chapter.id.toString(),
            number: chapter.chapterNumber,
            index: chapterIndex,
            // webUrl: `${this.baseUrl}/manga/${parsedJson.data.manga.id}/chapter/${chapterIndex}`,
            date: new Date(parseInt(chapter.uploadDate)),
            language: parsedJson.data.manga.source.lang, // api does not provide language on a per-chapter basis
            title: chapter.name,
            providers: [{id: chapter.scanlator, name: chapter.scanlator}],
          }
        )
      }

      return chapters;
    }

    async getChapterData(contentId: string, chapterId: string): Promise<ChapterData> {
      const response = await this.client.request(
        {
          url: this.apiUrl,
          method: "POST",
          body: {
            "query": GetChapterPagesQuery(chapterId),
          },
          headers: {
            "authorization": `Basic ${genAuthHeader(
              await ObjectStore.string("suwayomi_username"),
              await ObjectStore.string("suwayomi_password")
            )}`,
            "Content-Type": "application/json"
          },
        }
      )

      const parsedJson = JSON.parse(response.data);

      return {
        pages: parsedJson.data.fetchChapterPages.pages.map((entry: string) => {
          return {
            url: this.baseUrl + entry,
          };
        })
      }
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

    // required for suwayomi authentication
    async willRequestImage(imageURL: string): Promise<NetworkRequest> {
      return {
        url: imageURL,
        method: "GET",
        // body: {
        //   "query": GetAllCategoriesQuery,
        // },
        headers: {
          "authorization": `Basic ${genAuthHeader(
            await ObjectStore.string("suwayomi_username"), 
            await ObjectStore.string("suwayomi_password")
          )}`,
          // "Content-Type": "application/json"
        },
      }
    }

    

    async getProgressState(contentId: string): Promise<ContentProgressState> {
      if (await ObjectStore.boolean("suwayomi_track")) {
        const response = await this.client.request(
          {
            url: this.apiUrl,
            method: "POST",
            body: {
              "query": GetMangaChaptersQuery(contentId),
            },
            headers: {
              "authorization": `Basic ${genAuthHeader(
                await ObjectStore.string("suwayomi_username"),
                await ObjectStore.string("suwayomi_password")
              )}`,
              "Content-Type": "application/json"
            },
          }
        );

        const parsedJson = JSON.parse(response.data);

        if (!parsedJson || !parsedJson.length) {
          return {};
        }

        const readChapterIds = parsedJson.data.manga.chapters.nodes
          .filter((chapter: { isRead: boolean; }) => chapter.isRead === true)
          .map((chapter: { id: number; }) => chapter.id.toString());
          
        const latestUnreadChapters = parsedJson.data.manga.chapters.nodes
          .filter((chapter: { isRead: boolean; }) => chapter.isRead === false);

        if (latestUnreadChapters.length == 0) return {readChapterIds};

        return {
          readChapterIds,
          currentReadingState: {
            chapterId: latestUnreadChapters[0].id,
            page: latestUnreadChapters[0].lastPageRead,
            readDate: new Date(latestUnreadChapters[0].lastReadAt),
            progress:
              Math.round(
                (latestUnreadChapters[0].lastPageRead / latestUnreadChapters[0].pageCount) * 100
              ) / 100,
          }
        }
      } else {
        return {};
      }
    }
}
