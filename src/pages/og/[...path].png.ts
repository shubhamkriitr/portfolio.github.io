/**
 * Dynamic OG image endpoint — generates a 1200×630 PNG for each blog post
 * and project at build time using Satori (SVG → rsvg → PNG).
 *
 * Generated URLs:
 *   /og/blog/<post-id>.png    (linked from Post.astro og:image)
 *   /og/project/<slug>.png   (linked from [slug].astro og:image)
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { familyName, fonts } from '@config/fonts';
import { site } from '@config/site';
import { Resvg } from '@resvg/resvg-js';
import type { APIContext, GetStaticPathsResult } from 'astro';
import { getCollection } from 'astro:content';
import React from 'react';
import satori from 'satori';

// Load fonts once at module level (build-time only — never runs in the browser).
// Everything here is derived from src/config/fonts.ts; nothing is hardcoded.
// Satori cannot read variable woff2, so `og` points at *static* Fontsource
// packages, not the @fontsource-variable ones the site's CSS imports.
const DISPLAY_FAMILY = familyName(fonts.display.stack);
const BODY_FAMILY = familyName(fonts.body.stack);

const FONTS = [
  ...fonts.body.og.map((f) => ({
    name: BODY_FAMILY,
    data: readFileSync(resolve(`node_modules/${f.pkg}/files`, f.file)).buffer as ArrayBuffer,
    weight: f.weight,
    style: 'normal' as const,
  })),
  ...fonts.display.og.map((f) => ({
    name: DISPLAY_FAMILY,
    data: readFileSync(resolve(`node_modules/${f.pkg}/files`, f.file)).buffer as ArrayBuffer,
    weight: f.weight,
    style: 'normal' as const,
  })),
];

const W = 1200;
const H = 630;
const ACCENT = '#4e76a0'; // default accent; overridden below if theme.color is set

function accentColor(): string {
  const c = site.theme?.color?.light;
  return c && c !== 'auto' ? c : ACCENT;
}

/** Build a satori element tree for the OG card */
function ogCard(title: string, description: string | undefined, type: string) {
  const accent = accentColor();
  const authorLine = `${site.author.name}${type === 'post' ? ' · Blog' : type === 'project' ? ' · Projects' : ''}`;
  const desc = description
    ? description.length > 140
      ? description.slice(0, 137) + '…'
      : description
    : '';
  const hostname = site.url.replace(/^https?:\/\//, '');

  // Editorial card: paper ground, serif title, mono-ish meta, hairline rules.
  return React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: W,
        height: H,
        backgroundColor: '#fafaf8',
        fontFamily: BODY_FAMILY,
        padding: '64px 80px',
        justifyContent: 'space-between',
      },
    },
    // Eyebrow: accent dot + author / section
    React.createElement(
      'div',
      { style: { display: 'flex', alignItems: 'center' } },
      React.createElement('div', {
        style: {
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: accent,
          marginRight: 14,
        },
      }),
      React.createElement(
        'div',
        {
          style: {
            fontSize: 21,
            color: '#6b6862',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          },
        },
        authorLine,
      ),
    ),
    // Title block
    React.createElement(
      'div',
      { style: { display: 'flex', flexDirection: 'column' } },
      React.createElement(
        'div',
        {
          style: {
            fontFamily: DISPLAY_FAMILY,
            fontSize: title.length > 60 ? 58 : title.length > 40 ? 66 : 76,
            fontWeight: fonts.display.weight,
            color: '#16161a',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          },
        },
        title,
      ),
      desc &&
        React.createElement(
          'div',
          {
            style: {
              fontSize: 26,
              color: '#6b6862',
              fontWeight: 400,
              lineHeight: 1.45,
              marginTop: 24,
            },
          },
          desc,
        ),
    ),
    // Footer above a hairline rule
    React.createElement(
      'div',
      { style: { display: 'flex', flexDirection: 'column' } },
      React.createElement('div', {
        style: {
          width: '100%',
          height: 1,
          backgroundColor: '#dedcd6',
          marginBottom: 22,
        },
      }),
      React.createElement(
        'div',
        {
          style: {
            fontSize: 20,
            color: '#6b6862',
            fontWeight: 500,
            letterSpacing: '0.06em',
          },
        },
        hostname,
      ),
    ),
  );
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const posts = await getCollection('posts', (p) => !p.data.hidden && !p.data.draft);
  const projects = await getCollection('projects');

  return [
    ...posts.map((post) => ({
      params: { path: `blog/${post.id}` },
      props: {
        title: post.data.title,
        description: post.data.description,
        type: 'post',
      },
    })),
    ...projects.map((project) => ({
      params: { path: `project/${project.id}` },
      props: {
        title: project.data.title,
        description: project.data.description,
        type: 'project',
      },
    })),
  ];
}

export async function GET({ props }: APIContext) {
  const { title, description, type } = props as {
    title: string;
    description?: string;
    type: string;
  };

  const svg = await satori(ogCard(title, description, type), {
    width: W,
    height: H,
    fonts: FONTS,
  });

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: W } });
  const pngData = resvg.render().asPng();

  return new Response(new Uint8Array(pngData), {
    headers: { 'Content-Type': 'image/png' },
  });
}
