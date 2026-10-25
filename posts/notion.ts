import { ExtendedRecordMap } from 'notion-types';
import { getPageTitle } from 'notion-utils';

// Notion's edge 403s notion-client's default got User-Agent; a browser
// User-Agent is required for the unofficial API to answer (verified
// 2026-10-25: identical loadPageChunk calls 403 without it, 200 with it).
// Passed as gotOptions to every NotionAPI.getPage call.
export const notionGotOptions = {
  headers: {
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  },
};

// Notion's loadPageChunk response now double-wraps every record
// (block[id] = { value: { value: {...} } } instead of { value: {...} }),
// which notion-client 6.16 does not unwrap: react-notion-x then sees
// blocks with no type and crashes rendering post pages. Unwrap one level
// wherever the double nesting is present; single-wrapped maps pass
// through unchanged.
export const normalizeRecordMap = (
  recordMap: ExtendedRecordMap,
): ExtendedRecordMap => {
  const tables = recordMap as unknown as Record<
    string,
    Record<string, { value?: { value?: unknown } }>
  >;
  for (const table of Object.values(tables)) {
    if (!table || typeof table !== 'object') continue;
    for (const entry of Object.values(table)) {
      if (
        entry &&
        typeof entry === 'object' &&
        entry.value &&
        typeof entry.value === 'object' &&
        'value' in entry.value
      ) {
        (entry as { value: unknown }).value = (
          entry.value as { value: unknown }
        ).value;
      }
    }
  }
  return recordMap;
};

export const POSTS = {
  'go-graphql-api': {
    date: new Date('2021-06-25').toDateString(),
    uri: 'shblog/Production-ready-API-with-Go-and-GraphQL-4ebc1ab551e447c2ac14261a61da6032',
  },
  'go-dokku-deployment': {
    date: new Date('2021-06-28').toDateString(),
    uri: 'shblog/Deploying-a-Go-App-with-Dokku-c504be4c35b34d20918a5cf23c0c5588',
  },
  'styled-system': {
    date: new Date('2021-07-06').toDateString(),
    uri: 'shblog/Rapid-UI-development-with-styled-system-e1ce2f8a2e64485491b49e4e3a6a8f96',
  },
};

export interface PageInfo {
  title: string;
  cover?: string;
  coverPosition?: number;
}

export interface Page extends PageInfo {
  uri: string;
  date: string;
}

export const getPageInfo = (page: ExtendedRecordMap): PageInfo => {
  const info: PageInfo = {
    title: getPageTitle(page),
  };

  const block = Object.values(page.block)[0].value;
  if (block.type === 'page' && block.format?.page_cover) {
    info.coverPosition = block.format.page_cover_position;
    info.cover =
      'https://www.notion.so/image/' +
      encodeURIComponent(block.format.page_cover) +
      '?table=block&id=' +
      block.id;
  }

  return info;
};
