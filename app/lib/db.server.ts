import { AppLoadContext } from "@shopify/remix-oxygen";

export async function getDatabaseCollection(context: AppLoadContext, collection: string, maxLimit: number = 100)
{
  const pipeline = [{ $limit: maxLimit }]
  const body = JSON.stringify({
    collection,
    database: context.env.DATABASE_NAME,
    dataSource: context.env.CLUSTER_NAME,
    pipeline
  })

  const headers = new Headers([
    ["Content-Type", "application/json"],
    ["Access-Control-Request-Headers", "*"],
    ["api-key", context.env.DATA_API_KEY]
  ])

  const config = {
    method: "post",
    headers,
    body
  }
  
  const url = context.env.DATA_API_BASE_URL + "/action/aggregate"

  const data = await fetch(url, config).then((response) => response.json());

  return data
}