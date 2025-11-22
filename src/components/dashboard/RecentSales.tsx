import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils';

interface Sale {
    id: string;
    name: string;
    email: string;
    amount: number;
    status: 'completed' | 'pending' | 'failed';
    date: string;
}

interface RecentSalesProps {
    sales: Sale[];
}

export function RecentSales({ sales }: RecentSalesProps) {
    return (
        <Card className="glass-card col-span-4 lg:col-span-2 border-none h-full">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {sales.map((sale) => (
                        <div key={sale.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10 ring-2 ring-background group-hover:ring-primary/50 transition-all">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sale.email}`} />
                                    <AvatarFallback>{sale.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                                        {sale.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{sale.email}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="font-bold">{formatCurrency(sale.amount)}</div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${sale.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                        sale.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-rose-500/10 text-rose-500'
                                    }`}>
                                    {sale.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
