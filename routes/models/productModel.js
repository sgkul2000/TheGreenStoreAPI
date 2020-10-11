const mongoose = require('mongoose')
const Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      trim: true,
    },
    per: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    isAvailable: {
      type: Boolean,
      required: true,
      default: true,
    },
    isSpecial: {
      type: Boolean,
      required: true,
      default: false,
    },
    source:{
      type: String,
      required: false
    },
    reviews: [
      {
        type: mongoose.Schema.ObjectId,
        required: false,
        ref: 'Review',
      },
    ],
  },
  {
    timestamps: true,
    collection: 'products',
  }
)

module.exports = mongoose.model('Product', ProductSchema)
