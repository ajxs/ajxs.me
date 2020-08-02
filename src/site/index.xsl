<?xml version="1.0" ?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" encoding="utf-8" indent="yes" />

	<xsl:template match="entry">
		<li class="colour_dark-bg colour_dark-bg_hover">
			<a class="entry-link">
				<xsl:attribute name="href">
					<xsl:value-of select="@url" />
				</xsl:attribute>
				<h3 class="colour_light">
					<xsl:value-of select="title" />
				</h3>
				<div class="date colour_mid-dark">
					<xsl:value-of select="date" />
				</div>
				<div class="short colour_mid">
					<xsl:value-of select="description" />
				</div>
				<div class="tags colour_mid-dark">
					<span>tagged as: </span>
					<ul class="colour_mid">
						<xsl:for-each select="tags/tag">
							<xsl:sort select="." />
							<li>
								<a>
									<xsl:attribute name="href">
										<xsl:value-of select="@url" />
									</xsl:attribute>
									<xsl:value-of select="." />
								</a>
							</li>
						</xsl:for-each>
					</ul>
				</div>
			</a>
		</li>
	</xsl:template>

	<xsl:template match="index">
		<html lang="en">
			<head>
				<meta content="text/html;charset=utf-8" http-equiv="Content-Type" />
				<meta content="utf-8" http-equiv="encoding" />
				<title>panoptic.online</title>
				<link rel="stylesheet" type="text/css" href="/static/style.css" />
			</head>
			<body>
				<main>
					<header class="colour_light">
						<a id="header-link" href="/">
							<h1>~ajxs</h1>
						</a>
					</header>
					<section id="contact-info" class="colour_mid-light">
						<h2 class="colour_light">
							Contact
						</h2>
						<ul id="contact-info-list">
							<li>
								<img alt="email icon" class="icon" src="/static/img/contact/email.png" />
								<span>ajxs [at] panoptic.online</span>
							</li>
							<li>
								<img alt="github icon" class="icon" src="/static/img/contact/github.png" />
								<a href="https://github.com/ajxs">github.com/ajxs</a>
							</li>
						</ul>
					</section>

					<section id="blog">
						<h2 class="colour_light">
							Latest blog entries
						</h2>
						<ul id="blog-entries">
							<xsl:for-each select="entries/entry">
								<xsl:apply-templates select="." />
							</xsl:for-each>
						</ul>
					</section>

					<footer class="colour_dark">
						© 2020 AJXS
					</footer>
				</main>
			</body>
		</html>
	</xsl:template>

	<xsl:template match="tag_index">
		<html lang="en">
			<head>
				<meta content="text/html;charset=utf-8" http-equiv="Content-Type" />
				<meta content="utf-8" http-equiv="encoding" />
				<title>panoptic.online</title>
				<link rel="stylesheet" type="text/css" href="/static/style.css" />
			</head>
			<body>
				<main>
					<header class="colour_light">
						<a id="header-link" href="/">
							<h1>~ajxs</h1>
						</a>
					</header>

					<section id="blog">
						<h2 id="tag-heading" class="colour_light">
							Entries tagged as '<span id="tag-index-name" class="colour_mid">
								<xsl:value-of select="name" />
							</span>'
						</h2>
						<ul id="blog-entries">
							<xsl:for-each select="entries/entry">
								<xsl:apply-templates select="." />
							</xsl:for-each>
						</ul>
					</section>

				<footer class="colour_dark">
						© 2020 AJXS
				</footer>
			</main>
		</body>
	</html>
</xsl:template>

	<xsl:template match="entry">
		<html lang="en">
			<head>
				<meta content="text/html;charset=utf-8" http-equiv="Content-Type" />
				<meta content="utf-8" http-equiv="encoding" />
				<title>panoptic.online</title>
				<link rel="stylesheet" type="text/css" href="/static/style.css" />
			</head>
			<body>
				<main>
					<header class="colour_light">
						<a id="header-link" href="/">
							<h1>~ajxs</h1>
						</a>
					</header>

					<section id="blog-entry" class="colour_mid-light">
						<div class="entry-header colour_dark-bg">
							<h1>
								<xsl:value-of select="title" />
							</h1>
							<div class="date colour_mid-dark">
								<xsl:value-of select="date" />
							</div>
							<div class="short colour_mid">
								<xsl:value-of select="description" />
							</div>
							<div class="tags colour_mid-dark">
								<span>tagged as: </span>
								<ul class="colour_mid">
									<xsl:for-each select="tags/tag">
										<xsl:sort select="." />
										<li>
											<a>
												<xsl:attribute name="href">
													<xsl:value-of select="@url" />
												</xsl:attribute>
												<xsl:value-of select="." />
											</a>
										</li>
									</xsl:for-each>
								</ul>
							</div>
						</div>
						<div class="entry-body colour_light">
							<xsl:value-of select="body" disable-output-escaping="no" />
						</div>
					</section>
					<footer class="colour_dark">
							© 2020 AJXS
					</footer>
				</main>
			</body>
		</html>
	</xsl:template>

</xsl:stylesheet>
