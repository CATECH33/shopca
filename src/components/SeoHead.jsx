import React from 'react'
import { Helmet } from 'react-helmet-async'
import { canonicalUrl, ogImageUrl } from '../lib/seo.js'

const SITE_NAME = 'PASMAL'
const DEFAULT_OG_IMAGE = ogImageUrl('/og-default.png')

export default function SeoHead({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = 'website',
  noindex = false,
  schema,
  schemas = [],
}) {
  const fullTitle = title?.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  const canonUrl  = canonical ? canonicalUrl(canonical) : undefined
  const image     = ogImage ? ogImageUrl(ogImage) : DEFAULT_OG_IMAGE

  const allSchemas = [
    ...(schema ? [schema] : []),
    ...schemas,
  ]

  return (
    <Helmet>
      {/* Titre */}
      <title>{fullTitle}</title>

      {/* Meta de base */}
      {description && <meta name="description" content={description} />}
      {keywords    && <meta name="keywords"    content={keywords}    />}
      {noindex
        ? <meta name="robots" content="noindex, nofollow" />
        : <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      }

      {/* Canonical */}
      {canonUrl && <link rel="canonical" href={canonUrl} />}

      {/* Open Graph */}
      <meta property="og:title"       content={fullTitle}  />
      <meta property="og:site_name"   content={SITE_NAME}  />
      <meta property="og:type"        content={ogType}     />
      {description && <meta property="og:description" content={description} />}
      {canonUrl    && <meta property="og:url"         content={canonUrl}    />}
      <meta property="og:image"       content={image}      />
      <meta property="og:image:width"  content="1200"      />
      <meta property="og:image:height" content="630"       />
      <meta property="og:locale"      content="fr_FR"      />

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle}           />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image"       content={image}               />

      {/* Structured data */}
      {allSchemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  )
}
