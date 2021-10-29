const coin = require("../schemas/coin");
const taggeds = require("../schemas/taggeds");
const conf = require("../configs/config.json");

module.exports = {
  conf: {
    aliases: ["tag-aldır", "taglıaldır"],
    name: "tagaldır",
    help: "tagaldır @Jalix/ID"
  },

  run: async (client, message, args, embed) => {
    if (!conf.staffs.some(x => message.member.roles.cache.has(x))) return;
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) return message.channel.send(embed.setDescription("Tag Aldığını Belirtmek için geçerli bir üye belirtmelisin"));
    if (!member.user.username.includes(conf.tag)) return message.channel.send(embed.setDescription(`Belirttiğiniz kişinin isminde **${conf.tag}** sembolü bulunmuyor `));
    const taggedData = await taggeds.findOne({ guildID: message.guild.id, userID: message.author.id });
    if (taggedData && taggedData.taggeds.includes(member.user.id)) return message.channel.send(embed.setDescription("Bu kişiyi daha önce zaten taglı olarak belirtmişsin!"));

    embed.setDescription(`${message.member.toString()} üyesi sana tag aldırmak istiyor, kabul ediyor musun?`);
    const msg = await message.channel.send(member.toString(), { embed });
    msg.react("✅");
    msg.react("❌");

    msg.awaitReactions((reaction, user) => ["✅", "❌"].includes(reaction.emoji.name) && user.id === member.user.id, {
      max: 1,
      time: 30000,
      errors: ['time']
    }).then(async collected => {
      const reaction = collected.first();
      if (reaction.emoji.name === '✅') {
        await coin.findOneAndUpdate({ guildID: member.guild.id, userID: message.author.id }, { $inc: { coin: conf.taggedCoin } }, { upsert: true });
        embed.setColor("RANDOM");
        msg.edit(embed.setDescription(`${member.toString()} üyesi başarıyla taglı olarak belirtildi!`));
        await taggeds.findOneAndUpdate({ guildID: message.guild.id, userID: message.author.id }, { $push: { taggeds: member.user.id} }, { upsert: true });
        await taggeds.findOneAndUpdate({ guildID: member.guild.id, userID: message.author.id }, { $inc: { sayi:1} }, { upsert: true });
    
      } else {
        embed.setColor("RANDOM");
        msg.edit(embed.setDescription(`${member.toString()} üyesi taglı teklifinizi reddetti`));
      }
    }).catch(() => msg.edit(embed.setDescription("30 saniye içinde herhangi bir emojiye basılmadığı için işlem iptal edildi!")));
  }
}
/* await taggedData.findOne({guildID: message.guild.id,userID: message.author.id},async function(err,res){
      if(!res){
        new taggedData({guildID: message.guild.id, userID:message.author.id, sayi:1}).save();
      }else {

        res.sayi = 1
        res.save();
      }

      }) */