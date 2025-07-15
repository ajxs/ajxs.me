import fs from "fs/promises";
import path from "path";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import prettier from "prettier";
import { Eta } from "eta";
import { Article, PageRedirect, StaticPage, Tag } from "./models";
import {
  convertNameToFilename,
  filterAndSortArticles,
  sortTagsByName,
} from "./sharedUtilityFunctions";
import {
  blogDirectory,
  defaultPageKeywords,
  distFolder,
  mainPageTitle,
  tagsDirectory,
} from "./constants";
import { createRssFeed } from "./createRssFeed";
import { loadBlogData } from "./loadBlogData";

const eta = new Eta({ views: path.join(__dirname, "templates") });

dayjs.extend(utc);
dayjs.extend(timezone);

/* The number of the latest blog posts to show on the main site index. */
const mainIndexArticleCount = 10;

/**
 * Default information for the main page template.
 * This contains default values for the page meta information, footer text,
 * and main page title.
 */
const defaultMainPageTemplateInfo = {
  pageTitle: mainPageTitle,
  footerText: `© ${dayjs().year()} ajxs`,
  meta_description: "ajxs personal site",
  meta_author: "ajxs",
  meta_email: "ajxs@panoptic.online",
  meta_keywords: defaultPageKeywords.join(),
};

const prettierPageFormattingOptions: prettier.Options = {
  parser: "html",
};

const transformTagToTemplateFormat = (tag: Tag) => ({
  name: tag.name,
  filename: convertNameToFilename(tag.name),
});

const transformArticleToTemplateFormat = (article: Article) => ({
  body: article.body,
  date: dayjs(article.dateCreated).tz("Australia/Sydney").format("YYYY.MM.DD"),
  description: article.description,
  filename: convertNameToFilename(article.title),
  title: article.title,
  tags: sortTagsByName(article.tags ?? []).map(transformTagToTemplateFormat),
});

/**
 * Creates a static redirect page file.
 * These entries represent static redirect HTML files, designed to perform a
 * client-side redirect with a 'refresh' meta directive in the HTML header.
 * These replace the older system of using symlinks to redirect on the
 * server-side due to compatibility issues with non-Linux based web-hosts.
 * @param pageRedirect - The page redirect entity to create the page from.
 * @param mainPageTemplate - The main page template.
 */
async function createRedirectPage(pageRedirect: PageRedirect): Promise<void> {
  /**
   * The page body for the redirect.
   * Ordinarily this should not be seen, however this exists as a fallback for
   * older browsers which do not automatically follow the redirect in the
   * HTML header.
   */
  const pageBody =
    "<p>The page you're looking for has moved.<br/>" +
    "If you are not redirected automatically please" +
    `<a href=\"${pageRedirect.addressTo}\">click here</a>.</p>`;

  const redirectPageHtml = eta.render("./layout", {
    ...defaultMainPageTemplateInfo,
    body: pageBody,
    redirect: pageRedirect.addressTo,
  });

  const formattedPageHtml = await prettier.format(
    redirectPageHtml,
    prettierPageFormattingOptions,
  );

  const filePath = `${distFolder}/${pageRedirect.addressFrom}`;

  await fs.writeFile(filePath, formattedPageHtml);

  console.log(`Created redirect page: ${filePath}`);
}

async function createStaticPage(staticPage: StaticPage): Promise<void> {
  const staticPageHtml = eta.render("./layout", {
    ...defaultMainPageTemplateInfo,
    meta_description: staticPage.description,
    pageTitle: `${staticPage.title} - ${mainPageTitle}`,
    body: staticPage.body,
    containsCodeBlocks: staticPage.containsCodeBlocks,
  });

  const formattedPageHtml = await prettier.format(
    staticPageHtml,
    prettierPageFormattingOptions,
  );

  const filePath = `${distFolder}/${staticPage.path}`;

  await fs.writeFile(filePath, formattedPageHtml);

  console.log(`Created static page: ${filePath}`);
}

