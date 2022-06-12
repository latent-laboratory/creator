import React from "react"

export default class Header extends React.Component {
  render() {
    let stats = this.props.state.map((x) => (
      <div key={x}>{"$ "+x+"..."}<br/></div>
      )
    )
    return (
      <div className="banner">
        <div></div>
        <div>
          <div className="header">
            creator
          </div>
          <div className="subheader">
            built with <a href="https://docs.zora.co/" target="_blank" className="highlight">Zora</a>
          </div>
        </div>
        <div className="console">
          {stats}
        </div>
      </div>
    )
  }
}