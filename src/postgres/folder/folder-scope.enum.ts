export const FolderScope = {
  INTENT: 'intent',
} as const;

export type FolderScope = (typeof FolderScope)[keyof typeof FolderScope];
