import type {MetaFunction} from '@shopify/remix-oxygen';
import {FaHeart, FaTrash} from 'react-icons/fa';
import {Link} from '~/components/Link';
import {resolveProductUrl} from '~/data/product-slugs';
import {Button} from '~/components/Button';
import {PageHeader, Text} from '~/components/Text';
import {useWishlist} from '~/hooks/useWishlist';

export const meta: MetaFunction = () => {
  return [{title: 'Wishlist'}];
};

export default function Wishlist() {
  const {items, removeItem} = useWishlist();

  return (
    <div>
      <PageHeader heading="Wishlist">
        <Text color="subtle">
          <FaHeart className="inline mr-1" size={14} />
          {items.length} saved item{items.length !== 1 ? 's' : ''}
        </Text>
      </PageHeader>
      <div className="w-full p-4 md:p-8 lg:p-12">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <Text className="mb-4" as="p">
              Your wishlist is empty.
            </Text>
            <Button variant="primary" to="/">
              Browse Products
            </Button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li
                key={item.handle}
                className="flex gap-4 p-4 border border-primary/10 rounded-lg"
              >
                {item.image && (
                  <Link to={resolveProductUrl(item.handle)} className="shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded"
                      width={80}
                      height={80}
                    />
                  </Link>
                )}
                <div className="flex flex-col flex-1 min-w-0">
                  <Link
                    to={resolveProductUrl(item.handle)}
                    className="font-medium truncate hover:underline"
                  >
                    {item.title}
                  </Link>
                  {item.price && (
                    <Text size="fine" color="subtle" className="mt-1">
                      ${item.price}
                    </Text>
                  )}
                  <div className="mt-auto pt-2 flex gap-2">
                    <Link
                      to={resolveProductUrl(item.handle)}
                      className="text-xs underline text-primary/60 hover:text-primary"
                    >
                      View Product
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeItem(item.handle)}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                      aria-label={`Remove ${item.title} from wishlist`}
                    >
                      <FaTrash size={10} />
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
