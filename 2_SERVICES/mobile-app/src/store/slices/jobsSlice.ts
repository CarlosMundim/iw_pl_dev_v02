import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  salary?: string;
  salaryRange?: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  remote: boolean;
  description: string;
  requirements: string[];
  niceToHave?: string[];
  benefits?: string[];
  postedDate: string;
  applicationDeadline?: string;
  experienceLevel: 'entry' | 'mid' | 'senior';
  department?: string;
  tags?: string[];
  isBookmarked?: boolean;
  matchScore?: number;
  viewCount?: number;
  applicationCount?: number;
}

interface JobFilters {
  location?: string;
  jobType?: string[];
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string[];
  keywords?: string;
  company?: string;
  department?: string[];
  postedSince?: string; // '1d', '7d', '30d'
}

interface JobsState {
  jobs: Job[];
  bookmarkedJobs: string[]; // Job IDs
  recentlyViewed: string[]; // Job IDs
  searchResults: Job[];
  featuredJobs: Job[];
  recommendedJobs: Job[];
  filters: JobFilters;
  searchQuery: string;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMoreJobs: boolean;
  currentPage: number;
  totalJobs: number;
  sortBy: 'relevance' | 'date' | 'salary' | 'match';
  sortOrder: 'asc' | 'desc';
}

const initialState: JobsState = {
  jobs: [],
  bookmarkedJobs: [],
  recentlyViewed: [],
  searchResults: [],
  featuredJobs: [],
  recommendedJobs: [],
  filters: {},
  searchQuery: '',
  isLoading: false,
  isLoadingMore: false,
  error: null,
  hasMoreJobs: true,
  currentPage: 1,
  totalJobs: 0,
  sortBy: 'relevance',
  sortOrder: 'desc',
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    // Fetch jobs
    fetchJobsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchJobsSuccess: (state, action: PayloadAction<{
      jobs: Job[];
      totalJobs: number;
      currentPage: number;
      hasMore: boolean;
    }>) => {
      state.isLoading = false;
      state.jobs = action.payload.jobs;
      state.totalJobs = action.payload.totalJobs;
      state.currentPage = action.payload.currentPage;
      state.hasMoreJobs = action.payload.hasMore;
      state.error = null;
    },
    fetchJobsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Load more jobs
    loadMoreJobsStart: (state) => {
      state.isLoadingMore = true;
    },
    loadMoreJobsSuccess: (state, action: PayloadAction<{
      jobs: Job[];
      currentPage: number;
      hasMore: boolean;
    }>) => {
      state.isLoadingMore = false;
      state.jobs = [...state.jobs, ...action.payload.jobs];
      state.currentPage = action.payload.currentPage;
      state.hasMoreJobs = action.payload.hasMore;
    },
    loadMoreJobsFailure: (state, action: PayloadAction<string>) => {
      state.isLoadingMore = false;
      state.error = action.payload;
    },

    // Search jobs
    searchJobsStart: (state, action: PayloadAction<string>) => {
      state.isLoading = true;
      state.searchQuery = action.payload;
      state.error = null;
    },
    searchJobsSuccess: (state, action: PayloadAction<Job[]>) => {
      state.isLoading = false;
      state.searchResults = action.payload;
      state.error = null;
    },
    searchJobsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Featured jobs
    setFeaturedJobs: (state, action: PayloadAction<Job[]>) => {
      state.featuredJobs = action.payload;
    },

    // Recommended jobs
    setRecommendedJobs: (state, action: PayloadAction<Job[]>) => {
      state.recommendedJobs = action.payload;
    },

    // Bookmarks
    toggleBookmark: (state, action: PayloadAction<string>) => {
      const jobId = action.payload;
      const isBookmarked = state.bookmarkedJobs.includes(jobId);
      
      if (isBookmarked) {
        state.bookmarkedJobs = state.bookmarkedJobs.filter(id => id !== jobId);
      } else {
        state.bookmarkedJobs.push(jobId);
      }

      // Update job in all arrays
      const updateJobBookmark = (jobs: Job[]) => {
        return jobs.map(job => 
          job.id === jobId 
            ? { ...job, isBookmarked: !isBookmarked }
            : job
        );
      };

      state.jobs = updateJobBookmark(state.jobs);
      state.searchResults = updateJobBookmark(state.searchResults);
      state.featuredJobs = updateJobBookmark(state.featuredJobs);
      state.recommendedJobs = updateJobBookmark(state.recommendedJobs);
    },

    // Recently viewed
    addToRecentlyViewed: (state, action: PayloadAction<string>) => {
      const jobId = action.payload;
      state.recentlyViewed = [
        jobId,
        ...state.recentlyViewed.filter(id => id !== jobId)
      ].slice(0, 20); // Keep only last 20
    },

    // Filters
    updateFilters: (state, action: PayloadAction<Partial<JobFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },

    // Sorting
    setSorting: (state, action: PayloadAction<{
      sortBy: typeof initialState.sortBy;
      sortOrder: typeof initialState.sortOrder;
    }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },

    // Update single job
    updateJob: (state, action: PayloadAction<Job>) => {
      const updatedJob = action.payload;
      
      const updateJobInArray = (jobs: Job[]) => {
        return jobs.map(job => 
          job.id === updatedJob.id ? updatedJob : job
        );
      };

      state.jobs = updateJobInArray(state.jobs);
      state.searchResults = updateJobInArray(state.searchResults);
      state.featuredJobs = updateJobInArray(state.featuredJobs);
      state.recommendedJobs = updateJobInArray(state.recommendedJobs);
    },

    // Clear search
    clearSearch: (state) => {
      state.searchQuery = '';
      state.searchResults = [];
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset pagination
    resetPagination: (state) => {
      state.currentPage = 1;
      state.hasMoreJobs = true;
      state.jobs = [];
    },
  },
});

