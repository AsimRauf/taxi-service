import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import { hash } from 'bcryptjs'
import type { NextApiRequest, NextApiResponse } from 'next'

// Update regex to match exactly 13 digits including +31 prefix
const phoneRegex = /^\+31[0-9]{11}$/

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectToDatabase()
    const { name, email, phoneNumber, password } = req.body
    
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format' })
    }

    const hashedPassword = await hash(password, 12)
    await User.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword
    })

    res.status(201).json({ message: 'User created successfully' })
  } catch (error: unknown) {
    if ((error as { code?: number }).code === 11000) {
      return res.status(400).json({ message: 'Email or phone number already exists' })
    }
    res.status(500).json({ message: (error as Error).message || 'Error creating user' })
  }
}