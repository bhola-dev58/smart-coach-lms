import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  college: { type: String, default: '' },
  branch: { type: String, default: '' },
  year: { type: Number, min: 1, max: 4 },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  provider: { type: String, enum: ['credentials', 'google'], default: 'credentials' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.index({ email: 1 });

export default mongoose.models.User || mongoose.model('User', userSchema);
