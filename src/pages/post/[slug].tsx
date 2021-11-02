import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import Comments from '../../components/Comments';

import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next';
import ExitPreviewButton from '../../components/ExitPreviewButton';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
  navigation: {
    prevPost: {
      uid: string;
      data: { title: string };
    }[];
    nextPost: {
      uid: string;
      data: { title: string };
    }[];
  };
}

export default function Post({ post, preview, navigation }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const createdAtFormated = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );

  const updatedAtFormated =
    post.last_publication_date &&
    format(new Date(post.last_publication_date), "dd MMM yyyy 'às' hh:mm", {
      locale: ptBR,
    });

  const minutesToRead = post.data.content.reduce((acc, content) => {
    const countWords = (str: string): number => str.trim().split(/\s+/).length;

    acc += countWords(content.heading) / 200;
    acc += countWords(RichText.asText(content.body)) / 200;

    return Math.ceil(acc);
  }, 0);

  return (
    <div>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>

      <ExitPreviewButton preview={preview} />

      <Image
        className={styles.banner}
        src={post.data.banner.url}
        loading="lazy"
        width="1440"
        height="400"
        layout="responsive"
      />

      <article className={commonStyles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{post.data.title}</h2>

          <div className={styles.containerMeta}>
            <div className={styles.meta}>
              <FiCalendar color="#BBBBBB" />
              <time>{createdAtFormated}</time>
            </div>

            <div className={styles.meta}>
              <FiUser color="#BBBBBB" />
              <p>{post.data.author}</p>
            </div>

            <div className={styles.meta}>
              <FiClock color="#BBBBBB" />
              <p>{Math.ceil(minutesToRead)} min</p>
            </div>
          </div>

          {updatedAtFormated && (
            <p className={styles.metaUpdated}>
              * editado em <time>{updatedAtFormated}</time>
            </p>
          )}
        </div>

        <div className={styles.content}>
          {post.data.content.map((content, index) => (
            <div key={String(index)}>
              <strong>{content.heading}</strong>
              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </div>
          ))}
        </div>
      </article>

      <section
        className={`${styles.navigationPosts} ${commonStyles.container}`}
      >
        {navigation?.prevPost.length > 0 && (
          <div key={navigation.prevPost[0].uid}>
            <h3>{navigation.prevPost[0].data.title}</h3>
            <Link href={`/post/${navigation.prevPost[0].uid}`}>
              <a>Post anterior</a>
            </Link>
          </div>
        )}

        {navigation?.nextPost.length > 0 && (
          <div key={navigation.nextPost[0].uid}>
            <h3>{navigation.nextPost[0].data.title}</h3>
            <Link href={`/post/${navigation.nextPost[0].uid}`}>
              <a>Próximo post</a>
            </Link>
          </div>
        )}
      </section>

      <Comments />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  return {
    paths: posts.results.map(post => {
      return { params: { slug: post.uid } };
    }),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
  params,
}: GetStaticPropsContext) => {
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(params.slug), {});

  const prevPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const nextPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.last_publication_date]',
    }
  );

  if (!response) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      post: response,
      preview,
      navigation: {
        prevPost: prevPost?.results,
        nextPost: nextPost?.results,
      },
    },
    revalidate: 60 * 60 * 12, // 12h
  };
};
