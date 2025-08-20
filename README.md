

# Demon Development Verify Bot
## https://discord.gg/tjwC5DkhJb
Demon Development Verify Bot, Discord sunucularınız için basit ve etkili bir CAPTCHA doğrulama sistemidir. Bu bot, sunucuya yeni katılan kullanıcıların bir CAPTCHA çözmesini isteyerek bot hesapları ve spam girişlerini engellemenize yardımcı olur.

## Özellikler

  - **Basit Doğrulama Sistemi:** Kullanıcıların belirli bir komut kullanarak CAPTCHA doğrulamasını başlatmasını sağlar.
  - **Rastgele CAPTCHA Metinleri:** Her doğrulama için rastgele, okunması zorlaştırılmış CAPTCHA metinleri oluşturur.
  - **Rol Yönetimi:** Doğrulama başarılı olduğunda, kullanıcıdan doğrulanmamış (`unverified`) rolünü kaldırır ve doğrulanmış (`verified`) rolünü ekler.
  - **Zaman Sınırı ve Deneme Hakkı:** Belirli bir süre içinde ve belirli sayıda deneme hakkı içinde doğrulamanın tamamlanmasını bekler.
  - **Ephemeral Yanıtlar:** Doğrulama mesajları ve uyarıları sadece ilgili kullanıcı tarafından görülebilecek şekilde gönderilir.
  - **Slash Komutu Entegrasyonu:** `discord.js` kütüphanesinin en son sürümüyle uyumlu olarak slash komutları (`/verify`) kullanır.

## Kurulum

### 1\. Dosyaları İndirme

Öncelikle bu botun kodlarını içeren dosyaları projenize ekleyin.

### 2\. Gerekli Kütüphaneleri Yükleme

Botun çalışması için gerekli olan Node.js kütüphanelerini yüklemek üzere terminal veya komut istemcisini açın ve projenizin ana dizininde aşağıdaki komutu çalıştırın:

```sh
npm install discord.js jimp
```

### 3\. Yapılandırma (`config.json`)

Projenizin ana dizininde `config.json` adında bir dosya oluşturun ve içine aşağıdaki bilgileri girin. Bu bilgileri kendi Discord uygulamanızdan ve sunucunuzdan almanız gerekir.

```json
{
  "token": "BOTUNUZUN_TOKENI_BURAYA",
  "clientId": "BOTUNUZUN_IDSI_BURAYA",
  "guildId": "SUNUCUNUZUN_IDSI_BURAYA",
  "verifiedRoleId": "DOGRULANMIS_ROLUNUN_IDSI_BURAYA",
  "unverifiedRoleId": "DOGRULANMAMIS_ROLUNUN_IDSI_BURAYA",
  "captchaLength": 5,
  "captchaTimeoutSec": 60,
  "maxAttempts": 3
}
```

  - `token`: Botunuzun Discord'dan aldığınız token'ı.
  - `clientId`: Botunuzun uygulama ID'si.
  - `guildId`: Botun kullanılacağı sunucunun ID'si.
  - `verifiedRoleId`: CAPTCHA doğrulamasını geçen kullanıcılara verilecek rolün ID'si.
  - `unverifiedRoleId`: Doğrulanmamış kullanıcıların sahip olduğu rolün ID'si. (Doğrulama başarılı olduğunda bu rol kullanıcıdan alınacaktır.)
  - `captchaLength`: CAPTCHA metninin kaç karakterden oluşacağı.
  - `captchaTimeoutSec`: Kullanıcının CAPTCHA'yı çözmesi için verilecek süre (saniye cinsinden).
  - `maxAttempts`: Kullanıcının kaç kez deneme hakkı olduğu.

### 4\. Slash Komutlarını Kaydetme

Botu ilk kez çalıştırdığınızda, `/verify` komutunun Discord'da görünmesi için bu komutu bir kez kaydetmeniz gerekir. Terminalde aşağıdaki komutu çalıştırın:

```sh
node index.js register
```

Bu komutun başarıyla tamamlanması, "Slash komutları kaydedildi." çıktısını verecektir. Artık normal şekilde botu çalıştırabilirsiniz.

### 5\. Botu Çalıştırma

Botu başlatmak için terminalde aşağıdaki komutu kullanın:

```sh
node index.js
```

Botunuz artık çevrimiçi olmalı ve `/verify` komutunu kullanarak doğrulama işlemini başlatmaya hazır olmalıdır.

## Kullanım

1.  Yeni bir kullanıcı sunucuya katıldığında, ona `unverifiedRoleId` ile belirtilen rolü otomatik olarak veren bir sisteminiz olduğundan emin olun.
2.  Kullanıcı, botun komutlarına erişebildiği herhangi bir metin kanalında `/verify` komutunu yazar.
3.  Bot, kullanıcıya bir CAPTCHA resmi ve metin girme isteğiyle özel bir mesaj gönderir.
4.  Kullanıcı doğru kodu girdiğinde, bot ona `verifiedRoleId` rolünü ekler ve `unverifiedRoleId` rolünü kaldırır.

5.  Yanlış girilen kodlar için kullanıcıya bir deneme hakkı daha verilir. Eğer zaman dolarsa veya tüm denemeler başarısız olursa, doğrulama işlemi iptal edilir.
