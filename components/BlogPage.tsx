import Head from 'next/head';
import styled from 'styled-components';
import { Title, Link, Container, Grid, Card, Image, Text } from '@components';
import { Page } from '@posts/notion';
import BlogPagination from './BlogPagination';

export interface BlogPageProps {
  pages: Page[];
  currentPage: number;
  totalPages: number;
}

const BlogImage = styled(Image)`
  border-radius: 5px;
`;

// Shared by /blog (page 1) and /blog/page/[page] so every listing page
// renders the same header, grid, and pager.
const BlogPage = ({ pages, currentPage, totalPages }: BlogPageProps) => {
  const title =
    currentPage > 1
      ? `Blog - Page ${currentPage} - Antoine Ordonez`
      : 'Blog - Antoine Ordonez';
  return (
    <Container maxWidth={1200}>
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} />
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
      <BlogPagination currentPage={currentPage} totalPages={totalPages} />
    </Container>
  );
};

export default BlogPage;
