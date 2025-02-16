import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^\+31[0-9]{11}$/.test(v)
      },
      message: 'Please enter a valid Netherlands phone number'
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.models.User || mongoose.model('User', UserSchema)
