function stringify(x) {
  return x.map(y => {
    return `{address: "${y.address}", tokenId: "${y.tokenId}"}`
  }).toString()
}

async function query_zora(query) {
  const response = await fetch("https://api.zora.co/graphql", {
    method: "post",
    headers: { "Content-Type": "application/json"},
    body: JSON.stringify({ query })
  })
  const result = await response.json()
  if (result.errors) {
    console.log(result.errors[0].message)
    return null
  } else {
    return result.data
  }
}

async function query_sales(contract_token_ids, limit=10, after="") {
  let { sales } = await query_zora(
`{
  sales(pagination: { limit: ${limit}, after: "${after}" },
  sort: { sortKey: TIME, sortDirection: DESC }, 
  where: { tokens: [${stringify(contract_token_ids)}] }
  ) {
    nodes {
      token {
        collectionAddress
        collectionName
        owner
        tokenId
        name
        image {
          url
          size
          mimeType
          mediaEncoding {
            ... on ImageEncodingTypes {
              large
              thumbnail
            }
          }
        }
      }
      sale {
        saleType
        saleContractAddress
        buyerAddress
        sellerAddress
        networkInfo {
          network
          chain
        }
        transactionInfo {
          blockTimestamp
          transactionHash
        }
        price {
          blockNumber
          nativePrice {
            decimal
            currency {
              name
            }
          }
          usdcPrice {
            decimal
            currency {
              name
            }
          }
        }
      }
    }
    pageInfo {
      endCursor
      hasNextPage
      limit
    }
  }
}`)
  return sales
}

export async function get_sales(contract_token_ids, limit=500, depth=5, data=[], after="", calls=1) {
  return query_sales(contract_token_ids, limit=limit, after=after).then(x => {
    data = data.concat(x.nodes)
    if (x.pageInfo.hasNextPage && calls < depth) {
      return get_sales(contract_token_ids, limit=limit, depth=depth, data=data, after=x.pageInfo.endCursor, calls=calls+1)
    } else {
      return data
    }
  })
}
