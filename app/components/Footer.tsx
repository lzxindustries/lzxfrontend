import {
  FaInstagram,
  FaDiscord,
  FaTwitch,
  FaYoutube,
  FaFacebook,
  FaTiktok,
  FaTwitter,
} from 'react-icons/fa';
import MailchimpSubscribe from 'react-mailchimp-subscribe';
import {CountrySelector} from './CountrySelector';
import Logo from './Logo';

export function Footer() {
  const iconSize = 24;
  return (
    <div>
      <footer className="footer p-10 bg-base-200 text-base-content">
        <div className="max-w-full overflow-hidden">
          <span className="footer-title">Subscribe to our newsletter</span>
          {/* @ts-expect-error react-mailchimp-subscribe types incompatible with React 18 */}
          <MailchimpSubscribe url="https://lzxindustries.us11.list-manage.com/subscribe/post?u=7da8b11822c70e5b64240e14f&amp;id=352bd533b6&amp;f_id=0076a2e0f0" />
          {/* <div className="form-control">
            <input type="text" placeholder="Your e-mail" className="input w-full max-w-xs" />
            <button className="btn">Submit</button>
          </div> */}
        </div>
        <div>
          <span className="footer-title">Resources</span>
          <a className="link link-hover" href="/products/videomancer">
            Videomancer Product Page
          </a>
          <a
            className="link link-hover"
            target="_blank"
            href="https://docs.lzxindustries.net/docs/instruments/videomancer"
            rel="noreferrer"
          >
            Videomancer Docs
          </a>
          <a
            className="link link-hover"
            target="_blank"
            href="https://docs.lzxindustries.net/blog"
            rel="noreferrer"
          >
            Blog
          </a>
          <a
            className="link link-hover"
            target="_blank"
            href="https://community.lzxindustries.net"
            rel="noreferrer"
          >
            Community Forum
          </a>
          <a
            className="link link-hover"
            target="_blank"
            href="https://us11.campaign-archive.com/home/?u=7da8b11822c70e5b64240e14f&id=352bd533b6"
            rel="noreferrer"
          >
            Newsletter Archive
          </a>
        </div>
        <div>
          <span className="footer-title">Contact Us</span>
          <a
            className="link link-hover"
            target="_blank"
            href="mailto:sales@lzxindustries.net"
            rel="noreferrer"
          >
            sales@lzxindustries.net
          </a>
          <a
            className="link link-hover"
            target="_blank"
            href="mailto:support@lzxindustries.net"
            rel="noreferrer"
          >
            support@lzxindustries.net
          </a>
        </div>
        <div>
          <span className="footer-title">Policies</span>
          <a className="link link-hover" href="/policies/terms-of-service">
            Terms of Service
          </a>
          <a className="link link-hover" href="/policies/refund-policy">
            Refund Policy
          </a>
        </div>
        <div>
          <span className="footer-title">Country</span>
          <CountrySelector />
          {/* <select className="select select-bordered w-full max-w-xs">
            <option selected>United States</option>
            <option>Canada</option>
          </select> */}
        </div>
      </footer>
      <footer className="footer px-10 py-4 border-t bg-base-200 text-base-content border-base-300">
        <div className="items-center grid-flow-col">
          <Logo size={iconSize} />
          <p>
            © 2026 LZX Industries LLC <br />
            Creative instruments for video synthesis and analog image
            processing.
          </p>
        </div>
        <div className="md:place-self-center md:justify-self-end">
          <div className="grid grid-flow-col gap-4 flex-wrap">
            <a
              target="_blank"
              href="https://www.facebook.com/lzxindustries"
              rel="noreferrer"
              aria-label="LZX on Facebook"
            >
              <FaFacebook size={iconSize} />
            </a>
            <a
              target="_blank"
              href="https://www.instagram.com/lzxindustries"
              rel="noreferrer"
              aria-label="LZX on Instagram"
            >
              <FaInstagram size={iconSize} />
            </a>
            <a
              target="_blank"
              href="https://discord.gg/7xzD4XzhGn"
              rel="noreferrer"
              aria-label="LZX on Discord"
            >
              <FaDiscord size={iconSize} />
            </a>
            <a
              target="_blank"
              href="https://www.twitch.tv/lzxindustries"
              rel="noreferrer"
              aria-label="LZX on Twitch"
            >
              <FaTwitch size={iconSize} />
            </a>
            <a
              target="_blank"
              href="https://www.youtube.com/lzxindustries"
              rel="noreferrer"
              aria-label="LZX on YouTube"
            >
              <FaYoutube size={iconSize} />
            </a>
            <a
              target="_blank"
              href="https://www.tiktok.com/@lzxindustries"
              rel="noreferrer"
              aria-label="LZX on TikTok"
            >
              <FaTiktok size={iconSize} />
            </a>
            <a
              target="_blank"
              href="https://x.com/lzxindustries"
              rel="noreferrer"
              aria-label="LZX on X"
            >
              <FaTwitter size={iconSize} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
