import { cn } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
}

interface GlassTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    className?: string;
}

export function GlassTable<T>({
    data,
    columns,
    onRowClick,
    className,
}: GlassTableProps<T>) {
    return (
        <div className={cn("glass-card overflow-hidden rounded-xl border-none", className)}>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-primary/5">
                        <TableRow className="hover:bg-transparent border-b border-white/10">
                            {columns.map((col, index) => (
                                <TableHead
                                    key={index}
                                    className={cn("text-muted-foreground font-semibold h-12", col.className)}
                                >
                                    {col.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? (
                            data.map((item, rowIndex) => (
                                <TableRow
                                    key={rowIndex}
                                    onClick={() => onRowClick?.(item)}
                                    className={cn(
                                        "border-b border-white/5 transition-colors hover:bg-primary/5",
                                        onRowClick && "cursor-pointer"
                                    )}
                                >
                                    {columns.map((col, colIndex) => (
                                        <TableCell key={colIndex} className={cn("py-4", col.className)}>
                                            {col.cell
                                                ? col.cell(item)
                                                : col.accessorKey
                                                    ? (item[col.accessorKey] as React.ReactNode)
                                                    : null
                                            }
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
