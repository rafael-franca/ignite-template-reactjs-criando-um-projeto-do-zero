import React, { useState } from 'react';
import { GetStaticProps, GetStaticPropsContext } from 'next';
import Head from 'next/head';

import Prismic from '@prismicio/client';

import { getPrismicClient } from '../services/prismic';

import Post from '../components/Post';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
    uid?: string;
    first_publication_date: string | null;
    data: {
        title: string;
        subtitle: string;
        author: string;
    };
}

interface PostPagination {
    next_page: string;
    results: Post[];
}

interface HomeProps {
    postsPagination: PostPagination;
}

export default function Home({ postsPagination: { results, next_page } }: HomeProps) {
    const [posts, setPosts] = useState<Post[]>(results);
    const [nextPage, setNextPage] = useState<string>(next_page);

    const loadMorePosts = () => {
        if (nextPage) {
            fetch(nextPage)
                .then(response => response.json())
                .then(data => {
                    const newPosts = data.results.map((post: Post) => ({
                        uid: post.uid,
                        first_publication_date: post.first_publication_date,
                        data: {
                            title: post.data.title,
                            subtitle: post.data.subtitle,
                            author: post.data.author,
                        },
                    }));

                    setNextPage(data.next_page);
                    setPosts([...posts, ...newPosts]);
                })
                .catch(() => {
                    alert('Erro na aplicação!');
                });
        }
    }

    const handleLoadMorePosts = () => loadMorePosts();

    return (
        <main className={commonStyles.container}>
            <Head>
                <title>spacetraveling</title>
            </Head>

            {posts.map(post => <Post {...post} key={post.uid} />)}

            {nextPage && <button className={styles.loadMoreBtn} type='button' onClick={handleLoadMorePosts}>
                Carregar mais posts
            </button>}
        </main>
    )
}

export const getStaticProps: GetStaticProps = async (context: GetStaticPropsContext) => {
    const prismic = getPrismicClient();

    const response = await prismic.query([
        Prismic.predicates.at('document.type', 'posts')
    ], {
        fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
        pageSize: 1
    });

    const posts = response.results.map(post => {
        return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
                title: post.data.title,
                subtitle: post.data.subtitle,
                author: post.data.author
            }
        };
    });

    return {
        props: {
            postsPagination: {
                results: posts,
                next_page: response.next_page
            }
        }
    }
};
