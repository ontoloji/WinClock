# WinClock

Windows 11 icin gelistirilmis, yalnizca saat ve tarih gosteren seffaf masaustu saat uygulamasi.

## Ozellikler

- Yalnizca saat ve tarih gorunur.
- Saat/tarih disindaki alanlar tamamen seffaftir.
- Masaustunde istediginiz konuma tasiyip sabitleyebilirsiniz.
- System tray'de calisir.
- Windows acildiginda otomatik baslatilabilir.
- Tray menuden click-through acilarak saatin uzerine tiklanamaz hale getirilebilir.
- Boyut (olcek) degistirilebilir.
- Renk degistirilebilir.
- Disaridan font dosyasi (`.ttf`, `.otf`, `.woff`, `.woff2`) yuklenebilir.
- Vektor tabanli metin render edildigi icin olcek degisince kalite bozulmaz.

## Kurulum

```bash
npm install
```

## Calistirma

```bash
npm start
```

Terminali kapattiginizda uygulama da kapaniyorsa su komutu kullanin:

```bash
npm run start:detached
```

Bu komut uygulamayi terminalden bagimsiz baslatir.

## Kullanim

- Saat penceresi: seffaf ve kenarliksiz gorunum.
- Ayarlar penceresi: tray menudeki `Ayarlar` seceneginden acilir.
- Tray secenekleri:
	- Saati goster/gizle
	- Click-through ac/kapat
	- Konumu kilitle/ac
	- Windows ile baslat ac/kapat
	- Cikis
- Saat penceresinde `Ctrl + Mouse Wheel` ile hizli olcek degistirebilirsiniz.

## Windows Build

```bash
npm run build
```

Build sonrasinda `dist/` altinda Windows kurulum ciktilari olusur.