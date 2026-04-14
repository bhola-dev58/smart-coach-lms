/**
 * ============================================
 * 🚀 Initialize All Collections in MongoDB Atlas
 * Run: node src/lib/init_collections.js
 * ============================================
 * This script connects to your MongoDB and ensures
 * all 9 collections are created on the server.
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

// All collection schemas defined inline (CommonJS compatible)
const collections = [
  {
    name: 'User',
    schema: {
      name: String,
      email: { type: String, unique: true },
      password: String,
      phone: String,
      avatar: String,
      role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
      provider: { type: String, default: 'credentials' },
      isActive: { type: Boolean, default: true },
      isEmailVerified: { type: Boolean, default: false },
      lastLoginAt: Date,
      college: String,
      branch: String,
      year: Number,
      enrolledCourses: [mongoose.Schema.Types.ObjectId],
      bio: String,
      specialization: [String],
      socialLinks: { linkedin: String, youtube: String, website: String },
    },
  },
  {
    name: 'Course',
    schema: {
      title: String,
      slug: { type: String, unique: true },
      description: String,
      shortDescription: String,
      thumbnail: String,
      previewVideoUrl: String,
      instructor: mongoose.Schema.Types.ObjectId,
      category: String,
      level: String,
      language: { type: String, default: 'Hindi' },
      price: Number,
      originalPrice: Number,
      isFree: { type: Boolean, default: false },
      totalHours: Number,
      totalLessons: Number,
      chapters: [{ title: String, description: String, order: Number, lessons: [] }],
      prerequisites: [String],
      learningOutcomes: [String],
      tags: [String],
      faqs: [{ question: String, answer: String }],
      rating: Number,
      totalRatings: Number,
      totalStudents: Number,
      isPublished: { type: Boolean, default: false },
      isFeatured: { type: Boolean, default: false },
      publishedAt: Date,
    },
  },
  {
    name: 'Enrollment',
    schema: {
      student: mongoose.Schema.Types.ObjectId,
      course: mongoose.Schema.Types.ObjectId,
      payment: mongoose.Schema.Types.ObjectId,
      progress: {
        completedLessons: [String],
        currentLesson: String,
        percentage: Number,
        lastAccessedAt: Date,
        totalWatchTimeMin: Number,
      },
      notes: [{ lessonSlug: String, content: String, updatedAt: Date }],
      quizScores: [{ lessonSlug: String, score: Number, maxScore: Number, attemptedAt: Date }],
      certificateIssued: { type: Boolean, default: false },
      certificateUrl: String,
      certificateIssuedAt: Date,
      status: { type: String, default: 'active' },
      enrolledAt: Date,
      completedAt: Date,
      expiresAt: Date,
    },
  },
  {
    name: 'Payment',
    schema: {
      student: mongoose.Schema.Types.ObjectId,
      course: mongoose.Schema.Types.ObjectId,
      amount: Number,
      currency: { type: String, default: 'INR' },
      discountApplied: Number,
      couponCode: String,
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      method: String,
      status: { type: String, default: 'created' },
      refundAmount: Number,
      refundReason: String,
      refundedAt: Date,
      receipt: String,
      paidAt: Date,
    },
  },
  {
    name: 'Review',
    schema: {
      student: mongoose.Schema.Types.ObjectId,
      course: mongoose.Schema.Types.ObjectId,
      rating: Number,
      title: String,
      comment: String,
      isApproved: { type: Boolean, default: true },
      helpfulCount: { type: Number, default: 0 },
    },
  },
  {
    name: 'Coupon',
    schema: {
      code: { type: String, unique: true },
      description: String,
      discountType: String,
      discountValue: Number,
      maxDiscountAmount: Number,
      minPurchaseAmount: Number,
      applicableCourses: [mongoose.Schema.Types.ObjectId],
      applicableCategories: [String],
      maxUsageCount: Number,
      currentUsageCount: Number,
      maxUsagePerUser: Number,
      usedBy: [mongoose.Schema.Types.ObjectId],
      startsAt: Date,
      expiresAt: Date,
      isActive: { type: Boolean, default: true },
    },
  },
  {
    name: 'Notification',
    schema: {
      recipient: mongoose.Schema.Types.ObjectId,
      type: String,
      title: String,
      message: String,
      link: String,
      isRead: { type: Boolean, default: false },
      readAt: Date,
      relatedCourse: mongoose.Schema.Types.ObjectId,
      relatedPayment: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    name: 'Contact',
    schema: {
      name: String,
      email: String,
      phone: String,
      subject: String,
      message: String,
      status: { type: String, default: 'new' },
      adminReply: String,
      repliedAt: Date,
      repliedBy: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    name: 'Announcement',
    schema: {
      title: String,
      content: String,
      type: { type: String, default: 'info' },
      targetAudience: { type: String, default: 'all' },
      targetCourses: [mongoose.Schema.Types.ObjectId],
      showAsBanner: { type: Boolean, default: false },
      isActive: { type: Boolean, default: true },
      startsAt: Date,
      expiresAt: Date,
      createdBy: mongoose.Schema.Types.ObjectId,
    },
  },
];

async function initCollections() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    const db = mongoose.connection.db;
    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map((c) => c.name);

    console.log('📋 Existing collections:', existingNames.length ? existingNames.join(', ') : '(none)');
    console.log('─'.repeat(50));

    let created = 0;
    let skipped = 0;

    for (const col of collections) {
      const collectionName = col.name.toLowerCase() + 's'; // Mongoose pluralizes

      if (existingNames.includes(collectionName)) {
        console.log(`⏭️  ${col.name} (${collectionName}) — already exists`);
        skipped++;
      } else {
        // Register the model and create the collection
        const schema = new mongoose.Schema(col.schema, { timestamps: true });
        const Model = mongoose.models[col.name] || mongoose.model(col.name, schema);
        await Model.createCollection();
        console.log(`✅ ${col.name} (${collectionName}) — CREATED`);
        created++;
      }
    }

    console.log('─'.repeat(50));
    console.log(`\n🎉 Done! Created: ${created} | Already existed: ${skipped} | Total: ${collections.length}`);

    // Verify final state
    const finalCollections = await db.listCollections().toArray();
    console.log('\n📦 All collections on server:');
    finalCollections.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initCollections();
