import type {AppLoadContext} from '@shopify/remix-oxygen';

export async function getDataCollection(
  context: AppLoadContext,
  collection: string,
  pipeline: any = [{$limit: 256}],
) {
  const body = JSON.stringify({
    collection,
    database: context.env.DATABASE_NAME,
    dataSource: context.env.CLUSTER_NAME,
    pipeline,
  });

  const headers = new Headers([
    ['Content-Type', 'application/json'],
    ['Access-Control-Request-Headers', '*'],
    ['api-key', context.env.DATA_API_KEY],
  ]);

  const config = {
    method: 'post',
    headers,
    body,
  };

  const url = context.env.DATA_API_BASE_URL + '/action/aggregate';
  let data = {documents: [{}]};

  try {
    data = await fetch(url, config).then((response) => response.json());
  } catch (error) {
    if (context.NODE_ENV === 'development') {
      if (error instanceof Error) {
        throw new Error(`There was an error: ${error.message}`);
      } else {
        throw new Error('There was an unknown error');
      }
    }
  }

  // console.log(data)
  return data.documents;
}

export async function getDataDocument(
  context: AppLoadContext,
  collection: string,
  filter: any,
) {
  // const pipeline = [{ $limit: maxLimit }]

  const body = JSON.stringify({
    collection,
    database: context.env.DATABASE_NAME,
    dataSource: context.env.CLUSTER_NAME,
    filter,
  });

  const headers = new Headers([
    ['Content-Type', 'application/json'],
    ['Access-Control-Request-Headers', '*'],
    ['api-key', context.env.DATA_API_KEY],
  ]);

  const config = {
    method: 'post',
    headers,
    body,
  };

  const url = context.env.DATA_API_BASE_URL + '/action/findOne';

  let data = {document: {}};

  try {
    data = await fetch(url, config).then((response) => response.json());
  } catch (error) {
    if (context.NODE_ENV === 'development') {
      if (error instanceof Error) {
        throw new Error(`There was an error: ${error.message}`);
      } else {
        throw new Error('There was an unknown error');
      }
    }
  }

  // console.log(data)
  return data.document;
}
