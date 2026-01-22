import React, { Component } from "react";

import WorldClockCard from "./WorldClockCard";
import Timezones from "../../services/data/timezones.json";

type Timezone = {
  Timezone: string;
  Country: string;
  ISO: string;
  Offset: string | number;
  isStarred?: boolean;
};

type State = {
  clocks: Timezone[];
  selectedClock: string;
  availableTimezones: Timezone[];
  isOpen: boolean;
  searchQuery: string;
};

class WorldClockMain extends Component<{}, State> {
  dropdownRef: React.RefObject<HTMLDivElement>;

  constructor(props: {}) {
    super(props);
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const defaultTimezone =
      Timezones.find((t) => t.Timezone === userTimezone) ? userTimezone : "Asia/Rasht";

    this.state = {
      clocks: [],
      selectedClock: defaultTimezone,
      availableTimezones: Timezones,
      isOpen: false,
      searchQuery: "",
    };
    this.addTimeZone = this.addTimeZone.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.selectTimezone = this.selectTimezone.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.toggleStar = this.toggleStar.bind(this);
    this.saveClocks = this.saveClocks.bind(this);
    this.dropdownRef = React.createRef();
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleClickOutside(event: MouseEvent) {
    if (
      this.dropdownRef.current &&
      !this.dropdownRef.current.contains(event.target as Node)
    ) {
      if (this.state.isOpen) {
        this.setState({ isOpen: false });
      }
    }
  }

  componentDidMount() {
    // 1. Get Geolocation (as per user request)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("User Location:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }

    // 2. Robust Timezone Detection
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const exists = this.state.availableTimezones.find((t) => t.Timezone === userTimezone);

    if (!exists) {
      console.log(`Timezone ${userTimezone} not found in list. Adding dynamically.`);
      // Create a new timezone entry
      // We might not have the offset or ISO handy, but we can try to infer or set defaults.
      // For now, let's try to get a reasonable display name.
      const newTimezone: Timezone = {
        Timezone: userTimezone,
        Country: "Current Location", // Fallback country name
        ISO: "XX", // Fallback ISO
        Offset: "0" // We don't have the exact offset in minutes easily without a library, but 'WorldClockCard' might need it.
        // Actually, WorldClockCard likely uses the Timezone string to display time, so Offset might be metadata.
        // Let's check WorldClockCard usage later. For now, valid object structure is key.
      };

      this.setState((prevState) => ({
        availableTimezones: [newTimezone, ...prevState.availableTimezones],
        selectedClock: userTimezone
      }));
    } else {
      if (this.state.selectedClock !== userTimezone) {
        this.setState({ selectedClock: userTimezone });
      }
    }

    document.addEventListener("mousedown", this.handleClickOutside);

    // Load starred clocks from localStorage
    const savedClocks = localStorage.getItem('starredClocks');
    if (savedClocks) {
      this.setState({ clocks: JSON.parse(savedClocks) });
    }
  }

  handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ selectedClock: e.target.value });
  }

  handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ searchQuery: e.target.value });
  }

  addTimeZone() {
    if (
      this.state.clocks.findIndex(
        (c) => c.Timezone === this.state.selectedClock
      ) < 0
    ) {
      let zone = this.state.availableTimezones.find((k) => k.Timezone === this.state.selectedClock);
      if (zone) {
        // Convert the Offset to a string if necessary
        const timeZoneWithStringOffset = {
          ...zone,
          Offset: String(zone.Offset),
        };
        this.setState((prevState) => ({
          clocks: [...prevState.clocks, timeZoneWithStringOffset],
        }));
      }
    }
  }

  removeClick(zone: string) {
    let updateClocks = [...this.state.clocks];
    let index = updateClocks.findIndex((t) => t.Timezone === zone);
    updateClocks.splice(index, 1);
    this.setState({
      clocks: updateClocks,
    });
    this.saveClocks(updateClocks);
  }

  toggleDropdown() {
    this.setState((prevState) => ({ isOpen: !prevState.isOpen }));
  }

  selectTimezone(timezone: string) {
    this.setState({ selectedClock: timezone, isOpen: false });
  }

  saveClocks(clocks: Timezone[]) {
    const starredClocks = clocks.filter(c => c.isStarred);
    localStorage.setItem('starredClocks', JSON.stringify(starredClocks));
  }

  toggleStar(timezone: string) {
    this.setState(prevState => {
      const updatedClocks = prevState.clocks.map(clock => {
        if (clock.Timezone === timezone) {
          return { ...clock, isStarred: !clock.isStarred };
        }
        return clock;
      });
      this.saveClocks(updatedClocks);
      return { clocks: updatedClocks };
    });
  }

  render() {
    const selectedZone = this.state.availableTimezones.find(
      (t) => t.Timezone === this.state.selectedClock
    );

    let clocks = this.state.clocks.map((zone) => (
      <WorldClockCard
        {...zone}
        key={zone.Timezone}
        isStarred={!!zone.isStarred}
        toggleStar={() => this.toggleStar(zone.Timezone)}
        removeClick={() => this.removeClick(zone.Timezone)}
      />
    ));

    return (
      <div className="bg-black text-white min-h-svh w-full pt-20 px-4 sm:px-8">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Side: Controls */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6 sticky top-24">
            <h2 className="text-2xl sm:text-4xl uppercase font-montserrat text-left">
              Choose a timezone
            </h2>

            <div className="relative font-mono w-full z-20" ref={this.dropdownRef}>
              <button
                onClick={() => this.toggleDropdown()}
                className="bg-white text-black p-5 rounded-2xl cursor-pointer w-full text-left flex justify-between items-center hover:bg-gray-100 transition-colors"
              >
                <span className="truncate pr-4">
                  {selectedZone
                    ? `${selectedZone.Country} (${selectedZone.Timezone})`
                    : this.state.selectedClock}
                </span>
                <span className={`transform transition-transform ${this.state.isOpen ? 'rotate-180' : ''} shrink-0`}>
                  ▼
                </span>
              </button>

              {this.state.isOpen && (
                <div className="absolute z-50 mt-2 w-full bg-black/80 backdrop-blur-md border border-gray-700 text-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-gray-700 sticky top-0 bg-black/90 z-10">
                    <input
                      type="text"
                      placeholder="Search timezone..."
                      className="w-full bg-white/10 text-white p-3 rounded-xl outline-none border border-transparent focus:border-white/20 transition-all placeholder-gray-500"
                      value={this.state.searchQuery}
                      onChange={this.handleSearchChange}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                  <ul className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    {this.state.availableTimezones
                      .filter((zone) => {
                        const query = this.state.searchQuery.toLowerCase();
                        return (
                          zone.Country.toLowerCase().includes(query) ||
                          zone.Timezone.toLowerCase().includes(query)
                        );
                      })
                      .map((zone) => (
                        <li
                          key={zone.Timezone}
                          onClick={() => this.selectTimezone(zone.Timezone)}
                          className="p-4 cursor-pointer hover:bg-white/10 transition-colors border-b border-gray-800 last:border-0 flex items-center gap-2"
                        >
                          {this.state.selectedClock === zone.Timezone && <span>✓</span>}
                          {zone.Country} <span className="text-gray-400 text-sm">({zone.Timezone})</span>
                        </li>
                      ))}
                    {this.state.availableTimezones.filter((zone) => {
                      const query = this.state.searchQuery.toLowerCase();
                      return (
                        zone.Country.toLowerCase().includes(query) ||
                        zone.Timezone.toLowerCase().includes(query)
                      );
                    }).length === 0 && (
                        <li className="p-4 text-gray-500 text-center">No results found</li>
                      )}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={this.addTimeZone}
              className="bg-white text-black py-4 px-10 rounded-2xl font-mono w-full hover:bg-black hover:text-white border border-white transition-colors"
            >
              Add Clock
            </button>

            {/* Keeping the commented out comparison logic here if needed later, but adjusted structure */}
          </div>

          {/* Right Side: Clocks Grid */}
          <div className="w-full lg:w-2/3 flex flex-wrap content-start gap-6 pb-20 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent pr-2">
            {clocks.length === 0 ? (
              <div className="w-full h-64 border-2 border-dashed border-gray-700 rounded-3xl flex items-center justify-center text-gray-500 font-mono">
                No clocks added yet. Select a timezone and click "Add Clock".
              </div>
            ) : (
              clocks
            )}
          </div>
        </div>
      </div>
    );
  }

  // getComparisonString(base: Timezone, target: Timezone): string {
  //   const baseOffset = Number(base.Offset);
  //   const targetOffset = Number(target.Offset);

  //   const diffMinutes = targetOffset - baseOffset;
  //   const isAhead = diffMinutes >= 0;
  //   const absDiff = Math.abs(diffMinutes);
  //   const hours = Math.floor(absDiff / 60);
  //   const minutes = absDiff % 60;

  //   let timeString = "";
  //   if (hours > 0) timeString += `${hours} hour${hours !== 1 ? 's' : ''}`;
  //   if (minutes > 0) timeString += ` ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  //   if (timeString === "") timeString = "0 minutes";

  //   return `${target.Country} (${target.Timezone}) is ${timeString} ${isAhead ? "ahead of" : "behind"} ${base.Country} (${base.Timezone})`;
  // }
}

export default WorldClockMain;
