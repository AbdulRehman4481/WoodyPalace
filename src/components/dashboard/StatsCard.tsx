import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string;
    growth: number;
    icon: LucideIcon;
    description?: string;
    trend?: 'up' | 'down' | 'neutral';
    className?: string;
}

export function StatsCard({
    title,
    value,
    growth,
    icon: Icon,
    description,
    trend,
    className,
}: StatsCardProps) {
    const isPositive = growth >= 0;

    return (
        <Card className={cn("glass-card overflow-hidden relative border-none", className)}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Icon className="w-24 h-24 transform rotate-12 -mr-8 -mt-8" />
            </div>
            <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className={cn(
                        "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                        isPositive
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-rose-500/10 text-rose-500"
                    )}>
                        {isPositive ? '+' : ''}{growth}%
                        {/* You could add a mini trend icon here */}
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                    <div className="text-2xl font-bold tracking-tight">{value}</div>
                    {description && (
                        <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    )}
                </div>

                {/* Decorative gradient glow */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent opacity-50" />
            </CardContent>
        </Card>
    );
}
