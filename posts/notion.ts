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

// Fetch a page with its FULL block list. notion-client's getPage only
// fetches missing blocks for ids it can see in the first chunk's content
// arrays — but with Notion's double-wrapped records those arrays are
// invisible until normalized, so the fetch loop exits immediately and any
// page longer than one chunk (~100 blocks) renders truncated. Normalizing
// the raw chunk inside getPageRaw, before getPage's own fetch loop runs,
// lets it discover and fetch every block. The post-hoc normalizeRecordMap
// call in the pages stays as a second layer for blocks fetched via
// syncRecordValues, which arrive double-wrapped too.
export const getNotionPage = async (uri: string) => {
  const { NotionAPI } = await import('notion-client');
  const api = new NotionAPI();
  const origGetPageRaw = api.getPageRaw.bind(api);
  (api as unknown as { getPageRaw: typeof api.getPageRaw }).getPageRaw =
    (async (...args: Parameters<typeof api.getPageRaw>) => {
      const res = await origGetPageRaw(...args);
      if (res && res.recordMap) {
        normalizeRecordMap(res.recordMap as ExtendedRecordMap);
      }
      return res;
    }) as typeof api.getPageRaw;
  return api.getPage(uri, { gotOptions: notionGotOptions });
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
  'test': {
    date: new Date('2026-10-25').toDateString(),
    uri: '40463c580eea809da39fe2aa8088c6fe',
  },
   'ce': {
    date: new Date('2026-10-25').toDateString(),
    uri: '40463c580eea80558cfdcde1301ee572',
  },
   'song-sound': {
    date: new Date('2026-10-25').toDateString(),
    uri: '40463c580eea80dca122d5a71e1ddc4c',
  },
  'fh': {
    date: new Date('2026-10-25').toDateString(),
    uri: '40463c580eea801b896ec5a0a55f702b',
  },
};

export const POSTS_PER_PAGE = 5;

// All blog posts, newest first. Entries carry their POSTS position so
// same-day posts have a deterministic order: a post added later to POSTS
// is the newer post and sorts first when the day-granularity dates tie.
// Shared by /blog and /blog/page/[page] so both list the same order.
export const getBlogPages = async (): Promise<Page[]> => {
  const entries: { page: Page; index: number }[] = [];
  await Promise.all(
    Object.keys(POSTS).map(async (key, index) => {
      const { uri, date } = POSTS[key as keyof typeof POSTS];
      const page = normalizeRecordMap(await getNotionPage(uri));
      if (page) {
        const info = getPageInfo(page);
        if (info.title !== 'Blog') {
          entries.push({
            page: {
              ...info,
              date,
              uri: `/blog/${key}`,
            },
            index,
          });
        }
      }
    }),
  );
  return entries
    .sort(
      (a, b) =>
        new Date(b.page.date).getTime() - new Date(a.page.date).getTime() ||
        b.index - a.index,
    )
    .map((entry) => entry.page);
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
