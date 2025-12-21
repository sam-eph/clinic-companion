import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockLabTests } from '@/data/mockData';
import { LabTest } from '@/types/clinic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Search, TestTube, Clock, CheckCircle, AlertCircle, Upload, DollarSign, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function LabTests() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [resultText, setResultText] = useState('');

  const getStatusIcon = (status: LabTest['status']) => {
    const icons = {
      'pending': <Clock className="h-4 w-4" />,
      'in-progress': <TestTube className="h-4 w-4" />,
      'completed': <CheckCircle className="h-4 w-4" />,
    };
    return icons[status];
  };

  const getStatusColor = (status: LabTest['status']) => {
    const colors = {
      'pending': 'bg-warning/10 text-warning border-warning/20',
      'in-progress': 'bg-info/10 text-info border-info/20',
      'completed': 'bg-success/10 text-success border-success/20',
    };
    return colors[status];
  };

  const filteredTests = mockLabTests.filter(test =>
    test.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.testType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingTests = filteredTests.filter(t => t.status === 'pending');
  const inProgressTests = filteredTests.filter(t => t.status === 'in-progress');
  const completedTests = filteredTests.filter(t => t.status === 'completed');

  const handleUploadResult = () => {
    if (!resultText.trim()) {
      toast.error('Please enter test results');
      return;
    }
    toast.success('Test results uploaded successfully');
    setIsResultDialogOpen(false);
    setResultText('');
    setSelectedTest(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const TestTable = ({ tests, showActions = false }: { tests: LabTest[], showActions?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead>Test ID</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead>Test Type</TableHead>
          <TableHead>Requested By</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Fee</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Status</TableHead>
          {showActions && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {tests.map((test) => (
          <TableRow key={test.id} className="hover:bg-accent/50">
            <TableCell className="font-mono text-sm text-primary">{test.id}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                  <User className="h-4 w-4 text-secondary-foreground" />
                </div>
                <span className="font-medium">{test.patientName}</span>
              </div>
            </TableCell>
            <TableCell>{test.testType}</TableCell>
            <TableCell className="text-muted-foreground">{test.requestedBy}</TableCell>
            <TableCell>{formatDate(test.requestDate)}</TableCell>
            <TableCell className="font-medium">${test.fee.toFixed(2)}</TableCell>
            <TableCell>
              <Badge variant="outline" className={cn(
                test.isPaid 
                  ? 'bg-success/10 text-success border-success/20' 
                  : 'bg-warning/10 text-warning border-warning/20'
              )}>
                <DollarSign className="h-3 w-3 mr-1" />
                {test.isPaid ? 'Paid' : 'Pending'}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={cn('gap-1', getStatusColor(test.status))}>
                {getStatusIcon(test.status)}
                <span className="capitalize">{test.status.replace('-', ' ')}</span>
              </Badge>
            </TableCell>
            {showActions && (
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {test.status === 'pending' && test.isPaid && user?.role === 'laboratory' && (
                    <Button size="sm" variant="outline" onClick={() => {
                      toast.success('Test started');
                    }}>
                      Start Test
                    </Button>
                  )}
                  {test.status === 'in-progress' && user?.role === 'laboratory' && (
                    <Button size="sm" onClick={() => {
                      setSelectedTest(test);
                      setIsResultDialogOpen(true);
                    }}>
                      <Upload className="h-4 w-4 mr-1" />
                      Upload Result
                    </Button>
                  )}
                  {test.status === 'completed' && (
                    <Button size="sm" variant="ghost" onClick={() => setSelectedTest(test)}>
                      View Result
                    </Button>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <DashboardLayout title="Laboratory Tests" subtitle="Manage and process lab test requests">
      <div className="space-y-6">
        {/* Search */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by patient or test type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingTests.length}</p>
              <p className="text-sm text-muted-foreground">Pending Tests</p>
            </div>
          </div>
          <div className="rounded-xl border border-info/20 bg-info/5 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <TestTube className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{inProgressTests.length}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </div>
          <div className="rounded-xl border border-success/20 bg-success/5 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedTests.length}</p>
              <p className="text-sm text-muted-foreground">Completed Today</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pendingTests.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="gap-2">
              <TestTube className="h-4 w-4" />
              In Progress ({inProgressTests.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed ({completedTests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <TestTable tests={pendingTests} showActions />
              {pendingTests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mb-3 opacity-50" />
                  <p>No pending tests</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="in-progress">
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <TestTable tests={inProgressTests} showActions />
              {inProgressTests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <TestTube className="h-12 w-12 mb-3 opacity-50" />
                  <p>No tests in progress</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <TestTable tests={completedTests} showActions />
              {completedTests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mb-3 opacity-50" />
                  <p>No completed tests</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Upload Result Dialog */}
        <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Test Results</DialogTitle>
              <DialogDescription>
                Enter the results for {selectedTest?.testType}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Patient</span>
                  <span className="font-medium">{selectedTest?.patientName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Test Type</span>
                  <span className="font-medium">{selectedTest?.testType}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="result">Test Results</Label>
                <Textarea
                  id="result"
                  placeholder="Enter detailed test results..."
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                  rows={6}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsResultDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUploadResult}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Results
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Result Dialog */}
        <Dialog open={!!selectedTest && !isResultDialogOpen} onOpenChange={() => setSelectedTest(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Results</DialogTitle>
              <DialogDescription>
                {selectedTest?.testType} for {selectedTest?.patientName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Test Date</span>
                  <span className="font-medium">{selectedTest?.requestDate && formatDate(selectedTest.requestDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Result Date</span>
                  <span className="font-medium">{selectedTest?.resultDate && formatDate(selectedTest.resultDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Requested By</span>
                  <span className="font-medium">{selectedTest?.requestedBy}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Results</Label>
                <div className="rounded-lg border border-border p-4 bg-card">
                  <p className="text-sm whitespace-pre-wrap">{selectedTest?.result || 'No results available'}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setSelectedTest(null)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
