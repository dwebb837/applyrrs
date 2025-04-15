import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import axios from 'axios';
import './App.css';

interface SalaryRange {
  salaryHumanReadableText?: string;
}

interface Job {
  id: string;
  roleTitle: string;
  jobDescriptionSummary: string;
  employmentType: string;
  url: string;
  salaryRange: SalaryRange | null;
  company: {
    name: string;
    homePageURL: string;
    linkedInURL: string;
    employeeRange: string;
  };
}

interface ApiResponse {
  jobOpenings: Job[];
  totalCount: number;
}

const ITEMS_PER_PAGE = 20;

export function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError('');
      try {
        const query = encodeURIComponent(JSON.stringify({
          seniorityFilters: [],
          locationFilters: ['United+States'],
          locationUSStatesFilters: [],
          techStackFilters: [],
          jobTitleFilters: ['Software+Developer'],
          keywordFilters: [],
          excludedKeywordFilters: [],
          companySizeFilters: [],
          employmentTypeFilters: [],
          visaFilter: null,
          minSalaryFilter: null,
          showJobsWithoutSalaryWithMinSalaryFilter: false,
          degreeRequiredFilter: null,
          industriesFilters: [],
          excludeIndustriesFilters: [],
          companyIdFilter: null,
          page,
          itemsPerPage: ITEMS_PER_PAGE,
          sortBy: 'DateAdded',
          showOnlySavedJobs: false,
          showOnlyAppliedJobs: false,
          showOnlyHiddenJobs: false,
          savedJobOpeningIds: [],
          appliedJobOpeningIds: [],
          hiddenJobOpeningIds: [],
          numberOfJobsHiddenInThisSession: 0
        }));

        const response = await axios.get<ApiResponse>(`http://localhost:3010/api/jobs?q=${query}`);
        setJobs(response.data.jobOpenings);
        setTotalPages(Math.ceil(response.data.totalCount / ITEMS_PER_PAGE));
        setSelectedJob(null);
      } catch {
        setError('Failed to load jobs.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [page]);

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
  };

  const handlePrevJob = () => {
    const idx = jobs.findIndex(j => j.id === selectedJob?.id);
    if (idx > 0) setSelectedJob(jobs[idx - 1]);
    else if (page > 1) {
      setPage(page - 1);
      setSelectedJob(null);
    }
  };

  const handleNextJob = () => {
    const idx = jobs.findIndex(j => j.id === selectedJob?.id);
    if (idx < jobs.length - 1) setSelectedJob(jobs[idx + 1]);
    else if (page < totalPages) {
      setPage(page + 1);
      setSelectedJob(null);
    }
  };

  return (
    <div class="container">
      <div class="left">
        <div class="pagination">
          <button onClick={() => setPage(page - 1)} disabled={page <= 1 || loading}>
            ← Prev Page
          </button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(page + 1)} disabled={page >= totalPages || loading}>
            Next Page →
          </button>
        </div>

        {loading && <div class="loader">Loading jobs...</div>}
        {error && <div class="error">{error}</div>}

        <ul class="job-list">
          {jobs.map(job => (
            <li
              key={job.id}
              class={selectedJob?.id === job.id ? 'selected' : ''}
              onClick={() => handleSelectJob(job)}
            >
              <p>{job.roleTitle}</p>
              <p>{job.company.name}</p>
            </li>
          ))}
        </ul>
      </div>

      <div class="right">
        <div class="job-navigation">
          <button onClick={handlePrevJob} disabled={!selectedJob && page <= 1}>
            ← Prev Job
          </button>
          <button onClick={handleNextJob} disabled={!selectedJob && page >= totalPages}>
            Next Job →
          </button>
        </div>

        {selectedJob ? (
          <div class="details">
            <h2>{selectedJob.roleTitle}</h2>
            <h3>{selectedJob.company.name}</h3>
            <p><strong>Type:</strong> {selectedJob.employmentType || 'N/A'}</p>
            <p><strong>Salary:</strong> {selectedJob.salaryRange?.salaryHumanReadableText || 'N/A'}</p>
            <p><strong>Description:</strong> {selectedJob.jobDescriptionSummary || 'N/A'}</p>
            <p><strong>Employement Type:</strong> {selectedJob.employmentType || 'N/A'}</p>
            <p><strong>Employee Range:</strong> {selectedJob.company.employeeRange || 'N/A'}</p>
            <p><strong>HomePage URL:</strong> {selectedJob.company.homePageURL || 'N/A'}</p>
            <p><strong>LinkedIn URL:</strong> {selectedJob.company.linkedInURL || 'N/A'}</p>
            <a href={selectedJob.url} target="_blank" rel="noopener noreferrer">
              <button class="apply-btn">Apply Now</button>
            </a>
          </div>
        ) : (
          <div class="no-selection">
            {loading ? 'Loading details...' : 'Select a job to view details.'}
          </div>
        )}
      </div>
    </div>
  );
}
