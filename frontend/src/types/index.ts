export interface VM {
  vmid: number;
  name: string;
  node: string;
  status: 'running' | 'stopped' | 'paused';
  type: 'qemu' | 'lxc';
  uptime?: number;
  cpu?: number;
  cpus?: number;
  mem?: number;
  maxmem?: number;
  disk?: number;
  maxdisk?: number;
  netin?: number;
  netout?: number;
  diskread?: number;
  diskwrite?: number;
  tags?: string[];
  template?: number;
}

export interface Node {
  node: string;
  status: string;
  cpu?: number;
  maxcpu?: number;
  mem?: number;
  maxmem?: number;
  disk?: number;
  maxdisk?: number;
  uptime?: number;
  level?: string;
  type?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
}

export interface VMFilters {
  node?: string;
  tags?: string[];
  status?: string;
  search?: string;
}