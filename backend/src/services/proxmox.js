import axios from 'axios';
import https from 'https';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

const PROXMOX_HOST = process.env.PROXMOX_HOST || '192.168.1.254';
const PROXMOX_PORT = process.env.PROXMOX_PORT || 8006;
const BASE_URL = `https://${PROXMOX_HOST}:${PROXMOX_PORT}/api2/json`;
const PROXMOX_API_TOKEN_ID = 'root@pam!roottoken';
const PROXMOX_API_TOKEN_SECRET = 'dfd52046-65cb-41fa-8b3b-312b03e7b8b4';

const agent = new https.Agent({
  rejectUnauthorized: false,
  // Additional SSL bypass for certificate chain issues
  checkServerIdentity: () => undefined,
  ciphers: 'ALL'
});

const client = axios.create({
  baseURL: BASE_URL,
  httpsAgent: agent,
  // Force disable SSL verification at axios level too
  validateStatus: () => true,
  timeout: 45000, // Global 45s timeout
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `PVEAPIToken=${PROXMOX_API_TOKEN_ID}=${PROXMOX_API_TOKEN_SECRET}`
  }
});

// === FULL REQUEST/RESPONSE LOGGER ===
// client.interceptors.request.use(
//   (config) => {
//     logger.info('🚀 REQUEST SENT', {
//       method: config.method?.toUpperCase(),
//       url: config.baseURL + config.url,
//       params: config.params,
//       headers: config.headers,
//       data: config.data ? JSON.stringify(config.data).substring(0, 500) + '...' : null,
//       authSet: !!config.headers.Authorization,
//       authPreview: config.headers.Authorization ? `${config.headers.Authorization.substring(0, 30)}...` : 'MISSING'
//     });
//     return config;
//   },
//   (error) => {
//     logger.error('🚫 REQUEST ERROR', { error: error.message });
//     return Promise.reject(error);
//   }
// );

// client.interceptors.response.use(
//   (response) => {
//     logger.info('✅ RESPONSE RECEIVED', {
//       status: response.status,
//       url: response.config.url,
//       headers: response.headers,
//       dataLength: JSON.stringify(response.data).length,
//       dataPreview: JSON.stringify(response.data).substring(0, 1000)
//     });
//     return response;
//   },
//   (error) => {
//     logger.error('❌ RESPONSE ERROR', {
//       status: error.response?.status,
//       statusText: error.response?.statusText,
//       url: error.config?.url,
//       headers: error.response?.headers,
//       data: error.response?.data ? JSON.stringify(error.response?.data).substring(0, 2000) : 'EMPTY'
//     });
//     return Promise.reject(error);
//   }
// );
// ===

/**
 * Get all VMs from cluster with optional filtering
 * @param {Object} filters - Filter options {node, tags, status}
 * @returns {Promise<Array>} List of VMs
 */
export async function getVMs(filters = {}) {
  try {
    logger.info('GET /api/vms');
    
    const response = await client.get('/cluster/resources', {
      params: { 
        type: 'vm'
      },
      timeout: 45000 // Per-request timeout
    });
    
    logger.info('Response status', { status: response.status, statusText: response.statusText });
    
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    let vms = response.data?.data || [];
    logger.info(`Found ${vms.length} VMs`);
    
    // Apply filters
    if (filters.node) {
      vms = vms.filter(vm => vm.node === filters.node);
    }
    
    if (filters.status) {
      vms = vms.filter(vm => vm.status === filters.status);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      vms = vms.filter(vm => {
        if (!vm.tags) return false;
        const vmTags = vm.tags.split(';').map(t => t.trim());
        return filters.tags.some(tag => vmTags.includes(tag));
      });
    }
    
    // Parse and format VM data
    return vms.map(vm => ({
      vmid: vm.vmid,
      name: vm.name,
      node: vm.node,
      status: vm.status,
      type: vm.type, // qemu or lxc
      uptime: vm.uptime,
      cpu: vm.cpu,
      cpus: vm.maxcpu,
      mem: vm.mem,
      maxmem: vm.maxmem,
      disk: vm.disk,
      maxdisk: vm.maxdisk,
      netin: vm.netin,
      netout: vm.netout,
      diskread: vm.diskread,
      diskwrite: vm.diskwrite,
      tags: vm.tags ? vm.tags.split(';').map(t => t.trim()) : [],
      template: vm.template || 0
    }));
    
  } catch (error) {
    logger.error('Error fetching VMs', { 
      error: error.message,
      code: error.code,
      status: error.response?.status,
      rawStatus: error.response?.statusText 
    });
    
    // Log full error response if available
    if (error.response?.data) {
      logger.error('Error response body', { body: JSON.stringify(error.response.data).substring(0, 2000) });
    }
    
    throw new Error(`Failed to fetch VMs: ${error.message}`);
  }
}

