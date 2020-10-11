const mongoose = require('mongoose')
const Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      required: true,
      ref: 'User',
      unique: true,
    },
    description: {
      type: String,
      required: false,
      default: '',
    },
    stars: {
      type: Number,
      required: true,
      trim: true,
      max: 5,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: 'reviews',
  }
)

module.exports = mongoose.model('Review', ReviewSchema)
