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
  FaTimes,
} from 'react-icons/fa';
import {MdForum} from 'react-icons/md';
import {useState} from 'react';
import Logo from './Logo';
import {PredictiveSearch} from './PredictiveSearch';
import {DocsSearch} from './DocsSearch';

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
  const [searchOpen, setSearchOpen] = useState(false);
  const isHome = url === '/' || url === '';
  const isVideomancer = url.includes('/instruments/videomancer');
  const isCatalog = url.includes('/catalog');
  const isCart = url.includes('/cart');
  const isAccount = url.includes('/account');
  const isDocs = url.startsWith('/docs');
  const isBlog = url.startsWith('/blog');
  const isModules = url.startsWith('/modules');
  const isConnect = url.startsWith('/connect');
  const isDownloads = url.startsWith('/downloads');
  const isLegacy = url.startsWith('/legacy');
  const isArtists = url.startsWith('/artists');
  const isSystems = url.startsWith('/systems');
  const isAbout = url.startsWith('/about');

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
                href="/instruments/videomancer"
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
            <li key="modules">
              <a className={isModules ? 'active' : ''} href="/modules">Modules</a>
            </li>
            <li key="systems">
              <a className={isSystems ? 'active' : ''} href="/systems">
                Systems
              </a>
            </li>
            <li key="legacy">
              <a className={isLegacy ? 'active' : ''} href="/legacy">
                Legacy
              </a>
            </li>
            <li key="docs">
              <a
                className={isDocs ? 'active' : ''}
                href="/docs"
              >
                Docs
              </a>
            </li>
            <li key="downloads">
              <a className={isDownloads ? 'active' : ''} href="/downloads">
                Downloads
              </a>
            </li>
            <li key="connect">
              <a className={isConnect ? 'active' : ''} href="/connect">
                LZX Connect
              </a>
            </li>
            <li key="blog">
              <a
                className={isBlog ? 'active' : ''}
                href="/blog"
              >
                Blog
              </a>
            </li>
            <li key="artists">
              <a className={isArtists ? 'active' : ''} href="/artists">
                Artists
              </a>
            </li>
            <li key="about">
              <a className={isAbout ? 'active' : ''} href="/about">
                About
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
            <li key="patches">
              <a href="/patches">Patches</a>
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
              href="/instruments/videomancer"
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
            <a className={isModules ? 'active' : ''} href="/modules">Modules</a>
          </li>
          <li>
            <a className={isSystems ? 'active' : ''} href="/systems">
              Systems
            </a>
          </li>
          <li>
            <a className={isLegacy ? 'active' : ''} href="/legacy">
              Legacy
            </a>
          </li>
          <li>
            <a
              className={isDocs ? 'active' : ''}
              href="/docs"
            >
              Docs
            </a>
          </li>
          <li>
            <a className={isDownloads ? 'active' : ''} href="/downloads">
              Downloads
            </a>
          </li>
          <li>
            <a className={isConnect ? 'active' : ''} href="/connect">
              LZX Connect
            </a>
          </li>
          <li>
            <a
              className={isBlog ? 'active' : ''}
              href="/blog"
            >
              Blog
            </a>
          </li>
          <li>
            <a className={isArtists ? 'active' : ''} href="/artists">
              Artists
            </a>
          </li>
          <li>
            <a className={isAbout ? 'active' : ''} href="/about">
              About
            </a>
          </li>
          <li>
            <a href="/patches">Patches</a>
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
      <div className="navbar-end">
        <ul className="menu menu-horizontal px-2">
          <li>
            <button onClick={() => setSearchOpen(true)} aria-label="Search">
              <FaSearch size={iconSize} />
            </button>
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
          </li>
          <span className="badge badge-sm indicator-item">{cartCount}</span>
        </ul>
      </div>
      {searchOpen && (
        <div className="fixed inset-0 z-[90] bg-black/50 flex items-start justify-center pt-20">
          <div className="w-full max-w-lg mx-4">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setSearchOpen(false)}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Close search"
              >
                <FaTimes size={iconSize} />
              </button>
            </div>
            <PredictiveSearch onClose={() => setSearchOpen(false)} />
            <div className="mt-4 rounded-lg bg-base-100 p-4 shadow">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-60">
                Search Docs And Blog
              </p>
              <DocsSearch />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
