const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    certificateCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
      index: true
    },
    recipientName: {
      type: String,
      required: true,
      trim: true
    },
    moduleTitle: {
      type: String,
      required: true,
      trim: true
    },
    moduleSlug: {
      type: String,
      required: true,
      trim: true
    },
    week: {
      type: Number,
      default: 1
    },
    issuedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Guarantee only one certificate per user per module
certificateSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

module.exports = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);
