import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import { hash } from 'bcryptjs'
import { signToken } from '@/lib/jwt'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectToDatabase()
    const { name, email, phoneNumber, password } = req.body
    console.log('Received signup request:', {
      name,
      email,
      phoneNumber,
      password: password ? '*****' : 'undefined'
    })
    
    // Ensure phone number starts with +31 and has exactly 9 digits after
    if (!phoneNumber.startsWith('+31') || phoneNumber.length !== 12) {
      console.log('Phone number validation failed:', phoneNumber)
      return res.status(400).json({ 
        message: 'Invalid phone number format. Must be in the format +31XXXXXXXXX (9 digits after +31)' 
      });
    }

    const hashedPassword = await hash(password, 12)
    const newUser = await User.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword
    })

    const token = signToken({
      userId: newUser._id.toString(),
      email: newUser.email
    })

    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber
      }
    })
    } catch (error: unknown) {
      console.error('Signup error:', error)
      
      // Handle Mongoose validation errors
      if ((error as { name?: string }).name === 'ValidationError') {
        const validationError = error as { errors: Record<string, { message: string }> }
        const firstError = Object.values(validationError.errors)[0]
        return res.status(400).json({ message: firstError.message })
      }
      
      console.log('Error details:', {
        errorCode: (error as { code?: number }).code,
        errorMessage: (error as Error).message,
        stack: (error as Error).stack
      })
    if ((error as { code?: number }).code === 11000) {
      const keyValue = (error as { keyValue?: Record<string, string> }).keyValue || {}
      if (keyValue.email) {
        return res.status(400).json({ message: 'Email already exists' })
      }
      if (keyValue.phoneNumber) {
        return res.status(400).json({ message: 'Phone number already exists' })
      }
      return res.status(400).json({ message: 'Email or phone number already exists' })
    }
    console.error('Signup error:', error)
    res.status(500).json({ message: 'An error occurred during signup. Please try again.' })
  }
}
