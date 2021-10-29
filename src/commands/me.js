const moment = require("moment");
require("moment-duration-format");
const conf = require("../configs/config.json");
const messageUserChannel = require("../schemas/messageUserChannel");
const voiceUserChannel = require("../schemas/voiceUserChannel");
const messageUser = require("../schemas/messageUser");
const voiceUser = require("../schemas/voiceUser");
const voiceUserParent = require("../schemas/voiceUserParent");
const coin = require("../schemas/coin");
const InviteData = require("../schemas/invite")
const taggeds = require("../schemas/taggeds");
module.exports = {
  conf: {
    aliases: [],
    name: "me",
    help: "me"
  },

  run: async (client, message, args, embed) => {
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;

    const category = async (parentsArray) => {
      const data = await voiceUserParent.find({ guildID: message.guild.id, userID: message.author.id });
      const voiceUserParentData = data.filter((x) => parentsArray.includes(x.parentID));
      let voiceStat = 0;
      for (var i = 0; i <= voiceUserParentData.length; i++) {
        voiceStat += voiceUserParentData[i] ? voiceUserParentData[i].parentData : 0;
      }
      return moment.duration(voiceStat).format("H [saat], m [dakika] s [saniye]");
    };
    
    const Active1 = await messageUserChannel.find({ guildID: message.guild.id, userID: message.author.id }).sort({ channelData: -1 });
    const Active2 = await voiceUserChannel.find({ guildID: message.guild.id, userID: message.author.id }).sort({ channelData: -1 });
    const voiceLength = Active2 ? Active2.length : 0;
    let voiceTop;
    let messageTop;
    Active1.length > 0 ? messageTop = Active1.splice(0, 5).map((x,i) => `\`${i+1}.\` <#${x.channelID}>: \`${Number(x.channelData).toLocaleString()} mesaj\``).join("\n") : messageTop = "Herhangi bir mesaj verisi bulamadım."
    Active2.length > 0 ? voiceTop = Active2.splice(0, 5).map((x,i) => `\`${i+1}.\`  <#${x.channelID}>: \`${moment.duration(x.channelData).format("H [saat], m [dakika] s [saniye]")}\``).join("\n") : voiceTop = "Herhangi bir ses verisi bulamadım."
    
    const messageData = await messageUser.findOne({ guildID: message.guild.id, userID: message.author.id });
    const voiceData = await voiceUser.findOne({ guildID: message.guild.id, userID: message.author.id });

    const messageDaily = messageData ? messageData.dailyStat : 0;
    const messageWeekly = messageData ? messageData.weeklyStat : 0;

    const voiceDaily = moment.duration(voiceData ? voiceData.dailyStat : 0).format("H [saat], m [dakika] s [saniye]");
    const voiceWeekly = moment.duration(voiceData ? voiceData.weeklyStat : 0).format("H [saat], m [dakika] s [saniye]");
    
    const coinData = await coin.findOne({ guildID: message.guild.id, userID: message.author.id });

    const filteredParents = message.guild.channels.cache.filter((x) =>
      x.type === "category" &&
      !conf.publicParents.includes(x.id) &&
      !conf.registerParents.includes(x.id) &&
      !conf.solvingParents.includes(x.id) &&
      !conf.privateParents.includes(x.id) &&
      !conf.aloneParents.includes(x.id) &&
      !conf.funParents.includes(x.id)
    );

    const maxValue = client.ranks[client.ranks.indexOf(client.ranks.find(x => x.coin >= (coinData ? coinData.coin : 0)))] || client.ranks[client.ranks.length-1];
    const taggedData = await taggeds.findOne({ guildID: message.guild.id, userID: member.id});
    
    let currentRank = client.ranks.filter(x => (coinData ? coinData.coin : 0) >= x.coin);
    currentRank = currentRank[currentRank.length-1];

    const kayitData = await coin.findOne({guildID: message.guild.id, userID:member.id});
    const data = await InviteData.findOne({ guildID: message.guild.id, inviter: member.id })

    const coinStatus = conf.staffs.some(x => message.member.roles.cache.has(x)) && client.ranks.length > 0 ?
    `
    ${progressBar(coinData ? coinData.coin : 0, maxValue.coin, 8)} \`${coinData ? coinData.coin : 0} / ${maxValue.coin}\`
    ${currentRank ? ` 
    ${currentRank !== client.ranks[client.ranks.length-1] ? `Şu an ${Array.isArray(currentRank.role) ? currentRank.role.map(x => `<@&${x}>`).join(", ") : `<@&${currentRank.role}>`} rolündesiniz. ${Array.isArray(maxValue.role) ? maxValue.role.length > 1 ? maxValue.role.slice(0, -1).map(x => `<@&${x}>`).join(', ') + ' ve ' + maxValue.role.map(x => `<@&${x}>`).slice(-1) : maxValue.role.map(x => `<@&${x}>`).join("") : `<@&${maxValue.role}>`} rolüne ulaşmak için \`${maxValue.coin-coinData.coin}\` Puan daha kazanmanız gerekiyor!` : "Şu an son yetkidesiniz! Emekleriniz için teşekkür ederiz."}` : `
    ${Array.isArray(maxValue.role) ? maxValue.role.length > 1 ? maxValue.role.slice(0, -1).map(x => `<@&${x}>`).join(', ') + ' ve ' + maxValue.role.map(x => `<@&${x}>`).slice(-1) : maxValue.role.map(x => `<@&${x}>`).join("") : `${message.member.roles.highest} Şuanda Rolündesin , <@&${maxValue.role}>`} rolüne ulaşmak için \`${maxValue.coin - (coinData ? coinData.coin : 0)}\` Puan daha kazanmanız gerekiyor!`}` : "";
    embed.setColor("RANDOM")
    embed.setThumbnail(message.author.avatarURL({ dynamic: true, size: 2048 }))
    embed.setDescription(`${message.author.toString()} kullanıcısının yetki yükseltim bilgileri aşağıda belirtilmiştir.`)
    embed.addField(`Bilgileri:`,
    `${conf.emojis.noktaemoji} Toplam Puan: \`${coinData ? coinData.coin : 0}\`
    ${conf.emojis.noktaemoji}  Toplam Sesli Kanal: \`${voiceLength} (${voiceLength ? voiceLength:0} Puan)\``)
    embed.addField(`Ses Bilgileri:`,
    `${conf.emojis.noktaemoji} Public Odaları: \`${await category(conf.publicParents)} (${coinData ? coinData.public : 0} Puan)\`
    ${conf.emojis.noktaemoji}  Secret Odaları: \`${await category(conf.privateParents)} (${coinData ? coinData.secret : 0} Puan)\`
    ${conf.emojis.noktaemoji}  Alone Odaları: \`${await category(conf.aloneParents)} (${coinData ? coinData.alone : 0} Puan)\`
    ${conf.emojis.noktaemoji}  Kayıt Odaları: \`${await category(conf.registerParents)} (${coinData ? coinData.kayıt : 0} Puan)\`
    ${conf.emojis.noktaemoji}  Oyun Odaları:  \`${await category(conf.funParents)} (${coinData ? coinData.oyun : 0} Puan)\`
    ${conf.emojis.noktaemoji}  Diğer Odalar: \`${await category(filteredParents.map(x => x.id))} (${coinData ? coinData.diğer : 0} Puan)\` 
    ─────────────────────`)
    embed.addField(`Mesaj Bilgileri:`,
    `${conf.emojis.noktaemoji} Genel Mesaj: \`${messageData ? messageData.topStat : 0} mesaj (${messageData ? messageData.topStat : 0} Puan)\`
    ${conf.emojis.noktaemoji} Haftalık Mesaj: \`${Number(messageWeekly).toLocaleString()} mesaj (${messageData ? messageData.weeklyStat : 0} Puan)\`
    ─────────────────────`)
    embed.addField(`Görev Bilgileri:`,
    `${conf.emojis.noktaemoji} Taglı Üye: ${taggedData ? taggedData.sayi : "0"}
    ${conf.emojis.noktaemoji} Davet: ${data ? data.userID : 0}
    ${conf.emojis.noktaemoji} Kayıt: ${kayitData ? kayitData.erkekUye + kayitData.kadinUye : "0"}`)
    embed.addField(`Yetkili Durumu`,
    `${coinStatus}
    ─────────────────────`)

    message.channel.send(embed);
  }

};

function progressBar(value, maxValue, size) {
const progress = Math.round(size * ((value / maxValue) > 1 ? 1 : (value / maxValue)));
const emptyProgress = size - progress > 0 ? size - progress : 0;

const progressText = conf.emojis.fill.repeat(progress);
const emptyProgressText = conf.emojis.empty.repeat(emptyProgress);

return emptyProgress > 0 ? conf.emojis.fillStart+progressText+emptyProgressText+conf.emojis.emptyEnd : conf.emojis.fillStart+progressText+emptyProgressText+conf.emojis.fillEnd;
};
