import { memo } from 'preact/compat';
import type { Job } from '../stores/jobStore';

interface JobListItemProps {
    job: Job;
    isSelected: boolean;
    isApplied: boolean;
    onSelect: () => void;
}

const JobListItem = memo(({ job, isSelected, isApplied, onSelect }: JobListItemProps) => {
    return (
        <li
            class={`job-item ${isSelected ? 'selected' : ''}`}
            onClick={onSelect}
        >
            <a href={job.url} target="_blank" rel="noopener noreferrer" class="job-link">
                <div class="job-info">
                    <h3 class="job-title">{job.roleTitle}</h3>
                    <p class="company-name">{job.company.name}</p>
                </div>
            </a>
            {isApplied && <div class="applied-badge">✓ Applied</div>}
        </li>
    );
}, (prev, next) =>
    prev.job.id === next.job.id &&
    prev.isSelected === next.isSelected &&
    prev.isApplied === next.isApplied
);

export default JobListItem;
