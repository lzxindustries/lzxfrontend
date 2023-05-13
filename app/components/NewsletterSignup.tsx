import MailchimpSubscribe from "react-mailchimp-subscribe"
import { Button } from "./Button";
import { Text } from "./Text"
import { Link } from "./Link";
import IconHelp from "./IconHelp";
import IconPolicy from "./IconPolicy";
const url = "https://lzxindustries.us11.list-manage.com/subscribe/post?u=7da8b11822c70e5b64240e14f&amp;id=352bd533b6&amp;f_id=0076a2e0f0";

// simplest form (only email)
export const NewsletterSignup = () =>
  <div className="grid gap-4">
    <Text size="lead">Sign up for our newsletter!</Text><Text size="copy" className="text-gray-400"><MailchimpSubscribe url={url} /></Text>
   </div>

export default NewsletterSignup
