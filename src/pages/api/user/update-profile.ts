import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { authMiddleware } from '@/middleware/auth';
import { hash } from 'bcryptjs';
import { MongoError } from 'mongodb';

interface AuthenticatedRequest extends NextApiRequest {
  user: { userId: string };
}

interface UpdateUserData {
  name?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    const { name, email, phoneNumber, currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const updateData: UpdateUserData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;

    // If new password is provided, hash it
    if (newPassword && currentPassword) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      updateData.password = await hash(newPassword, 12);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    if (error instanceof MongoError && error.code === 11000) {
      return res.status(400).json({ message: 'Email or phone number already exists' });
    }
    const errorMessage = error instanceof Error ? error.message : 'Error updating profile';
    res.status(500).json({ message: errorMessage });
  }
}

export default authMiddleware(handler);