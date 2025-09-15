export function GetChapterPagesQuery(chapterId: string) {
  return `
    mutation GetChapterPages {
      fetchChapterPages(input: {chapterId: ${chapterId}}) {
        pages
      }
    }
  `
}