#####################################################################
#  Copyright (c) 2023, Ajxs.
#  SPDX-License-Identifier: GPL-3.0-or-later
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
SITE_CSS            := ${DIST_FOLDER}/static/style.css
CODE_CSS            := ${DIST_FOLDER}/static/code.css
GITHUB_DNS_RECORD   := ${DIST_FOLDER}/CNAME
FAVICON             := ${DIST_FOLDER}/favicon.ico

LOCAL_EMU_PORT      := 8321
VENV_DIR            := ./.venv

all: clean emu site venv_init

clean:
	rm -rf ${DIST_FOLDER}

site: ${DIST_FOLDER} ${DIST_BLOG_FOLDER} ${DIST_TAGS_FOLDER} \
	${DIST_STATIC_CONTENT} ${DIST_RSS} ${SITE_CSS} ${CODE_CSS} \
	${GITHUB_DNS_RECORD} ${FAVICON}
	${SRC_FOLDER}/generate_site

${DIST_FOLDER}:
	mkdir -p ${DIST_FOLDER}

${DIST_BLOG_FOLDER}:
	mkdir -p ${DIST_BLOG_FOLDER}

${DIST_STATIC_CONTENT}:
	cp -r "${SRC_FOLDER}/static" ${DIST_FOLDER}/static

${DIST_TAGS_FOLDER}:
	mkdir -p ${DIST_TAGS_FOLDER}

${DIST_RSS}:
	${SRC_FOLDER}/generate_rss

${GITHUB_DNS_RECORD}:
	cp ${SRC_FOLDER}/CNAME ${GITHUB_DNS_RECORD}

${SITE_CSS}:
	sassc --style=compressed ${SRC_FOLDER}/style.scss ${SITE_CSS}

${CODE_CSS}:
	sassc --style=compressed ${SRC_FOLDER}/code.scss ${CODE_CSS}

${FAVICON}:
	cp ${SRC_FOLDER}/favicon.ico ${DIST_FOLDER}

emu: site
	cd "${DIST_FOLDER}" && python3 -m http.server "${LOCAL_EMU_PORT}"

venv_init:
	python3 -m venv .venv
	${VENV_DIR}/bin/pip install -r ${SRC_FOLDER}/requirements.txt
