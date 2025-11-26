// lib/ui.ts

// PERBAIKAN: Tambahkan ': string' setelah 'tag'
export const getTagColor = (tag: string) => {
  switch (tag.toLowerCase()) {
    case 'meeting':
      return 'bg-orange-100 text-orange-700';
    case 'work':
      return 'bg-purple-100 text-purple-700';
    case 'important':
      return 'bg-red-100 text-red-700';
    case 'upcoming':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

// ... tambahkan fungsi helper UI lainnya di sini ...