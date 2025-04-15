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
    actions: {
        fetchJobs: () => Promise<void>;
        setPage: (page: number) => void;
        selectJob: (job: Job) => void;
        navigateHistory: (direction: 'back' | 'forward') => void;
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

            actions: {
                fetchJobs: async () => {
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
                            page: get().page,
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
                            state.selectedJob = null;
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
                            // Keep only last 50 entries
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
                }
            }
        })),
        {
            name: 'job-store',
            partialize: (state) => ({
                page: state.page,
                history: state.history,
            })
        }
    )
);
