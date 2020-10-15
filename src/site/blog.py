#!/usr/bin/env python3

"""
Blog library.
Contains all of the functionality necessary for loading data from the blog database.
"""

from datetime import datetime
import os
import sqlite3

__author__ = "AJXS"
__copyright__ = "Copyright 2020, AJXS"
__credits__ = ["AJXS"]
__license__ = "GPL"
__version__ = "1.0"
__maintainer__ = "AJXS"
__email__ = "ajxs at panoptic.online"
__status__ = "Production"


# The main database file.
DATABASE_FILE = "{}/blog.sqlite3".format(os.getcwd())

# The database query to load all blog entries.
LOAD_ENTRIES_QUERY = """
SELECT *
FROM entry e
WHERE e.date_deleted IS NULL
ORDER BY e.date_created DESC;
"""

# Database query used to load the tags for an individual entry.
LOAD_ENTRY_TAGS_QUERY = """
SELECT t.* FROM tagged_entry k
LEFT JOIN tag t ON t.tag_id = k.tag_id
WHERE k.entry_id = ?;
"""

# Database query used to load the tags.
LOAD_TAGS_QUERY = """
SELECT t.*
FROM tag t
WHERE t.date_deleted IS NULL;
"""

# Database query used to load the entries associated with a tag.
LOAD_TAGGED_ENTRIES_QUERY = """
SELECT e.*
FROM tagged_entry k
LEFT JOIN entry e ON e.entry_id = k.entry_id
WHERE k.tag_id = ?
AND e.date_deleted IS NULL
ORDER BY e.date_created DESC;
"""


def normalise_entry_name(tag_name):
    """
    Creates a filename from an entry or tag name.
    """

    filename = tag_name.replace(" ", "_")
    filename = filename.replace("?", "")
    filename = filename.replace(".", "")
    filename = filename.replace(",", "")

    return filename


def load_tags():
    """
    Loads all tags from the database.
    """

    tags = []

    with sqlite3.connect(DATABASE_FILE) as conn:
        # The cursor used to fetch tags.
        tag_cursor = conn.cursor()

        tag_cursor.execute(LOAD_TAGS_QUERY)

        # Fetch all entry rows.
        while True:
            tag_rows = tag_cursor.fetchmany()
            # Break if all rows read.
            if not tag_rows:
                break

            for tag_row in tag_rows:
                parsed_tag_row = parse_tag_row(tag_row)
                tags.append(parsed_tag_row)


    return tags


def load_tagged_entries(tag):
    """
    Loads all of the entries associated with a particular tag.
    """

    tagged_entries = []

    with sqlite3.connect(DATABASE_FILE) as conn:
        # The cursor used to fetch entries.
        entry_cursor = conn.cursor()


        entry_cursor.execute(LOAD_TAGGED_ENTRIES_QUERY, (tag["tag_id"],))

        # Iterate through all tag rows.
        while True:
            entry_rows = entry_cursor.fetchmany()
            # Break if all rows read.
            if not entry_rows:
                break

            for entry_row in entry_rows:
                parsed_entry_row = parse_entry_row(entry_row)
                tagged_entries.append(parsed_entry_row)

    return tagged_entries


def parse_entry_row(entry_row):
    """
    Parses an individual entry row into the correct format.
    """

    # The parsed creation and modification dates.
    date_created = datetime.strptime(entry_row[4], "%Y-%m-%d %H:%M:%S")
    date_modified = datetime.strptime(entry_row[5], "%Y-%m-%d %H:%M:%S")

    # The date the entry was deleted, if present.
    date_deleted = None
    if entry_row[6] is not None:
        date_deleted = datetime.strptime(entry_row[6], "%Y-%m-%d %H:%M:%S")

    # The final filename for the entry.
    entry_filename = normalise_entry_name(entry_row[1])

    return {
        "entry_id": entry_row[0],
        "title": entry_row[1],
        "short": entry_row[2],
        "body": entry_row[3],
        "date_created": date_created,
        "date_modified": date_modified,
        "date_deleted": date_deleted,
        "filename": entry_filename,
        "tags": []
    }


def parse_tag_row(tag_row):
    """
    Parses an individual tag row into the correct format.
    """

    # The filename for this tag.
    tag_filename = normalise_entry_name(tag_row[1])

    return {
        "tag_id": tag_row[0],
        "name": tag_row[1],
        "filename": tag_filename
    }


def load_blog_entries():
    """
    Loads all of the entries from the database.
    """

    # The full array of blog entries which will be returned.
    blog_entries = []

    with sqlite3.connect(DATABASE_FILE) as conn:
        # The cursor used to fetch entries.
        entry_cursor = conn.cursor()

        # The cursor used to fetch the entries.
        entry_cursor.execute(LOAD_ENTRIES_QUERY)

        # Fetch all entry rows.
        while True:
            entry_rows = entry_cursor.fetchmany()
            # Break if all rows read.
            if not entry_rows:
                break

            for entry_row in entry_rows:
                # List of tags applied to this entry.
                entry_tags = []

                # Cursor used to fetch tags.
                tag_cursor = conn.cursor()

                # Fetch all post tags applied to this post.
                tag_cursor.execute(LOAD_ENTRY_TAGS_QUERY, (entry_row[0], ))

                # Iterate through all tag rows.
                while True:
                    tag_rows = tag_cursor.fetchmany()
                    # Break if all rows read.
                    if not tag_rows:
                        break

                    for tag_row in tag_rows:
                        parsed_tag_row = parse_tag_row(tag_row)
                        entry_tags.append(parsed_tag_row)

                # Parse the entry row.
                parsed_entry_row = parse_entry_row(entry_row)
                parsed_entry_row["tags"] = entry_tags

                blog_entries.append(parsed_entry_row)

    return blog_entries