async function createTagIndexPage(tag: Tag): Promise<void> {
  const tagIndexHtml = eta.render("./index", {
    ...defaultMainPageTemplateInfo,
    articles: filterAndSortArticles(tag.taggedArticles ?? []).map(
      transformArticleToTemplateFormat,
    ),
    meta_description: `Blog entries tagged as '${tag.name}'`,
    meta_keywords: [...defaultPageKeywords, tag.name].join(),
    pageTitle: `${tag.name} - ${mainPageTitle}`,
    heading: `Entries tagged as '<span class="tag-index-name">${tag.name}</span>'`,
    showArticleTags: false,
  });

  const formattedPageHtml = await prettier.format(
    tagIndexHtml,
    prettierPageFormattingOptions,
  );

  const filePath = `${blogDirectory}/tag/${convertNameToFilename(tag.name)}.html`;

  await fs.writeFile(filePath, formattedPageHtml);

  console.log(`Created tag index page: ${filePath}`);
}

/**
 * Creates an individual blog entry HTML file from a parsed entry.
 * Note that the 'containsCodeBlocks' field is used to conditionally add
 * the 'code blocks' CSS stylesheet to the page. This isn't added to entries
 * by default due to its size.
 * @param article - The article entity to create the page for.
 * @param articleTemplate - The article HTML template.
 * @param mainPageTemplate - The main page template.
 */
async function createArticlePage(article: Article): Promise<void> {
  const articleTagNames = (article.tags ?? []).map((tag) => tag.name);
  const pageKeywordString = [...defaultPageKeywords, ...articleTagNames].join();

  const articlePageHtml = eta.render("./entry", {
    ...defaultMainPageTemplateInfo,
    article: transformArticleToTemplateFormat(article),
    tags: sortTagsByName(article.tags ?? []).map(transformTagToTemplateFormat),
    meta_keywords: pageKeywordString,
    meta_description: article.description,
    pageTitle: `${article.title} - ${mainPageTitle}`,
    containsCodeBlocks: article.containsCodeBlocks,
  });

  const formattedPageHtml = await prettier.format(
    articlePageHtml,
    prettierPageFormattingOptions,
  );

  const filePath = `${blogDirectory}/${convertNameToFilename(article.title)}.html`;

  await fs.writeFile(filePath, formattedPageHtml);

  console.log(`Created article page: ${filePath}`);
}

async function createSiteIndex(
  articles: Article[],
  tags: Tag[],
): Promise<void> {
  const siteIndexPageHtml = eta.render("./index", {
    ...defaultMainPageTemplateInfo,
    articles: filterAndSortArticles(articles)
      .slice(0, mainIndexArticleCount)
      .map(transformArticleToTemplateFormat),
    pageBodyClass: "index-page",
    heading: "Blog",
    tags: sortTagsByName(tags).map(transformTagToTemplateFormat),
    showArticleTags: false,
  });

  // All output from the static-site generator is formatted with Prettier.
  // This is so that any changes to the output can be easily reviewed
  // with git diff.
  const formattedPageHtml = await prettier.format(
    siteIndexPageHtml,
    prettierPageFormattingOptions,
  );

  const filePath = `${distFolder}/index.html`;

  await fs.writeFile(filePath, formattedPageHtml);

  console.log(`Created site index page: ${filePath}`);
}

async function createAllEntriesPage(articles: Article[]): Promise<void> {
  const allEntriesHtml = eta.render("./index", {
    ...defaultMainPageTemplateInfo,
    articles: filterAndSortArticles(articles).map(
      transformArticleToTemplateFormat,
    ),
    heading: "All Blog Entries",
    meta_description: "All Blog Entries",
    pageTitle: `All Blog Entries - ${mainPageTitle}`,
    showArticleTags: true,
  });

  const formattedPageHtml = await prettier.format(
    allEntriesHtml,
    prettierPageFormattingOptions,
  );

  const filePath = `${blogDirectory}/all.html`;

  await fs.writeFile(filePath, formattedPageHtml);

  console.log(`Created all entries page: ${filePath}`);
}

export async function createSite() {
  const { articles, pageRedirects, staticPages, tags } = await loadBlogData();

  // This will recursively create the entire blog directory structure.
  // i.e. 'docs/blog/tag'.
  await fs.mkdir(tagsDirectory, { recursive: true });

  await Promise.all([
    createRssFeed(articles),
    createSiteIndex(articles, tags),
    createAllEntriesPage(articles),
    ...tags.map(createTagIndexPage),
    ...articles.map(createArticlePage),
    ...staticPages.map(createStaticPage),
    ...pageRedirects.map(createRedirectPage),
  ]);
}
