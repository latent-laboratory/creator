import React from "react"

export default class Numbers extends React.Component {
  render() {
    let sales = this.props.sales
    let volume = sales.map((x) => x.sale.price.usdcPrice == null ? 0 : x.sale.price.usdcPrice.decimal)
    let data = {
      "Recent Sales" : sales.length,
      "Total Volume" : volume.length == 0 ? "N/A" : Math.round(volume.reduce((i, j) => i + j, 0)).toLocaleString("en-US")+" USD",
      "Top Sale" : volume.length == 0 ? "N/A" : Math.round(Math.max(...volume)).toLocaleString("en-US")+" USD",
      "Last Sale" : volume.length == 0 ? "N/A" : sales[0].sale.transactionInfo.blockTimestamp.split("T")[0]
    }
    let stats = Object.keys(data).map((i) => (
        <div key={i}>
          <div className="stats-key">
            {i}
          </div>
          <div className="stats-val">
            {data[i]}
          </div>
        </div>
      )
    )
    return (
      <div className="stats">
        {stats}
      </div>
    )
  }
}