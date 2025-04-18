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
        fetchJobs: (page?: number) => Promise<void>;
        setPage: (page: number) => void;
        selectJob: (job: Job | null) => void;
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
                fetchJobs: async (page?: number) => {
                    const currentPage = page ?? get().page;
                    try {
                        set(state => {
                            state.loading = true;
                            state.error = '';
                            state.jobs = [];
                        });

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
                            state.jobs = structuredClone(response.data.jobOpenings);
                            state.totalPages = Math.ceil(response.data.totalCount / ITEMS_PER_PAGE);
                            state.loading = false;
                            state.selectedJob = null;
                        });
                    } catch (error) {
                        set(state => {
                            state.loading = false;
                            state.error = 'Failed to load jobs. Please try again.';
                        });
                    }
                },

                setPage: (page) => {
                    set(state => {
                        state.page = page;
                        state.history = [];
                    });
                    get().actions.fetchJobs(page);
                },

                selectJob: (job) => {
                    if (!job) {
                        set(state => {
                            state.selectedJob = null;
                        });
                        return;
                    }

                    set(state => {
                        state.selectedJob = structuredClone(job);
                        if (!state.history.includes(job.id)) {
                            state.history = [...state.history.slice(-49), job.id];
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
                            const job = state.jobs.find(j => j.id === newJobId);
                            state.selectedJob = job ? structuredClone(job) : null;
                        }
                    });
                },

                applyToJob: async (jobId) => {
                    try {
                        set(state => {
                            if (!state.appliedJobIds.includes(jobId)) {
                                state.appliedJobIds = [...state.appliedJobIds, jobId];
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
            onRehydrateStorage: () => async (state) => {
                if (state) {
                    setTimeout(async () => {
                        await state.actions.fetchJobs(state.page);
                    }, 100);

                    window.addEventListener('storage', (event) => {
                        if (event.key === 'job-store') {
                            state.actions.fetchJobs(state.page);
                        }
                    });
                }
            },
        }
    )
);

export const useJobs = () => useJobStore(store => store.jobs);
export const useCurrentPage = () => useJobStore(store => store.page);
export const useTotalPages = () => useJobStore(store => store.totalPages);
export const useSelectedJob = () => useJobStore(store => store.selectedJob);
export const useLoadingState = () => useJobStore(store => store.loading);
export const useErrorState = () => useJobStore(store => store.error);
export const useAppliedJobs = () => useJobStore(store => store.appliedJobIds);
export const useJobActions = () => useJobStore(store => store.actions);
