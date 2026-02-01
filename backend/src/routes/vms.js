import express from 'express';
import { getVMs, getVMConfig, getVMStatus } from '../services/proxmox.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/vms
 * Get all VMs with optional filtering
 * Query params: node, tags (comma-separated), status
 */
router.get('/', async (req, res, next) => {
  try {
    const { node, tags, status } = req.query;
    
    const filters = {
      node,
      status,
      tags: tags ? tags.split(',').map(t => t.trim()) : undefined
    };
    
    const vms = await getVMs(filters);
    
    res.json({
      success: true,
      count: vms.length,
      data: vms
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/vms/:node/:vmid
 * Get detailed VM information
 */
router.get('/:node/:vmid', async (req, res, next) => {
  try {
    const { node, vmid } = req.params;
    const { type = 'qemu' } = req.query;
    
    const [config, status] = await Promise.all([
      getVMConfig(node, vmid, type),
      getVMStatus(node, vmid, type)
    ]);
    
    res.json({
      success: true,
      data: {
        config,
        status
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;