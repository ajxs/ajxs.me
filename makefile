#####################################################################
#  Copyright (c) 2020, AJXS.
#  This program is free software; you can redistribute it and/or modify it
#  under the terms of the GNU General Public License as published by the
#  Free Software Foundation; either version 3 of the License, or
#  (at your option) any later version.
#
#  Authors:
#     Anthony <ajxs [at] panoptic.online>
#####################################################################

.POSIX:
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

.PHONY: all clean

SRC_FOLDER          := ./src

DIST_FOLDER         := ./dist
DIST_BLOG_FOLDER    := ${DIST_FOLDER}/blog
DIST_TAGS_FOLDER    := ${DIST_FOLDER}/blog/tag
DIST_STATIC_CONTENT := ${DIST_FOLDER}/static
DIST_HTACCESS       := ${DIST_FOLDER}/.htaccess

all: site

clean:
	rm -rf ${DIST_FOLDER}

site: ${DIST_FOLDER} ${DIST_BLOG_FOLDER} ${DIST_TAGS_FOLDER} ${DIST_STATIC_CONTENT} ${DIST_HTACCESS}
	${SRC_FOLDER}/site/generate_site

${DIST_FOLDER}:
	mkdir -p ${DIST_FOLDER}

${DIST_BLOG_FOLDER}:
	mkdir -p ${DIST_BLOG_FOLDER}

${DIST_STATIC_CONTENT}:
	cp -r "${SRC_FOLDER}/site/static" ${DIST_FOLDER}/static

${DIST_TAGS_FOLDER}:
	mkdir -p ${DIST_TAGS_FOLDER}

${DIST_HTACCESS}:
	cp "${SRC_FOLDER}/site/.htaccess" ${DIST_HTACCESS}
