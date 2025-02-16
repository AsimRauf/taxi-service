import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken, TokenPayload } from '@/lib/jwt'

interface AuthenticatedRequest extends NextApiRequest {
  user: TokenPayload
}

export function authMiddleware(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '')
     
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' })
      }

      const decoded: TokenPayload = verifyToken(token)
      ;(req as AuthenticatedRequest).user = decoded

      return handler(req as AuthenticatedRequest, res)
    } catch {
      return res.status(401).json({ message: 'Invalid token' })
    }
  }
}
