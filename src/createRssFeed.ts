import fs from "fs/promises";
import xml2js from "xml2js";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Article } from "./models";
import {
  convertNameToFilename,
  filterAndSortArticles,
} from "./sharedUtilityFunctions";
import { defaultPageKeywords, distFolder, mainPageTitle } from "./constants";

dayjs.extend(utc);
dayjs.extend(timezone);

const convertDateToRssFormat = (date: Date): string =>
  dayjs(date).tz("Australia/Sydney").format("ddd, DD MMM YYYY HH:mm:ss ZZ");

export async function createRssFeed(articles: Article[]): Promise<void> {
  const rssChannelLink = "https://ajxs.me";

  const builder = new xml2js.Builder();

  const sortedArticles = filterAndSortArticles(articles);

  const articleItems = sortedArticles.map((article) => {
    const filename = `${rssChannelLink}/blog/${convertNameToFilename(article.title)}.html`;

    return {
      title: article.title,
      link: filename,
      description: article.description,
      pubDate: convertDateToRssFormat(article.dateCreated),
      guid: filename,
      category: article.tags.map((tag) => tag.name).sort(),
    };
  });

  const rssFeedString = builder.buildObject({
    rss: {
      $: {
        version: "2.0",
        xmlns: "http://www.w3.org/2005/Atom",
      },
      channel: {
        title: mainPageTitle,
        link: rssChannelLink,
        description: "Ajxs blog",
        language: "en",
        // Set the channel pubDate to the date of the last article.
        // In the case of an empty article list, use the current date.
        pubDate: convertDateToRssFormat(
          sortedArticles[0]?.dateCreated ?? new Date()
        ),
        lastBuildDate: convertDateToRssFormat(new Date()),
        /**
         * The channel webmaster email string.
         * Re: format, refer to: https://www.rssboard.org/rss-profile#data-types-email
         */
        webMaster: "ajxs@panoptic.online (Anthony)",
        "atom:link": {
          $: {
            href: `${rssChannelLink}/site.rss`,
            rel: "self",
            type: "application/rss+xml",
          },
        },
        category: defaultPageKeywords,
        item: articleItems,
      },
    },
  });

  const rssFeedPath = `${distFolder}/site.rss`;

  await fs.writeFile(rssFeedPath, rssFeedString);

  console.log(`Created RSS feed: ${rssFeedPath}`);
}
