import mongoose, { Schema } from 'mongoose';

const NotificationSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: [
            'new_booking',
            'booking_update',
            'booking_cancelled',
            'booking_cancellation_request',
            'booking_confirmed',
            'payment_received',
            'cancellation_request_approved',
            'cancellation_request_rejected'
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
    userId: {
        type: String,
        required: true,
        index: true
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

// If you need to update an existing model, you'll need to update the collection
// Add this before creating/getting the model
if (mongoose.models.Notification) {
    delete mongoose.models.Notification;
}

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;