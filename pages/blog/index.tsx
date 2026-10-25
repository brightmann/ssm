import Head from 'next/head';
import styled from 'styled-components';
import { GetStaticPropsResult, NextPage } from 'next';

import {
  getNotionPage,
  getPageInfo,
  normalizeRecordMap,
  Page,
  POSTS,
} from '@posts/notion';
import { Title, Link, Container, Grid, Card, Image, Text } from '@components';

interface BlogProps {
  pages: Page[];
}

const BlogImage = styled(Image)`
  border-radius: 5px;
`;

const Blog: NextPage<BlogProps> = ({ pages }) => {
  return (
    <Container maxWidth={1200}>
      <Head>
        <title>Blog - Antoine Ordonez</title>
        <meta property="og:title" content="Blog – Antoine Ordonez" />
      </Head>
      <Container mb="3rem">
        <Title>Blog</Title>
        <Text textAlign="center">
          Posts about code, projects and various other things.
        </Text>
      </Container>
      <Grid gridTemplateColumns={['1fr', '1fr 1fr']} gridGap={['3rem', '2rem']}>
        {pages.map(({ title, uri, date, cover }, i) => (
          <Link key={i} href={uri}>
            <Card padding={[0]} margin={[0]}>
              <Grid
                gridTemplateColumns={'1fr'}
                justifyItems={['center', 'flex-start']}
                gridGap="1rem"
              >
                {cover && (
                  <BlogImage
                    src={cover}
                    width="100%"
                    height="auto"
                    alt={title}
                  />
                )}
                <Container
                  gridGap=".5rem"
                  alignItems={['center', 'flex-start']}
                >
                  <Title
                    as="h2"
                    fontSize="1.5rem"
                    textAlign={['center', 'left']}
                    margin={0}
                  >
                    {title}
                  </Title>
                  <Text margin={0} fontWeight="initial" fontSize=".9rem">
                    {date}
                  </Text>
                </Container>
              </Grid>
            </Card>
          </Link>
        ))}
      </Grid>
    </Container>
  );
};


export const getStaticProps = async (): Promise<
  GetStaticPropsResult<BlogProps>
> => {
  // Entries carry their POSTS position so same-day posts have a
  // deterministic order: a post added later to POSTS is the newer post
  // and sorts first when the day-granularity dates tie.
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

  return {
    props: {
      pages: entries
        .sort(
          (a, b) =>
            new Date(b.page.date).getTime() -
              new Date(a.page.date).getTime() || b.index - a.index,
        )
        .map((entry) => entry.page),
    },
  };
};

export default Blog;
