import Logo from "./Logo"
import { FaAngleDown } from 'react-icons/fa';
import { FaAngleRight } from 'react-icons/fa';
import { FaList } from 'react-icons/fa';
import { FaShoppingCart } from 'react-icons/fa';
import { FaSearch } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';
import { FaInstagram } from 'react-icons/fa';
import { FaDiscord } from 'react-icons/fa';
import { FaTwitch } from 'react-icons/fa';
import { FaYoutube } from 'react-icons/fa';
import { FaFacebook } from 'react-icons/fa';
import { MdForum } from 'react-icons/md';

export function Header(
  {
    cartCount = 13,
    url = ''
  }: {
    cartCount: number;
    url?: string
  }
) {
  const iconSize = 16;
  const logoSize = 24;
  const isPatches = url.includes('/patches')
  const isModules = url.includes('/modules')
  const isCart = url.includes('/cart')
  const isAccount = url.includes('/account')
  const isSearch = url.includes('/search')
  const isGettingStarted = url.includes('/getting-started')
  const isDealers = url.includes('/dealers')
  const isJournal = url.includes('/journal')
  const isInStock = url.includes('/?available=true')
  const isCatalog = !isPatches && !isModules && !isCart && !isAccount && !isSearch && !isGettingStarted && !isInStock && !isDealers && !isJournal;

  return (
    <div className="navbar bg-base-100 sticky top-0 z-50">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <FaList size={iconSize} />
          </label>
          <ul tabIndex={1} className="menu menu-compact dropdown-content mt-0 p-2 shadow bg-base-100 rounded-box w-52">
            <li><a className={isCatalog ? "active" : ""} href="/">Catalog</a></li>
            {/* <li><a className={isInStock ? "active" : ""} href="/?available=true">In Stock</a></li> */}
            <li><a className={isPatches ? "active" : ""} href="/patches">Patches</a></li>
            {/* <li tabIndex={0}>
              <a className="justify-between">
                Docs
                <FaAngleRight size={iconSize} />
              </a>
              <ul className="p-2"> */}
            <li><a className={isGettingStarted ? "active" : ""} href="/getting-started">Getting Started</a></li>
            <li><a className={isModules ? "active" : ""} href="/modules">Module List</a></li>
            <li><a className={isDealers ? "active" : ""} href="/dealers">Dealers</a></li>
            <li><a className={isJournal ? "active" : ""} href="/journal">Journal</a></li>
            {/* </ul>
            </li> */}
          </ul>
        </div>
        <a className="px-2" href="/"><Logo size={logoSize} /></a>
        <a className="px-2" target="_blank" href="https://community.lzxindustries.net"><MdForum size={iconSize} /></a>
        <a className="px-2" target="_blank" href="https://www.facebook.com/lzxindustries"><FaFacebook size={iconSize} /></a>
        <a className="px-2"  target="_blank" href="https://www.instagram.com/lzxindustries"><FaInstagram size={iconSize} /></a>
        <a className="px-2"  target="_blank" href="https://discord.gg/KxGAnSVw2J"><FaDiscord size={iconSize} /></a>
        <a className="px-2"  target="_blank" href="https://www.twitch.com/lzxindustries"><FaTwitch size={iconSize} /></a>
        <a className="px-2"  target="_blank" href="https://www.youtube.com/lzxindustries"><FaYoutube size={iconSize} /></a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-2">
          <li><a className={isCatalog ? "active" : ""} href="/">Catalog</a></li>
          {/* <li><a className={isInStock ? "active" : ""} href="/?available=true">In Stock</a></li> */}
          <li><a className={isPatches ? "active" : ""} href="/patches">Patches</a></li>
          {/* <li tabIndex={0}>
            <a>
              Docs
              <FaAngleDown size={iconSize} />
            </a>
            <ul className="p-2"> */}
          <li><a className={isGettingStarted ? "active" : ""} href="/getting-started">Getting Started</a></li>
          <li><a className={isModules ? "active" : ""} href="/modules">Module List</a></li>
          <li><a className={isDealers ? "active" : ""} href="/dealers">Dealers</a></li>
          <li><a className={isJournal ? "active" : ""} href="/journal">Journal</a></li>
          {/* </ul>
          </li> */}
        </ul>
      </div>
      <div className="navbar-end">
        {/* <div className="form-control px-2">
          <input type="text" placeholder="Search" className="input input-bordered px-6" />
        </div> */}

        <ul className="menu menu-horizontal px-2">

          <li><a className={(isSearch ? "active" : "")} href="/search"><FaSearch size={iconSize} /></a></li>
          <li><a className={(isAccount ? "active" : "")} href="/account"><FaUser size={iconSize} /></a></li>
          <li><a className={(isCart ? " active" : "")} href="/cart"><FaShoppingCart size={iconSize} /></a></li>
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