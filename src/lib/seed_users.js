/**
 * ============================================
 * 🌱 Seed Dummy Users into MongoDB
 * Run this to create an Admin, Instructor & Student
 * ============================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

// Inline User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false },
  role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  isActive: { type: Boolean, default: true },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seedUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const rawPassword = 'password123'; // Sabhi ka same dummy password abhi k liye
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const usersToCreate = [
      {
        name: 'Super Admin',
        email: 'admin@meetme.center',
        password: hashedPassword,
        role: 'admin',
      },
      {
        name: 'Dr. Rajesh Kumar',
        email: 'instructor@meetme.center', // Isko simple id k sath test k liye override karte h
        password: hashedPassword,
        role: 'instructor',
      },
      {
        name: 'Aman Student',
        email: 'student@meetme.center',
        password: hashedPassword,
        role: 'student',
      }
    ];

    let created = 0;
    let updated = 0;

    for (const userData of usersToCreate) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        await User.updateOne({ email: userData.email }, { $set: { password: hashedPassword, role: userData.role }});
        console.log(`🔄 Updated: ${userData.name} (${userData.role}) | Pass: ${rawPassword}`);
        updated++;
      } else {
        await User.create(userData);
        console.log(`✅ Created: ${userData.name} (${userData.role}) | Pass: ${rawPassword}`);
        created++;
      }
    }

    console.log(`\n─────────────────────────────────────`);
    console.log(`🎉 User Seed complete! You can now test the login page.`);
    process.exit(0);

  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('bcryptjs')) {
      console.error('\n❌ ERROR: "bcryptjs" is missing. Please run `npm install bcryptjs next-auth` first.\n');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

seedUsers();
