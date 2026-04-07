import {
  FaList,
  FaShoppingCart,
  FaSearch,
  FaUser,
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
}: {
  cartCount: number;
  url?: string;
}) {
  const iconSize = 16;
  const logoSize = 24;
  const isHome = url === '/' || url === '';
  const isModules = url.includes('/modules');
  const isVideomancer = url.includes('/products/videomancer');
  const isCatalog = url.includes('/catalog');
  const isCart = url.includes('/cart');
  const isAccount = url.includes('/account');
  const isSearch = url.includes('/search');
  const isGettingStarted = url.includes('https://docs.lzxindustries.net');
  const isDealers = url.includes('/dealers');
  const isBlog = url.includes('https://docs.lzxindustries.net/blog');

  return (
    <div className="navbar bg-base-100 sticky top-0 z-50">
      <div className="navbar-start">
        <div className="dropdown">
          <button tabIndex={-1} className="btn btn-ghost lg:hidden">
            <FaList size={iconSize} />
          </button>
          <ul
            tabIndex={-1}
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
            {/* <li tabIndex={0}>
              <a className="justify-between">
                Docs
                <FaAngleRight size={iconSize} />
              </a>
              <ul className="p-2"> */}
            <li key="getting-started">
              <a
                className={isGettingStarted ? 'active' : ''}
                href="https://docs.lzxindustries.net"
              >
                Docs
              </a>
            </li>
            {/* <li key="modules">
              <a className={isModules ? 'active' : ''} href="https://docs.lzxindustries.net/docs/modules/module-list">
                Module List
              </a>
            </li> */}
            <li key="dealers">
              <a className={isDealers ? 'active' : ''} href="/dealers">
                Dealers
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
            {/* <li key="firmware">
              <a
                className={''}
                href="https://github.com/lzxindustries/firmware"
              >
                Firmware
              </a>
            </li> */}
            {/* </ul>
            </li> */}
          </ul>
        </div>
        <a className="px-2" href="/">
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
          {/* <li tabIndex={0}>
            <a>
              Docs
              <FaAngleDown size={iconSize} />
            </a>
            <ul className="p-2"> */}
          <li>
            <a
              className={isGettingStarted ? 'active' : ''}
              href="https://docs.lzxindustries.net"
            >
              Docs
            </a>
          </li>
          {/* <li>
            <a className={isModules ? 'active' : ''} href="https://docs.lzxindustries.net/docs/modules/module-list">
              Module List
            </a>
          </li> */}
          <li>
            <a className={isDealers ? 'active' : ''} href="/dealers">
              Dealers
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
          {/* <li>
            <a className={''} href="https://github.com/lzxindustries/firmware">
              Firmware
            </a>
          </li> */}
          {/* </ul>
          </li> */}
        </ul>
        <a
          className="px-2"
          target="_blank"
          href="https://community.lzxindustries.net"
          rel="noreferrer"
        >
          <MdForum size={iconSize} />
        </a>
        <a
          className="px-2"
          target="_blank"
          href="https://www.facebook.com/lzxindustries"
          rel="noreferrer"
        >
          <FaFacebook size={iconSize} />
        </a>
        <a
          className="px-2"
          target="_blank"
          href="https://www.instagram.com/lzxindustries"
          rel="noreferrer"
        >
          <FaInstagram size={iconSize} />
        </a>
        <a
          className="px-2"
          target="_blank"
          href="https://discord.gg/7xzD4XzhGn"
          rel="noreferrer"
        >
          <FaDiscord size={iconSize} />
        </a>
        <a
          className="px-2"
          target="_blank"
          href="https://www.twitch.tv/lzxindustries"
          rel="noreferrer"
        >
          <FaTwitch size={iconSize} />
        </a>
        <a
          className="px-2"
          target="_blank"
          href="https://www.youtube.com/lzxindustries"
          rel="noreferrer"
        >
          <FaYoutube size={iconSize} />
        </a>
        <a
          className="px-2"
          target="_blank"
          href="https://www.tiktok.com/@lzxindustries"
          rel="noreferrer"
        >
          <FaTiktok size={iconSize} />
        </a>
        <a
          className="px-2"
          target="_blank"
          href="https://x.com/lzxindustries"
          rel="noreferrer"
        >
          <FaTwitter size={iconSize} />
        </a>
      </div>
      <div className="navbar-end">
        {/* <div className="form-control px-2">
          <input type="text" placeholder="Search" className="input input-bordered px-6" />
        </div> */}

        <ul className="menu menu-horizontal px-2">
          <li>
            <a className={isSearch ? 'active' : ''} href="/search">
              <FaSearch size={iconSize} />
            </a>
          </li>
          <li>
            <a className={isAccount ? 'active' : ''} href="/account">
              <FaUser size={iconSize} />
            </a>
          </li>
          <li>
            <a className={isCart ? ' active' : ''} href="/cart">
              <FaShoppingCart size={iconSize} />
            </a>
          </li>
          {/* {cartCount !== 0 ? <span className="badge badge-sm indicator-item">{cartCount}</span> : ''} */}
          <span className="badge badge-sm indicator-item">{cartCount}</span>
        </ul>
      </div>
    </div>
  );
}

// function Header({ title, menu }: { title: string; menu?: EnhancedMenu }) {
//   const isHome = useIsHomePath();

//   const {
//     isOpen: isCartOpen,
//     openDrawer: openCart,
//     closeDrawer: closeCart,
//   } = useDrawer();

//   const {
//     isOpen: isMenuOpen,
//     openDrawer: openMenu,
//     closeDrawer: closeMenu,
//   } = useDrawer();

//   const addToCartFetchers = useCartFetchers('ADD_TO_CART');

//   // toggle cart drawer when adding to cart
//   useEffect(() => {
//     if (isCartOpen || !addToCartFetchers.length) return;
//     openCart();
//   }, [addToCartFetchers, isCartOpen, openCart]);

//   return (
//     <>
//       <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
//       {menu && (
//         <MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} menu={menu} />
//       )}
//       <DesktopHeader
//         isHome={isHome}
//         title={title}
//         menu={menu}
//         openCart={openCart}
//       />
//       <MobileHeader
//         isHome={isHome}
//         title={title}
//         openCart={openCart}
//         openMenu={openMenu}
//       />
//     </>
//   );
// }
