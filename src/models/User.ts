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
        console.log('Validating phone number:', v, 'Length:', v.length)
        console.log('Character codes:', Array.from(v).map(c => c.charCodeAt(0)))
        const isValid = /^\+31[0-9]{9}$/.test(v) && v.length === 12
        console.log('Validation result:', isValid)
        if (!isValid) {
          console.log('Validation failed for:', v)
        }
        return isValid
      },
      message: 'Please enter a valid Netherlands phone number in the format +31XXXXXXXXX (12 digits total)'
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
