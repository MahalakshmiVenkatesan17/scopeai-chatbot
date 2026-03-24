import React from 'react';
 
interface TableProps {
  children: React.ReactNode;
  className?: string;
}
 
export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
        {children}
      </table>
    </div>
  );
}
 
export function TableHeader({ children, className = '' }: TableProps) {
  return <thead className={`bg-gray-50 dark:bg-gray-800/50 ${className}`}>{children}</thead>;
}
 
export function TableBody({ children, className = '' }: TableProps) {
  return <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 ${className}`}>{children}</tbody>;
}
 
export function TableRow({ children, className = '' }: TableProps) {
  return <tr className={className}>{children}</tr>;
}
 
interface TableHeaderCellProps extends TableProps {
  colSpan?: number;
  rowSpan?: number;
}
 
export function TableHead({ children, className = '', colSpan, rowSpan }: TableHeaderCellProps) {
  return (
    <th
      scope="col"
      colSpan={colSpan}
      rowSpan={rowSpan}
      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 ${className}`}
    >
      {children}
    </th>
  );
}
 
interface TableCellProps extends TableProps {
  colSpan?: number;
  rowSpan?: number;
}
 
export function TableCell({ children, className = '', colSpan, rowSpan }: TableCellProps) {
  return (
    <td
      colSpan={colSpan}
      rowSpan={rowSpan}
      className={`whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-200 ${className}`}
    >
      {children}
    </td>
  );
}