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
  filename = convertToApproximateAsciiRepresentation(filename).replace(
    /[^\w\-.~]/g,
    "",
  );

  return filename;
}

function convertToApproximateAsciiRepresentation(input: string): string {
  return (
    input
      // Specifically replace this character before it gets normalised and stripped
      // out, as it features prominently in the μCOM-87 article.
      .replace("μ", "u")
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
      .normalize("NFKD")
      // strip combining marks.
      .replace(/[\u0300-\u036f]/g, "")
      // remove remaining non-ASCII characters.
      .replace(/[^\x00-\x7F]/g, "")
  );
}

export const filterAndSortArticles = (articles: Article[]) =>
  articles
    .filter((article) => !article.isUnlisted)
    .sort((a, b) => dayjs(b.dateCreated).diff(a.dateCreated));

export const sortTagsByName = (tags: Tag[]) =>
  tags.sort((a, b) => a.name.localeCompare(b.name));
