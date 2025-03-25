import fs from "fs/promises";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import Handlebars from "handlebars";
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
  page_title: mainPageTitle,
  footer_text: `© ${dayjs().year()} ajxs`,
  meta_description: "ajxs personal site",
  meta_author: "ajxs",
  meta_email: "ajxs@panoptic.online",
  meta_keywords: defaultPageKeywords.join(),
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
async function createRedirectPage(
  pageRedirect: PageRedirect,
  mainPageTemplate: Handlebars.TemplateDelegate,
): Promise<void> {
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

  const staticPageHtml = mainPageTemplate({
    ...defaultMainPageTemplateInfo,
    page_body: pageBody,
    redirect: pageRedirect.addressTo,
  });

  const filePath = `${distFolder}/${pageRedirect.addressFrom}`;

  await fs.writeFile(filePath, staticPageHtml);

  console.log(`Created redirect page: ${filePath}`);
}

async function createStaticPage(
  staticPage: StaticPage,
  mainPageTemplate: Handlebars.TemplateDelegate,
): Promise<void> {
  const staticPageHtml = mainPageTemplate({
    ...defaultMainPageTemplateInfo,
    meta_description: staticPage.description,
    page_title: `${staticPage.title} - ${mainPageTitle}`,
    page_body: staticPage.body,
    contains_code_blocks: staticPage.containsCodeBlocks,
  });

  const filePath = `${distFolder}/${staticPage.path}`;

  await fs.writeFile(filePath, staticPageHtml);

  console.log(`Created static page: ${filePath}`);
}

async function createTagIndexPage(
  tag: Tag,
  blogIndexTemplate: Handlebars.TemplateDelegate,
  mainPageTemplate: Handlebars.TemplateDelegate,
): Promise<void> {
  const taggedArticleIndexHtml = blogIndexTemplate({
    articles: filterAndSortArticles(tag.taggedArticles ?? [])
      .slice(0, mainIndexArticleCount)
      .map(transformArticleToTemplateFormat),
    heading: `Entries tagged as '<span class="tag-index-name">${tag.name}</span>'`,
    show_entry_tags: false,
  });

  const tagIndexHtml = mainPageTemplate({
    ...defaultMainPageTemplateInfo,
    meta_description: `Blog entries tagged as '${tag.name}'`,
    meta_keywords: [...defaultPageKeywords, tag.name].join(),
    page_title: `${tag.name} - ${mainPageTitle}`,
    page_body: taggedArticleIndexHtml,
  });

  const filePath = `${blogDirectory}/tag/${convertNameToFilename(tag.name)}.html`;

  await fs.writeFile(filePath, tagIndexHtml);

  console.log(`Created tag index page: ${filePath}`);
}

/**
 * Creates an individual blog entry HTML file from a parsed entry.
 * Note that the 'contains_code_blocks' field is used to conditionally add
 * the 'code blocks' CSS stylesheet to the page. This isn't added to entries
 * by default due to its size.
 * @param article - The article entity to create the page for.
 * @param articleTemplate - The article HTML template.
 * @param mainPageTemplate - The main page template.
 */
async function createArticlePage(
  article: Article,
  articleTemplate: Handlebars.TemplateDelegate,
  mainPageTemplate: Handlebars.TemplateDelegate,
): Promise<void> {
  const articleTagNames = (article.tags ?? []).map((tag) => tag.name);
  const pageKeywordString = [...defaultPageKeywords, ...articleTagNames].join();

  const articleHtml = articleTemplate(
    transformArticleToTemplateFormat(article),
  );

  const articlePageHtml = mainPageTemplate({
    ...defaultMainPageTemplateInfo,
    meta_keywords: pageKeywordString,
    meta_description: article.description,
    page_title: `${article.title} - ${mainPageTitle}`,
    page_body: articleHtml,
    contains_code_blocks: article.containsCodeBlocks,
  });

  const filePath = `${blogDirectory}/${convertNameToFilename(article.title)}.html`;

  await fs.writeFile(filePath, articlePageHtml);

  console.log(`Created article page: ${filePath}`);
}

