export type ContestStatus = 'draft' | 'upcoming' | 'active' | 'voting' | 'completed' | 'archived'

// Valid transitions
const TRANSITIONS: Record<ContestStatus, ContestStatus[]> = {
  draft: ['upcoming', 'archived'],
  upcoming: ['active', 'archived'],
  active: ['voting', 'archived'],
  voting: ['completed'],
  completed: ['archived'],
  archived: [],
}

export function canTransition(from: ContestStatus, to: ContestStatus): boolean {
  return TRANSITIONS[from].includes(to)
}

export function getValidTransitions(from: ContestStatus): ContestStatus[] {
  return TRANSITIONS[from]
}

/**
 * Compute a composite contest score from engagement signals.
 * votes * 3 + likes * 1 + comments * 0.5 + shares * 2
 */
export function computeContestScore(
  votes: number,
  likes: number,
  comments: number,
  shares: number
): number {
  return votes * 3 + likes * 1 + comments * 0.5 + shares * 2
}

/**
 * Generate a URL-safe slug from a title.
 * Lowercases, replaces spaces with hyphens, strips non-alphanumeric/hyphen chars.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
