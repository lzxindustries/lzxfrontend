// import IconInstagram from './IconInstagram'
// import IconFacebook from './IconFacebook'
// import IconYoutube from './IconYoutube'
// import IconTwitch from './IconTwitch'
// import IconHelp from './IconHelp'
// import IconDiscord from './IconDiscord'
// import { Text } from './Text';
// import { Link } from './Link';

// export default function FooterMenu() {
//   return (
//     <>
//       <div className="grid gap-4">
//         <div className="grid gap-4"> <Link target="_blank" to="https://community.lzxindustries.net"><IconHelp className="inline-block align-middle" /> <Text className="inline-block align-middle">LZX Community Forum </Text></Link></div>
//         <div className="grid gap-4"> <Link target="_blank" to="https://www.instagram.com/lzxindustries"><IconInstagram className="inline-block align-middle" /> <Text className="inline-block align-middle">LZX on Instagram </Text></Link></div>
//         <div className="grid gap-4"> <Link target="_blank" to="https://www.facebook.com/lzxindustries"><IconFacebook className="inline-block align-middle" /> <Text className="inline-block align-middle">LZX on Facebook </Text></Link></div>
//         <div className="grid gap-4"> <Link target="_blank" to="https://www.youtube.com/lzxindustries"><IconYoutube className="inline-block align-middle" /> <Text className="inline-block align-middle">LZX on YouTube </Text></Link></div>
//         <div className="grid gap-4"> <Link target="_blank" to="https://discord.gg/KxGAnSVw2J"><IconDiscord className="inline-block align-middle" /> <Text className="inline-block align-middle">LZX on Discord </Text></Link></div>
//         <div className="grid gap-4"> <Link target="_blank" to="https://www.twitch.com/lzxindustries"><IconTwitch className="inline-block align-middle" /> <Text className="inline-block align-middle">LZX on Twitch </Text></Link></div>
//       </div>
//     </>
//   );
// }

// // const FooterLink = ({ item }: { item: EnhancedMenuItem }) => {
// //   if (item.to.startsWith('http')) {
// //     return (
// //       <a href={item.to} target={item.target} rel="noopener noreferrer">
// //         {item.title}
// //       </a>
// //     );
// //   }

// //   return (
// //     <Link to={item.to} target={item.target} prefetch="intent">
// //       {item.title}
// //     </Link>
// //   );
// // };

// // function FooterMenu({ menu }: { menu?: EnhancedMenu }) {
// //   const styles = {
// //     section: 'grid gap-4',
// //     nav: 'grid gap-2 pb-6',
// //   };

// //   return (
// //     <>
// //       {(menu?.items || []).map((item: EnhancedMenuItem) => (
// //         <section key={item.id} className={styles.section}>
// //           <Disclosure>
// //             {({ open }) => (
// //               <>
// //                 <Disclosure.Button className="text-left md:cursor-default">
// //                   <Heading className="flex justify-between" size="lead" as="h3">
// //                     {item.title}
// //                     {item?.items?.length > 0 && (
// //                       <span className="md:hidden">
// //                         <IconCaret direction={open ? 'up' : 'down'} />
// //                       </span>
// //                     )}
// //                   </Heading>
// //                 </Disclosure.Button>
// //                 {item?.items?.length > 0 ? (
// //                   <div
// //                     className={`${open ? `max-h-48 h-fit` : `max-h-0 md:max-h-fit`
// //                       } overflow-hidden transition-all duration-300`}
// //                   >
// //                     <Suspense data-comment="This suspense fixes a hydration bug in Disclosure.Panel with static prop">
// //                       <Disclosure.Panel static>
// //                         <nav className={styles.nav}>
// //                           {item.items.map((subItem) => (
// //                             <FooterLink key={subItem.id} item={subItem} />
// //                           ))}
// //                         </nav>
// //                       </Disclosure.Panel>
// //                     </Suspense>
// //                   </div>
// //                 ) : null}
// //               </>
// //             )}
// //           </Disclosure>
// //         </section>
// //       ))}
// //     </>
// //   );
// // }
