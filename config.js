module.exports = {
    host: "127.0.0.1", // Server IP
    serverport: "10011", // Server Port
    username: "username", // Server Query Username
    password: "password", // Server Query Password
    nickname: "nickname", // Client Nickname
    virtualserverid: "1337", // Virtual Server ID
    pokeChannels: { // Channels in which to poke users
        /*
        pokeExample: {
            enabled: true, // Enable Poke
            channelName: "Requesting Staff", // Name of the channel for the poke message
            channelID: "000", // Channel to watch for new users
            groupIDs: ["000"], // Groups to Poke when user joins channel
            secondaryID: [] // Only poke if they are also in this group (such as different staff teams)
        },
        */
    },
    pokeRequestMessage: (numOfClients) => `${numOfClients} members are available to help you!`,
    pokeMessage: (clientNickname, channelName) => `${clientNickname} is ${channelName}!`,
    pokeMessageNone: "No members are available to help you at this time."
}
