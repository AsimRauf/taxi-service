import mongoose, { Schema } from 'mongoose';

const NotificationSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: [
            'new_booking',
            'booking_update',
            'booking_cancelled',
            'booking_cancellation',  // Add this new type
            'payment_received'
        ]
    },
    recipientType: {
        type: String,
        required: true,
        enum: ['admin', 'company', 'user']
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: false
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['info', 'warning', 'error', 'success'],
        default: 'info'
    },
    read: {
        type: Boolean,
        default: false
    },
    metadata: {
        type: Schema.Types.Mixed,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for better query performance
NotificationSchema.index({ recipientType: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ bookingId: 1 });

const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

export default Notification;