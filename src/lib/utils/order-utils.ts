export const getStatusColor = (status: string): string => {
  const s = status?.toUpperCase();
  switch (s) {
    case 'CREATED':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case 'PROCESSING':
      return 'bg-green-100 text-green-600 hover:bg-green-100';
    case 'READY':
      return 'bg-green-300 text-green-800 hover:bg-green-300';
    case 'DELIVERED':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

export const statusMap: Record<string, string> = {
  CREATED: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  CONFIRMED: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  PROCESSING: 'bg-green-100 text-green-600 hover:bg-green-100',
  READY: 'bg-green-300 text-green-800 hover:bg-green-300',
  DELIVERED: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  CANCELLED: 'bg-red-100 text-red-800 hover:bg-red-100',
};
