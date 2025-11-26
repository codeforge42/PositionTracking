import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getCompanies, deleteCompany, scanAllCompanies, deleteAllRecords } from '../../services/custonmers-companies-api';
import { Company } from '@/types';
import { Plus, Search, RefreshCw } from 'lucide-react';
import CompanyCard from '@/components/customer/CompanyCard';
import AddCompanyDialog from '@/components/customer/AddCompanyDialog';
import { useAuth } from '@/contexts/AuthContext';

const CustomerDashboard = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (localStorage.getItem('user')) fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      if (localStorage.getItem('user')) {
        const data = await getCompanies(JSON.parse(localStorage.getItem('user') || '{}')['user'].id);
        setCompanies(data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load companies.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    try {
      const data = await deleteCompany(user.id, companyId);
      setCompanies(data);
      toast({
        title: 'Company deleted',
        description: 'The company has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete company.',
        variant: 'destructive',
      });
    }
  };

  const handleScanAll = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isScanning) return;

    try {
      setIsScanning(true);
      toast({
        title: 'Scanning started',
        description: `Scanning all companies for ${user.name}...`,
      });

      const data = await scanAllCompanies(user.id);
      setCompanies(data);

      toast({
        title: 'Scanning complete',
        description: `Successfully scanned all companies for ${user.name}.`,
      });
    } catch (error) {
      toast({
        title: 'Scanning failed',
        description: 'There was an error scanning the companies.',
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
      window.location.reload();
    }
  };
  const handleDeleteAllRecords = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await deleteAllRecords(user.id);
      toast({
        title: 'All records deleted',
        description: 'All records have been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting all records:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete all records.',
        variant: 'destructive',
      });
    }
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.linkedin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="flex gap-4">
          <Button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 h-9 px-4"
          >
            <Plus className="h-4 w-4" />
            Customer
          </Button>
          <Button
            variant="default"
            onClick={handleScanAll}
            disabled={isScanning}
            className="flex items-center gap-2 h-9 px-4"
          >
            <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : `Scan All`}
          </Button>

          <Button
            variant="default"
            onClick={handleDeleteAllRecords}
            className="flex items-center gap-2 h-9 px-4"
          >
            Delete All Records
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search companies..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-lg">Loading...</div>
        </div>
      ) : filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              userId={user.id}
              company={company}
              setCompanies={setCompanies}
              onDelete={handleDeleteCompany}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium text-gray-700">No companies found</h3>
          <p className="text-gray-500 mt-1">Add your first company to start tracking job listings.</p>
        </div>
      )}

      <AddCompanyDialog
        open={dialogOpen}
        setCompanies={setCompanies}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
};

export default CustomerDashboard;
