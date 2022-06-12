import React from "react"
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend} from "recharts"

export default class Visualization extends React.Component {
  render() {
    let colors = ["#EBF70C", "#0CEFF7", "#F70CD0", "#DB0437"]
    let groups = {}
    this.props.sales.map((i) => {
      let market = i.sale.saleType.split("_")[0]
      let data = {
        x: i.sale.price.blockNumber,
        y: i.sale.price.usdcPrice === null ? 0 : Math.round(i.sale.price.usdcPrice.decimal),
        z: i.sale.transactionInfo.blockTimestamp.split("T")[0]
      }
      groups[market] === undefined ? groups[market] = [data] : groups[market].push(data)
    })
    let scatter = Object.keys(groups).map((x, i) => (
      <Scatter key={x} name={x} data={groups[x]} fill={colors[i%colors.length]}/>
    ))
    return (
      <div>
        {scatter.length > 0 &&
        <ResponsiveContainer width={"100%"} height={400}>
          <ScatterChart margin={{top: 50, right: 50, bottom: 0, left: 50}}>
            <CartesianGrid strokeDasharray="2 2"/>
            <XAxis dataKey="x" name="block" type="number" tickSize={10} domain={["dataMin", "dataMax"]}/>
            <YAxis dataKey="y" name="price" scale="auto" unit=" usd" type="number" domain={[0, "dataMax"]} tickSize={10} tickFormatter={(x) => x.toLocaleString("en-US")} />
            <ZAxis dataKey="z" name="date"/>
            <Tooltip cursor={{strokeDasharray:"3 3"}}/>
            <Legend height={50} verticalAlign="top" iconSize={20} iconType="rect"/>
            {scatter}
          </ScatterChart>
        </ResponsiveContainer>
        }
      </div>
    )
  }
}
