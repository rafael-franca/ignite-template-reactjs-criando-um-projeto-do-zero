import Image from 'next/image'
import Link from 'next/link'

import styles from './header.module.scss'
import commonStyles from '../../styles/common.module.scss'

export default function Header() {
  return (
    <header className={ commonStyles.container }>
      <div className={ styles.container }>
        <Link href="/">
          <a>
            <Image src='/spacetraveling.png' alt='logo' width={239} height={27} />
          </a>
        </Link>
      </div>
    </header>
  )
}
