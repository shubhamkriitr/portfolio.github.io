import { useMemo, useState } from 'react';

import type { CoauthorMap } from '../../utils/authors';
import { linkAuthors } from '../../utils/authors';
import type { BibEntry } from '../../utils/bibtex';
import {
  getAuthors,
  getBoolField,
  getCleanBibtex,
  getTitle,
  getVenue,
  getYear,
} from '../../utils/bibtex';
import { BadgeSet } from './BadgeSet';
import { GoogleScholarBadge } from './GoogleScholarBadge';
import { InspireHEPBadge } from './InspireHEPBadge';

interface Labels {
  abstract?: string;
  bibtex?: string;
  supp?: string;
  searchPlaceholder?: string;
  noResults?: string;
}

interface BadgeConfig {
  altmetric: boolean;
  dimensions: boolean;
  googleScholar: boolean;
  inspirehep: boolean;
}

interface Props {
  entries: BibEntry[];
  maxAuthorLimit?: number;
  showThumbnails?: boolean;
  /** Last name to italicise in author lists (case-insensitive). */
  authorLastName?: string;
  /** Path prefix for publication preview images (relative to public/). */
  previewDir?: string;
  /** Path prefix for publication PDFs and supplements (relative to public/). */
  pdfDir?: string;
  /** UI labels — override for non-English sites. */
  labels?: Labels;
  /** site.base value used to build links to individual publication detail pages. */
  detailBase?: string;
  /** Parsed coauthors.yml — used to link co-author names to their profiles. */
  coauthors?: CoauthorMap;
  /** google_scholar_id → citation count (from citations.yml). */
  citations?: Record<string, number>;
  /** Google Scholar user ID for badge profile links (site.socials.scholar_userid). */
  scholarUserId?: string;
  /** Badge visibility flags from site.publications.badges. */
  badges?: BadgeConfig;
}

function entryUrl(entry: BibEntry): string {
  if (entry.fields.html) return entry.fields.html;
  if (entry.fields.doi) return `https://doi.org/${entry.fields.doi}`;
  return '';
}

