import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  videoUrl: { type: String, default: '' },
  content: { type: String, default: '' },
  resources: [{
    name: String,
    url: String,
    size: String,
    type: { type: String, enum: ['pdf', 'code', 'video', 'link'] },
  }],
  order: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false },
});

const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  order: { type: Number, default: 0 },
  lessons: [lessonSchema],
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['CSE', 'ECE', 'MECH', 'CIVIL', 'AI/ML', 'GATE', 'MATHS', 'GENERAL'], required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'], default: 'Beginner' },
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: 0 },
  totalHours: { type: Number, default: 0 },
  totalLessons: { type: Number, default: 0 },
  chapters: [chapterSchema],
  prerequisites: [String],
  learningOutcomes: [String],
  tags: [String],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  totalStudents: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

courseSchema.index({ slug: 1 });
courseSchema.index({ category: 1, isPublished: 1 });

export default mongoose.models.Course || mongoose.model('Course', courseSchema);
