import mongoose from 'mongoose';

// ============================================
// 📚 COURSE SCHEMA
// Main course with chapters and lessons
// ============================================

// ── Lesson (smallest unit of content) ──
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true },
  type: { type: String, enum: ['video', 'assignment'], default: 'video' },
  duration: { type: Number, required: true }, // in minutes
  videoUrl: { type: String, default: '' },
  content: { type: String, default: '' }, // markdown/HTML content
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
  resources: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true },
      size: { type: String, default: '' },
      type: { type: String, enum: ['pdf', 'code', 'video', 'link', 'image'] },
    },
  ],
  order: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false }, // Free preview lesson
});

// ── Chapter (group of lessons) ──
const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },
  lessons: [lessonSchema],
});

// ── FAQ for course page ──
const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

// ── Main Course ──
const courseSchema = new mongoose.Schema(
  {
    // ── Basic Info ──
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: '', maxlength: 200 },
    thumbnail: { type: String, default: '' },
    previewVideoUrl: { type: String, default: '' }, // intro video

    // ── Instructor & Category ──
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: [
        'CSE', 'ECE', 'MECH', 'CIVIL', 'AI/ML',
        'GATE', 'MATHS', 'GENERAL', 'SCIENCE', 'COMMERCE',
      ],
      required: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'Beginner',
    },
    language: { type: String, default: 'Hindi' },

    // ── Pricing ──
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: 0 },
    isFree: { type: Boolean, default: false },

    // ── Content Stats ──
    totalHours: { type: Number, default: 0 },
    totalLessons: { type: Number, default: 0 },
    chapters: [chapterSchema],

    // ── Course Metadata ──
    prerequisites: [{ type: String }],
    learningOutcomes: [{ type: String }],
    tags: [{ type: String }],
    faqs: [faqSchema],

    // ── Ratings & Stats ──
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },

    // ── Publish Settings ──
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

// ── Indexes for fast queries ──
// Note: slug already has { unique: true } which auto-creates an index
courseSchema.index({ category: 1, isPublished: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ isFeatured: 1, isPublished: 1 });
courseSchema.index({ tags: 1 });

export default mongoose.models.Course || mongoose.model('Course', courseSchema);
