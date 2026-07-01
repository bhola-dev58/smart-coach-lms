import mongoose from 'mongoose';

// ============================================
// 🏢 TENANT SCHEMA (Multi-Tenant SaaS)
// Each coaching center gets its own tenant
// with custom branding and subdomain
// ============================================
const tenantSchema = new mongoose.Schema(
  {
    // ── Basic Info ──
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    subdomain: { type: String, required: true, unique: true },

    // ── Owner (Admin of this tenant) ──
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── Branding ──
    branding: {
      logo: { type: String, default: '' },          // Cloudinary URL
      favicon: { type: String, default: '' },
      primaryColor: { type: String, default: '#C8102E' },
      secondaryColor: { type: String, default: '#1a1a2e' },
      tagline: { type: String, default: '' },
      heroImage: { type: String, default: '' },
    },

    // ── Contact ──
    contact: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
      website: { type: String, default: '' },
    },

    // ── Subscription / Plan ──
    plan: {
      type: String,
      enum: ['free', 'starter', 'pro', 'enterprise'],
      default: 'free',
    },
    planExpiresAt: { type: Date },
    maxCourses: { type: Number, default: 5 },       // Free plan limit
    maxStudents: { type: Number, default: 100 },     // Free plan limit
    maxInstructors: { type: Number, default: 2 },

    // ── Features Toggle ──
    features: {
      liveClasses: { type: Boolean, default: false },
      certificates: { type: Boolean, default: true },
      discussions: { type: Boolean, default: true },
      assignments: { type: Boolean, default: true },
      paymentGateway: { type: Boolean, default: false },
      customDomain: { type: Boolean, default: false },
    },

    // ── Stats ──
    totalCourses: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },

    // ── Status ──
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Indexes ──
tenantSchema.index({ owner: 1 });
tenantSchema.index({ isActive: 1 });

export default mongoose.models.Tenant ||
  mongoose.model('Tenant', tenantSchema);
