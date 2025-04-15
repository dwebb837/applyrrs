import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import axios from 'axios';

interface SalaryRange {
    salaryHumanReadableText?: string;
}

interface Company {
    name: string;
    homePageURL: string;
    linkedInURL: string;
    employeeRange: string;
}

export interface Job {
    id: string;
    roleTitle: string;
    jobDescriptionSummary: string;
    employmentType: string;
    url: string;
    salaryRange: SalaryRange | null;
    company: Company;
}

interface ApiResponse {
    jobOpenings: Job[];
    totalCount: number;
}

interface JobState {
    jobs: Job[];
    page: number;
    totalPages: number;
    selectedJob: Job | null;
    loading: boolean;
    error: string;
    history: string[];
    appliedJobIds: string[];
    actions: {
        fetchJobs: () => Promise<void>;
        setPage: (page: number) => void;
        selectJob: (job: Job) => void;
        navigateHistory: (direction: 'back' | 'forward') => void;
        applyToJob: (jobId: string) => Promise<void>;
    };
}

const ITEMS_PER_PAGE = 20;

export const useJobStore = create<JobState>()(
    persist(
        immer((set, get) => ({
            jobs: [],
            page: 1,
            totalPages: 1,
            selectedJob: null,
            loading: false,
            error: '',
            history: [],
            appliedJobIds: [],

            actions: {
                fetchJobs: async () => {
                    const currentPage = get().page;
                    set(state => {
                        state.loading = true;
                        state.error = '';
                    });

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
                            page: currentPage,
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

                        const response = await axios.get<ApiResponse>(
                            `http://localhost:3010/api/jobs?q=${query}`
                        );

                        set(state => {
                            state.jobs = response.data.jobOpenings;
                            state.totalPages = Math.ceil(response.data.totalCount / ITEMS_PER_PAGE);
                            state.loading = false;
                        });
                    } catch (error) {
                        set(state => {
                            state.error = 'Failed to load jobs.';
                            state.loading = false;
                        });
                    }
                },

                setPage: (page) => {
                    set(state => {
                        state.page = page;
                        state.history = [];
                    });
                    get().actions.fetchJobs();
                },

                selectJob: (job) => {
                    set(state => {
                        state.selectedJob = job;
                        if (!state.history.includes(job.id)) {
                            state.history.push(job.id);
                            if (state.history.length > 50) state.history.shift();
                        }
                    });
                },

                navigateHistory: (direction) => {
                    set(state => {
                        const currentId = state.selectedJob?.id;
                        if (!currentId) return;

                        const currentIndex = state.history.indexOf(currentId);
                        const newIndex = direction === 'back' ? currentIndex - 1 : currentIndex + 1;

                        if (newIndex >= 0 && newIndex < state.history.length) {
                            const newJobId = state.history[newIndex];
                            state.selectedJob = state.jobs.find(j => j.id === newJobId) || null;
                        }
                    });
                },

                applyToJob: async (jobId) => {
                    try {
                        set(state => {
                            if (!state.appliedJobIds.includes(jobId)) {
                                state.appliedJobIds.push(jobId);
                            }
                        });

                        await axios.post(`http://localhost:3010/api/applications`, {
                            jobId,
                            timestamp: new Date().toISOString()
                        });

                    } catch (error) {
                        set(state => {
                            state.appliedJobIds = state.appliedJobIds.filter(id => id !== jobId);
                            state.error = 'Failed to save application. Please try again.';
                        });
                    }
                }
            }
        })),
        {
            name: 'job-store',
            partialize: (state) => ({
                page: state.page,
                history: state.history,
                appliedJobIds: state.appliedJobIds
            }),
            onRehydrateStorage: () => (state) => {
                state?.actions.fetchJobs();
                if (typeof window !== 'undefined') {
                    window.addEventListener('storage', (event) => {
                        if (event.key === 'job-store') {
                            state?.actions.fetchJobs();
                        }
                    });
                }
            },
        }
    )
);
