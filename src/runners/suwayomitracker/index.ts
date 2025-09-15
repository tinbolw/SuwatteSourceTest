import {
  RunnerPreferenceProvider,
  ContentTracker,
  Form,
  Highlight,
  ImageRequestHandler,
  NetworkRequest,
  RunnerAuthenticatable,
  RunnerInfo,
  TrackerConfig,
  TrackProgressUpdate,
  TrackStatus,
  UIStepper,
  UITextField,
} from "@suwatte/daisuke";

import { UnreadChapterMutation, UpdateChapterMutation } from "./gql";
import {
  GetMangaChaptersQuery,
  GetAllCategoriesQuery,
  GetMangaQuery,
} from "../suwayomi/gql"
import { genAuthHeader } from "../suwayomi/utils";


const info: RunnerInfo = {
  id: "tin.suwayomitracker",
  name: "Suwayomi Tracker",
  version: 0.1,
  website: "https://github.com/Suwayomi/Suwayomi-Server",
  thumbnail: "suwayomi.png",
};

const config: TrackerConfig = {
  linkKeys: ["suwayomi"],
};

export const Target:
  ContentTracker &
  RunnerPreferenceProvider &
  ImageRequestHandler & 
  RunnerAuthenticatable = {
  info,
  config,

  async didUpdateLastReadChapter(id: string, progress: TrackProgressUpdate): Promise<void> {
    const client = new NetworkClient();
    const baseUrl = await ObjectStore.string("suwayomi_url") ?? "http://127.0.0.1:4567";
    const apiUrl = baseUrl + "/api/graphql";

    const response = await client.request(
      {
        url: apiUrl,
        method: "POST",
        body: {
          "query": GetMangaChaptersQuery(id),
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

    const chapters = await (JSON.parse(response.data)).data.manga.chapters.nodes;

    const matches = chapters.filter((chapter: { chapterNumber: any; }) => chapter.chapterNumber == progress.chapter);

    if (matches.length == 0) {
      throw new Error("No chapter with that number found.");
    } else {
      await client.request(
        {
          url: apiUrl,
          method: "POST",
          body: {
            "query": UpdateChapterMutation(matches[0].id),
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
    }
  },

  async getResultsForTitles(titles: string[]): Promise<Highlight[]> {
    const title = titles[0]; // api does not seem to support more than one title anyways

    const client = new NetworkClient();
    const baseUrl = await ObjectStore.string("suwayomi_url") ?? "http://127.0.0.1:4567";
    const apiUrl = baseUrl + "/api/graphql";

    const response = await client.request(
      {
        url: apiUrl,
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
    );

    const parsedJson = await JSON.parse(response.data);

    return parsedJson.data.categories.nodes[0].mangas.nodes
      .filter((manga: { title: string; }) => manga.title == title)
      .map((manga: { thumbnailUrl: string; id: { toString: () => any; }; title: any; }) => {
        const imageUrl = baseUrl + manga.thumbnailUrl;
        return {
          id: manga.id.toString(),
          title: manga.title,
          cover: imageUrl,
        };
      });
  },

  async getTrackItem(id: string): Promise<Highlight> {
    const client = new NetworkClient();
    const baseUrl = await ObjectStore.string("suwayomi_url") ?? "http://127.0.0.1:4567";
    const apiUrl = baseUrl + "/api/graphql";

    const response = await client.request(
      {
        url: apiUrl,
        method: "POST",
        body: {
          "query": GetMangaQuery(id),
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

    const manga = await (JSON.parse(response.data)).data.manga;

    return {
      id,
      title: manga.title,
      cover: baseUrl + manga.thumbnailUrl,
      webUrl: `${baseUrl}/manga/${id}`,
      entry: {
        status: TrackStatus.COMPLETED, // ask about this
        progress: {
          maxAvailableChapter: manga.highestNumberedChapter.chapterNumber,
          lastReadChapter: manga.latestReadChapter?.chapterNumber ?? 0,
        }
      }
    }
  },

  async didUpdateStatus(id: string, status: TrackStatus): Promise<void> {
    throw new Error("3");
  },

  async beginTracking(id: string, status: TrackStatus): Promise<void> {
    throw new Error("4");
  },

  async getEntryForm(id: string): Promise<Form> {
    const client = new NetworkClient();
    const baseUrl = await ObjectStore.string("suwayomi_url") ?? "http://127.0.0.1:4567";
    const apiUrl = baseUrl + "/api/graphql";

    const response = await client.request(
      {
        url: apiUrl,
        method: "POST",
        body: {
          "query": GetMangaQuery(id),
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

    const manga = await (JSON.parse(response.data)).data.manga;

    return {
      sections: [
        {
          header: "Reading Progress",
          children: [
            UIStepper({
              id: "progress",
              title: "Chapter",
              value: manga.latestReadChapter?.chapterNumber ?? 0,
              upperBound: manga.highestNumberedChapter.chapterNumber,
              allowDecimal: true,
            }),
          ]
        }
      ]
    }
  },

  async didSubmitEntryForm(id: string, form: any): Promise<void> {
    const client = new NetworkClient();
    const baseUrl = await ObjectStore.string("suwayomi_url") ?? "http://127.0.0.1:4567";
    const apiUrl = baseUrl + "/api/graphql";

    const response = await client.request(
      {
        url: apiUrl,
        method: "POST",
        body: {
          "query": GetMangaChaptersQuery(id),
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

    const chapters = await (JSON.parse(response.data)).data.manga.chapters.nodes;

    const matches = chapters.filter((chapter: { chapterNumber: any; }) => chapter.chapterNumber == form.progress);
    const laterChapters = chapters.filter((chapter: { chapterNumber: any; }) => chapter.chapterNumber > (form.progress ?? 0));

    if (form.progress == 0) {
      for (const chapter of laterChapters) {
        await client.request(
          {
            url: apiUrl,
            method: "POST",
            body: {
              "query": UnreadChapterMutation(chapter.id),
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
      }
    } else if (matches.length == 0) {
      throw new Error("No chapter with that number found.");
    } else {
      await client.request(
        {
          url: apiUrl,
          method: "POST",
          body: {
            "query": UpdateChapterMutation(matches[0].id),
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

      for (const chapter of laterChapters) {
        await client.request(
          {
            url: apiUrl,
            method: "POST",
            body: {
              "query": UnreadChapterMutation(chapter.id),
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
      }
    }
  },

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
  },

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
  },

  async getAuthenticatedUser() {
    return {
      handle: "placeholder",
    }
  },

  async handleUserSignOut() {

  }
}