# BookMe

BookMe je React Native / Expo aplikacija za rezervisanje termina u salonima lepote, frizerskim salonima, nail salonima i spa centrima. Aplikacija podrzava tri role korisnika: obican korisnik, vlasnik salona i administrator.

Korisnik moze da pretrazuje aktivne i odobrene salone, sortira ih po blizini, dodaje salone u favorite, otvori detalje salona, izabere uslugu, datum i termin, kreira booking i pregleda ili otkaze svoje rezervacije.

Owner moze da pregleda svoje salone, kreira novi salon, menja podatke salona, bira lokaciju na mapi, dodaje sliku iz galerije, menja radno vreme, aktivira/deaktivira salon i upravlja servisima salona. Owner ima i Reminders stranicu sa buducim booking-ima grupisanim po salonu.

Administrator ima pregled korisnika i salona, moze da odobri salone i ima Statistics stranicu sa pregledom booking-a, korisnika, salona i gross zarade.

## Tehnologije

- React Native
- Expo SDK 54
- Expo Router
- TypeScript
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- AsyncStorage za cuvanje auth sesije
- react-native-maps
- expo-location
- expo-image-picker
- expo-haptics
- expo-audio

## Glavne funkcionalnosti

- Registracija korisnika uz izbor role: `user` ili `owner`
- Login preko Firebase email/password autentifikacije
- Cuvanje korisnicke sesije
- Role-based navigacija za `admin`, `owner` i `user`
- CRUD nad salonima i servisima
- Kreiranje i otkazivanje booking-a
- Dodavanje i uklanjanje salona iz favorites
- Admin approve flow za salone
- Realtime osvezavanje booking-a, favorites i statistika preko Firestore listener-a
- Loading state, error state i korisnicke poruke za neuspesne akcije
- Pink UI tema prilagodjena aplikaciji za beauty industriju

## Ekrani

Aplikacija ima vise od 10 funkcionalno razlicitih ekrana:

- Login
- Register
- Home
- Salon details / booking
- Bookings
- Favorites
- Profile
- Owner salon dashboard
- Reminders
- Admin
- Statistics

## Native funkcionalnosti

Projekat koristi vise native funkcionalnosti mobilnog uredjaja:

- Geolokacija korisnika za sortiranje salona po blizini
- Geolokacija ownera za inicijalno postavljanje lokacije salona
- Mapa za izbor lokacije salona
- Galerija telefona za izbor slike salona
- Haptic feedback prilikom uspesnog kreiranja booking-a
- Kratak confirmation sound prilikom uspesnog kreiranja booking-a

## Struktura projekta

```text
bookme/
  app/                    Expo Router ekrani i layout-i
  components/             UI komponente i page-specific komponente
  constants/              Tema i zajednicke konstante
  contexts/               Auth context
  lib/                    Firebase konfiguracija i helper funkcije
  scripts/                Seed skripte
  types/                  TypeScript modeli
  assets/                 Slike i sound asseti
```

## Firebase konfiguracija

Potrebno je kreirati Firebase projekat i ukljuciti:

1. Authentication
   - Enable Email/Password provider.
2. Firestore Database
   - Kreirati bazu u Firebase Console.
3. Firebase Storage
   - Kreirati default Storage bucket za slike salona.

Zatim napraviti `.env` fajl na osnovu `.env.example`:

```bash
cp .env.example .env
```

Popuniti vrednosti iz Firebase web app konfiguracije:

```text
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
SEED_ADMIN_NAME=
```

`SEED_ADMIN_*` vrednosti nisu obavezne. Ako ostanu prazne, seed skripta koristi podrazumevanog administratora.

## Firebase Storage

Slike salona se upload-uju u Firebase Storage putanju:

```text
salons/{salonId}/{timestamp}.{extension}
```

Primer development Storage pravila:

```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /salons/{salonId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Za produkciju pravila treba dodatno ograniciti tako da samo owner konkretnog salona moze da menja sliku.

## Pokretanje aplikacije

Instalacija dependency-ja:

```bash
npm install
```

Pokretanje Expo development servera:

```bash
npm start
```

Pokretanje na Androidu:

```bash
npm run android
```

Pokretanje na iOS-u:

```bash
npm run ios
```

Pokretanje web verzije:

```bash
npm run web
```

## Seed baze

Nakon sto je `.env` popunjen Firebase podacima, seed se pokrece komandom:

```bash
npm run seed:firestore
```

Seed kreira:

- jednog administratora
- cetiri owner korisnika
- cetiri salona
- osam servisa

Podrazumevani nalozi:

```text
Admin:
admin@bookme.local / BookMeAdmin123!

Owners:
luna.owner@bookme.local / BookMeOwner123!
rose.owner@bookme.local / BookMeOwner123!
glow.owner@bookme.local / BookMeOwner123!
velvet.owner@bookme.local / BookMeOwner123!
```

Obican korisnik se moze registrovati kroz aplikaciju na Register ekranu.

## Provera projekta

TypeScript provera:

```bash
npx tsc --noEmit
```

Lint:

```bash
npm run lint
```

Web export provera:

```bash
npx expo export --platform web --max-workers 1
```

## Napomena za build

Za seminarski rad je potrebno dodati `eas.json` i napraviti preview ili production build preko Expo EAS Build sistema. Ovaj README opisuje lokalno pokretanje i Firebase konfiguraciju; EAS build konfiguracija se dodaje odvojeno.
