export const GetAllCategoriesQuery = `
  query AllCategories {
    categories {
      nodes {
        mangas {
          nodes {
            id
            title
            thumbnailUrl
          }
        }
      }
    }
  }
`;

export function GetMangaQuery(contentId: string) {
  return `
    query GetManga {
      manga(id: ${contentId}) {
        title
        thumbnailUrl
        description
        author
        status
        genre
        id
        highestNumberedChapter {
          chapterNumber
        }
        latestReadChapter {
          chapterNumber
        }
      }
    }
  `;
}

export function GetMangaChaptersQuery(contentId: string) {
  return `
    query GetMangaChapters {
      manga(id: ${contentId}) {
        chapters {
          nodes {
            name
            id
            isRead
            lastPageRead
            lastReadAt
            pageCount
            chapterNumber
            url
            uploadDate
            scanlator
          }
        }
        id
        source {
          lang
        }
      }
    }
  `;
}