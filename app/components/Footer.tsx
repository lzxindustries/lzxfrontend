import Logo from "./Logo"
import { FaInstagram } from 'react-icons/fa';
import { FaDiscord } from 'react-icons/fa';
import { FaTwitch } from 'react-icons/fa';
import { FaYoutube } from 'react-icons/fa';
import { FaFacebook } from 'react-icons/fa';
import { CountrySelector } from "./CountrySelector";
import MailchimpSubscribe from "react-mailchimp-subscribe"

export function Footer() {
  const iconSize = 24;
  return (
    <div>
      <footer className="footer p-10 bg-base-200 text-base-content">
        <div>
          <span className="footer-title">Subscribe to our newsletter</span>
          <MailchimpSubscribe url="https://lzxindustries.us11.list-manage.com/subscribe/post?u=7da8b11822c70e5b64240e14f&amp;id=352bd533b6&amp;f_id=0076a2e0f0" />
          {/* <div className="form-control">
            <input type="text" placeholder="Your e-mail" className="input w-full max-w-xs" />
            <button className="btn">Submit</button>
          </div> */}
        </div>
        <div>
          <span className="footer-title">Resources</span>
          <a className="link link-hover" target="_blank" href="https://community.lzxindustries.net">Community Forum</a>
          <a className="link link-hover" target="_blank" href="https://us11.campaign-archive.com/home/?u=7da8b11822c70e5b64240e14f&id=352bd533b6">Newsletter Archive</a>
        </div>
        <div>
          <span className="footer-title">Contact Us</span>
          <a className="link link-hover" target="_blank" href="mailto:sales@lzxindustries.net">sales@lzxindustries.net</a>
          <a className="link link-hover" target="_blank" href="mailto:support@lzxindustries.net">support@lzxindustries.net</a>
          <a className="link link-hover" target="_blank" href="https://wkf.ms/4aEUIm3">Service Request</a>
        </div>
        <div>
          <span className="footer-title">Policies</span>
          <a className="link link-hover" href="/policies/terms-of-service">Terms of Service</a>
          <a className="link link-hover" href="/policies/refund-policy">Refund Policy</a>
        </div>
        <div>
          <span className="footer-title w-64">Country</span>
          <CountrySelector />
          <div className="h-8"/>
          {/* <select className="select select-bordered w-full max-w-xs">
            <option selected>United States</option>
            <option>Canada</option>
          </select> */}
        </div>
      </footer>
      <footer className="footer px-10 py-4 border-t bg-base-200 text-base-content border-base-300">
        <div className="items-center grid-flow-col">
          <Logo size={iconSize} />
          <p>© 2023 LZX Industries LLC <br />Creative instruments for video synthesis and analog image processing.</p>
        </div>
        <div className="md:place-self-center md:justify-self-end">
          <div className="grid grid-flow-col gap-4">
            <a target="_blank" href="https://www.facebook.com/lzxindustries"><FaFacebook size={iconSize} /></a>
            <a target="_blank" href="https://www.instagram.com/lzxindustries"><FaInstagram size={iconSize} /></a>
            <a target="_blank" href="https://discord.gg/3FqKuKWS"><FaDiscord size={iconSize} /></a>
            <a target="_blank" href="https://www.twitch.com/lzxindustries"><FaTwitch size={iconSize} /></a>
            <a target="_blank" href="https://www.youtube.com/lzxindustries"><FaYoutube size={iconSize} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
