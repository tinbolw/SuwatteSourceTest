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