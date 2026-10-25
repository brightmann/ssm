import { GetStaticPropsResult, NextPage } from 'next';
import { getBlogPages, POSTS_PER_PAGE } from '@posts/notion';
import BlogPage, { BlogPageProps } from '@components/BlogPage';

// Page 1 of the blog listing. Further pages live at /blog/page/[page].
const Blog: NextPage<BlogPageProps> = (props) => <BlogPage {...props} />;

export const getStaticProps = async (): Promise<
  GetStaticPropsResult<BlogPageProps>
> => {
  const all = await getBlogPages();
  return {
    props: {
      pages: all.slice(0, POSTS_PER_PAGE),
      currentPage: 1,
      totalPages: Math.ceil(all.length / POSTS_PER_PAGE),
    },
  };
};

export default Blog;
