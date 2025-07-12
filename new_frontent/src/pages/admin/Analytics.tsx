import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Clock, 
  MousePointer,
  Smartphone,
  Monitor,
  Globe
} from "lucide-react";

const Analytics = () => {
  const metrics = [
    {
      title: "Page Views",
      value: "127,543",
      change: "+12.3%",
      icon: Eye,
      trending: "up"
    },
    {
      title: "Unique Visitors",
      value: "89,234",
      change: "+8.7%",
      icon: Users,
      trending: "up"
    },
    {
      title: "Avg. Session Duration",
      value: "4m 32s",
      change: "-2.1%",
      icon: Clock,
      trending: "down"
    },
    {
      title: "Bounce Rate",
      value: "32.4%",
      change: "-5.2%",
      icon: MousePointer,
      trending: "down"
    }
  ];

  const topPages = [
    { page: "/dashboard", views: "25,431", percentage: 85 },
    { page: "/profile", views: "18,234", percentage: 65 },
    { page: "/settings", views: "12,543", percentage: 45 },
    { page: "/users", views: "9,876", percentage: 35 },
    { page: "/analytics", views: "7,234", percentage: 25 }
  ];

  const deviceStats = [
    { device: "Desktop", percentage: 65, users: "58,102" },
    { device: "Mobile", percentage: 30, users: "26,770" },
    { device: "Tablet", percentage: 5, users: "4,462" }
  ];

  const trafficSources = [
    { source: "Direct", percentage: 40, visitors: "35,694" },
    { source: "Search Engines", percentage: 35, visitors: "31,232" },
    { source: "Social Media", percentage: 15, visitors: "13,385" },
    { source: "Referrals", percentage: 10, visitors: "8,923" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Detailed insights about your platform performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="profile-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              <p className="text-xs flex items-center gap-1">
                {metric.trending === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={metric.trending === "up" ? "text-green-500" : "text-red-500"}>
                  {metric.change}
                </span>
                <span className="text-muted-foreground">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <Card className="profile-card">
              <CardHeader>
                <CardTitle className="text-foreground">Top Pages</CardTitle>
                <CardDescription>Most visited pages this month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topPages.map((page, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">{page.page}</span>
                      <span className="text-muted-foreground">{page.views} views</span>
                    </div>
                    <Progress value={page.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Real-time Activity */}
            <Card className="profile-card">
              <CardHeader>
                <CardTitle className="text-foreground">Real-time Activity</CardTitle>
                <CardDescription>Live user activity on your platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">234</div>
                    <p className="text-sm text-muted-foreground">Active users right now</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Page views per minute</span>
                      <span className="text-sm font-medium text-foreground">47</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">New sessions</span>
                      <span className="text-sm font-medium text-foreground">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Bounce rate</span>
                      <span className="text-sm font-medium text-foreground">28%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Sources */}
            <Card className="profile-card">
              <CardHeader>
                <CardTitle className="text-foreground">Traffic Sources</CardTitle>
                <CardDescription>Where your visitors are coming from</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {trafficSources.map((source, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">{source.source}</span>
                      <span className="text-muted-foreground">{source.visitors} visitors</span>
                    </div>
                    <Progress value={source.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Geographic Data */}
            <Card className="profile-card">
              <CardHeader>
                <CardTitle className="text-foreground">Top Countries</CardTitle>
                <CardDescription>Visitor locations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { country: "United States", visitors: "28,543", flag: "🇺🇸" },
                  { country: "United Kingdom", visitors: "15,234", flag: "🇬🇧" },
                  { country: "Canada", visitors: "12,876", flag: "🇨🇦" },
                  { country: "Germany", visitors: "9,456", flag: "🇩🇪" },
                  { country: "France", visitors: "7,823", flag: "🇫🇷" }
                ].map((country, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-sm font-medium text-foreground">{country.country}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{country.visitors}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card className="profile-card">
            <CardHeader>
              <CardTitle className="text-foreground">Device Breakdown</CardTitle>
              <CardDescription>How users access your platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {deviceStats.map((device, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {device.device === "Desktop" && <Monitor className="h-4 w-4" />}
                      {device.device === "Mobile" && <Smartphone className="h-4 w-4" />}
                      {device.device === "Tablet" && <Globe className="h-4 w-4" />}
                      <span className="font-medium text-foreground">{device.device}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">{device.users} users</div>
                      <div className="text-xs text-muted-foreground">{device.percentage}%</div>
                    </div>
                  </div>
                  <Progress value={device.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="profile-card">
              <CardHeader>
                <CardTitle className="text-foreground">Page Load Times</CardTitle>
                <CardDescription>Average loading performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { page: "Homepage", time: "1.2s", score: 95 },
                  { page: "Dashboard", time: "1.8s", score: 88 },
                  { page: "Profile", time: "2.1s", score: 82 },
                  { page: "Settings", time: "1.5s", score: 91 }
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">{item.page}</span>
                      <span className="text-muted-foreground">{item.time}</span>
                    </div>
                    <Progress value={item.score} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="profile-card">
              <CardHeader>
                <CardTitle className="text-foreground">User Engagement</CardTitle>
                <CardDescription>How users interact with your platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">4m 32s</div>
                    <p className="text-xs text-muted-foreground">Avg. Session</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">3.4</div>
                    <p className="text-xs text-muted-foreground">Pages/Session</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">68%</div>
                    <p className="text-xs text-muted-foreground">Return Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">32%</div>
                    <p className="text-xs text-muted-foreground">Bounce Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;