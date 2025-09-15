import { 
  RunnerPreferenceProvider,
  ContentTracker, 
  Form, 
  Highlight, 
  RunnerInfo,
  TrackerConfig,
  TrackProgressUpdate,
  TrackStatus,
  UITextField,
} from "@suwatte/daisuke";
import { GetMangaChaptersQuery, UpdateChapterMutation } from "./gql";
import { genAuthHeader } from "./utils";

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

export const Target: ContentTracker & RunnerPreferenceProvider = {
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

    const parsedJson = await JSON.parse(response.data);
    const chapterId = parsedJson.data.manga.chapter.nodes
      .filter((chapter: { chapterNumber: number | undefined; }) => chapter.chapterNumber == progress.chapter)[0].id;

    console.log(chapterId);

    // await client.request(
    //   {
    //     url: apiUrl,
    //     method: "POST",
    //     body: {
    //       "query": UpdateChapterMutation(parsedJson),
    //     },
    //     headers: {
    //       "authorization": `Basic ${genAuthHeader(
    //         await ObjectStore.string("suwayomi_username"), 
    //         await ObjectStore.string("suwayomi_password")
    //       )}`,
    //       "Content-Type": "application/json"
    //     },
    //   }
    // );
  },

  async getResultsForTitles(titles: string[]): Promise<Highlight[]> {
    throw new Error();
  },

  async getTrackItem(id: string): Promise<Highlight> {
    throw new Error();
  },
  
  async didUpdateStatus(id: string, status: TrackStatus): Promise<void> {
    throw new Error();
  },

  async beginTracking(id: string, status: TrackStatus): Promise<void> {
    throw new Error();
  },
    
  async getEntryForm(id: string): Promise<Form> {
    throw new Error();
  },
    
  async didSubmitEntryForm(id: string, form: any): Promise<void> {
    throw new Error();
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
}