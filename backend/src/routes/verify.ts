import { Router, Request, Response } from 'express';
import { verifyGhanaCard } from '../services/niaVerification.js';

const router = Router();

router.post('/ghana-card', async (req: Request, res: Response) => {
  try {
    const { cardNumber, fullName, frontCardImage, backCardImage, faceImage, selfieSource } = req.body as {
      cardNumber?: string;
      fullName?: string;
      frontCardImage?: string;
      backCardImage?: string;
      faceImage?: string;
      selfieSource?: 'live_camera' | 'upload';
    };
    if (!cardNumber || !fullName || !frontCardImage || !backCardImage || !faceImage) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: cardNumber, fullName, frontCardImage, backCardImage, faceImage',
      });
      return;
    }
    const result = await verifyGhanaCard({
      cardNumber,
      fullName,
      frontCardImage,
      backCardImage,
      faceImage,
      selfieSource,
    });
    res.json(result);
  } catch (err) {
    console.error('Ghana card verification error:', err);
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'Verification failed.',
    });
  }
});

export default router;
