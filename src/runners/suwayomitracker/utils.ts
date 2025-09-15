/**
 * Generates the credentials portion of an HTTP Basic Authorization header.
 * @param username 
 * @param password 
 * @returns {(string|"")} The credentials, or an empty string if either username or password is null.
 */
export function genAuthHeader(username: string | null, password: string | null) : string {
  if (username && password) {
    return Buffer.from(`${username}:${password}`).toString('base64');
  } else {
    return "";
  }
}

export function matchMangaStatus(status: string) : number | undefined {
  switch (status) {
    case "ONGOING":
    case "LICENSED":
      return 1;
    case "COMPLETED":
    case "PUBLISHING_FINISHED":
      return 2;
    case "CANCELLED":
      return 3;
    case "ON_HIATUS":
      return 4;
    default:
      return undefined;
  }
}