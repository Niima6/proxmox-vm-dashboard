import express from 'express';
import { getTags } from '../services/proxmox.js';

const router = express.Router();

/**
 * GET /api/tags
 * Get all unique VM tags
 */
router.get('/', async (req, res, next) => {
  try {
    const tags = await getTags();
    
    res.json({
      success: true,
      count: tags.length,
      data: tags
    });
  } catch (error) {
    next(error);
  }
});

export default router;