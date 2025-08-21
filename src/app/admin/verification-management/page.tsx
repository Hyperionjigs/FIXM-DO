"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Shield, 
  UserCheck, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Download,
  Eye,
  Filter,
  Search
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { VerificationService } from "@/lib/verification-service";
import { providerManager } from "@/lib/verification-providers";

interface VerificationLog {
  id: string;
  userId: string;
  type: 'selfie' | 'id-document';
  timestamp: string;
  success: boolean;
  confidence: number;
  reasons: string[];
  metadata?: Record<string, any>;
  userEmail?: string;
  userName?: string;
}

interface VerificationStats {
  total: number;
  successful: number;
  failed: number;
  pending: number;
  successRate: number;
  averageConfidence: number;
  byProvider: Record<string, number>;
  byType: Record<string, number>;
}

export default function VerificationManagementPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      loadVerificationData();
    }
  }, [user]);

  const loadVerificationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load verification logs
      const logsData = await fetchVerificationLogs();
      setLogs(logsData);

      // Calculate statistics
      const statsData = calculateStats(logsData);
      setStats(statsData);

    } catch (err) {
      console.error('Error loading verification data:', err);
      setError('Failed to load verification data');
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationLogs = async (): Promise<VerificationLog[]> => {
    // Simulate fetching verification logs from Firestore
    // In production, this would query the verificationLogs collection
    
    const mockLogs: VerificationLog[] = [
      {
        id: '1',
        userId: 'user1',
        type: 'selfie',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        success: true,
        confidence: 0.95,
        reasons: [],
        metadata: { provider: 'internal' },
        userEmail: 'user1@example.com',
        userName: 'John Doe'
      },
      {
        id: '2',
        userId: 'user2',
        type: 'id-document',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        success: false,
        confidence: 0.45,
        reasons: ['Poor image quality', 'Document not clearly visible'],
        metadata: { provider: 'clerk' },
        userEmail: 'user2@example.com',
        userName: 'Jane Smith'
      },
      {
        id: '3',
        userId: 'user3',
        type: 'selfie',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        success: true,
        confidence: 0.92,
        reasons: [],
        metadata: { provider: 'onfido' },
        userEmail: 'user3@example.com',
        userName: 'Bob Johnson'
      }
    ];

    return mockLogs;
  };

  const calculateStats = (logs: VerificationLog[]): VerificationStats => {
    const total = logs.length;
    const successful = logs.filter(log => log.success).length;
    const failed = logs.filter(log => !log.success).length;
    const successRate = total > 0 ? (successful / total) * 100 : 0;
    const averageConfidence = total > 0 
      ? logs.reduce((sum, log) => sum + log.confidence, 0) / total 
      : 0;

    const byProvider: Record<string, number> = {};
    const byType: Record<string, number> = {};

    logs.forEach(log => {
      const provider = log.metadata?.provider || 'unknown';
      byProvider[provider] = (byProvider[provider] || 0) + 1;
      byType[log.type] = (byType[log.type] || 0) + 1;
    });

    return {
      total,
      successful,
      failed,
      pending: 0, // Would be calculated from pending verifications
      successRate,
      averageConfidence,
      byProvider,
      byType
    };
  };

  const getFilteredLogs = () => {
    let filtered = logs;

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(log => log.type === filter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusBadge = (success: boolean, confidence: number) => {
    if (success) {
      if (confidence >= 0.9) {
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      } else {
        return <Badge className="bg-yellow-100 text-yellow-800">Verified (Low Confidence)</Badge>;
      }
    } else {
      return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'clerk':
        return <Shield className="h-4 w-4" />;
      case 'onfido':
        return <FileText className="h-4 w-4" />;
      case 'jumio':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['User ID', 'User Name', 'User Email', 'Type', 'Provider', 'Success', 'Confidence', 'Timestamp', 'Reasons'].join(','),
      ...getFilteredLogs().map(log => [
        log.userId,
        log.userName || '',
        log.userEmail || '',
        log.type,
        log.metadata?.provider || 'unknown',
        log.success ? 'Yes' : 'No',
        log.confidence,
        new Date(log.timestamp).toLocaleString(),
        log.reasons.join('; ')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading verification data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Verification Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage user verification requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadVerificationData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Verification Logs</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    All time verifications
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.successful} successful, {stats.failed} failed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(stats.averageConfidence * 100).toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Average verification confidence
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting review
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Verifications by Provider</CardTitle>
              </CardHeader>
              <CardContent>
                {stats && Object.entries(stats.byProvider).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(stats.byProvider).map(([provider, count]) => (
                      <div key={provider} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getProviderIcon(provider)}
                          <span className="capitalize">{provider}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No verification data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verifications by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {stats && Object.entries(stats.byType).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(stats.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {type === 'selfie' ? (
                            <UserCheck className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                          <span className="capitalize">{type.replace('-', ' ')}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No verification data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="all">All Types</option>
                  <option value="selfie">Selfie</option>
                  <option value="id-document">ID Document</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {getFilteredLogs().length} of {logs.length} logs
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredLogs().map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.userName || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{log.userEmail || log.userId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {log.type === 'selfie' ? (
                            <UserCheck className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                          <span className="capitalize">{log.type.replace('-', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getProviderIcon(log.metadata?.provider || 'unknown')}
                          <span className="capitalize">{log.metadata?.provider || 'unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(log.success, log.confidence)}
                      </TableCell>
                      <TableCell>
                        {(log.confidence * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providerManager.getAllProviders().map((provider) => (
                  <div key={provider.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getProviderIcon(provider.name.toLowerCase())}
                        <div>
                          <div className="font-medium">{provider.name}</div>
                          <div className="text-sm text-muted-foreground">{provider.description}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={provider.isAvailable ? "default" : "secondary"}>
                        {provider.isAvailable ? "Available" : "Not Configured"}
                      </Badge>
                      {provider.isAvailable && (
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configuration options for the verification system will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 