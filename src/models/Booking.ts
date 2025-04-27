import mongoose, { Schema } from 'mongoose';

const addressSchema = new mongoose.Schema({
    label: String,
    mainAddress: String,
    secondaryAddress: String,
    description: String,
    value: {
        place_id: String,
        description: String,
        structured_formatting: {
            main_text: String,
            secondary_text: String,
            place_id: String
        }
    }
});

const luggageSchema = new mongoose.Schema({
    regularLuggage: {
        large: Number,
        small: Number,
        handLuggage: Number
    },
    specialLuggage: {
        foldableWheelchair: Number,
        rollator: Number,
        pets: Number,
        bicycle: Number,
        winterSports: Number,
        stroller: Number,
        golfBag: Number,
        waterSports: Number
    }
});

const contactInfoSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    phoneNumber: String,
    additionalPhoneNumber: String
});

const bookingForOtherSchema = new mongoose.Schema({
    fullName: String,
    phoneNumber: String
});

const businessInfoSchema = new mongoose.Schema({
    companyName: String,
    businessAddress: addressSchema
});

// Add Cancellation Schema
const CancellationSchema = new Schema({
  requestedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['requested', 'approved', 'rejected'],
    default: 'requested'
  },
  adminResponse: {
    type: String
  },
  processedAt: {
    type: Date
  },
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

const bookingSchema = new mongoose.Schema({
    // Keep MongoDB's default _id
    clientBookingId: {
        type: String,
        required: true,
        index: true // Add index for faster queries
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        index: true // For faster user-based queries
    },
    userId: {
        type: String,
        required: false
    },
    pickup: {
        type: addressSchema,
        required: true
    },
    destination: {
        type: addressSchema,
        required: true
    },
    stopovers: [addressSchema],
    sourceAddress: String,
    destinationAddress: String,
    directDistance: String,
    extraDistance: String,
    pickupDateTime: String,
    returnDateTime: String,
    hasLuggage: Boolean,
    passengers: Number,
    luggage: luggageSchema,
    vehicle: {
        type: String,
        enum: ['sedan', 'stationWagon', 'bus'], // Updated vehicle types
        required: true
    },
    isReturn: Boolean,
    price: Number,
    bookingType: {
        type: String,
        enum: ['individual', 'business']
    },
    isFixedPrice: Boolean,
    flightNumber: String,
    remarks: String,
    contactInfo: contactInfoSchema,
    bookingForOther: bookingForOtherSchema,
    businessInfo: businessInfoSchema,
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    // Add the cancellation field
    cancellation: {
        type: CancellationSchema,
        default: null
    },
    assignedCompany: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        default: null
    },
    companyAssignedAt: {
        type: Date,
        default: null
    },
    companyAssignedBy: {
        type: String,  // or Schema.Types.ObjectId if you're referencing users
        default: null
    },
    isTemporary: {
        type: Boolean,
        default: true
    },
    paymentPending: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Add this to your existing schema
const paymentSchema = new mongoose.Schema({
  orderId: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'expired'],
    default: 'pending'
  },
  amount: Number,
  currency: {
    type: String,
    default: 'EUR'
  },
  paymentUrl: String,
  transactionId: String,
  paymentMethod: String,
  paidAt: Date
}, { timestamps: true });

// Add this to your bookingSchema
bookingSchema.add({
  payment: {
    type: paymentSchema,
    default: null
  }
});

// Add compound index for user and clientBookingId
bookingSchema.index({ user: 1, clientBookingId: 1 }, { unique: true });

// Add methods to easily find user's bookings
bookingSchema.statics.findByUser = function(userId) {
    return this.find({ user: new mongoose.Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .populate('user', 'name email');
};

// Add any pre-save or methods you need
bookingSchema.pre('save', function(next) {
  // If this is a new booking, generate ID
  if (this.isNew && !this.clientBookingId) {
    this.clientBookingId = new Date().getTime().toString();
  }
  next();
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

export default Booking;
