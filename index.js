const { Client, Collection ,MessageEmbed} = require("discord.js");
const client = (global.client = new Client());
const settings = require("./src/configs/settings.json");
const Mongoose = require("mongoose");

client.commands = new Collection();
client.aliases = new Collection();
client.invites = new Collection();
client.cooldown = new Map();
client.ranks = [
{role: "903281185642397789",coin: 100000}
];
require("./src/handlers/commandHandler");
require("./src/handlers/eventHandler");
require("./src/handlers/mongoHandler");

client.on("ready",async () => {
    client.guilds.cache.get(settings.ServerID).fetchInvites().then(x => Invites.set(x.first().guild.id, x));
})

client.on('ready', () => {
    client.user.setActivity(`Created By Jalix.`);
   })

client
  .login(settings.token)
  
  .then(() => console.log("[BOT] Bot connected!"))
  .catch(() => console.log("[BOT] Bot can't connected!"));

  const InviteModel = require("./src/schemas/invite.js");
  
const Invites = new Collection();

client.on('inviteCreate', (invite) => {
    const GuildInvites = Invites.get(invite.guild.id);
    GuildInvites.set(invite.code, invite);
    Invites.set(invite.guild.id, GuildInvites);
});
client.on('inviteDelete', (invite) => {
    const GuildInvites = Invites.get(invite.guild.id);
    GuildInvites.delete(invite.code);
    Invites.set(invite.guild.id, GuildInvites);
});

client.on('guildMemberAdd', async (member) => {
    if (member.user.bot) return;
    const GuildInvites = (Invites.get(member.guild.id) || new Collection()).clone()
        , Guild = member.guild
        , Fake = Date.now() - member.user.createdTimestamp < settings.FakeDays ? true : false,
        EmojiTik = settings.EEmojiTik,
        EmojiHayir = settings.EmojiHayir
        , Channel = Guild.channels.cache.get(settings.InviteLog);

    Guild.fetchInvites().then(async invites => {
        const invite = invites.find(_i => GuildInvites.has(_i.code) && GuildInvites.get(_i.code).uses < _i.uses) || GuildInvites.find(_i => !invites.has(_i.code)) || Guild.vanityURLCode;
        Invites.set(Guild.id, invites);
        let successful = 0, content = `${member} sunucuya giriş yaptı.`;

        if (invite.inviter && invite.inviter.id !== member.id) {
            const InviterData = await InviteModel.findOne({ Id: invite.inviter.id }) || new InviteModel({ Id: invite.inviter.id });
            if (Fake) InviterData.Unsuccessful += 1;
            else successful = InviterData.Successful += 1;
            InviterData.Total += 1;
            InviterData.save();
            InviteModel.findOneAndUpdate({ Id: member.id }, { $set: { Inviter: invite.inviter.id, Fake: Fake } }, { upsert: true, setDefaultsOnInsert: true }).exec();
        }

        if (Channel) {
            if (invite === Guild.vanityURLCode) content = `${member} sunucuya özel urlyi kullanarak girdi!`;
            else if (invite.inviter.id === member.id) content = `${member} kendi daveti ile sunucuya giriş yaptı.`
            else content = `${member} katıldı! **Davet eden**: ${invite.inviter.tag} \`(${successful} davet)\` ${Fake ? `${EmojiHayir}` : `${EmojiTik}`}`;
            Channel.send(content);
        }

    }).catch(console.error);
});
client.on('guildMemberRemove', async (member) => {
    if (member.user.bot) return;
    let successful = 0, content = `${member} sunucudan ayrıldı.`;
    const MemberData = await InviteModel.findOne({ Id: member.id }) || {}
        , Channel = member.guild.channels.cache.get(settings.InviteLog);

    if (!MemberData && Channel) return Channel.send(content);

    const InviterData = await InviteModel.findOne({ Id: MemberData.Inviter }) || new InviteModel({ Id: MemberData.Inviter });

    if (MemberData.Fake === true && data.Inviter && InviterData.Unsuccessful > 0) InviterData.Unsuccessful -= 1;
    else if (MemberData.Inviter && InviterData.Successful > 0) InviterData.Successful -= 1;
    successful = InviterData.Successful
    InviterData.Total -= 1;
    InviterData.save();

    const InviterMember = member.guild.member(MemberData.Inviter);

    if (Channel) {
        content = `${member} sunucudan ayrıldı. ${InviterMember ? `**Davet eden**: ${InviterMember.user.tag} \`(${successful} davet)\`` : 'Davetçi bulunamadı!'}`;
        Channel.send(content);
    }
});

client.on('message', async (message) => {
    if (message.author.bot || (message.channel.type === 'dm' && !message.guild) || !message.content.startsWith(settings.prefix)) return;

    const embed = new MessageEmbed().setColor(message.member.displayHexColor);
    const args = message.content.slice(settings.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const EmojiTik = settings.EEmojiTik,
    EmojiHayir = settings.EmojiHayir;
    if (command === 'invite' || command === 'invites' || command === 'davetler' || command === 'davet') {
        const Member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const InviteData = await InviteModel.findOne({ Id: Member.id }) || { Total: 0, Successful: 0, Unsuccessful: 0 };
        if (InviteData.Total) {
            embed.setDescription(`${Member.id === message.author.id ? 'Senin' : `**${Member.user.tag}** sahip olduğun`} \`${InviteData.Total}\` davetin var. (\`${InviteData.Successful}\` Başarılı Davet, \`${InviteData.Unsuccessful}\` Başarısız Davet)`);
        } else {
            embed.setDescription(`${EmojiHayir} Kullanıcının verilerini bulamadım.`);
        }
        embed.setAuthor(Member.user.tag, Member.user.avatarURL({ dynamic: true }), `https://discord.com/users/${Member.id}`);
        message.channel.send(embed);
    }  else if (command === 'topinv' || command === 'topdavet' || command === 'davet-sıralama') {
        const InviteTop = await InviteModel.find({}).exec();
        if (!InviteTop || !InviteTop.length) return message.channel.send(embed.setDescription('Sunucunuzda davet yapan hiç üye yok.'));
        const liste = InviteTop.filter(x => x.Total !== 0 && x.Id).sort((x,y) => y.Total - x.Total).map((value,index)=> `**${index+1}.** <@${value.Id}> • \`${value.Total}\` davet (\`${value.Unsuccessful}\` başarısız, \`${value.Successful}\` başarılı)`)

        await message.channel.send(embed.setDescription(`${liste.slice(0, 10).join('\n')}`).setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true })));
    }
});

client.splitEmbedWithDesc = async function(description, author = false, footer = false, features = false) {
  let embedSize = parseInt(`${description.length/2048}`.split('.')[0])+1
  let embeds = new Array()
  for (var i = 0; i < embedSize; i++) {
    let desc = description.split("").splice(i*2048, (i+1)*2048)
    let x = new MessageEmbed().setDescription(desc.join(""))
    if (i == 0 && author) x.setAuthor(author.name, author.icon ? author.icon : null)
    if (i == embedSize-1 && footer) x.setFooter(footer.name, footer.icon ? footer.icon : null)
    if (i == embedSize-1 && features && features["setTimestamp"]) x.setTimestamp(features["setTimestamp"])
    if (features) {
      let keys = Object.keys(features)
      keys.forEach(key => {
        if (key == "setTimestamp") return
        let value = features[key]
        if (i !== 0 && key == 'setColor') x[key](value[0])
        else if (i == 0) {
          if(value.length == 2) x[key](value[0], value[1])
          else x[key](value[0])
        }
      })
    }
    embeds.push(x)
  }
  return embeds
};