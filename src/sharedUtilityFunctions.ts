import dayjs from "dayjs";
import { Article, Tag } from "./models";

/**
 * Creates a filename from an entry or tag name.
 * @param name - The entity name to convert.
 * @returns A string suitable for use as a filename.
 */
export function convertNameToFilename(name: string): string {
  let filename: string = name.replace(/ /g, "_");
  // This removes all non-legal characters.
  // Refer to: https://www.ietf.org/rfc/rfc3986.txt
  //   Section 2.3: Unreserved Characters.
  filename = filename.replace(/[^\w\-.~]/g, "");

  return filename;
}

export const filterAndSortArticles = (articles: Article[]) =>
  articles
    .filter((article) => !article.isUnlisted)
    .sort((a, b) => dayjs(b.dateCreated).diff(a.dateCreated));

export const sortTagsByName = (tags: Tag[]) =>
  tags.sort((a, b) => a.name.localeCompare(b.name));
