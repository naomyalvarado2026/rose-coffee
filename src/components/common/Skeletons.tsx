
export const CardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl border border-gray-150 dark:border-stone-700 shadow-xs flex items-center justify-between animate-pulse">
      <div className="space-y-2.5 flex-1">
        <div className="h-3 bg-gray-200 rounded w-24"></div>
        <div className="h-7 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) => {
  return (
    <div className="bg-white dark:bg-stone-800 rounded-2xl border border-gray-150 dark:border-stone-700 shadow-xs overflow-hidden animate-pulse">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-150 dark:border-stone-700 flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-48"></div>
        <div className="h-8 bg-gray-250 rounded w-28"></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-150 dark:border-stone-700">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="py-4 px-6">
                  <div className="h-3 bg-gray-250 rounded w-16"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: cols }).map((_, c) => (
                  <td key={c} className="py-4 px-6">
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl border border-gray-150 dark:border-stone-700 shadow-xs space-y-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
      <div className="h-60 w-full flex items-end gap-3 pt-4 border-b border-l border-gray-150 dark:border-stone-700 pb-2 pl-2">
        <div className="bg-gray-100 rounded-t w-full h-1/3"></div>
        <div className="bg-gray-100 rounded-t w-full h-2/3"></div>
        <div className="bg-gray-100 rounded-t w-full h-1/2"></div>
        <div className="bg-gray-100 rounded-t w-full h-4/5"></div>
        <div className="bg-gray-100 rounded-t w-full h-2/5"></div>
        <div className="bg-gray-100 rounded-t w-full h-3/5"></div>
      </div>
    </div>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-stone-800 rounded-2xl border border-gray-150 dark:border-stone-700 overflow-hidden shadow-sm flex flex-col h-full animate-pulse">
      <div className="relative pt-[70%] bg-gray-200"></div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-4"></div>
        <div className="space-y-2 flex-grow">
          <div className="h-3 bg-gray-150 rounded w-full"></div>
          <div className="h-3 bg-gray-150 rounded w-5/6"></div>
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-stone-700">
          <div className="space-y-1">
            <div className="h-3 bg-gray-150 rounded w-10"></div>
            <div className="h-5 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded-xl w-32"></div>
        </div>
      </div>
    </div>
  );
};

export const BlogCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-stone-800 border border-coffee/10 rounded-3xl overflow-hidden shadow-xxs flex flex-col h-full animate-pulse">
      <div className="relative aspect-video bg-gray-200"></div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="h-3 w-3 bg-gray-200 rounded-full"></div>
          <div className="h-3 w-24 bg-gray-150 rounded"></div>
        </div>
        <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-4/5 mb-4"></div>
        <div className="space-y-2 mb-6">
          <div className="h-3 bg-gray-150 rounded w-full"></div>
          <div className="h-3 bg-gray-150 rounded w-11/12"></div>
          <div className="h-3 bg-gray-150 rounded w-3/4"></div>
        </div>
        <div className="mt-auto pt-4 border-t border-stone-50 flex items-center gap-2">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-3 w-3 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
