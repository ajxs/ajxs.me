/**
 * Database connection module.
 * @module database
 */

import { DataSource, IsNull } from "typeorm";
import { Article, PageRedirect, StaticPage, Tag } from "./models";
import "reflect-metadata";

/**
 * Initialises the database on the configured port.
 * Registers all TypeORM entities.
 * @returns The initialised database data source.
 */
async function initialiseAppDataSource(): Promise<DataSource> {
  const appDataSource = new DataSource({
    type: "sqlite",
    database: "./site.sqlite3",
    logging: ["error"],
    entities: [Article, PageRedirect, StaticPage, Tag],
  });

  return appDataSource.initialize();
}

export async function loadBlogData(): Promise<{
  articles: Article[];
  pageRedirects: PageRedirect[];
  staticPages: StaticPage[];
  tags: Tag[];
}> {
  const appDataSource = await initialiseAppDataSource();
  console.log("Database opened");

  const whereNotDeleted = { where: { dateDeleted: IsNull() } };

  const [articles, pageRedirects, staticPages, tags] = await Promise.all([
    appDataSource.getRepository(Article).find({
      ...whereNotDeleted,
      order: {
        dateCreated: "DESC",
      },
      relations: {
        tags: true,
      },
    }),
    appDataSource.getRepository(PageRedirect).find(whereNotDeleted),
    appDataSource.getRepository(StaticPage).find(whereNotDeleted),
    appDataSource.getRepository(Tag).find({
      ...whereNotDeleted,
      relations: {
        taggedArticles: true,
      },
    }),
  ]);

  await appDataSource.destroy();
  console.log("Database closed");

  return { articles, pageRedirects, staticPages, tags };

  // return { articles: [], pageRedirects: [], staticPages: [], tags: [] };
}