async function loadBlogTemplates(): Promise<{
  mainPageTemplate: Handlebars.TemplateDelegate;
  blogIndexTemplate: Handlebars.TemplateDelegate;
  articleTemplate: Handlebars.TemplateDelegate;
  indexTemplate: Handlebars.TemplateDelegate;
}> {
  /* The base template folder. */
  const templateDirectory = "src/templates";

  const [
    tagListPartialContents,
    pageTemplateFileContents,
    blogIndexTemplateFile,
    articleTemplateFile,
    indexTemplateFile,
  ] = await Promise.all([
    fs.readFile(`${templateDirectory}/tag_list.hbs`, "utf-8"),
    fs.readFile(`${templateDirectory}/page.hbs`, "utf-8"),
    fs.readFile(`${templateDirectory}/blog_index.hbs`, "utf-8"),
    fs.readFile(`${templateDirectory}/entry.hbs`, "utf-8"),
    fs.readFile(`${templateDirectory}/index.hbs`, "utf-8"),
  ]);

  Handlebars.registerPartial("tag_list", tagListPartialContents);

  return {
    mainPageTemplate: Handlebars.compile(pageTemplateFileContents),
    blogIndexTemplate: Handlebars.compile(blogIndexTemplateFile),
    articleTemplate: Handlebars.compile(articleTemplateFile),
    indexTemplate: Handlebars.compile(indexTemplateFile),
  };
}

async function createSiteIndex(
  articles: Article[],
  tags: Tag[],
  mainPageTemplate: Handlebars.TemplateDelegate,
  blogIndexTemplate: Handlebars.TemplateDelegate,
  indexTemplate: Handlebars.TemplateDelegate,
): Promise<void> {
  const siteIndexArticleIndexHtml = blogIndexTemplate({
    articles: filterAndSortArticles(articles)
      .slice(0, mainIndexArticleCount)
      .map(transformArticleToTemplateFormat),
    heading: "Blog",
    show_tag_list: true,
    show_entry_tags: false,
  });

  const siteIndexHtml = indexTemplate({
    blog_index_html: siteIndexArticleIndexHtml,
    index_tag_links: sortTagsByName(tags).map(transformTagToTemplateFormat),
  });

  const siteIndexPageHtml = mainPageTemplate({
    ...defaultMainPageTemplateInfo,
    body_class: "index-page",
    page_body: siteIndexHtml,
  });

  const filePath = `${distFolder}/index.html`;

  await fs.writeFile(filePath, siteIndexPageHtml);

  console.log(`Created site index page: ${filePath}`);
}

async function createAllEntriesPage(
  articles: Article[],
  blogIndexTemplate: Handlebars.TemplateDelegate,
  mainPageTemplate: Handlebars.TemplateDelegate,
): Promise<void> {
  const allEntriesIndexHtml = blogIndexTemplate({
    articles: filterAndSortArticles(articles).map(
      transformArticleToTemplateFormat,
    ),
    heading: "All Blog Entries",
    show_entry_tags: true,
  });

  const allEntriesHtml = mainPageTemplate({
    ...defaultMainPageTemplateInfo,
    meta_description: "All Blog Entries",
    page_title: `All Blog Entries - ${mainPageTitle}`,
    page_body: allEntriesIndexHtml,
  });

  const filePath = `${blogDirectory}/all.html`;

  await fs.writeFile(filePath, allEntriesHtml);

  console.log(`Created all entries page: ${filePath}`);
}

export async function createSite() {
  const { articles, pageRedirects, staticPages, tags } = await loadBlogData();

  const {
    mainPageTemplate,
    blogIndexTemplate,
    articleTemplate,
    indexTemplate,
  } = await loadBlogTemplates();

  // This will recursively create the entire blog directory structure.
  // i.e. 'docs/blog/tag'.
  await fs.mkdir(tagsDirectory, { recursive: true });

  await Promise.all([
    createRssFeed(articles),
    createSiteIndex(
      articles,
      tags,
      mainPageTemplate,
      blogIndexTemplate,
      indexTemplate,
    ),
    createAllEntriesPage(articles, blogIndexTemplate, mainPageTemplate),
    ...tags.map((tag) =>
      createTagIndexPage(tag, blogIndexTemplate, mainPageTemplate),
    ),
    ...articles.map((article) =>
      createArticlePage(article, articleTemplate, mainPageTemplate),
    ),
    ...staticPages.map((staticPage) =>
      createStaticPage(staticPage, mainPageTemplate),
    ),
    ...pageRedirects.map((pageRedirect) =>
      createRedirectPage(pageRedirect, mainPageTemplate),
    ),
  ]);
}
