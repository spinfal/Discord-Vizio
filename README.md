# Discord Vizio

A cool way to control your Vizio TV through Discord. I made this around 4am so there may be bugs.

## Getting Started

These instructions will get the bot running on your PC for testing purposes. This is in no way 100% ready for an actual full release (I may not ever do one)

### Prerequisites

You will need:
- [Node.JS](https://nodejs.org)

### Installing what's needed

You will need these installed:
```
npm i discord.js vizio-smart-cast
```

## Starting the Bot

1. Setup [config.json](config.json)
2. Open [index.js](index.js) and change the IP to your TV's IP
3. Run `node index.js`

## Using the bot

1. Make sure the TV is on and connected to the **same WiFi as your computer** (this means you cannot run on REPL or any other service)
2. Run the command `q.pair` and you should see a PIN on your TV (You will not get a response from the bot, just enter the PIN in the channel you ran the command in)
3. You are now paired! I haven't made a help command yet, because I stopped working on the bot. Here are the commands:
  - `q.ping` - Shows the bot ping and latency 
  - `q.pair` - Starts the pairing process
  - `q.state` - Returns the current TV state
  - `q.input` - Returns the current input
  - `q.vol` - Control the volume.
     - `q.vol up` - Increment up
     - `q.vol down` - Decrement down
     - `q.vol set <pick a number 0-100>` - Sets volume to chosen number
  - `q.power` - Turns off the TV (but not ON 😔)
  - `q.sleep` - Listed options will be shown when you run the command

## Authors

* **Spin (aka Spinfal)** - *Initial work* - [spinfal](https://github.com/spinfal)

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE.md](LICENSE.md) file for details