export const {
  fetchJobsStart,
  fetchJobsSuccess,
  fetchJobsFailure,
  loadMoreJobsStart,
  loadMoreJobsSuccess,
  loadMoreJobsFailure,
  searchJobsStart,
  searchJobsSuccess,
  searchJobsFailure,
  setFeaturedJobs,
  setRecommendedJobs,
  toggleBookmark,
  addToRecentlyViewed,
  updateFilters,
  clearFilters,
  setSorting,
  updateJob,
  clearSearch,
  clearError,
  resetPagination,
} = jobsSlice.actions;

export default jobsSlice.reducer;

// Selectors
export const selectJobs = (state: { jobs: JobsState }) => state.jobs.jobs;
export const selectSearchResults = (state: { jobs: JobsState }) => state.jobs.searchResults;
export const selectFeaturedJobs = (state: { jobs: JobsState }) => state.jobs.featuredJobs;
export const selectRecommendedJobs = (state: { jobs: JobsState }) => state.jobs.recommendedJobs;
export const selectBookmarkedJobs = (state: { jobs: JobsState }) => state.jobs.bookmarkedJobs;
export const selectRecentlyViewed = (state: { jobs: JobsState }) => state.jobs.recentlyViewed;
export const selectJobsLoading = (state: { jobs: JobsState }) => state.jobs.isLoading;
export const selectJobsError = (state: { jobs: JobsState }) => state.jobs.error;
export const selectJobFilters = (state: { jobs: JobsState }) => state.jobs.filters;
export const selectSearchQuery = (state: { jobs: JobsState }) => state.jobs.searchQuery;
export const selectHasMoreJobs = (state: { jobs: JobsState }) => state.jobs.hasMoreJobs;

// Derived selectors
export const selectBookmarkedJobDetails = (state: { jobs: JobsState }) => {
  const allJobs = [...state.jobs.jobs, ...state.jobs.searchResults, ...state.jobs.featuredJobs];
  return state.jobs.bookmarkedJobs
    .map(id => allJobs.find(job => job.id === id))
    .filter(Boolean) as Job[];
};

export const selectRecentlyViewedJobs = (state: { jobs: JobsState }) => {
  const allJobs = [...state.jobs.jobs, ...state.jobs.searchResults, ...state.jobs.featuredJobs];
  return state.jobs.recentlyViewed
    .map(id => allJobs.find(job => job.id === id))
    .filter(Boolean) as Job[];
};