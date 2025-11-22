import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingUp, AlertCircle, Zap } from 'lucide-react';

export function AIInsights() {
    return (
        <Card className="glass-card border-none bg-gradient-to-br from-primary/5 via-background to-background">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg gradient-text">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI Insights
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-3 items-start p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <TrendingUp className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-medium">Revenue Spike</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Revenue is up <strong>12%</strong> compared to last week, driven by the new "Summer Collection" launch.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 items-start p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-medium">Inventory Alert</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            3 top-selling products are running low on stock. Consider restocking soon.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 items-start p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <Zap className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-medium">Conversion Opportunity</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Cart abandonment rate dropped by <strong>5%</strong> after the checkout optimization.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
