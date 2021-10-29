const moment = require("moment");
require("moment-duration-format");
const messageGuild = require("../schemas/messageGuild");
const messageGuildChannel = require("../schemas/messageGuildChannel");
const voiceGuild = require("../schemas/voiceGuild");
const voiceGuildChannel = require("../schemas/voiceGuildChannel");
const messageUser = require("../schemas/messageUser");
const voiceUser = require("../schemas/voiceUser");
const coin = require("../schemas/coin");
const InviteData = require("../schemas/invite.js");

module.exports = {
  conf: {
    aliases: [],
    name: "top",
    help: "top"
  },
  
  run: async (client, message, args, embed) => {
    const messageChannelData = await messageGuildChannel.find({ guildID: message.guild.id }).sort({ channelData: -1 });
    const voiceChannelData = await voiceGuildChannel.find({ guildID: message.guild.id }).sort({ channelData: -1 });
    const messageUsersData = await messageUser.find({ guildID: message.guild.id }).sort({ topStat: -1 });
    const voiceUsersData = await voiceUser.find({ guildID: message.guild.id }).sort({ topStat: -1 });
    const messageGuildData = await messageGuild.findOne({ guildID: message.guild.id });
    const voiceGuildData = await voiceGuild.findOne({ guildID: message.guild.id });
    const coinData = await coin.find({ guildID: message.guild.id }).sort({ coin: -1 });
    const InviteTop = await InviteData.find({}).exec()
    const liste1 = InviteTop.filter(x => x.Total !== 0 && x.Id).sort((x,y) => y.Total - x.Total).map((value,index)=> `**${index+1}.** <@${value.Id}> • \`${value.Total}\` davet`)
    const sonInv = liste1.splice(0, 5).join("\n")    
    let coinSum = 0;



    const messageChannels = messageChannelData.splice(0, 5).map((x, index) => `\`${index+1}.\` <#${x.channelID}>: \`${Number(x.channelData).toLocaleString()} mesaj\``).join(`\n`);
    const voiceChannels = voiceChannelData.splice(0, 5).map((x, index) => `\`${index+1}.\` <#${x.channelID}>: \`${moment.duration(x.channelData).format("H [saat], m [dakika] s [saniye]")}\``).join(`\n`);
    const messageUsers = messageUsersData.splice(0, 5).map((x, index) => `\`${index+1}.\` <@${x.userID}>: \`${Number(x.topStat).toLocaleString()} mesaj\``).join(`\n`);
    const voiceUsers = voiceUsersData.splice(0, 5).map((x, index) => `\`${index+1}.\` <@${x.userID}>: \`${moment.duration(x.topStat).format("H [saat], m [dakika] s [saniye]")}\``).join(`\n`);
    const coinUsers = coinData.splice(0, 5).map((x, index) => {
      coinSum += x.coin;
      return `\`${index+1}.\` <@${x.userID}>: \`${Number(x.coin).toLocaleString()} Puan\``
    }).join(`\n`);

    embed.setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true, size: 2048 }))
    embed.setThumbnail(message.guild.iconURL({ dynamic: true, size: 2048 }))
    embed.setColor("GOLD")
    embed.setDescription(`__**Sunucudaki TOP Sıralamaları:**__\n\n**❯ Sunucudaki Toplam Ses Süresi:** \`${moment.duration(voiceGuildData ? voiceGuildData.topStat : 0).format("H [saat], m [dakika] s [saniye]")}\`\n**❯ Sunucudaki Toplam Mesaj Sayısı:** \`${Number(messageGuildData ? messageGuildData.topStat : 0).toLocaleString()}\`\n**❯ Sunucudaki Toplam Puan Miktarı:** \`${coinSum}\``)
    embed.addField(`__Top Ses Sıralaması__:`,`${voiceUsers.length > 0 ? voiceUsers : "Veri bulunamadı!"}`)
    embed.addField(`__Top Ses Kanal Sıralaması__:`,`${voiceChannels.length > 0 ? voiceChannels : "Veri bulunamadı!"}`)
    embed.addField(`__Top Mesaj Kanal Sıralaması__:`,`${messageChannels.length > 0 ? messageChannels : "Veri bulunamadı."}`)
    embed.addField(`__Top Puan Sıralaması__:`,`${coinUsers.length > 0 ? coinUsers : "Veri bulunamadı."}`)
    embed.addField(`__Top Davet Sıralaması__:`,`${sonInv || "Davet Bulunamadı!"}`)
  

    message.channel.send(embed).catch(err => console.log(err));
  }
};