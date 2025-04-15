import { useEffect } from 'preact/hooks';
import { useJobStore } from './stores/jobStore';
import './App.css';

export function App() {
  const {
    jobs,
    page,
    totalPages,
    selectedJob,
    loading,
    error,
    history,
    appliedJobIds,
    actions
  } = useJobStore();

  const currentHistoryIndex = selectedJob ? history.indexOf(selectedJob.id) : -1;
  const canGoBack = currentHistoryIndex > 0;
  const canGoForward = currentHistoryIndex < history.length - 1;
  const isApplied = selectedJob ? appliedJobIds.includes(selectedJob.id) : false;

  useEffect(() => {
    actions.fetchJobs();
  }, [page]);

  return (
    <div class="container">
      <div class="left">
        <div class="pagination">
          <button
            onClick={() => actions.setPage(page - 1)}
            disabled={page <= 1 || loading}
          >
            ← Prev Page
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            onClick={() => actions.setPage(page + 1)}
            disabled={page >= totalPages || loading}
          >
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
              onClick={() => actions.selectJob(job)}
            >
              <p>{job.roleTitle}</p>
              <p>{job.company.name}</p>
              {appliedJobIds.includes(selectedJob?.id || '') && (
                <div class="applied-badge">✓ Applied</div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div class="right">
        <div class="job-navigation">
          <button
            onClick={() => actions.navigateHistory('back')}
            disabled={!canGoBack}
            title="Navigate back through history"
          >
            ↞ History
          </button>
          <button
            onClick={() => {
              const idx = jobs.findIndex(j => j.id === selectedJob?.id);
              if (idx > 0) actions.selectJob(jobs[idx - 1]);
              else if (page > 1) actions.setPage(page - 1);
            }}
            disabled={!selectedJob && page <= 1}
          >
            ← Prev Job
          </button>
          <button
            onClick={() => {
              const idx = jobs.findIndex(j => j.id === selectedJob?.id);
              if (idx < jobs.length - 1) actions.selectJob(jobs[idx + 1]);
              else if (page < totalPages) actions.setPage(page + 1);
            }}
            disabled={!selectedJob && page >= totalPages}
          >
            Next Job →
          </button>
          <button
            onClick={() => actions.navigateHistory('forward')}
            disabled={!canGoForward}
            title="Navigate forward through history"
          >
            History ↠
          </button>
        </div>

        {selectedJob ? (
          <div class="details">
            <h2>{selectedJob.roleTitle}</h2>
            <h3>{selectedJob.company.name}</h3>
            <p><strong>Type:</strong> {selectedJob.employmentType || 'N/A'}</p>
            <p><strong>Salary:</strong> {selectedJob.salaryRange?.salaryHumanReadableText || 'N/A'}</p>
            <p><strong>Description:</strong> {selectedJob.jobDescriptionSummary || 'N/A'}</p>
            <p><strong>Employee Range:</strong> {selectedJob.company.employeeRange || 'N/A'}</p>
            <p><strong>HomePage URL:</strong>
              <a href={selectedJob.company.homePageURL} target="_blank" rel="noopener noreferrer">
                {selectedJob.company.homePageURL || 'N/A'}
              </a>
            </p>
            <p><strong>LinkedIn URL:</strong>
              <a href={selectedJob.company.linkedInURL} target="_blank" rel="noopener noreferrer">
                {selectedJob.company.linkedInURL || 'N/A'}
              </a>
            </p>
            <a href={selectedJob.url} target="_blank" rel="noopener noreferrer" class="job-url">
              <button class={`apply-btn ${isApplied ? 'applied' : ''}`}>
                {isApplied ? '✓ Applied - Visit Job Page' : 'Go to Application Page'}
              </button>
            </a>

            {!isApplied && (
              <button
                class="mark-applied-btn"
                onClick={(e) => {
                  e.preventDefault();
                  actions.applyToJob(selectedJob.id);
                }}
              >
                Mark as Applied
              </button>
            )}
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
