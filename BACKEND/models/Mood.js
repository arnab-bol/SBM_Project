
const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    mood: {
      type: String,
      required: [true, 'Mood label is required'],
      trim: true,
    },

    emoji: {
      type: String,
      required: [true, 'Emoji is required'],
      trim: true,
    },

    note: {
      type: String,
      default: '',
      trim: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('Mood', moodSchema);

