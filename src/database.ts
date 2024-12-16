/**
 * Database connection module.
 * @module database
 */

import { DataSource } from "typeorm";
import { Article, PageRedirect, StaticPage, Tag } from "./models";
import "reflect-metadata";

/** The main application's data source. */
export let appDataSource: DataSource;

/**
 * Initialises the database on the configured port.
 * Registers all TypeORM entities.
 * @returns The initialised database data source.
 */
export async function initialiseAppDataSource(): Promise<DataSource> {
  appDataSource = new DataSource({
    type: "sqlite",
    database: "./site.sqlite3",
    logging: ["error"],
    entities: [Article, PageRedirect, StaticPage, Tag],
  });

  return appDataSource.initialize();
}

/**
 * Closes the database connection.
 */
export async function destroyAppDataSource(): Promise<void> {
  if (!appDataSource || !appDataSource.isInitialized) {
    throw new Error("Database not connected");
  }

  await appDataSource.destroy();
}
