import {
  GetStaticPaths,
  GetStaticPropsResult,
  NextPage,
} from 'next';
import { getBlogPages, POSTS, POSTS_PER_PAGE } from '@posts/notion';
import BlogPage, { BlogPageProps } from '@components/BlogPage';

type Params = {
  params: {
    page: string;
  };
};

// Pages 2..N of the blog listing; page 1 lives at /blog.
const BlogPaginated: NextPage<BlogPageProps> = (props) => (
  <BlogPage {...props} />
);

export const getStaticPaths: GetStaticPaths = async () => {
  const totalPages = Math.ceil(
    Object.keys(POSTS).length / POSTS_PER_PAGE,
  );
  const paths = [];
  for (let page = 2; page <= totalPages; page++) {
    paths.push({ params: { page: String(page) } });
  }
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = async ({
  params: { page },
}: Params): Promise<GetStaticPropsResult<BlogPageProps>> => {
  const currentPage = parseInt(page, 10);
  const all = await getBlogPages();
  const totalPages = Math.ceil(all.length / POSTS_PER_PAGE);
  if (
    Number.isNaN(currentPage) ||
    currentPage < 2 ||
    currentPage > totalPages
  ) {
    return { notFound: true };
  }
  return {
    props: {
      pages: all.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        currentPage * POSTS_PER_PAGE,
      ),
      currentPage,
      totalPages,
    },
  };
};

export default BlogPaginated;
