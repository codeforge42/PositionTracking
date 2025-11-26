import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getCustomerById } from "@/services/customers-api";
import { deleteRecords } from '../../services/custonmers-companies-api';
import { Company, Job } from "@/types";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const CompanyJobs = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!companyId) return;

      try {
        setLoading(true);
        const customerId = user?.id;
        // Fetch company details
        const data = await getCustomerById(customerId);
        const companies = data["companies"];
        const foundCompany = companies.find((c) => c.id === companyId);

        if (!foundCompany) {
          toast({
            title: "Error",
            description: "Company not found.",
            variant: "destructive",
          });
          navigate("/customer/dashboard");
          return;
        }

        setCompany(foundCompany);

        // Fetch jobs for this company
        const jobData = foundCompany.jobs;
        setJobs(jobData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load jobs.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId, navigate, toast]);

  
    const handleDeleteRecords = async () => {
  
      try {
        await deleteRecords(user.id, company.id);
        setJobs([]);
      } catch (error) {
        toast({
          title: 'deletion failed',
          description: 'There was an error deleting the records.',
          variant: 'destructive',
        });
      } 
    };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!company) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => navigate("/customer/dashboard")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{company.name}</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">Career URL:</span>{" "}
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {company.website}
              </a>
            </div>
            <div>
              <span className="font-medium">Last Scan:</span>{" "}
              {company.last_scan_date
                ? new Date(company.last_scan_date).toLocaleString()
                : "Not Scanned"}
            </div>
            <div>
              <span className="font-medium">Jobs Found:</span> {jobs.length}
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Job Listings</h3>
            <Button
            variant="default"
            onClick={handleDeleteRecords}
            className="flex items-center gap-2 h-9 px-4"
          >
            Delete Records
          </Button>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <h3 className="text-lg font-medium text-gray-700">
                No job listings found
              </h3>
              <p className="text-gray-500 mt-1">
                There are no job listings available for this company yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Description</TableHead>
                    {/* <TableHead>Posted Date</TableHead> */}
                    <TableHead>Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => {
                    if (job.description.includes("Yes,")) {
                      return (
                        <TableRow
                          key={job.id}
                          className={cn(
                            job.description.includes("Yes,")
                              ? "border-l-4 border-l-emerald-500"
                              : "border-l-4 border-l-red-500"
                          )}
                          style={{ borderLeftWidth: "4px" }}
                        >
                          <TableCell className="font-medium">
                            {job.title}
                          </TableCell>
                          <TableCell className="max-w-md truncate">
                            {job.description}
                          </TableCell>
                          <TableCell>
                            <a
                              href={job.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                            >
                              View Job
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return null; // Skip rendering if the condition is not met
                  })}
                  {jobs.map((job) => {
                    if (!job.description.includes("Yes,")) {
                      return (
                        <TableRow
                          key={job.id}
                          className={cn(
                            job.description.includes("Yes,")
                              ? "border-l-4 border-l-emerald-500"
                              : "border-l-4 border-l-red-500"
                          )}
                          style={{ borderLeftWidth: "4px" }}
                        >
                          <TableCell className="font-medium">
                            {job.title}
                          </TableCell>
                          <TableCell className="max-w-md truncate">
                            {job.description}
                          </TableCell>
                          <TableCell>
                            <a
                              href={job.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                            >
                              View Job
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return null; // Skip rendering if the condition is not met
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyJobs;
