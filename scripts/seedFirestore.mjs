import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  doc,
  getFirestore,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

loadEnvFile('.env');

const requiredEnv = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing ${key}. Add it to .env before running the seed.`);
  }
}

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const adminSeed = {
  email: process.env.SEED_ADMIN_EMAIL || 'admin@bookme.local',
  password: process.env.SEED_ADMIN_PASSWORD || 'BookMeAdmin123!',
  name: process.env.SEED_ADMIN_NAME || 'BookMe Admin',
  role: 'admin',
};

const ownerSeeds = [
  {
    id: 'owner-luna-beauty',
    email: 'luna.owner@bookme.local',
    password: 'BookMeOwner123!',
    name: 'Mila Jovanovic',
    salonId: 'luna-beauty-studio',
  },
  {
    id: 'owner-rose-hair',
    email: 'rose.owner@bookme.local',
    password: 'BookMeOwner123!',
    name: 'Sara Petrovic',
    salonId: 'rose-hair-lounge',
  },
  {
    id: 'owner-glow-nails',
    email: 'glow.owner@bookme.local',
    password: 'BookMeOwner123!',
    name: 'Nina Markovic',
    salonId: 'glow-nail-bar',
  },
  {
    id: 'owner-velvet-spa',
    email: 'velvet.owner@bookme.local',
    password: 'BookMeOwner123!',
    name: 'Ana Ilic',
    salonId: 'velvet-skin-spa',
  },
];

const salonSeeds = [
  {
    id: 'luna-beauty-studio',
    ownerSeedId: 'owner-luna-beauty',
    name: 'Luna Beauty Studio',
    description:
      'A soft, modern beauty studio for makeup, brows and everyday glow appointments.',
    category: 'beauty',
    imageUrl: 'https://picsum.photos/seed/bookme-luna-beauty/1200/800',
    location: {
      street: 'Kralja Petra 18',
      city: 'Belgrade',
      latitude: 44.8181,
      longitude: 20.4564,
    },
    workingHours: createWeeklyHours({
      monday: ['09:00', '20:00'],
      tuesday: ['09:00', '20:00'],
      wednesday: ['09:00', '20:00'],
      thursday: ['09:00', '20:00'],
      friday: ['09:00', '20:00'],
      saturday: ['10:00', '16:00'],
      sunday: null,
    }),
  },
  {
    id: 'rose-hair-lounge',
    ownerSeedId: 'owner-rose-hair',
    name: 'Rose Hair Lounge',
    description:
      'Haircuts, color refreshes and polished styling near the center of the city.',
    category: 'hair',
    imageUrl: 'https://picsum.photos/seed/bookme-rose-hair/1200/800',
    location: {
      street: 'Njegoseva 42',
      city: 'Belgrade',
      latitude: 44.8017,
      longitude: 20.4707,
    },
    workingHours: createWeeklyHours({
      monday: ['08:30', '19:00'],
      tuesday: ['08:30', '19:00'],
      wednesday: ['08:30', '19:00'],
      thursday: ['08:30', '19:00'],
      friday: ['08:30', '19:00'],
      saturday: ['09:00', '15:00'],
      sunday: null,
    }),
  },
  {
    id: 'glow-nail-bar',
    ownerSeedId: 'owner-glow-nails',
    name: 'Glow Nail Bar',
    description:
      'Manicure, pedicure and gel polish services in a compact nail-focused studio.',
    category: 'nails',
    imageUrl: 'https://picsum.photos/seed/bookme-glow-nails/1200/800',
    location: {
      street: 'Bulevar Zorana Djindjica 96',
      city: 'Belgrade',
      latitude: 44.8141,
      longitude: 20.4148,
    },
    workingHours: createWeeklyHours({
      monday: ['10:00', '21:00'],
      tuesday: ['10:00', '21:00'],
      wednesday: ['10:00', '21:00'],
      thursday: ['10:00', '21:00'],
      friday: ['10:00', '21:00'],
      saturday: ['10:00', '18:00'],
      sunday: null,
    }),
  },
  {
    id: 'velvet-skin-spa',
    ownerSeedId: 'owner-velvet-spa',
    name: 'Velvet Skin Spa',
    description:
      'Relaxed facial treatments, massage appointments and skin-care rituals.',
    category: 'spa',
    imageUrl: 'https://picsum.photos/seed/bookme-velvet-spa/1200/800',
    location: {
      street: 'Pozeska 67',
      city: 'Belgrade',
      latitude: 44.7796,
      longitude: 20.4179,
    },
    workingHours: createWeeklyHours({
      monday: ['09:00', '18:00'],
      tuesday: ['09:00', '18:00'],
      wednesday: ['09:00', '18:00'],
      thursday: ['09:00', '18:00'],
      friday: ['09:00', '18:00'],
      saturday: ['10:00', '14:00'],
      sunday: null,
    }),
  },
];

const serviceSeeds = [
  {
    id: 'luna-evening-makeup',
    salonId: 'luna-beauty-studio',
    name: 'Evening makeup',
    description: 'Full evening makeup with skin prep and lashes.',
    priceRsd: 5500,
    durationMinutes: 75,
    slotIntervalMinutes: 30,
    availableTimeSlots: createTimeSlots('09:00', '18:30', 30),
  },
  {
    id: 'luna-brow-shaping',
    salonId: 'luna-beauty-studio',
    name: 'Brow shaping',
    description: 'Brow shaping and light styling.',
    priceRsd: 1200,
    durationMinutes: 25,
    slotIntervalMinutes: 30,
    availableTimeSlots: createTimeSlots('09:00', '19:00', 30),
  },
  {
    id: 'rose-womens-cut',
    salonId: 'rose-hair-lounge',
    name: 'Women haircut',
    description: 'Consultation, wash, haircut and blow dry.',
    priceRsd: 3200,
    durationMinutes: 60,
    slotIntervalMinutes: 30,
    availableTimeSlots: createTimeSlots('08:30', '18:00', 30),
  },
  {
    id: 'rose-color-refresh',
    salonId: 'rose-hair-lounge',
    name: 'Color refresh',
    description: 'Root color or gloss refresh with basic styling.',
    priceRsd: 6800,
    durationMinutes: 120,
    slotIntervalMinutes: 60,
    availableTimeSlots: createTimeSlots('09:00', '16:00', 60),
  },
  {
    id: 'glow-gel-manicure',
    salonId: 'glow-nail-bar',
    name: 'Gel manicure',
    description: 'Nail shaping, cuticle care and gel polish.',
    priceRsd: 2600,
    durationMinutes: 60,
    slotIntervalMinutes: 30,
    availableTimeSlots: createTimeSlots('10:00', '19:30', 30),
  },
  {
    id: 'glow-pedicure',
    salonId: 'glow-nail-bar',
    name: 'Spa pedicure',
    description: 'Pedicure with scrub, care and polish.',
    priceRsd: 3300,
    durationMinutes: 75,
    slotIntervalMinutes: 30,
    availableTimeSlots: createTimeSlots('10:00', '18:30', 30),
  },
  {
    id: 'velvet-hydrating-facial',
    salonId: 'velvet-skin-spa',
    name: 'Hydrating facial',
    description: 'Deep cleansing, mask and hydrating skin-care finish.',
    priceRsd: 4800,
    durationMinutes: 60,
    slotIntervalMinutes: 30,
    availableTimeSlots: createTimeSlots('09:00', '17:00', 30),
  },
  {
    id: 'velvet-relax-massage',
    salonId: 'velvet-skin-spa',
    name: 'Relax massage',
    description: 'A calming full-body massage treatment.',
    priceRsd: 5200,
    durationMinutes: 60,
    slotIntervalMinutes: 60,
    availableTimeSlots: createTimeSlots('10:00', '16:00', 60),
  },
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function seed() {
  const adminUser = await upsertAuthUser(adminSeed.email, adminSeed.password);
  const ownerUsers = new Map();

  for (const owner of ownerSeeds) {
    const firebaseUser = await upsertAuthUser(owner.email, owner.password);
    ownerUsers.set(owner.id, firebaseUser);
  }

  const batches = createBatches();

  addUserProfile(batches, adminUser.uid, adminSeed);

  for (const owner of ownerSeeds) {
    const firebaseUser = ownerUsers.get(owner.id);

    addUserProfile(batches, firebaseUser.uid, {
      email: owner.email,
      name: owner.name,
      role: 'owner',
      salonId: owner.salonId,
    });
  }

  for (const salon of salonSeeds) {
    const owner = ownerSeeds.find((item) => item.id === salon.ownerSeedId);
    const ownerUser = ownerUsers.get(salon.ownerSeedId);

    addSet(batches, doc(db, 'salons', salon.id), {
      name: salon.name,
      description: salon.description,
      category: salon.category,
      imageUrl: salon.imageUrl,
      ownerId: ownerUser.uid,
      ownerEmail: owner.email.trim().toLowerCase(),
      location: salon.location,
      workingHours: salon.workingHours,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  for (const service of serviceSeeds) {
    addSet(batches, doc(db, 'services', service.id), {
      ...service,
      currency: 'RSD',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await Promise.all(batches.map((batch) => batch.commit()));

  console.log('Firestore seed completed.');
  console.log(`Admin user: ${adminSeed.email}`);
  console.log(`Owners: ${ownerSeeds.length}`);
  console.log(`Salons: ${salonSeeds.length}`);
  console.log(`Services: ${serviceSeeds.length}`);
  console.log('');
  console.log('Default owner password: BookMeOwner123!');
}

async function upsertAuthUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      normalizedEmail,
      password,
    );

    return credential.user;
  } catch (error) {
    if (error?.code !== 'auth/email-already-in-use') {
      throw error;
    }

    const credential = await signInWithEmailAndPassword(
      auth,
      normalizedEmail,
      password,
    );

    return credential.user;
  }
}

function addUserProfile(batches, uid, profile) {
  addSet(batches, doc(db, 'users', uid), {
    email: profile.email.trim().toLowerCase(),
    name: profile.name,
    role: profile.role,
    ...(profile.salonId ? { salonId: profile.salonId } : {}),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

function createWeeklyHours(days) {
  return Object.fromEntries(
    Object.entries(days).map(([day, hours]) => [
      day,
      hours
        ? { isOpen: true, opensAt: hours[0], closesAt: hours[1] }
        : { isOpen: false, opensAt: null, closesAt: null },
    ]),
  );
}

function createTimeSlots(start, end, intervalMinutes) {
  const slots = [];
  let cursor = toMinutes(start);
  const endMinutes = toMinutes(end);

  while (cursor <= endMinutes) {
    slots.push(toTime(cursor));
    cursor += intervalMinutes;
  }

  return slots;
}

function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function toTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function createBatches() {
  const firstBatch = writeBatch(db);
  firstBatch.operationCount = 0;
  return [firstBatch];
}

function addSet(batches, ref, data) {
  let batch = batches[batches.length - 1];

  if (batch.operationCount >= 450) {
    batch = writeBatch(db);
    batch.operationCount = 0;
    batches.push(batch);
  }

  batch.set(ref, data);
  batch.operationCount += 1;
}

function loadEnvFile(fileName) {
  const envPath = resolve(process.cwd(), fileName);

  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

seed().catch((error) => {
  console.error('Firestore seed failed.');
  console.error(error);
  process.exitCode = 1;
});
