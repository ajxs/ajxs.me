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
GITHUB_DNS_RECORD   := ${DIST_FOLDER}/CNAME
ADA_ARTICLE_SYMLINK := ${DIST_BLOG_FOLDER}/Giving_Ada_a_chance.html
DIST_CSS            := ${DIST_FOLDER}/static/style.css

all: site

clean:
	rm -rf ${DIST_FOLDER}

site: ${DIST_FOLDER} ${DIST_BLOG_FOLDER} ${DIST_TAGS_FOLDER} \
	${DIST_STATIC_CONTENT} ${DIST_RSS} ${GITHUB_DNS_RECORD} ${ADA_ARTICLE_SYMLINK} \
	${DIST_CSS}
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

# Unfortunately when creating the Ada article, the originally published version had 
# a mis-capitalised title. This makefile creates a symlink with the incorrectly capitalised
# filename, pointing to the correct file name.
${ADA_ARTICLE_SYMLINK}:
	cd ${DIST_BLOG_FOLDER} && ln -s Giving_Ada_a_Chance.html Giving_Ada_a_chance.html

emu: site
	cd "${DIST_FOLDER}" && python -m SimpleHTTPServer

css: ${DIST_FOLDER} ${DIST_CSS}
