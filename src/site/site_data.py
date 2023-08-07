#!/usr/bin/env python3

"""
Site library.
Contains all of the functionality necessary for loading data from the site database.
"""

from datetime import datetime
import os
import re
import sqlite3
import pytz

__author__ = "AJXS"
__copyright__ = "Copyright 2020, AJXS"
__credits__ = ["AJXS"]
__license__ = "GPL"
__version__ = "1.0"
__maintainer__ = "AJXS"
__email__ = "ajxs at panoptic.online"
__status__ = "Production"


# The main database file.
DATABASE_FILE = "{}/site.sqlite3".format(os.getcwd())

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
WHERE k.entry_id = ?
ORDER BY t.name ASC;
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

# Database query used to load static page entries.
LOAD_STATIC_PAGES_QUERY = """
SELECT *
FROM static_page p
WHERE p.date_deleted IS NULL;
"""

# Database query used to load static redirect page entries.
LOAD_STATIC_REDIRECT_PAGES_QUERY = """
SELECT *
FROM static_page_redirect p
WHERE p.date_deleted IS NULL;
"""

def create_filename_from_entity(name):
    """
    Creates a filename from an entry or tag name.
    """

    filename = name.replace(" ", "_")
    # This removes all non-legal characters.
    # Refer to: https://www.ietf.org/rfc/rfc3986.txt
    #   Section 2.3: Unreserved Characters.
    filename = re.sub(r"[^\w\-.~]", "", filename)

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

    # The local timezone. Used to make the 'created/modified/deleted' dates 'timezone aware'.
    local_timezone = pytz.timezone('Australia/Sydney')

    # The parsed creation and modification dates.
    date_created = local_timezone.localize(datetime.strptime(entry_row[4], "%Y-%m-%d %H:%M:%S"))
    date_modified = local_timezone.localize(datetime.strptime(entry_row[5], "%Y-%m-%d %H:%M:%S"))

    # The date the entry was deleted, if present.
    date_deleted = None
    if entry_row[6] is not None:
        date_deleted = local_timezone.localize(datetime.strptime(entry_row[6], "%Y-%m-%d %H:%M:%S"))

    # The final filename for the entry.
    entry_filename = create_filename_from_entity(entry_row[1])

    return {
        "entry_id": entry_row[0],
        "title": entry_row[1],
        "short": entry_row[2],
        "body": entry_row[3],
        "date_created": date_created,
        "date_modified": date_modified,
        "date_deleted": date_deleted,
        # The publicly displayed date, in human readable format.
        "date": date_created.strftime("%Y.%m.%d"),
        "filename": entry_filename,
        "contains_code_blocks": entry_row[7],
        "unlisted": entry_row[8],
        "tags": []
    }


def parse_tag_row(tag_row):
    """
    Parses an individual tag row into the correct format.
    """

    # The filename for this tag.
    tag_filename = create_filename_from_entity(tag_row[1])

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


def load_static_pages():
    """
    Loads all of the static pages from the database.
    """

    # The full array of static pages which will be returned.
    static_pages = []

    with sqlite3.connect(DATABASE_FILE) as conn:
        # The cursor used to fetch entries.
        cursor = conn.cursor()

        # The cursor used to fetch the entries.
        cursor.execute(LOAD_STATIC_PAGES_QUERY)

        # Fetch all page rows.
        while True:
            rows = cursor.fetchmany()
            # Break if all rows read.
            if not rows:
                break

            for row in rows:
                static_pages.append({
                    "title": row[1],
                    "description": row[2],
                    "path": row[3],
                    "body": row[4],
                    "contains_code_blocks": row[8],
                })

    return static_pages


def load_static_redirect_pages():
    """
    Loads all of the static redirect pages from the database.
    """

    # The full array of static redirect pages which will be returned.
    static_redirect_pages = []

    with sqlite3.connect(DATABASE_FILE) as conn:
        # The cursor used to fetch entries.
        cursor = conn.cursor()

        # The cursor used to fetch the entries.
        cursor.execute(LOAD_STATIC_REDIRECT_PAGES_QUERY)

        # Fetch all page rows.
        while True:
            rows = cursor.fetchmany()
            # Break if all rows read.
            if not rows:
                break

            for row in rows:
                static_redirect_pages.append({
                    "address_from": row[0],
                    "address_to": row[1],
                })

    return static_redirect_pages
