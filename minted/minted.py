import json
import time
import requests
import pandas as pd

def dfify(x, k, outfile):
  x = [i[k] for i in x if k in i.keys()]
  df = pd.DataFrame(x)
  df = df[df["tokenId"].notna()]
  df = df[df["tokenId"].apply(lambda x: len(x) < 20)]
  df = df[["collectionAddress", "tokenId", "collectionName", "name"]]
  df = df.sort_values(by="tokenId", ascending=True)
  df = df.reset_index(drop=True)
  if (outfile):
    df.to_csv(outfile, header=False, index=False)
  else:
    return df

def query_zora(query):
  response = requests.post(
    url = "https://api.zora.co/graphql",
    headers = {"Content-Type": "application/json"},
    json = {"query": query}
  )
  try:
    return response.json()
  except Exception as e:
    print(response.content)
    return {}

def query_sales(contract_token_ids, limit=500, after=""):
  query = """
{{
  sales(pagination: {{ limit: {limit}, after: "{after}" }},
  sort: {{ sortKey: TIME, sortDirection: DESC }}, 
  where: {{ tokens: {contract_token_ids} }}
  ) {{
    nodes {{
      token {{
        collectionAddress
        collectionName
        owner
        tokenId
        name
        image {{
          url
          size
          mimeType
          mediaEncoding {{
            ... on ImageEncodingTypes {{
              large
              thumbnail
            }}
          }}
        }}
      }}
      sale {{
        saleType
        saleContractAddress
        buyerAddress
        sellerAddress
        networkInfo {{
          network
          chain
        }}
        transactionInfo {{
          blockTimestamp
          transactionHash
        }}
        price {{
          blockNumber
          nativePrice {{
            decimal
            currency {{
              name
            }}
          }}
          usdcPrice {{
            decimal
            currency {{
              name
            }}
          }}
        }}
      }}
    }}
    pageInfo {{
      endCursor
      hasNextPage
      limit
    }}
  }}
}}
""".format(contract_token_ids=contract_token_ids, limit=limit, after=after)
  return query_zora(query)

def query_mints(minter_address, contracts=[], limit=500, after=""):
  query = """
{{
  mints(sort: {{ sortKey: TIME, sortDirection: DESC }},
  pagination: {{ limit: {limit}, after: "{after}" }},
  where: {{ minterAddresses: "{minter_address}", collectionAddresses: {contracts} }}
  ) {{
    nodes {{
      token {{
        collectionAddress
        tokenId
        collectionName
        name
      }}
    }}
    pageInfo {{
      endCursor
      hasNextPage
      limit
    }}
  }}
}}
""".format(minter_address=minter_address, contracts=json.dumps(contracts), limit=limit, after=after)
  return query_zora(query)

def query_search(text, contracts=[], limit=50, after=""):
  query = """
{{
  search(query: {{ text: "{text}" }},
  pagination: {{ limit: {limit}, after: "{after}" }},
  filter: {{ collectionAddresses: {contracts} }}
  ) {{
    nodes {{
      entity {{
        ... on Token {{
          collectionAddress
          tokenId
          collectionName
          name
        }}
      }}
    }}
    pageInfo {{
      endCursor
      hasNextPage
      limit
    }}
  }}
}}
""".format(text=text, contracts=json.dumps(contracts), limit=limit, after=after)
  return query_zora(query)

def query_recursively(fn, key, data=[], after="", calls=1, limit=500, depth=50, wait=0.5, **kwargs):
  print("Fetching page {}".format(calls))
  x = fn(**kwargs, limit=limit, after=after)
  if x is not {}:
    data += x["data"][key]["nodes"]
    if x["data"][key]["pageInfo"]["hasNextPage"] and calls < depth:
      after = x["data"][key]["pageInfo"]["endCursor"]
      time.sleep(wait)
      query_recursively(fn, key, data, after, calls+1, limit, depth, **kwargs)
  return data

def get_sales(contract_token_ids, limit=500, depth=50, wait=0.5, outfile=False):
  return query_recursively(fn=query_sales, key="sales", limit=limit, wait=wait, depth=depth, contract_token_ids=contract_token_ids)

def get_mints(minter_address, contracts=[], limit=500, depth=50, wait=0.5, outfile=False):
  x = query_recursively(fn=query_mints, key="mints", limit=limit, depth=depth, wait=wait, minter_address=minter_address, contracts=contracts)
  return dfify(x, "token", outfile)

def get_search(text, contracts=[], limit=50, depth=50, wait=0.5, outfile=False):
  x = query_recursively(fn=query_search, key="search", limit=limit, depth=depth, wait=wait, text=text, contracts=contracts)
  return dfify(x, "entity", outfile)
