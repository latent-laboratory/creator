import React from "react"
import { IconCurrencyEthereum, IconReportSearch } from "@tabler/icons"

export default class History extends React.Component {
  render() {
    let data = this.props.sales.flat().sort(function(x, y) {
      return(x.sale.price.blockNumber >= y.sale.price.blockNumber ? -1 : 1)
    })
    let rows = data.map((x, i) => (
      <tr key={i}>
        <td>
         <IconCurrencyEthereum size="21" color="#FF1254" stroke="2"/>
        </td>
        <td>{x.sale.price.blockNumber}</td>
        <td><img src={x.token.image === null ? null : x.token.image.mediaEncoding.thumbnail}/></td>
        <td>{x.token.name}</td>
        <td>{x.sale.price.nativePrice.decimal.toFixed(2)+" "+x.sale.price.nativePrice.currency.name}</td>
        <td>{x.sale.price.usdcPrice === null ? "N/A" : x.sale.price.usdcPrice.decimal.toFixed(2)+" USDC"}</td>
        <td><code>{x.sale.sellerAddress.substring(0, 12)}</code></td>
        <td><code>{x.sale.buyerAddress.substring(0, 12)}</code></td>
        <td>{x.sale.transactionInfo.blockTimestamp.split("T")[0]}</td>
        <td>
          <a href={"https://etherscan.io/tx/"+x.sale.transactionInfo.transactionHash} target="_blank" rel="noreferrer">
            <IconReportSearch size="21" color="#ADF70C" stroke="2"/>
          </a>
        </td>
      </tr>
    ))
    return (
      <div>
        {rows.length > 0 &&
          <table>
            <tbody>
              {rows}
            </tbody> 
          </table>
        }
      </div> 
    )
  }
}
