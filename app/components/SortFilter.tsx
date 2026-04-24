import {Menu, Disclosure, Dialog, Transition} from '@headlessui/react';
import type {Location} from '@remix-run/react';
import {
  Link,
  useLocation,
  useSearchParams,
  useNavigate,
} from '@remix-run/react';

import type {
  FilterType,
  Filter,
  Collection,
} from '@shopify/hydrogen/storefront-api-types';
import {Fragment, useMemo, useState} from 'react';
import type {SyntheticEvent} from 'react';
import {useDebounce} from 'react-use';
import {IconFilters, IconCaret, IconXMark, IconClose} from '~/components/Icon';
import {Heading, Text} from '~/components/Text';

export type AppliedFilter = {
  label: string;
  urlParam: {
    key: string;
    value: string;
  };
};

export type SortParam =
  | 'price-low-high'
  | 'price-high-low'
  | 'best-selling'
  | 'featured'
  | 'name'
  | 'eldest'
  | 'newest';

type Props = {
  filters: Filter[];
  appliedFilters?: AppliedFilter[];
  children: React.ReactNode;
  collections?: Collection[];
};

export function SortFilter({
  filters,
  appliedFilters = [],
  children,
  collections = [],
}: Props) {
  // Desktop uses an inline sidebar; mobile opens a full-screen Dialog to
  // avoid the in-flow accordion pushing the product grid down.
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between w-full gap-2">
        <button
          onClick={() =>
            typeof window !== 'undefined' && window.innerWidth >= 768
              ? setDesktopOpen((v) => !v)
              : setMobileOpen(true)
          }
          aria-label="Toggle filters"
          className="relative flex items-center justify-center w-11 h-11 focus:ring-primary/5"
        >
          <IconFilters />
        </button>
        <SortMenu />
      </div>

      <div className="flex flex-col flex-wrap md:flex-row">
        <div
          className={`hidden md:block transition-all duration-200 ${
            desktopOpen
              ? 'opacity-100 md:min-w-[240px] md:w-[240px] md:pr-8 max-h-full'
              : 'opacity-0 md:min-w-[0px] md:w-[0px] pr-0 max-h-0 md:max-h-full overflow-hidden'
          }`}
        >
          <FiltersDrawer
            collections={collections}
            filters={filters}
            appliedFilters={appliedFilters}
          />
        </div>
        <div className="flex-1">{children}</div>
      </div>

      <Transition show={mobileOpen} as={Fragment}>
        <Dialog
          onClose={() => setMobileOpen(false)}
          className="relative z-50 md:hidden"
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="ease-in duration-150"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-base-100 shadow-xl pb-[env(safe-area-inset-bottom,0px)]">
                <div className="flex items-center justify-between border-b border-base-300 px-4 py-3">
                  <Dialog.Title className="text-lg font-semibold">
                    Filters
                  </Dialog.Title>
                  <button
                    type="button"
                    aria-label="Close filters"
                    className="inline-flex items-center justify-center w-11 h-11"
                    onClick={() => setMobileOpen(false)}
                  >
                    <IconClose />
                  </button>
                </div>
                <div className="px-4">
                  <FiltersDrawer
                    collections={collections}
                    filters={filters}
                    appliedFilters={appliedFilters}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export function FiltersDrawer({
  filters = [],
  appliedFilters = [],
  collections = [],
}: {
  filters: Filter[];
  appliedFilters: AppliedFilter[];
  collections: Collection[];
}) {
  const [params] = useSearchParams();
  const location = useLocation();

  const filterMarkup = (filter: Filter, option: Filter['values'][0]) => {
    switch (filter.type) {
      case 'PRICE_RANGE':
        const min =
          params.has('minPrice') && !isNaN(Number(params.get('minPrice')))
            ? Number(params.get('minPrice'))
            : undefined;

        const max =
          params.has('maxPrice') && !isNaN(Number(params.get('maxPrice')))
            ? Number(params.get('maxPrice'))
            : undefined;

        return <PriceRangeFilter min={min} max={max} />;

      default:
        const to = getFilterLink(
          filter,
          option.input as string,
          params,
          location,
        );
        return (
          <Link
            className="focus:underline hover:underline"
            prefetch="intent"
            to={to}
          >
            {option.label}
          </Link>
        );
    }
  };

  return (
    <>
      <nav className="py-8">
        {appliedFilters.length > 0 ? (
          <div className="pb-8">
            <AppliedFilters filters={appliedFilters} />
          </div>
        ) : null}

        <Heading as="h4" size="lead" className="pb-4">
          Filter By
        </Heading>
        <div className="divide-y">
          {filters.map(
            (filter: Filter) =>
              filter.values.length > 1 && (
                <Disclosure as="div" key={filter.id} className="w-full">
                  {({open}) => (
                    <>
                      <Disclosure.Button className="flex justify-between w-full py-4">
                        <Text size="lead">{filter.label}</Text>
                        <IconCaret direction={open ? 'up' : 'down'} />
                      </Disclosure.Button>
                      <Disclosure.Panel key={filter.id}>
                        <ul key={filter.id} className="py-2">
                          {filter.values?.map((option) => {
                            return (
                              <li key={option.id} className="pb-4">
                                {filterMarkup(filter, option)}
                              </li>
                            );
                          })}
                        </ul>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              ),
          )}
        </div>
      </nav>
    </>
  );
}

function AppliedFilters({filters = []}: {filters: AppliedFilter[]}) {
  const [params] = useSearchParams();
  const location = useLocation();
  return (
    <>
      <Heading as="h4" size="lead" className="pb-4">
        Applied filters
      </Heading>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter: AppliedFilter) => {
          return (
            <Link
              to={getAppliedFilterLink(filter, params, location)}
              className="flex px-2 border rounded-full gap"
              key={`${filter.label}-${filter.urlParam.key}-${filter.urlParam.value}`}
            >
              <span className="flex-grow">{filter.label}</span>
              <span>
                <IconXMark />
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function getAppliedFilterLink(
  filter: AppliedFilter,
  params: URLSearchParams,
  location: Location,
) {
  const paramsClone = new URLSearchParams(params);
  if (filter.urlParam.key === 'variantOption') {
    const variantOptions = paramsClone.getAll('variantOption');
    const filteredVariantOptions = variantOptions.filter(
      (options) => !options.includes(filter.urlParam.value),
    );
    paramsClone.delete(filter.urlParam.key);
    for (const filteredVariantOption of filteredVariantOptions) {
      paramsClone.append(filter.urlParam.key, filteredVariantOption);
    }
  } else {
    paramsClone.delete(filter.urlParam.key);
  }
  return `${location.pathname}?${paramsClone.toString()}`;
}

function getSortLink(
  sort: SortParam,
  params: URLSearchParams,
  location: Location,
) {
  params.set('sort', sort);
  return `${location.pathname}?${params.toString()}`;
}

function getFilterLink(
  filter: Filter,
  rawInput: string | Record<string, any>,
  params: URLSearchParams,
  location: ReturnType<typeof useLocation>,
) {
  const paramsClone = new URLSearchParams(params);
  const newParams = filterInputToParams(filter.type, rawInput, paramsClone);
  return `${location.pathname}?${newParams.toString()}`;
}

const PRICE_RANGE_FILTER_DEBOUNCE = 500;

function PriceRangeFilter({max, min}: {max?: number; min?: number}) {
  const location = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const navigate = useNavigate();

  const [minPrice, setMinPrice] = useState(min ? String(min) : '');
  const [maxPrice, setMaxPrice] = useState(max ? String(max) : '');

  useDebounce(
    () => {
      if (
        (minPrice === '' || minPrice === String(min)) &&
        (maxPrice === '' || maxPrice === String(max))
      )
        return;

      const price: {min?: string; max?: string} = {};
      if (minPrice !== '') price.min = minPrice;
      if (maxPrice !== '') price.max = maxPrice;

      const newParams = filterInputToParams('PRICE_RANGE', {price}, params);
      navigate(`${location.pathname}?${newParams.toString()}`);
    },
    PRICE_RANGE_FILTER_DEBOUNCE,
    [minPrice, maxPrice],
  );

  const onChangeMax = (event: SyntheticEvent) => {
    const newMaxPrice = (event.target as HTMLInputElement).value;
    setMaxPrice(newMaxPrice);
  };

  const onChangeMin = (event: SyntheticEvent) => {
    const newMinPrice = (event.target as HTMLInputElement).value;
    setMinPrice(newMinPrice);
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm">from</span>
        <input
          name="maxPrice"
          className="input input-bordered input-sm w-full text-base"
          type="text"
          inputMode="numeric"
          defaultValue={min}
          placeholder={'$'}
          onChange={onChangeMin}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm">to</span>
        <input
          name="minPrice"
          className="input input-bordered input-sm w-full text-base"
          type="number"
          inputMode="numeric"
          defaultValue={max}
          placeholder={'$'}
          onChange={onChangeMax}
        />
      </label>
    </div>
  );
}

function filterInputToParams(
  type: FilterType,
  rawInput: string | Record<string, any>,
  params: URLSearchParams,
) {
  let input: Record<string, any>;
  try {
    input = typeof rawInput === 'string' ? JSON.parse(rawInput) : rawInput;
  } catch {
    return params;
  }
  switch (type) {
    case 'PRICE_RANGE':
      if (input.price.min) params.set('minPrice', input.price.min);
      if (input.price.max) params.set('maxPrice', input.price.max);
      break;
    case 'LIST':
      Object.entries(input).forEach(([key, value]) => {
        if (typeof value === 'string') {
          params.set(key, value);
        } else if (typeof value === 'boolean') {
          params.set(key, value.toString());
        } else {
          const {name, value: val} = value as {name: string; value: string};
          const allVariants = params.getAll(`variantOption`);
          const newVariant = `${name}:${val}`;
          if (!allVariants.includes(newVariant)) {
            params.append('variantOption', newVariant);
          }
        }
      });
      break;
  }

  return params;
}

export default function SortMenu() {
  const items: {label: string; key: SortParam}[] = [
    {
      label: 'Newest',
      key: 'newest',
    },
    {
      label: 'Eldest',
      key: 'eldest',
    },
    {
      label: 'Name',
      key: 'name',
    },
    {
      label: 'Lowest Price',
      key: 'price-low-high',
    },
    {
      label: 'Highest Price',
      key: 'price-high-low',
    },
  ];
  const [params] = useSearchParams();
  const location = useLocation();
  const activeItem = items.find((item) => item.key === params.get('sort'));

  return (
    <Menu as="div" className="relative z-50">
      <Menu.Button className="flex items-center">
        <span className="px-2">
          <span className="px-2 font-medium">Sort by:</span>
          <span>{(activeItem || items[0]).label}</span>
        </span>
        <IconCaret />
      </Menu.Button>

      <Menu.Items
        as="nav"
        className="absolute z-50 bg-white right-0 flex flex-col p-4 text-right rounded-sm max-h-[70vh] overflow-y-auto shadow-lg border border-base-300"
      >
        {items.map((item) => (
          <Menu.Item key={item.label}>
            {() => (
              <Link
                className={`block text-sm pb-2 px-3 ${
                  activeItem?.key === item.key ? 'font-bold' : 'font-normal'
                }`}
                to={getSortLink(item.key, params, location)}
              >
                {item.label}
              </Link>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
}
