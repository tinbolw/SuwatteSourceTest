export function UpdateChapterMutation(chapterId: string) {
  return `
    mutation UpdateChapter {
      updateChapter(input: {id: ${chapterId}, patch: {
        isRead: true
      }}) {
        chapter {
          isRead
        }
      }
    }
  `
}

export function UnreadChapterMutation(chapterId: string) {
  return `
    mutation UpdateChapter {
      updateChapter(input: {id: ${chapterId}, patch: {
        isRead: false
      }}) {
        chapter {
          isRead
        }
      }
    }
  `
}