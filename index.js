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
    let clientArr = []

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
                                if (client !== undefined) {
                                    clientArr.push(client);
                                    //client.propcahce.clid
                                }
                            })
                        }
                    })
                }
                setTimeout(() => { // Send the poke after a second to allow the promises to be fulfilled
                    let newArr = [...new Set(clientArr)]
                    let doSecondary = false;

                    // Check if the channel has secondary IDs
                    if (channel.secondaryID.length > 0) {
                        doSecondary = true;
                    }
                    for (let client in newArr) {
                        if (doSecondary){
                            if (newArr[client].propcache.clientServergroups.includes(channel.secondaryID[0])) {
                                teamspeak.clientPoke(newArr[client].propcache.clid, config.pokeMessage(clientRequest.propcache.clientNickname, channel.channelName))
                                numOfClients++;
                            }
                        }
                        else { 
                            teamspeak.clientPoke(newArr[client].propcache.clid, config.pokeMessage(clientRequest.propcache.clientNickname, channel.channelName))
                            numOfClients++;
                        }
                    }

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
