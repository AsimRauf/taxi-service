export const generateBookingId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000); // Add randomness to prevent collisions
    return `${timestamp}${random}`;
};