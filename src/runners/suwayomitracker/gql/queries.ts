export function GetMangaChaptersQuery(contentId: string) {
  return `
    query GetMangaChapters {
      manga(id: ${contentId}) {
        chapters {
          nodes {
            id
            chapterNumber
          }
        }
      }
    }
  `;
}