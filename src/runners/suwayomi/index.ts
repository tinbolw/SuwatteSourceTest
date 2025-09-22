import {
  CatalogRating,
  Chapter,
  ChapterData,
  Content,
  ContentSource,
  DirectoryConfig,
  DirectoryRequest,
  Form,
  ImageRequestHandler,
  NetworkRequest,
  PagedResult,
  Property,
  RunnerAuthenticatable,
  RunnerInfo,
  RunnerPreferenceProvider,
  SourceConfig,
  UITextField,
} from "@suwatte/daisuke";

import { GetAllMangaQuery, GetMangaQuery, GetMangaChaptersQuery, GetChapterPagesQuery } from "./gql";

import { GetAllMangasResponse, GetChapterPagesResponse, GetMangaChaptersResponse, GetMangaResponse } from "./types";

import { genAuthHeader, graphqlPost, matchMangaStatus, getBaseUrl, getPreferences } from "./utils";

// import { getCookie } from "./auth";

export class Target
  implements
  ContentSource,
  ImageRequestHandler, 
  RunnerPreferenceProvider,
  RunnerAuthenticatable {

  info: RunnerInfo = {
    id: "tin.suwayomi",
    name: "Suwayomi",
    version: 0.1,
    thumbnail: "suwayomi.png",
    website: "https://github.com/Suwayomi/Suwayomi-Server",
    supportedLanguages: ["UNIVERSAL"],
    rating: CatalogRating.SAFE,
  };
  
  config: SourceConfig = {};

  client = new NetworkClient();

  // Override the placeholder URL
  async onEnvironmentLoaded(): Promise<void> {
    this.config = {
      cloudflareResolutionURL: await getBaseUrl(),
    };
  }

  async willRequestImage(imageURL: string): Promise<NetworkRequest> {
    return {
      url: imageURL,
      method: "GET",
      headers: {
        "authorization": `Basic ${genAuthHeader(
          await ObjectStore.string("suwayomi_username"), 
          await ObjectStore.string("suwayomi_password")
        )}`,
      },
    }
  }

  async getDirectory(request: DirectoryRequest): Promise<PagedResult> {
    const { baseUrl, apiUrl, username, password } = await getPreferences();

    // const result = await getCookie(baseUrl, username, password);
    // console.log(result);

    const response: GetAllMangasResponse = await graphqlPost(apiUrl, this.client,
      GetAllMangaQuery(request.query), username, password);

    const highlights = response.mangas.nodes
      .map((manga) => {
        // thumbnailUrl is relative to the Suwayomi server URL
        const imageUrl = baseUrl + manga.thumbnailUrl;
        return {
          id: manga.id.toString(),
          title: manga.title,
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
    const { baseUrl, apiUrl, username, password } = await getPreferences();

    const response: GetMangaResponse = await graphqlPost(apiUrl, this.client,
      GetMangaQuery(contentId), username, password) ;

    const manga = response.manga;

    const properties: Property[] = [];
    properties.push(
      {
        id: "genres",
        title: "Genres",
        tags: [
          {
            id: "sourceName",
            title: response.manga.source.displayName,
          },
          ...manga.genre.map((genre: string) => {
            return {
              id: genre,
              title: genre,
            };
          })
        ]
      }
    )

    return {
      title: manga.title,
      cover: baseUrl + manga.thumbnailUrl,
      webUrl: `${baseUrl}/manga/${manga.id}`, // api seems to provide wrong local url
      status: matchMangaStatus(manga.status),
      creators: manga.author.split(", "),
      summary: manga.description,
      properties: properties,
    };
  }

  async getChapters(contentId: string): Promise<Chapter[]> {
    const { baseUrl, apiUrl, username, password } = await getPreferences();

    const response: GetMangaChaptersResponse = await graphqlPost(apiUrl, this.client,
      GetMangaChaptersQuery(contentId), username, password) ;

    const chapters: Chapter[] = [];

    response.manga.chapters.nodes.reverse(); // order: latest first

    for (let chapterIndex = 0; chapterIndex < response.manga.chapters.nodes.length; chapterIndex++) {
      const chapter = response.manga.chapters.nodes[chapterIndex];
      chapters.push(
        {
          chapterId: chapter.id.toString(),
          number: chapter.chapterNumber,
          index: chapterIndex,
          date: new Date(parseInt(chapter.uploadDate)),
          language: response.manga.source.lang, // api does not provide language on a per-chapter basis
          title: chapter.name,
          providers: [{ id: chapter.scanlator || "UNKNOWN", name: chapter.scanlator || "UNKNOWN"}],
        }
      )
    }

    return chapters;
  }

  async getChapterData(contentId: string, chapterId: string): Promise<ChapterData> {
    const { baseUrl, apiUrl, username, password } = await getPreferences();

    const response: GetChapterPagesResponse = await graphqlPost(apiUrl, this.client,
      GetChapterPagesQuery(chapterId), username, password) ;

    return {
      pages: response.fetchChapterPages.pages.map((entry: string) => {
        return {
          url: baseUrl + entry,
        };
      })
    }
  }

  async getPreferenceMenu(): Promise<Form> {
    return {
      sections: [
        // add select for authentication type
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

  async getAuthenticatedUser() {
    return {
      handle: "placeholder",
    }
  }

  async handleUserSignOut() {

  }
}
