//import { Teamspeak, QueryProtocol } from "ts3-nodejs-library";
const { TeamSpeak } = require("ts3-nodejs-library")
const config = require("./config")

TeamSpeak.connect({
    host: config.host,
    serverport: config.serverport,
    username: config.username,
    password: config.password,
    nickname: config.nickname
}).then(async teamspeak => {
    // Connect to Virtual Server
    teamspeak.useBySid(config.virtualserverid);

    // Confirm Connections Information
    teamspeak.whoami().then(whoami => {
        console.log(whoami);
    })

    // Poke when user joins channel
    teamspeak.on("clientmoved", ev => {
        pokeGroup(ev.client, ev.channel, teamspeak)
    })

}).catch(err => {
    // Error
    console.log(err);
});


function pokeGroup(clientRequest, channelObj, teamspeak) {
    // Iterate through channels
    for (let channelName in config.pokeChannels) {
        let channel = config.pokeChannels[channelName];
        // Check to see if the channel is enabled
        if (channel.enabled) {
            // Match the channel ID with ones within the config
            if (channelObj.propcache.cid == channel.channelID) {
                let numOfClients = 0;
                // Iterate through the groups within the config
                for (let groupID in channel.groupIDs) {
                    // Get all the clients within that group (includes offline)
                    teamspeak.serverGroupClientList(channel.groupIDs[groupID]).then(clients => {
                        // Iterate through the clients
                        for (let i = 0; i < clients.length; i++) {
                            // Get the client ID from their Database ID
                            teamspeak.getClientByDbid(clients[i].cldbid).then(client => {
                                // Check to see if the client is online
                                if (client !== undefined) {
                                    // Pokes the client (management member)
                                    teamspeak.clientPoke(client.propcache.clid, config.pokeMessage(clientRequest.propcache.clientNickname, channel.channelName));
                                    numOfClients++;
                                }
                            })
                        }
                    })
                }
                setTimeout(() => { // Send the poke after a second to allow the promises to be fulfilled
                    if (numOfClients == 0) {
                        teamspeak.clientPoke(clientRequest.propcache.clid, config.pokeMessageNone);
                    } 
                    else {
                        teamspeak.clientPoke(clientRequest.propcache.clid, config.pokeRequestMessage(numOfClients));
                    }
                }, 1000);
            }

        }
    }
}