function PublicationEntry({
  entry,
  maxAuthorLimit = 3,
  showThumbnails = true,
  authorLastName = '',
  previewDir = '/assets/img/publication_preview/',
  pdfDir = '/assets/pdf/',
  labels = {},
  detailBase,
  coauthors = {},
  citations = {},
  scholarUserId = '',
  badges,
}: {
  entry: BibEntry;
  maxAuthorLimit?: number;
  showThumbnails?: boolean;
  authorLastName?: string;
  previewDir?: string;
  pdfDir?: string;
  labels?: Labels;
  detailBase?: string;
  coauthors?: CoauthorMap;
  citations?: Record<string, number>;
  scholarUserId?: string;
  badges?: BadgeConfig;
}) {
  const [abstractOpen, setAbstractOpen] = useState(false);
  const [bibtexOpen, setBibtexOpen] = useState(false);
  const [awardOpen, setAwardOpen] = useState(false);

  const abbr = entry.fields.abbr ?? '';
  const preview = entry.fields.preview ?? '';
  const title = getTitle(entry);
  const url = entryUrl(entry);
  const authorsRaw = getAuthors(entry);
  const authorList = authorsRaw ? authorsRaw.split(', ') : [];
  const venue = getVenue(entry);
  const year = getYear(entry);
  const abstract = entry.fields.abstract ?? '';
  const doi = entry.fields.doi ?? '';
  const arxiv = entry.fields.arxiv ?? '';
  const hal = entry.fields.hal ?? '';
  const pdfPath = entry.fields.pdf ?? '';
  const supp = entry.fields.supp ?? '';
  const codeUrl = entry.fields.code ?? '';
  const blog = entry.fields.blog ?? '';
  const website = entry.fields.website ?? '';
  const slides = entry.fields.slides ?? '';
  const poster = entry.fields.poster ?? '';
  const video = entry.fields.video ?? '';
  const hasAward = entry.fields.award ?? '';
  const awardName = entry.fields.award_name ?? '';
  const bibtex_show = getBoolField(entry, 'bibtex_show');
  const annotation = entry.fields.annotation ?? '';
  const additionalInfo = entry.fields.additional_info ?? '';

  // Badge fields
  const googleScholarId = entry.fields.google_scholar_id ?? '';
  const inspirehepId = entry.fields.inspirehep_id ?? '';
  const altmetricField = entry.fields.altmetric ?? '';
  const dimensionsField = entry.fields.dimensions ?? '';

  // Altmetric: explicit ID overrides DOI/arXiv lookup when value is not "true"
  const altmetricExplicitId =
    altmetricField && altmetricField !== 'true' ? altmetricField : undefined;
  const hasAltmetricSource = !!(altmetricExplicitId || doi || arxiv);

  const showAltmetric = !!(badges?.altmetric && altmetricField && hasAltmetricSource);
  const showDimensions = !!(badges?.dimensions && dimensionsField && doi);
  const showGoogleScholar = !!(badges?.googleScholar && googleScholarId && scholarUserId);
  const showInspireHEP = !!(badges?.inspirehep && inspirehepId);
  const hasBadges = showAltmetric || showDimensions || showGoogleScholar || showInspireHEP;

  // Author links with coauthor URL and self-identification
  const authorLinks = useMemo(
    () => linkAuthors(authorList, coauthors, authorLastName),

    [authorsRaw, authorLastName],
  );
  const visibleAuthorLinks = maxAuthorLimit ? authorLinks.slice(0, maxAuthorLimit) : authorLinks;
  const hiddenCount = authorLinks.length - visibleAuthorLinks.length;

  // Resolve asset paths — use full URL if provided, otherwise prefix with configured dir
  const previewSrc = preview.includes('://') ? preview : `${previewDir}${preview}`;
  const pdfHref = pdfPath.startsWith('http') ? pdfPath : `${pdfDir}${pdfPath}`;
  const suppHref = supp.startsWith('http') ? supp : `${pdfDir}${supp}`;
  const slidesHref = slides.startsWith('http') ? slides : `${pdfDir}${slides}`;
  const posterHref = poster.startsWith('http') ? poster : `${pdfDir}${poster}`;

  const scholarCount = googleScholarId ? citations[googleScholarId] : undefined;

  const hasMedia = showThumbnails && !!preview;

  return (
    <li className="folio-entry">
      <div className={hasMedia ? 'folio-media' : undefined}>
        {/* Thumbnail — the abbr rides on the entry as a mono tag, not a ribbon */}
        {hasMedia && (
          <img className="folio-media-thumb" src={previewSrc} alt={preview} loading="lazy" />
        )}

        <div id={entry.key} className="pub-body">
          {/* Title — links to internal detail page when available, otherwise to external URL */}
          <div className="title">
            {detailBase !== undefined ? (
              <a className="folio-entry-title" href={`${detailBase}/publications/${entry.key}/`}>
                {title}
              </a>
            ) : url ? (
              <a
                className="folio-entry-title"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {title}
              </a>
            ) : (
              <span className="folio-entry-title">{title}</span>
            )}
            {abbr && <span className="folio-tag">{abbr}</span>}
          </div>

          {/* Authors with coauthor links and self-identification */}
          {authorLinks.length > 0 && (
            <div className="folio-entry-meta pub-authors">
              {visibleAuthorLinks.map((al, i) => {
                // The "and N more" span supplies its own leading comma, so the
                // last visible author must never emit a trailing separator.
                const isLast = i === visibleAuthorLinks.length - 1;
                const nameEl = al.isSelf ? <em>{al.name}</em> : <>{al.name}</>;
                return (
                  <span key={i}>
                    {al.url ? (
                      <a href={al.url} target="_blank" rel="noopener noreferrer">
                        {nameEl}
                      </a>
                    ) : (
                      nameEl
                    )}
                    {!isLast && ', '}
                  </span>
                );
              })}
              {hiddenCount > 0 && (
                <span>
                  , and {hiddenCount} more author{hiddenCount > 1 ? 's' : ''}
                </span>
              )}
              {/* Annotation tooltip — info icon with hover text */}
              {annotation && (
                <span
                  title={annotation}
                  aria-label={annotation}
                  data-tooltip={annotation}
                  style={{ cursor: 'help', marginLeft: '0.3rem', opacity: 0.65, fontSize: '0.9em' }}
                >
                  ⓘ
                </span>
              )}
            </div>
          )}

          {/* Venue + year + additional_info */}
          {(venue || year) && (
            <div className="folio-entry-meta pub-venue">
              {venue && <em>{venue}</em>}
              {venue && year ? ', ' : ''}
              {year || ''}
              {additionalInfo && <span style={{ marginLeft: '0.25rem' }}> · {additionalInfo}</span>}
            </div>
          )}

          {/* Link buttons */}
          <div className="folio-actions">
            {hasAward && (
              <button
                className="folio-action"
                aria-expanded={awardOpen}
                onClick={() => setAwardOpen(!awardOpen)}
              >
                {awardName || 'Awarded'}
              </button>
            )}
            {abstract && (
              <button
                className="folio-action"
                aria-expanded={abstractOpen}
                onClick={() => setAbstractOpen(!abstractOpen)}
              >
                {labels.abstract ?? 'Abs'}
              </button>
            )}
            {doi && (
              <a
                href={`https://doi.org/${doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="folio-action"
              >
                DOI
              </a>
            )}
            {arxiv && (
              <a
                href={`https://arxiv.org/abs/${arxiv}`}
                target="_blank"
                rel="noopener noreferrer"
                className="folio-action"
              >
                arXiv
              </a>
            )}
            {hal && (
              <a
                href={`https://hal.science/${hal}`}
                target="_blank"
                rel="noopener noreferrer"
                className="folio-action"
              >
                HAL
              </a>
            )}
            {bibtex_show && (
              <button
                className="folio-action"
                aria-expanded={bibtexOpen}
                onClick={() => setBibtexOpen(!bibtexOpen)}
              >
                {labels.bibtex ?? 'Bib'}
              </button>
            )}
            {entry.fields.html && (
              <a
                href={entry.fields.html}
                target="_blank"
                rel="noopener noreferrer"
                className="folio-action"
              >
                HTML
              </a>
            )}
            {pdfPath && (
              <a
                href={pdfHref}
                target="_blank"
                rel="noopener noreferrer"
                className="folio-action"
              >
                PDF
              </a>
            )}
            {supp && (
              <a
                href={suppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="folio-action"
              >
                {labels.supp ?? 'Supp'}
              </a>
            )}
            {slides && (
              <a
                href={slidesHref}
                target="_blank"
                rel="noopener noreferrer"
                className="folio-action"
              >
                Slides
              </a>
            )}
            {poster && (
              <a
                href={posterHref}
                target="_blank"
                rel="noopener noreferrer"
                className="folio-action"
              >
                Poster
              </a>
            )}
            {video && (
              <a
                href={video}
                target="_blank"
                rel="noopener noreferrer"
                className="folio-action"
              >
                Video
              </a>
            )}
            {codeUrl && (
              <a
                href={codeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="folio-action"
              >
                Code
              </a>
            )}
            {blog && (
              <a
                href={blog}
                target="_blank"
                rel="noopener noreferrer"
                className="folio-action"
              >
                Blog
              </a>
            )}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="folio-action"
              >
                Website
              </a>
            )}
            {detailBase !== undefined && (
              <a href={`${detailBase}/publications/${entry.key}/`} className="folio-action">
                Details
              </a>
            )}
          </div>

          {/* Metric badges row */}
          {hasBadges && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginTop: '0.4rem',
              }}
            >
              <BadgeSet
                doi={doi || undefined}
                arxiv={arxiv || undefined}
                altmetricId={altmetricExplicitId}
                showAltmetric={showAltmetric}
                showDimensions={showDimensions}
              />
              {showGoogleScholar && (
                <GoogleScholarBadge
                  scholarUserId={scholarUserId}
                  googleScholarId={googleScholarId}
                  count={scholarCount}
                />
              )}
              {showInspireHEP && <InspireHEPBadge inspirehepId={inspirehepId} />}
            </div>
          )}

          {/* Disclosure panels — mounted only while open */}
          {hasAward && awardOpen && (
            <div className="folio-panel">
              <p>{hasAward}</p>
            </div>
          )}

          {abstract && abstractOpen && (
            <div className="folio-panel">
              <p>{abstract}</p>
            </div>
          )}

          {/* BibTeX — internal fields filtered out */}
          {bibtex_show && bibtexOpen && (
            <div className="folio-panel">
              <pre>{getCleanBibtex(entry)}</pre>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export function BibSearch({
  entries,
  maxAuthorLimit = 3,
  showThumbnails = true,
  authorLastName = '',
  previewDir = '/assets/img/publication_preview/',
  pdfDir = '/assets/pdf/',
  labels = {},
  detailBase,
  coauthors = {},
  citations = {},
  scholarUserId = '',
  badges,
}: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    const words = q.split(/\s+/).filter(Boolean);
    return entries.filter((entry) => {
      const haystack = [getTitle(entry), getAuthors(entry), getVenue(entry), String(getYear(entry))]
        .join(' ')
        .toLowerCase();
      return words.every((word) => haystack.includes(word));
    });
  }, [entries, query]);

  const byYear = useMemo(() => {
    const map = new Map<number, BibEntry[]>();
    for (const entry of filtered) {
      const year = getYear(entry);
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(entry);
    }
    return map;
  }, [filtered]);

  const years = useMemo(() => [...byYear.keys()].sort((a, b) => b - a), [byYear]);

  return (
    <div className="publications">
      {/* Search \u2014 hairline underline, no boxed input */}
      <div className="pub-search">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.searchPlaceholder ?? 'Search publications\u2026'}
          className="folio-input"
          aria-label="Search publications"
        />
        <p className="folio-count">
          {filtered.length} of {entries.length} publication{entries.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Grouped by year \u2014 the year rides in the mono label rail */}
      {filtered.length === 0 ? (
        <section className="folio-row">
          <p className="folio-label">No results</p>
          <div className="folio-body">
            <p className="folio-empty">
              {labels.noResults ?? 'No publications match your search.'}
            </p>
          </div>
        </section>
      ) : (
        years.map((year) => (
          <section className="folio-row" key={year}>
            <p className="folio-label">{year}</p>
            <div className="folio-body">
              <ol className="folio-stack">
                {byYear.get(year)!.map((entry) => (
                <PublicationEntry
                  key={entry.key}
                  entry={entry}
                  maxAuthorLimit={maxAuthorLimit}
                  showThumbnails={showThumbnails}
                  authorLastName={authorLastName}
                  previewDir={previewDir}
                  pdfDir={pdfDir}
                  labels={labels}
                  detailBase={detailBase}
                  coauthors={coauthors}
                  citations={citations}
                  scholarUserId={scholarUserId}
                  badges={badges}
                />
                ))}
              </ol>
            </div>
          </section>
        ))
      )}
    </div>
  );
}

export default BibSearch;
