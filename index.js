const {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
  AttachmentBuilder,
  Events
} = require('discord.js');

const Jimp = require('jimp');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

function randomString(length) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

async function generateCaptchaImage(text) {
  const width = 360;
  const height = 140;
  const image = new Jimp(width, height, 0xffffffff);

  const fontBig = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
  const fontSmall = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);

  for (let i = 0; i < 1000; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    const noise = Jimp.rgbaToInt(
      200 + Math.floor(Math.random() * 55),
      200 + Math.floor(Math.random() * 55),
      200 + Math.floor(Math.random() * 55),
      255
    );
    image.setPixelColor(noise, x, y);
  }

  for (let i = 0; i < 6; i++) {
    const x1 = Math.floor(Math.random() * width);
    const y1 = Math.floor(Math.random() * height);
    const x2 = Math.floor(Math.random() * width);
    const y2 = Math.floor(Math.random() * height);
    drawLine(image, x1, y1, x2, y2, 2, 0x333333ff);
  }

  const textWidth = Jimp.measureText(fontBig, text);
  const textHeight = Jimp.measureTextHeight(fontBig, text, width);
  const tx = (width - textWidth) / 2;
  const ty = (height - textHeight) / 2;
  image.print(fontBig, tx, ty, text);

  if (Math.random() > 0.5) image.blur(1);
  image.rotate(Math.random() * 8 - 4, false);
  image.print(fontSmall, 8, height - 24, 'Yapay zekâ tarafından oluşturuldu');

  return await image.getBufferAsync(Jimp.MIME_PNG);
}

function drawLine(img, x0, y0, x1, y1, thickness, color) {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0, y = y0;

  while (true) {
    for (let ox = -thickness; ox <= thickness; ox++) {
      for (let oy = -thickness; oy <= thickness; oy++) {
        const px = x + ox;
        const py = y + oy;
        if (px >= 0 && py >= 0 && px < img.bitmap.width && py < img.bitmap.height) {
          img.setPixelColor(color, px, py);
        }
      }
    }

    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
}


const commands = [
  new SlashCommandBuilder()
    .setName('verify')
    .setDescription('CAPTCHA doğrulamasını başlatır.')
].map(c => c.toJSON());

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(config.token);
  await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: commands }
  );
  console.log('✓ Slash komutları kaydedildi.');
}


client.once(Events.ClientReady, async (c) => {
  console.log(`✅ Giriş yapıldı: ${c.user.tag}`);


  try {
    await client.user.setPresence({
      activities: [{ name: 'DemonDev | Brem1n', type: 3 }], // 3 = WATCHING
      status: 'online'
    });
    console.log('✅ Bot durumu ayarlandı.');
  } catch (e) {
    console.error('Durum ayarlanamadı:', e);
  }

  if (process.argv.includes('register')) {
    try {
      await registerCommands();
      process.exit(0);
    } catch (e) {
      console.error('Slash komutları kaydedilemedi:', e);
      process.exit(1);
    }
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'verify') {
    const captchaText = randomString(config.captchaLength);
    const buffer = await generateCaptchaImage(captchaText);

    await interaction.reply({
      content: 'Lütfen CAPTCHA kodunu giriniz:',
      files: [new AttachmentBuilder(buffer, { name: 'captcha.png' })],
      ephemeral: true
    });

    const filter = m => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({ filter, time: config.captchaTimeoutSec * 1000, max: config.maxAttempts });

    collector.on('collect', async m => {
      if (m.content === captchaText) {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        await member.roles.remove(config.unverifiedRoleId).catch(console.error);
        await member.roles.add(config.verifiedRoleId).catch(console.error);

        await interaction.followUp({ content: '✅ Başarılı! Artık doğrulandınız.', ephemeral: true });
        collector.stop();
      } else {
        await interaction.followUp({ content: '❌ Kod yanlış, tekrar deneyin.', ephemeral: true });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.followUp({ content: '⌛ Zaman doldu, CAPTCHA iptal edildi.', ephemeral: true });
      }
    });
  }
});


client.login(config.token).catch((e) => {
  console.error('Login hatası:', e);
});
