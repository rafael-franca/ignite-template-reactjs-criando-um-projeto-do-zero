import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next';
import Image from 'next/image';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import Head from 'next/head';

import Prismic from '@prismicio/client';

import { getPrismicClient } from '../../services/prismic';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';

interface Post {
    first_publication_date: string | null;
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
}

export default function Post({ post }: PostProps) {
    const router = useRouter()

    if (router.isFallback) {
        return <div>Carregando...</div>
    }

    const dateFormated = format(
        new Date(post.first_publication_date),
        "dd MMM yyyy",
        {
            locale: ptBR,
        }
    );

    const minutesToRead = post.data.content.reduce((acc, content) => {
        const countWords = (str: string): number => str.trim().split(/\s+/).length;
    
        acc += countWords(content.heading) / 200;
        acc += countWords(RichText.asText(content.body)) / 200;
    
        return Math.ceil(acc);
    }, 0);

    return (
        <main>
            <Head>
                <title>{post.data.title} | spacetraveling</title>
            </Head>

            <Image className={styles.banner} src={post.data.banner.url} loading="lazy" width="1440" height="400" layout="responsive" />

            <article className={commonStyles.container}>
                <h2 className={styles.title}>{post.data.title}</h2>

                <div className={styles.containerMeta}>
                    <div className={styles.meta}>
                        <FiCalendar color='#BBBBBB' />
                        <time>{dateFormated}</time>
                    </div>

                    <div className={styles.meta}>
                        <FiUser color='#BBBBBB' />
                        <p>{post.data.author}</p>
                    </div>

                    <div className={styles.meta}>
                        <FiClock color='#BBBBBB' />
                        <p>{Math.ceil(minutesToRead)} min</p>
                    </div>
                </div>

                <div className={styles.content}>
                    {post.data.content.map((content, index) => (
                        <>
                            <strong>{content.heading}</strong>
                            <div
                                key={String(index)}
                                dangerouslySetInnerHTML={{
                                    __html: RichText.asHtml(content.body),
                                }}
                            />
                        </>
                    ))}
                </div>
            </article>
        </main>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    const prismic = getPrismicClient();

    const posts = await prismic.query([
        Prismic.Predicates.at('document.type', 'posts')
    ]);

    return {
        paths: posts.results.map((post) => {
            return { params: { slug: post.uid } }
        }),
        fallback: true
    }
};

export const getStaticProps: GetStaticProps = async ({ params }: GetStaticPropsContext) => {
    const prismic = getPrismicClient();

    const response = await prismic.getByUID('posts', String(params.slug), {});

    return {
        props: {
            post: response
        }
    }
};
