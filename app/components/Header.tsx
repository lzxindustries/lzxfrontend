import {
  FaList,
  FaShoppingCart,
  FaSearch,
  FaUser,
  FaUserCheck,
  FaInstagram,
  FaDiscord,
  FaTwitch,
  FaYoutube,
  FaFacebook,
  FaTiktok,
  FaTwitter,
} from 'react-icons/fa';
import {MdForum} from 'react-icons/md';
import Logo from './Logo';

export function Header({
  cartCount = 13,
  url = '',
  isLoggedIn = false,
  onCartClick,
}: {
  cartCount: number;
  url?: string;
  isLoggedIn?: boolean;
  onCartClick?: () => void;
}) {
  const iconSize = 16;
  const logoSize = 24;
  const isHome = url === '/' || url === '';
  const isVideomancer = url.includes('/products/videomancer');
  const isCatalog = url.includes('/catalog');
  const isCart = url.includes('/cart');
  const isAccount = url.includes('/account');
  const isSearch = url.includes('/search');
  const isGettingStarted = url.includes('https://docs.lzxindustries.net');
  const isBlog = url.includes('https://docs.lzxindustries.net/blog');

  return (
    <div className="navbar bg-base-100 sticky top-0 z-50">
      <div className="navbar-start">
        <div className="dropdown">
          <button tabIndex={0} className="btn btn-ghost lg:hidden" aria-label="Open menu">
            <FaList size={iconSize} />
          </button>
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-0 p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li key="home">
              <a
                className={isHome ? 'active' : ''}
                href="/"
              >
                Home
              </a>
            </li>
            <li key="videomancer">
              <a
                className={isVideomancer ? 'active' : ''}
                href="/products/videomancer"
                style={{color: isVideomancer ? undefined : '#0072BC', fontWeight: 600}}
              >
                Videomancer
              </a>
            </li>
            <li key="catalog">
              <a className={isCatalog ? 'active' : ''} href="/catalog">
                Shop
              </a>
            </li>
            <li key="getting-started">
              <a
                className={isGettingStarted ? 'active' : ''}
                href="https://docs.lzxindustries.net"
              >
                Docs
              </a>
            </li>
            <li key="blog">
              <a
                className={isBlog ? 'active' : ''}
                href="https://docs.lzxindustries.net/blog"
              >
                Blog
              </a>
            </li>
            <li key="community">
              <a
                target="_blank"
                href="https://community.lzxindustries.net"
                rel="noreferrer"
              >
                Community
              </a>
            </li>
          </ul>
        </div>
        <a className="px-2" href="/" aria-label="LZX Industries home">
          <Logo size={logoSize} />
        </a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-2">
          <li>
            <a className={isHome ? 'active' : ''} href="/">
              Home
            </a>
          </li>
          <li>
            <a
              className={isVideomancer ? 'active' : ''}
              href="/products/videomancer"
              style={{color: isVideomancer ? undefined : '#0072BC', fontWeight: 600}}
            >
              Videomancer
            </a>
          </li>
          <li>
            <a className={isCatalog ? 'active' : ''} href="/catalog">
              Shop
            </a>
          </li>
          <li>
            <a
              className={isGettingStarted ? 'active' : ''}
              href="https://docs.lzxindustries.net"
            >
              Docs
            </a>
          </li>
          <li>
            <a
              className={isBlog ? 'active' : ''}
              href="https://docs.lzxindustries.net/blog"
            >
              Blog
            </a>
          </li>
        </ul>
        <a
          className="px-2"
          target="_blank"
          href="https://community.lzxindustries.net"
          rel="noreferrer"
          aria-label="LZX Community Forum"
        >
          <MdForum size={iconSize} />
        </a>
        <a
          className="px-2"
          target="_blank"
          href="https://www.facebook.com/lzxindustries"
          rel="noreferrer"
          aria-label="LZX on Facebook"
        >
          <FaFacebook size={iconSize} />
        </a>
        <a
          className="px-2"
          target="_blank"
          href="https://www.instagram.com/lzxindustries"
          rel="noreferrer"
          aria-label="LZX on Instagram"
        >
          <FaInstagram size={iconSize} />
        </a>
        <a
          className="px-2"
          target="_blank"
          href="https://discord.gg/7xzD4XzhGn"
          rel="noreferrer"
          aria-label="LZX on Discord"
        >
          <FaDiscord size={iconSize} />
        </a>
        <a
          className="px-2"
          target="_blank"
          href="https://www.twitch.tv/lzxindustries"
          rel="noreferrer"
          aria-label="LZX on Twitch"
        >
          <FaTwitch size={iconSize} />
        </a>
        <a
          className="px-2"
          target="_blank"
          href="https://www.youtube.com/lzxindustries"
          rel="noreferrer"
          aria-label="LZX on YouTube"
        >
          <FaYoutube size={iconSize} />
        </a>
        <a
          className="px-2"
          target="_blank"
          href="https://www.tiktok.com/@lzxindustries"
          rel="noreferrer"
          aria-label="LZX on TikTok"
        >
          <FaTiktok size={iconSize} />
        </a>
        <a
          className="px-2"
          target="_blank"
          href="https://x.com/lzxindustries"
          rel="noreferrer"
          aria-label="LZX on X"
        >
          <FaTwitter size={iconSize} />
        </a>
      </div>
      <div className="navbar-end">\n        <ul className="menu menu-horizontal px-2">
          <li>
            <a className={isSearch ? 'active' : ''} href="/search" aria-label="Search">
              <FaSearch size={iconSize} />
            </a>
          </li>
          <li>
            <a className={isAccount ? 'active' : ''} href="/account" aria-label={isLoggedIn ? 'My Account' : 'Sign in'}>
              {isLoggedIn ? <FaUserCheck size={iconSize} /> : <FaUser size={iconSize} />}
            </a>
          </li>
          <li>
            <button
              className={isCart ? 'active' : ''}
              onClick={onCartClick}
              aria-label="Cart"
            >
              <FaShoppingCart size={iconSize} />
            </button>
          </li>\n          <span className="badge badge-sm indicator-item">{cartCount}</span>
        </ul>
      </div>
    </div>
  );
}
