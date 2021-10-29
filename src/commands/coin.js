const coin = require("../schemas/coin");
const conf = require("../configs/config.json");

module.exports = {
  conf: {
    aliases: [],
    name: "coin",
    help: "coin [ekle/sil/gönder] [kullanıcı] [sayı]"
  },

  run: async (client, message, args, embed, prefix) => {
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
    if (!member) return message.channel.send(embed.setDescription("Puan işlemi uygulamak için bir kullanıcı belirtmelisin!")).then(x => x.delete({timeout: 15000})).catch()

    if (args[0] === "ekle" || args[0] === "add" || args[0] === "Ekle" || args[0] ==="ver") {
      if (!message.member.hasPermission(8)) return;
      const count = parseInt(args[2]);
      if (!count) return message.channel.send(embed.setDescription("\`•\` Puan miktarı belirtmeyi unuttunuz.")).then(x => x.delete({timeout: 15000})).catch();
      if (!count < 0) return message.channel.send(embed.setDescription("\`•\` Ekleyeceğiniz puan miktarı __0__'dan büyük olmalı.")).then(x => x.delete({timeout: 15000})).catch();

      await coin.findOneAndUpdate({ guildID: message.guild.id, userID: member.user.id }, { $inc: { coin: count } }, { upsert: true });
      const coinData = await coin.findOne({ guildID: message.guild.id, userID: member.user.id });
      let addedRoles = "";
      if (coinData && client.ranks.some(x => coinData.coin >= x.coin && !member.roles.cache.has(x.role))) {
        const roles = client.ranks.filter(x => coinData.coin >= x.coin && !member.roles.cache.has(x.role));
        addedRoles = roles;
        member.roles.add(roles[roles.length-1].role);
        embed.setColor("GOLD");
      }
      message.channel.send(embed.setDescription(`\`•\` ${member.toString()} kullanıcısına **${count}**  puan eklendi. Yetkisi puanına göre otomatik ayarlandı!`).setTitle(`İşlem Başarılı!`));
    } else if (args[0] === "sil" || args[0] === "remove" || args[0] === "kaldır") {
      if (!message.member.hasPermission(8)) return;
      const count = parseInt(args[2]);
      if (!count) return message.channel.send(embed.setDescription("\`•\` Puan miktarı belirtmeyi unuttunuz.")).then(x => x.delete({timeout: 15000})).catch();
      if (!count < 0) return message.channel.send(embed.setDescription("\`•\ Kaldıracağınız puan miktarı **0**'dan büyük olmalı.")).then(x => x.delete({timeout: 15000})).catch();
      let coinData = await coin.findOne({ guildID: message.guild.id, userID: member.user.id });
      if (!coinData || coinData && count > coinData.coin) return message.channel.send(embed.setDescription(`\`•\` Kaldırmak istediğiniz puan miktarı , kullanıcının toplam puan miktarından fazla. Mevcut puanından daha az sayıda veya eşit miktarda çıkarabilirsiniz.`));

      await coin.findOneAndUpdate({ guildID: message.guild.id, userID: member.user.id }, { $inc: { coin: -count } }, { upsert: true });
      coinData = await coin.findOne({ guildID: message.guild.id, userID: member.user.id });
      let removedRoles = "";
      if (coinData && client.ranks.some(x => coinData.coin < x.coin && member.roles.cache.has(x.role))) {
        const roles = client.ranks.filter(x =>  coinData.coin < x.coin && member.roles.cache.has(x.role));
        removedRoles = roles;
        roles.forEach(x => {
          member.roles.remove(x.role)
        });
        embed.setColor("RANDOM");
      }
      message.channel.send(embed.setDescription(`\`•\` Belirttiğiniz Kullanıcıdan \`${count}\` puan **çıkarıldı**. Yetkisi puanına göre otomatik ayarlandı! `).setTitle(`İşlem Başarılı!`)).then(x => x.delete({timeout: 15000})).catch();
    }
  }
};
