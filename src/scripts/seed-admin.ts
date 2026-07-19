/**
 * Seeds (or promotes) the super admin account. Idempotent — safe to run
 * multiple times.
 *
 * Usage:
 *   npm run seed:admin
 *
 * Reads from env (falling back to sensible defaults for local dev):
 *   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_PHONE, MONGODB_URI
 */
import mongoose from 'mongoose';
import { hash } from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@taxiservice.nl';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe-Admin-2026!';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Super Admin';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '+31600000000';

// Minimal schema — mirrors src/models/User.ts without the phone validator so
// seeding never fails on formatting while the app schema evolves
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phoneNumber: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

async function main() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }

  await mongoose.connect(MONGODB_URI);
  const User = mongoose.models.User || mongoose.model('User', UserSchema);

  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`✅ Existing user ${ADMIN_EMAIL} promoted to admin`);
    } else {
      console.log(`✅ Admin ${ADMIN_EMAIL} already exists — nothing to do`);
    }
  } else {
    const hashedPassword = await hash(ADMIN_PASSWORD, 12);
    await User.create({
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      name: ADMIN_NAME,
      phoneNumber: ADMIN_PHONE,
      role: 'admin'
    });
    console.log(`✅ Super admin created: ${ADMIN_EMAIL}`);
    if (!process.env.ADMIN_PASSWORD) {
      console.log(`⚠️  Using the default password — set ADMIN_PASSWORD in .env and re-run, or change it after first login.`);
    }
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
