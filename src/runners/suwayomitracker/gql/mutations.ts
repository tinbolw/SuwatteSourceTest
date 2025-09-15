export function UpdateChapterMutation(chapterId: string) {
  return `
    mutation UpdateChapter {
      updateChapter(input: {id: ${chapterId}, patch: {
        isRead: false
      }}) {
        chapter {
          chapterNumber
          isRead
          name
        }
      }
    }
  `
}