/**
 * Gets the API url of the Suwayomi server, or localhost if one is not defined.
 * @returns 
 */
export async function getApiUrl() : Promise<string> {
  const baseUrl = await ObjectStore.string("suwayomi_url") ?? "http://127.0.0.1:4567";
  return baseUrl + "/api/graphql";
}