const Discord = require('discord.js');
const client = new Discord.Client();
const smartcast = require('vizio-smart-cast');
const tv = new smartcast('192.168.1.182'); // find your Vizio TV's IP and put it here
const fs = require('fs');
const config = require('./config.json');
const prefix = config[0].prefix;
var authCode = config[0].auth[0];
var deviceName;

client.once('ready', () => {
    console.log(`logged in as ${client.user.username}`);
    if (authCode !== undefined) {
        tv.pairing.useAuthToken(authCode);
        console.log('paired!');
    } 
    smartcast.discover(device => {
        console.log(device);
        deviceName = device.name;
        client.user.setActivity(`${device.name} - Model: ${device.model}`, { type: "LISTENING" });
    });
    tv.power.currentMode().then(data => {
        console.log(data);
    });
});

function isOwner(_id) {
    return _id === config[0].owner;
}

client.on('message', message => {
   if (client.user.bot) return;
});

// ping
client.on('message', async message => {
    if (message.content.startsWith(`${prefix}ping`)) {
        return message.channel.send(`latency is ${Date.now() - message.createdTimestamp}ms\nping is ${Math.round(client.ws.ping)}ms`);
    }
});

// pair
client.on('message', async message => {
    /*
        tv.pairing.initiate().then(response => {
            rl.question('Enter PIN:', answer => {
                tv.pairing.pair(answer).then(response => {
                    console.log(response.ITEM.AUTH_TOKEN);
                });
            });
        });
    */

   if (message.content.startsWith(`${prefix}pair`)) {
       console.log(authCode);
       if (authCode === undefined) {
            if (!isOwner(message.author.id)) return message.channel.send(`Only <@${config[0].owner}> can use this command.`);
            tv.pairing.initiate().then(response => {
                const filter = m => m.author.id === message.author.id;
                message.channel.awaitMessages(filter, {
                    max: 1,
                    time: 20000,
                }).then(async(collected) => {
                    if(!isNaN(parseInt(collected.first().content))) {
                        tv.pairing.pair(collected.first().content).then(response => {
                            let _config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

                            _config[0].auth.push(response.ITEM.AUTH_TOKEN);
                            fs.writeFile("./config.json", JSON.stringify(_config, null, 4), err => {
                                if (err) return console.log(err);
                            });

                            authCode = config[0].auth[0];
                            return message.channel.send('Paired!');
                        });
                    }
                
                    console.log('pin: ' + collected.first().content)
                });
            });
        } else {
            return message.reply('I am already paired!');
        }
    }
});

// power state
client.on('message', async message => {
    if (message.content.startsWith(`${prefix}state`)) {
        tv.power.currentMode().then(data => {
            if (data.ITEMS[0].VALUE === 1) {
                return message.channel.send(`\`${deviceName}\` is on!`);
            } else if (data.ITEMS[0].VALUE === 0) {
                return message.channel.send(`\`${deviceName}\` is off!`);
            }
        });
    }
});

// current tv input
client.on('message', async message => {
    if (message.content.startsWith(`${prefix}input`)) {
        tv.input.current().then(data => {
            return message.channel.send(`Input Value: **${data.ITEMS[0].VALUE}**`);
        });
    }
});

// volume control
client.on('message', async message => {
    if (message.content.startsWith(`${prefix}vol`)) {
        if (!isOwner(message.author.id)) return message.channel.send(`Only <@${config[0].owner}> can use this command.`);
        let args = message.content.replace(`${prefix}vol `, '');
        args = args.split(' ');

        if (args[0].toLowerCase() === 'up') {
            return tv.control.volume.up();
        } else if (args[0].toLowerCase() === 'down') {
            return tv.control.volume.down();
        } else if (args[0].toLowerCase() === 'set') {
            if (isNaN(parseInt(args[1])) === true) {
                return message.channel.send('You must choose between `[0 - 100]`')
            } else if (args.length === 2) {
                return tv.control.volume.set(parseInt(args[1]));
            }
        } else if (args[0].toLowerCase() === 'mute') {
            return tv.control.volume.toggleMute();
        }
    }
});

// power control
client.on('message', async message => {
    if (message.content.startsWith(`${prefix}power`)) {
        if (!isOwner(message.author.id)) return message.channel.send(`Only <@${config[0].owner}> can use this command.`);
        tv.control.power.toggle();
    }
});

// sleep timer
client.on('message', async message => {
    if (message.content.startsWith(`${prefix}sleep`)) {
        if (!isOwner(message.author.id)) return message.channel.send(`Only <@${config[0].owner}> can use this command.`);
        let _value;
        let args = message.content.replace(`${prefix}sleep `, '');
        args = args.split(' ');
        if (args.length === 1) {
            if (args[0] === 'off') {
                _value = 0;
            } else {
                _value = parseInt(args[0]);
            }
            tv.settings.timers.sleepTimer.set(_value)
            .then(data => console.log(data))
            .catch(err => message.channel.send('That wasn\'t a valid choice. Choices are:\n ```off = turns off sleep timer\n1 = 30 minutes\n2 = 60 minutes\n3 = 90 minutes\n4 = 120 minutes\n5 = 180 minutes```'))
        }
    }
});

client.login(config[0].token);
