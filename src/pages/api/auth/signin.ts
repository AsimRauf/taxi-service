import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import { compare } from 'bcryptjs'
import { signToken } from '@/lib/jwt'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectToDatabase()
    
    const { email, password } = JSON.parse(JSON.stringify(req.body))
    
    const user = await User.findOne({ email })
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isPasswordValid = await compare(password, user.password)
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = signToken({ 
      userId: user._id.toString(),
      email: user.email 
    })
    
    return res.status(200).json({ 
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Signin error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
