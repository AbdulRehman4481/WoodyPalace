'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User,
    Lock,
    Bell,
    Globe,
    Palette,
    Shield,
    CreditCard,
    Mail,
    Save
} from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Settings"
                description="Manage your account settings and preferences."
                breadcrumbs={[
                    { label: 'Dashboard', href: '/' },
                    { label: 'Settings', href: '/settings' },
                ]}
            />

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-8 bg-white/5 backdrop-blur-md border border-white/10 p-1 h-auto gap-2 rounded-xl">
                    <TabsTrigger value="profile" className="data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-md gap-2 h-10">
                        <User className="h-4 w-4" />
                        <span className="hidden md:inline">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger value="account" className="data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-md gap-2 h-10">
                        <Lock className="h-4 w-4" />
                        <span className="hidden md:inline">Security</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-md gap-2 h-10">
                        <Bell className="h-4 w-4" />
                        <span className="hidden md:inline">Notifications</span>
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-md gap-2 h-10">
                        <Palette className="h-4 w-4" />
                        <span className="hidden md:inline">Appearance</span>
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-md gap-2 h-10">
                        <CreditCard className="h-4 w-4" />
                        <span className="hidden md:inline">Billing</span>
                    </TabsTrigger>
                    <TabsTrigger value="api" className="data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-md gap-2 h-10">
                        <Globe className="h-4 w-4" />
                        <span className="hidden md:inline">API</span>
                    </TabsTrigger>
                </TabsList>

                {/* Profile Settings */}
                <TabsContent value="profile" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription className="text-white/60">Update your personal details and public profile.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" defaultValue="Admin User" className="bg-white/5 border-white/10 text-white" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" defaultValue="admin@example.com" className="bg-white/5 border-white/10 text-white" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Input id="bio" defaultValue="Store Administrator" className="bg-white/5 border-white/10 text-white" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
                            <CardHeader>
                                <CardTitle>Profile Picture</CardTitle>
                                <CardDescription className="text-white/60">Upload a new profile picture.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center space-y-4">
                                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-white/10 flex items-center justify-center">
                                    <User className="h-16 w-16 text-white/40" />
                                </div>
                                <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white">Change Avatar</Button>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="flex justify-end">
                        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                        </Button>
                    </div>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="account" className="space-y-6">
                    <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription className="text-white/60">Change your password to keep your account secure.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input id="current-password" type="password" className="bg-white/5 border-white/10 text-white" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" type="password" className="bg-white/5 border-white/10 text-white" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input id="confirm-password" type="password" className="bg-white/5 border-white/10 text-white" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Two-Factor Authentication</CardTitle>
                            <CardDescription className="text-white/60">Add an extra layer of security to your account.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>Enable 2FA</Label>
                                <p className="text-sm text-white/60">Protect your account with 2FA security.</p>
                            </div>
                            <Switch />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
                            <Save className="mr-2 h-4 w-4" /> Update Security
                        </Button>
                    </div>
                </TabsContent>

                {/* Notifications Settings */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Email Notifications</CardTitle>
                            <CardDescription className="text-white/60">Manage your email notification preferences.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label>Order Updates</Label>
                                    <p className="text-sm text-white/60">Receive emails about new orders and status changes.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label>Low Stock Alerts</Label>
                                    <p className="text-sm text-white/60">Get notified when products are running low on stock.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label>New Customers</Label>
                                    <p className="text-sm text-white/60">Receive emails when a new customer registers.</p>
                                </div>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label>Marketing & News</Label>
                                    <p className="text-sm text-white/60">Receive updates about new features and promotions.</p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
                            <Save className="mr-2 h-4 w-4" /> Save Preferences
                        </Button>
                    </div>
                </TabsContent>

                {/* Appearance Settings */}
                <TabsContent value="appearance" className="space-y-6">
                    <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Theme Preferences</CardTitle>
                            <CardDescription className="text-white/60">Customize the look and feel of the admin panel.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2 cursor-pointer">
                                    <div className="h-24 rounded-lg bg-slate-950 border-2 border-purple-500 ring-2 ring-purple-500/20"></div>
                                    <div className="text-center text-sm font-medium">Dark</div>
                                </div>
                                <div className="space-y-2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                                    <div className="h-24 rounded-lg bg-white border border-slate-200"></div>
                                    <div className="text-center text-sm font-medium">Light</div>
                                </div>
                                <div className="space-y-2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                                    <div className="h-24 rounded-lg bg-slate-900 border border-slate-800 flex">
                                        <div className="w-1/2 bg-slate-950"></div>
                                        <div className="w-1/2 bg-white"></div>
                                    </div>
                                    <div className="text-center text-sm font-medium">System</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Billing Settings */}
                <TabsContent value="billing" className="space-y-6">
                    <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Current Plan</CardTitle>
                            <CardDescription className="text-white/60">You are currently on the Pro plan.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                        <Shield className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Pro Plan</h4>
                                        <p className="text-sm text-white/60">$29/month</p>
                                    </div>
                                </div>
                                <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white">Upgrade</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Payment Method</CardTitle>
                            <CardDescription className="text-white/60">Manage your payment methods.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <CreditCard className="h-6 w-6 text-white/60" />
                                    <div>
                                        <p className="font-medium">Visa ending in 4242</p>
                                        <p className="text-sm text-white/60">Expires 12/24</p>
                                    </div>
                                </div>
                                <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5">Edit</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* API Settings */}
                <TabsContent value="api" className="space-y-6">
                    <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>API Keys</CardTitle>
                            <CardDescription className="text-white/60">Manage your API keys for external integrations.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Public Key</Label>
                                <div className="flex gap-2">
                                    <Input readOnly value="pk_live_51Hz..." className="bg-white/5 border-white/10 text-white font-mono" />
                                    <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white">Copy</Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Secret Key</Label>
                                <div className="flex gap-2">
                                    <Input type="password" value="sk_live_51Hz..." className="bg-white/5 border-white/10 text-white font-mono" />
                                    <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white">Reveal</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