/**
 * Get detailed VM configuration
 * @param {string} node - Node name
 * @param {number} vmid - VM ID
 * @param {string} type - VM type (qemu or lxc)
 * @returns {Promise<Object>} VM configuration
 */
export async function getVMConfig(node, vmid, type = 'qemu') {
  logger.info('GET /api/vms/config');
  try {
    const endpoint = type === 'lxc' 
      ? `/nodes/${node}/lxc/${vmid}/config`
      : `/nodes/${node}/qemu/${vmid}/config`;
    
    const response = await client.get(endpoint);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching VM config', { node, vmid, error: error.message });
    throw new Error(`Failed to fetch VM config: ${error.message}`);
  }
}

/**
 * Get current VM status
 * @param {string} node - Node name
 * @param {number} vmid - VM ID
 * @param {string} type - VM type (qemu or lxc)
 * @returns {Promise<Object>} VM status
 */
export async function getVMStatus(node, vmid, type = 'qemu') {
  try {
    const endpoint = type === 'lxc'
      ? `/nodes/${node}/lxc/${vmid}/status/current`
      : `/nodes/${node}/qemu/${vmid}/status/current`;
    
    const response = await client.get(endpoint);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching VM status', { node, vmid, error: error.message });
    throw new Error(`Failed to fetch VM status: ${error.message}`);
  }
}

/**
 * Get all nodes in the cluster
 * @returns {Promise<Array>} List of nodes
 */
export async function getNodes() {
  try {
    logger.info('Fetching nodes from Proxmox');
    const response = await client.get('/nodes');
    
    return (response.data.data || []).map(node => ({
      node: node.node,
      status: node.status,
      cpu: node.cpu,
      maxcpu: node.maxcpu,
      mem: node.mem,
      maxmem: node.maxmem,
      disk: node.disk,
      maxdisk: node.maxdisk,
      uptime: node.uptime,
      level: node.level,
      type: node.type
    }));
  } catch (error) {
    logger.error('Error fetching nodes', { error: error.message });
    throw new Error(`Failed to fetch nodes: ${error.message}`);
  }
}

/**
 * Get all unique tags from VMs
 * @returns {Promise<Array>} List of unique tags
 */
export async function getTags() {
  try {
    const vms = await getVMs();
    const tagsSet = new Set();
    
    vms.forEach(vm => {
      if (vm.tags && vm.tags.length > 0) {
        vm.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    
    return Array.from(tagsSet).sort();
  } catch (error) {
    logger.error('Error fetching tags', { error: error.message });
    throw new Error(`Failed to fetch tags: ${error.message}`);
  }
}

/**
 * Test connection to Proxmox API
 * @returns {Promise<Object>} Connection status
 */
export async function testConnection() {
  try {
    const response = await client.get('/version');
    return {
      success: true,
      version: response.data.data.version,
      release: response.data.data.release
    };
  } catch (error) {
    logger.error('Connection test failed', { error: error.message });
    return {
      success: false,
      error: error.message
    };
  }
}
