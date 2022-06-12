import React from "react"
import { data } from "../data/data.js"
import { get_sales } from "../utils/zora.js"
import Header from "./Header"
import Numbers from "./Numbers"
import Visualization from "./Visualization"
import History from "./History"

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      status : ["Zora API Demo"], 
      sales : []
    }
    this.update_sales = this.update_sales.bind(this) 
  }
  update_sales() {
    this.setState({
      status: this.state.status.concat("Fetching sales historical data")
    })
    get_sales(data).then((x) => {
      this.setState({
        sales: x,
        status: this.state.status.concat("Computing summary statistics")
      })
    })
  }
  componentDidMount() {
    this.update_sales()
  }
  render() {
    return (
      <div>
        <Header state={this.state.status}/>
        <Numbers sales={this.state.sales}/>
        <Visualization sales={this.state.sales}/>
        <History sales={this.state.sales}/>
      </div>
    )
  }
}