-- 
--  Copyright (c) 2020, AJXS.
--  This program is free software; you can redistribute it and/or modify it
--  under the terms of the GNU General Public License as published by the
--  Free Software Foundation; either version 3 of the License, or
--  (at your option) any later version.
--
--  Authors:
--     Anthony <ajxs [at] panoptic.online>
-- 


BEGIN TRANSACTION;

DROP TABLE IF EXISTS entry;
DROP TABLE IF EXISTS tag;
DROP TABLE IF EXISTS tagged_entry;
DROP TABLE IF EXISTS static_page;

CREATE TABLE entry (
	entry_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	description TEXT,
	body TEXT NOT NULL,
	date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	date_deleted DATETIME
);


CREATE TABLE tag (
	tag_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	date_deleted DATETIME
);


CREATE TABLE tagged_entry (
	tag_id INTEGER NOT NULL REFERENCES tag(tag_id),
	entry_id INTEGER NOT NULL REFERENCES entry(entry_id) ON DELETE CASCADE,
	PRIMARY KEY(tag_id, entry_id)
);


CREATE TABLE static_page (
	page_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	description TEXT,
	path TEXT NOT NULL,
	body TEXT NOT NULL,
	date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	date_deleted DATETIME
);

-- These entries represent static redirect HTML files, designed to perform a client-side 
-- redirect with a 'refresh' meta directive in the HTML header.
-- These replace the older system of using symlinks to redirect on the server-side due to 
-- compatibility issues with non-Linux based webhosts.
CREATE TABLE static_page_redirect (
	address_from TEXT NOT NULL,
	address_to TEXT NOT NULL,
	date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	date_deleted DATETIME,
	PRIMARY KEY (address_from, address_to)
);

COMMIT;
