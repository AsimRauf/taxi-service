export const generateBookingId = () => {
    // Generate a timestamp-based prefix (first 4 digits)
    const timestamp = Date.now().toString().slice(-4);
  
    // Generate 4 random alphanumeric characters
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let random = '';
    for (let i = 0; i < 4; i++) {
      random += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  
    // Combine for a total of 8 characters
    return `${timestamp}${random}`;
};