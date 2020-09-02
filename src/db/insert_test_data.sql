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

INSERT INTO entry (title, description, body) VALUES 
	('Test title', 'Just another test article', '<p>Lipsum</p><p>test</p>'),
	('Testing article', 'A test article', '<p>Lipsum</p><p>test</p>');

INSERT INTO tag (name) VALUES ('test'),
	('personal');

INSERT INTO tagged_entry (tag_id, entry_id) VALUES 
	(1, 2),
	(1, 1),
	(2, 1);

COMMIT;
