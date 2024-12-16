import { DataSource, IsNull } from "typeorm";
import { destroyAppDataSource, initialiseAppDataSource } from "./database";
import { Article, PageRedirect, StaticPage, Tag } from "./models";
import { createSite } from "./createSite";
import { createRssFeed } from "./createRssFeed";

async function loadBlogData(appDataSource: DataSource): Promise<{
  articles: Article[];
  pageRedirects: PageRedirect[];
  staticPages: StaticPage[];
  tags: Tag[];
}> {
  const whereNotDeleted = { where: { dateDeleted: IsNull() } };

  const [articles, pageRedirects, staticPages, tags] = await Promise.all([
    appDataSource.getRepository(Article).find({
      ...whereNotDeleted,
      order: {
        dateCreated: "DESC",
      },
    }),
    appDataSource.getRepository(PageRedirect).find(whereNotDeleted),
    appDataSource.getRepository(StaticPage).find(whereNotDeleted),
    appDataSource.getRepository(Tag).find(whereNotDeleted),
  ]);

  return { articles, pageRedirects, staticPages, tags };
}

initialiseAppDataSource().then(async (appDataSource) => {
  console.log("Database opened");

  const { articles, pageRedirects, staticPages, tags } =
    await loadBlogData(appDataSource);

  await Promise.all([
    createSite(articles, pageRedirects, staticPages, tags),
    createRssFeed(articles),
  ]);

  await destroyAppDataSource();
  console.log("Database closed");
});
