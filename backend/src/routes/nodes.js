import express from 'express';
import { getNodes } from '../services/proxmox.js';

const router = express.Router();

/**
 * GET /api/nodes
 * Get all cluster nodes
 */
router.get('/', async (req, res, next) => {
  try {
    const nodes = await getNodes();
    
    res.json({
      success: true,
      count: nodes.length,
      data: nodes
    });
  } catch (error) {
    next(error);
  }
});

export default router;