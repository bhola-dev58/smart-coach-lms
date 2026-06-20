import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema(
  {
    maintenanceMode: { type: Boolean, default: false },
    allowRegistrations: { type: Boolean, default: true },
    supportEmail: { type: String, default: 'contact@gradify.academy', trim: true },
    paymentGateway: { type: String, default: 'Razorpay / UPI Apps', trim: true },
    appVersion: { type: String, default: 'v2.1.0-stable', trim: true }
  },
  { timestamps: true }
);

export default mongoose.models.SystemSetting || mongoose.model('SystemSetting', systemSettingSchema);
