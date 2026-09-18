const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const advisorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never returned by default on find/findOne
    },
    firm: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
  },
  { timestamps: true }
);

// Hash the password whenever it is set or changed.
advisorSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

advisorSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Shape returned to the client: never leak the password hash.
advisorSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    firm: this.firm,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Advisor', advisorSchema);
