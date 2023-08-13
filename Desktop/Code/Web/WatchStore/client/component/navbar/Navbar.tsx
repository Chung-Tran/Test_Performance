'use client'
import React from 'react'
import styles from './navbar.module.css'
import logo from '../../public/logo.png'
import Image from 'next/image'
import { faMagnifyingGlass,faUser,faCartShopping } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect,useState } from 'react'
const Navbar = () => {
     
    const [scrolled, setScrolled] = useState(false);

    const handleScroll = () => {
        if (window.scrollY > 0) {
            setScrolled(true);
        } else {
            setScrolled(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    return (
        <div className= {`${styles.container} ${scrolled ? styles.scrolled : ''}`}>
            <div className={styles.navlogo}>
                    <Image
                        src={logo}
                        width={185}
                        height={65}
                        alt="Logo not found"
                    />
            </div>
            <div className={styles.navtitle}>
                <ul >
                    <li>
                        <a>
                            <span className={styles.border_right}>Giới thiệu</span>
                        </a>
                    </li>
                    <li>
                        <a>
                            <span className={styles.border_right}>Đồng hồ nam</span>
                        </a>
                    </li>
                    <li>
                        <a>
                            <span className={styles.border_right}>Đồng hồ nữ</span>
                        </a>
                    </li>
                    <li>
                        <a>
                            <span className={styles.border_right}>Đồng hồ đôi</span>
                        </a>
                    </li>
                    <li>
                        <a>
                            <span className={styles.border_right}>Phụ kiện</span>
                        </a>
                    </li>
                    <li>
                        <a>
                            <span className={styles.border_right}>Tin tức</span>
                        </a>
                    </li>
                    <li>
                        <a>
                            <span >Liên hệ</span>
                        </a>
                    </li>
                </ul>
            </div>
            <div className={styles.navicon}>
                <ul>
                    <li>
                    <FontAwesomeIcon icon={faMagnifyingGlass}  />
                    </li>
                    <li >
                    <FontAwesomeIcon icon={faUser} />
                    </li>
                    <li>
                    <FontAwesomeIcon icon={faCartShopping} />                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Navbar