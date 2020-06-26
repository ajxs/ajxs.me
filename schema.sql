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

CREATE TABLE entry (
	entry_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	title TEXT NOT NULL,
	short TEXT,
	body TEXT NOT NULL
);


CREATE TABLE tag (
	tag_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE tagged_entry (
	tag_id INTEGER NOT NULL REFERENCES tag(tag_id),
	entry_id INTEGER NOT NULL REFERENCES entry(entry_id) ON DELETE CASCADE,
	PRIMARY KEY(tag_id, entry_id)
);

COMMIT;
