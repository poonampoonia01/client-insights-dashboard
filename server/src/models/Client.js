const mongoose = require('mongoose');

const CATEGORIES = ['HNI', 'UHNI'];

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[+]?[\d\s-]{7,15}$/, 'Enter a valid phone number'],
    },
    netWorth: {
      type: Number,
      required: [true, 'Net worth is required'],
      min: [0, 'Net worth cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: 'Category must be either HNI or UHNI',
      },
    },
    primaryAssetClass: {
      type: String,
      required: [true, 'Primary asset class is required'],
      trim: true,
      maxlength: 60,
    },
    interests: {
      type: [String],
      default: [],
      set: (arr) =>
        Array.isArray(arr)
          ? [...new Set(arr.map((i) => String(i).trim()).filter(Boolean))]
          : [],
    },
    onboardingDate: {
      type: Date,
      required: [true, 'Onboarding date is required'],
    },
    advisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Advisor',
      required: true,
    },
  },
  { timestamps: true }
);

// A client's email only needs to be unique within one advisor's book of
// business, not globally — two advisors could each have a "priya@..." client.
clientSchema.index({ advisor: 1, email: 1 }, { unique: true });
clientSchema.index({ advisor: 1, category: 1 });
clientSchema.index({ advisor: 1, netWorth: -1 });
clientSchema.index({ advisor: 1, name: 'text' });

clientSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model('Client', clientSchema);
