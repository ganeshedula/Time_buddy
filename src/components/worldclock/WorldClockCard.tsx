import React, { Component } from "react";

import Clock from "react-clock";

import { TiDelete, TiStarOutline, TiStarFullOutline } from "react-icons/ti";

type Props = {
  Country: string;
  ISO: string;
  Timezone: string;
  Offset: string | number;
  removeClick: () => void;
  isStarred: boolean;
  toggleStar: () => void;
};

type State = {
  time: Date;
};

class WorldClock extends Component<Props, State> {
  intervalID: NodeJS.Timeout;

  state = {
    time: this.getCurrentTime(),
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      time: this.getCurrentTime(),
    };
    this.intervalID = setInterval(() => this.tick(), 1000);
  }

  componentDidMount() {
    fetch(`https://time.now/developer/api/timezone/${this.props.Timezone}`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.datetime) {
          this.setState({
            time: new Date(data.datetime),
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching time:", error);
      });
  }

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }

  getCurrentTime(): Date {
    let time = new Date();
    const offsetVal = typeof this.props.Offset === 'string' ? parseInt(this.props.Offset) : this.props.Offset;
    time.setMinutes(
      time.getMinutes() + time.getTimezoneOffset() + offsetVal
    );
    return time;
  }

  tick() {
    this.setState({
      time: this.getCurrentTime(),
    });
  }

  getOffsetString(): string {
    const offsetVal = typeof this.props.Offset === 'string' ? parseInt(this.props.Offset) : this.props.Offset;

    if (offsetVal === 0) return "Same time as Greenwich";

    const absOffset = Math.abs(offsetVal);
    const hours = Math.floor(absOffset / 60);
    const minutes = absOffset % 60;

    let timeParts = [];
    if (hours > 0) timeParts.push(`${hours} hrs`);
    if (minutes > 0) timeParts.push(`${minutes} mins`);

    const timeString = timeParts.join(' ');

    return `${timeString} ${offsetVal > 0 ? "ahead of" : "behind"} Greenwich`;
  }

  render() {
    return (
      <div className=" card flex flex-row w-full bg-slate-960 rounded-2xl m-2 text-center overflow-hidden transition-transform duration-300 ease-out">
        <div className="flex flex-col items-center justify-around font-montserrat bg-slate-965 p-1 w-4/12">
          <h3 className="flex items-center justify-center text-base m-0 uppercase">

            {this.props.Country}
          </h3>
          <h4 className="text-base font-normal m-0">{this.props.Timezone}</h4>
        </div>
        <div className="flex flex-col items-center justify-center w-6/12 py-4">
          <Clock value={this.state.time} className="clock" />
          <p className="mt-3">
            {this.state.time
              .toLocaleString()
              .substring(this.state.time.toLocaleString().indexOf(",") + 1)}
          </p>
          <p className="text-gray-400 text-xs font-mono mt-1">
            {this.getOffsetString()}
          </p>
        </div>
        <div className="w-2/12 flex flex-col justify-center items-center gap-2">
          <div
            onClick={this.props.toggleStar}
            className={`flex items-center justify-center w-fit text-2xl p-1 transition-all duration-200 ease-in overflow-hidden rounded-lg m-1 cursor-pointer hover:bg-white/10 ${this.props.isStarred ? 'text-yellow-400' : 'text-gray-400'}`}>
            {this.props.isStarred ? <TiStarFullOutline /> : <TiStarOutline />}
          </div>
          <div
            onClick={this.props.removeClick}
            className="flex items-center justify-center w-fit bg-red-200 text-white text-sm font-normal p-1 uppercase transition-all duration-200 ease-in overflow-hidden rounded-lg m-3 cursor-pointer hover:bg-red-250">
            <TiDelete className="block sm:hidden text-2xl" />
            <span className="hidden sm:block">Remove</span>
          </div>
        </div>
      </div>
    );
  }
}

export default WorldClock;
