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

DIST_FOLDER         := ./docs
DIST_BLOG_FOLDER    := ${DIST_FOLDER}/blog
DIST_TAGS_FOLDER    := ${DIST_FOLDER}/blog/tag
DIST_STATIC_CONTENT := ${DIST_FOLDER}/static
DIST_RSS            := ${DIST_FOLDER}/site.rss
DIST_CSS            := ${DIST_FOLDER}/static/style.css
GITHUB_DNS_RECORD   := ${DIST_FOLDER}/CNAME

all: site

clean:
	rm -rf ${DIST_FOLDER}

site: ${DIST_FOLDER} ${DIST_BLOG_FOLDER} ${DIST_TAGS_FOLDER} \
	${DIST_STATIC_CONTENT} ${DIST_RSS} ${DIST_CSS} ${GITHUB_DNS_RECORD}
	${SRC_FOLDER}/site/generate_site

${DIST_FOLDER}:
	mkdir -p ${DIST_FOLDER}

${DIST_BLOG_FOLDER}:
	mkdir -p ${DIST_BLOG_FOLDER}

${DIST_STATIC_CONTENT}:
	cp -r "${SRC_FOLDER}/site/static" ${DIST_FOLDER}/static

${DIST_TAGS_FOLDER}:
	mkdir -p ${DIST_TAGS_FOLDER}

${DIST_RSS}:
	${SRC_FOLDER}/site/generate_rss

${GITHUB_DNS_RECORD}:
	cp ${SRC_FOLDER}/CNAME ${GITHUB_DNS_RECORD}

${DIST_CSS}:
	sassc --style=expanded ${SRC_FOLDER}/site/style.scss ${DIST_CSS}

emu: site
	cd "${DIST_FOLDER}" && python3 -m http.server
