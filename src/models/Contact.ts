import mongoose, { Document, Schema } from 'mongoose'

export interface IContact extends Document {
  fullName: string
  email: string
  phoneNumber: string
  subject: string
  message: string
  createdAt: Date
  status: 'new' | 'inProgress' | 'resolved'
}

const contactSchema = new Schema<IContact>({
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required']
  },
  message: {
    type: String,
    required: [true, 'Message is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['new', 'inProgress', 'resolved'],
    default: 'new'
  }
})

// Check if model exists before creating a new one
const Contact = mongoose.models.Contact || mongoose.model<IContact>('Contact', contactSchema)

export default Contact