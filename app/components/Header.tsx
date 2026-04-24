import {
  FaList,
  FaShoppingCart,
  FaSearch,
  FaUser,
  FaUserCheck,
  FaTimes,
} from 'react-icons/fa';
import {useEffect, useState} from 'react';
import Logo from './Logo';
import {PredictiveSearch} from './PredictiveSearch';
import {DocsSearch} from './DocsSearch';
import {DesktopMegaMenu, MobileMegaMenu} from './MegaMenu';

export function Header({
  cartCount = 0,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  const isCart = url.includes('/cart');
  const isAccount = url.includes('/account');

  return (
    <div className="navbar bg-base-100 sticky top-0 z-50" data-testid="header">
      <div className="navbar-start">
        <button
          className="btn btn-ghost lg:hidden"
          aria-label="Open menu"
          data-testid="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <FaTimes size={iconSize} />
          ) : (
            <FaList size={iconSize} />
          )}
        </button>
        <a className="px-2" href="/" aria-label="LZX Industries home">
          <Logo size={logoSize} />
        </a>
      </div>
      <div className="navbar-center">
        <DesktopMegaMenu url={url} />
      </div>
      <div className="navbar-end">
        <ul className="menu menu-horizontal px-2">
          <li>
            <button onClick={() => setSearchOpen(true)} aria-label="Search" data-testid="search-toggle">
              <FaSearch size={iconSize} />
            </button>
          </li>
          <li>
            <a
              className={isAccount ? 'active' : ''}
              href="/account"
              aria-label={isLoggedIn ? 'My Account' : 'Sign in'}
            >
              {isLoggedIn ? (
                <FaUserCheck size={iconSize} />
              ) : (
                <FaUser size={iconSize} />
              )}
            </a>
          </li>
          <li>
            <button
              type="button"
              className={`indicator ${isCart ? 'active' : ''}`}
              onClick={onCartClick}
              aria-label={
                cartCount > 0 ? `Cart, ${cartCount} items` : 'Cart, empty'
              }
            >
              <span className="indicator-item badge badge-sm">{cartCount}</span>
              <FaShoppingCart size={iconSize} />
            </button>
          </li>
        </ul>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[64px] bottom-0 z-[80] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default appearance-none border-0 bg-black/30 p-0"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-h-full overflow-y-auto bg-base-100 shadow-xl">
            <MobileMegaMenu
              url={url}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

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
