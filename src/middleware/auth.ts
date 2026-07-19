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

// Same as authMiddleware but additionally requires the admin role.
// The role claim comes from the signed JWT, so it cannot be forged client-side.
export function adminMiddleware(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return authMiddleware(async (req, res) => {
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' })
      return
    }
    return handler(req, res)
  })
}
