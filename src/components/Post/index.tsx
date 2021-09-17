import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi';

import styles from './post.module.scss';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface PostProps {
    uid?: string;
    first_publication_date: string | null;
    data: {
      title: string;
      subtitle: string;
      author: string;
    };
  }

export default function Post({ uid, first_publication_date, data: { title, subtitle, author } }: PostProps) {
    const dateFormated = format(
        new Date(first_publication_date),
        "dd MMM yyyy",
        {
            locale: ptBR,
        }
    );

    return (
        <Link href={`/post/` + uid}>
            <a className={styles.container}>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.subtitle}>{subtitle}</p>

                <div className={styles.containerMeta}>
                    <div className={styles.meta}>
                        <FiCalendar color='#BBBBBB' />
                        <time>{dateFormated}</time>
                    </div>

                    <div className={styles.meta}>
                        <FiUser color='#BBBBBB' />
                        <p>{author}</p>
                    </div>
                </div>
            </a>
        </Link>
    );
}
