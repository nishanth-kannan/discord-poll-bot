//wait till the bot goes live
console.log('Setting it up...')

const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = ";";
const {token} = require("./config.json");
// const token = process.env.BOT_TOKEN;
// const command_channel = process.env.BOT_COMMAND_CHANNEL;
// const target_channel = process.env.BOT_TARGET_CHANNEL;
const command_channel = "meme-submissions";
const target_channel = "submission-results";

client.login(token);

client.on('ready', () =>{
    //message pops up in terminal when bot goes live
    console.log('Bot is online!');
});

client.on('message', gotMessage);

 async function gotMessage(msg){  //async
    if (!(msg.channel.name === command_channel) || !msg.content.startsWith(prefix) || msg.author.bot){
        return;
    }

    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'submit'){
        //console.log(msg); //to see info of EVERY MESSAGE SENT in that channel
        const channel_bot = await msg.guild.channels.cache.find(ch => ch.name === target_channel);//this is probably where the problem is //await
        var poll_duration = 1; //change the duration of the poll here

        if (!msg.content){ 
            return;
        }

        if (msg.attachments.array().length == '0'){ //replies to user when there is no image attached to the message
            return msg.reply(`bruh\nWhere is the meme?`); 
        }
        
        //all the emoji reactions for the poll; More can be added 
        const validEmojis = ['❤', '💛', '🖤'];

        //checks is message has an attachment(image) and stores that attachment in the variable
        let msgAttachment = msg.attachments.size > 0 ? msg.attachments.array()[0].url : null; 
        if (msgAttachment){ //sends embed in a separate channel for voting purposes 
            msg.reply('Thank you for your submission. Your pp will now be measured by the mods.');
            let embed = new Discord.MessageEmbed()
                .setColor('#6600FF')
                .setTitle('Time to Vote Bois')
                .setDescription(`Submission from ${msg.author.username}\nVote away!`+'\n\n❤ is for Post\n💛 is for Story\n🖤 is for Neither\n' + `\nPoll will last for ${poll_duration} minute/minutes.\n`)
                .setImage(msgAttachment);
            await channel_bot.send(embed).then(async embedMessage => {  //await
                for (const emoji of validEmojis){ //asking bot to react to embed
                    await embedMessage.react(emoji); 
                }

                const responses = reaction => { //triggered if one or some (or all) of the valid emojis are triggered
                    return validEmojis.includes(reaction.emoji.name);
                };

                //code that did not work sadly
                // let redHeart = 0;
                // let yellowHeart = 0;
                // let blackHeart = 0;
                // const responses = (reaction) => {
                //     if (reaction.emoji.name === '❤'){
                //         redHeart++;
                //         console.log(reaction.users);
                //     } else if (reaction.emoji.name === '💛'){
                //         yellowHeart++;
                //         console.log(reaction.users); 
                //     } else if (reaction.emoji.name === '🖤'){
                //         blackHeart++;
                //         console.log(reaction.users);
                //     }
                //     return (reaction.emoji.name === '❤' || reaction.emoji.name === '💛' || reaction.emoji.name === '🖤'); 
                // };

                let vote_result = ""; //Decision made by the bot
                let votes = []; //number of votes for each category
                let uniqueUsersList = new Set();
                
                embedMessage.awaitReactions(responses, {time: (poll_duration*60000)})
                    .then(collected => {
                        
                        const reactionInfo = embedMessage.reactions.cache;

                        //console.log(embedMessage);

                        for (const emoji of validEmojis) {
                            const temp = reactionInfo.get(emoji); //making a list of each individual number of reactions
                            votes.push(temp.users.cache.size);

                            usersList = temp.users.cache.array(); //making a list of users who voted
                            for (const user of usersList) {
                                uniqueUsersList.add(user.id);
                            }
                        }

                        let redHeart = votes[0]; //number of votes for each individual reaction
                        let yellowHeart = votes[1];
                        let blackHeart = votes[2];

                        // console.log("emoji: ", validEmojis); //extra info for yourself(cause why not)
                        // console.log("votes: ", votes);
                        // console.log("No. of unique users: ", uniqueUsersList.size-1);

                        //Decision making part of the bot; Can probably be greatly improved upon
                        if ((redHeart > yellowHeart) && (redHeart > blackHeart)){
                            vote_result += "Post";
                        }else if (((yellowHeart > redHeart) && (yellowHeart > blackHeart)) || (redHeart == yellowHeart == blackHeart)){
                            vote_result += "Story";
                        }else if ((blackHeart > yellowHeart) && (blackheart > redHeart)){
                            vote_result += "Trash";
                        }

                        let vote_count_embed = new Discord.MessageEmbed()
                            .setColor('#99FF00')
                            .setTitle('Judgement Time has Ended')
                            .setDescription(`And the Judgement is ${vote_result} worthy`+`\n\n${uniqueUsersList.size - 1} people have responded.\n\n${redHeart - 1} votes for post.\n${yellowHeart - 1} votes for story.\n${blackHeart - 1} votes for trash.`) //has -1 everywhere because bot is counted as a user
                            .setImage(msgAttachment);
                        channel_bot.send(vote_count_embed)
                    })
                    .catch(collected => {
                        console.log('Some error popped up and you suck')//just a vague fail safe; atleast you'll know SOMETHING is wrong
                    });
            });
        }
    }
}
      
