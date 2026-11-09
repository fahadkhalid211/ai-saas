/**
 * The people behind Crescelo, shown on the About page and used for author and organisation structured data.
 *
 * THE PEOPLE SWITCH. It is empty on purpose: a page must never name a person who has not agreed to be named, and bylines on
 * articles must belong to a real author. When someone is ready to be public, add them here and these follow:
 *   - /about lists them with their role and bio;
 *   - the Organization structured data names them as founder / members;
 *   - set `author: true` on the one who reviews articles and the blog structured data lists them as the author instead of
 *     "Crescelo" (search engines and AI assistants weigh a named, real author far more than an organisation).
 */
export interface TeamMember {
  name: string;
  role: string;
  /** Two or three sentences: what they have done that qualifies them to write or review for this site. */
  bio: string;
  /** A public profile that proves the person exists (LinkedIn, personal site, GitHub). */
  profileUrl?: string;
  /** The founder is listed in the Organization structured data as `founder`. */
  founder?: boolean;
  /** Reviews or writes the articles: used as the article author. */
  author?: boolean;
}

export const TEAM: TeamMember[] = [];

export const founders = (): TeamMember[] => TEAM.filter((m) => m.founder);
export const articleAuthor = (): TeamMember | undefined => TEAM.find((m) => m.author);
