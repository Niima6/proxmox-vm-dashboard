import { Server, Activity, HardDrive, Tag } from 'lucide-react';
import type { VM, Node } from '../types';

interface StatsProps {
  vms: VM[];
  nodes: Node[];
}

const Stats = ({ vms, nodes }: StatsProps) => {
  const runningVMs = vms.filter((vm) => vm.status === 'running').length;
  const stoppedVMs = vms.filter((vm) => vm.status === 'stopped').length;
  const totalTags = new Set(vms.flatMap((vm) => vm.tags || [])).size;

  const stats = [
    {
      label: 'Total VMs',
      value: vms.length,
      icon: Server,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      label: 'Running',
      value: runningVMs,
      icon: Activity,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      label: 'Stopped',
      value: stoppedVMs,
      icon: HardDrive,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900',
    },
    {
      label: 'Nodes',
      value: nodes.length,
      icon: Server,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
    {
      label: 'Tags',
      value: totalTags,
      icon: Tag,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Stats;