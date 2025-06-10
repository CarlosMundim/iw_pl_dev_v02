import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  companyLogo?: string;
  appliedDate: string;
  status: 'applied' | 'under_review' | 'phone_screen' | 'technical_interview' | 
          'final_interview' | 'offer_extended' | 'hired' | 'rejected' | 'withdrawn';
  matchScore?: number;
  coverLetter?: string;
  resumeVersion?: string;
  interviewDate?: string;
  interviewType?: 'phone' | 'video' | 'in_person';
  interviewNotes?: string;
  feedback?: string;
  rejectionReason?: string;
  offerDetails?: {
    salary: number;
    equity?: number;
    startDate?: string;
    benefits?: string[];
  };
  timeline: {
    date: string;
    status: string;
    note?: string;
  }[];
}

interface ApplicationsState {
  applications: Application[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  filters: {
    status?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
    company?: string;
  };
  sortBy: 'date' | 'status' | 'company';
  sortOrder: 'asc' | 'desc';
  statistics: {
    total: number;
    pending: number;
    interviews: number;
    offers: number;
    rejections: number;
    successRate: number;
  };
}

const initialState: ApplicationsState = {
  applications: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: {},
  sortBy: 'date',
  sortOrder: 'desc',
  statistics: {
    total: 0,
    pending: 0,
    interviews: 0,
    offers: 0,
    rejections: 0,
    successRate: 0,
  },
};

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    // Fetch applications
    fetchApplicationsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchApplicationsSuccess: (state, action: PayloadAction<Application[]>) => {
      state.isLoading = false;
      state.applications = action.payload;
      state.error = null;
      // Update statistics
      state.statistics = calculateStatistics(action.payload);
    },
    fetchApplicationsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Submit application
    submitApplicationStart: (state) => {
      state.isSubmitting = true;
      state.error = null;
    },
    submitApplicationSuccess: (state, action: PayloadAction<Application>) => {
      state.isSubmitting = false;
      state.applications.unshift(action.payload);
      state.error = null;
      // Update statistics
      state.statistics = calculateStatistics(state.applications);
    },
    submitApplicationFailure: (state, action: PayloadAction<string>) => {
      state.isSubmitting = false;
      state.error = action.payload;
    },

    // Update application status
    updateApplicationStatus: (state, action: PayloadAction<{
      applicationId: string;
      status: Application['status'];
      note?: string;
      interviewDate?: string;
      interviewType?: Application['interviewType'];
      feedback?: string;
      offerDetails?: Application['offerDetails'];
    }>) => {
      const { applicationId, status, note, interviewDate, interviewType, feedback, offerDetails } = action.payload;
      const application = state.applications.find(app => app.id === applicationId);
      
      if (application) {
        application.status = status;
        
        // Add to timeline
        application.timeline.push({
          date: new Date().toISOString(),
          status,
          note,
        });

        // Update specific fields based on status
        if (interviewDate) {
          application.interviewDate = interviewDate;
        }
        if (interviewType) {
          application.interviewType = interviewType;
        }
        if (feedback) {
          application.feedback = feedback;
        }
        if (offerDetails) {
          application.offerDetails = offerDetails;
        }

        // Update statistics
        state.statistics = calculateStatistics(state.applications);
      }
    },

    // Withdraw application
    withdrawApplication: (state, action: PayloadAction<{
      applicationId: string;
      reason?: string;
    }>) => {
      const { applicationId, reason } = action.payload;
      const application = state.applications.find(app => app.id === applicationId);
      
      if (application) {
        application.status = 'withdrawn';
        application.timeline.push({
          date: new Date().toISOString(),
          status: 'withdrawn',
          note: reason,
        });

        // Update statistics
        state.statistics = calculateStatistics(state.applications);
      }
    },

    // Add interview notes
    addInterviewNotes: (state, action: PayloadAction<{
      applicationId: string;
      notes: string;
    }>) => {
      const { applicationId, notes } = action.payload;
      const application = state.applications.find(app => app.id === applicationId);
      
      if (application) {
        application.interviewNotes = notes;
      }
    },

    // Update filters
    updateFilters: (state, action: PayloadAction<Partial<ApplicationsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },

    // Update sorting
    setSorting: (state, action: PayloadAction<{
      sortBy: ApplicationsState['sortBy'];
      sortOrder: ApplicationsState['sortOrder'];
    }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Delete application
    deleteApplication: (state, action: PayloadAction<string>) => {
      const applicationId = action.payload;
      state.applications = state.applications.filter(app => app.id !== applicationId);
      // Update statistics
      state.statistics = calculateStatistics(state.applications);
    },
  },
});

// Helper function to calculate statistics
const calculateStatistics = (applications: Application[]) => {
  const total = applications.length;
  const pending = applications.filter(app => 
    ['applied', 'under_review'].includes(app.status)
  ).length;
  const interviews = applications.filter(app => 
    ['phone_screen', 'technical_interview', 'final_interview'].includes(app.status)
  ).length;
  const offers = applications.filter(app => 
    ['offer_extended', 'hired'].includes(app.status)
  ).length;
  const rejections = applications.filter(app => 
    app.status === 'rejected'
  ).length;
  const successRate = total > 0 ? Math.round((offers / total) * 100) : 0;

  return {
    total,
    pending,
    interviews,
    offers,
    rejections,
    successRate,
  };
};

export const {
  fetchApplicationsStart,
  fetchApplicationsSuccess,
  fetchApplicationsFailure,
  submitApplicationStart,
  submitApplicationSuccess,
  submitApplicationFailure,
  updateApplicationStatus,
  withdrawApplication,
  addInterviewNotes,
  updateFilters,
  clearFilters,
  setSorting,
  clearError,
  deleteApplication,
} = applicationsSlice.actions;

export default applicationsSlice.reducer;

// Selectors
export const selectApplications = (state: { applications: ApplicationsState }) => state.applications.applications;
export const selectApplicationsLoading = (state: { applications: ApplicationsState }) => state.applications.isLoading;
export const selectApplicationsError = (state: { applications: ApplicationsState }) => state.applications.error;
export const selectApplicationsStatistics = (state: { applications: ApplicationsState }) => state.applications.statistics;
export const selectApplicationFilters = (state: { applications: ApplicationsState }) => state.applications.filters;
export const selectIsSubmitting = (state: { applications: ApplicationsState }) => state.applications.isSubmitting;

// Derived selectors
export const selectApplicationsByStatus = (status: Application['status']) => 
  (state: { applications: ApplicationsState }) => 
    state.applications.applications.filter(app => app.status === status);

export const selectRecentApplications = (state: { applications: ApplicationsState }) => 
  state.applications.applications
    .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
    .slice(0, 5);

export const selectUpcomingInterviews = (state: { applications: ApplicationsState }) => 
  state.applications.applications
    .filter(app => 
      app.interviewDate && 
      new Date(app.interviewDate) > new Date() &&
      ['phone_screen', 'technical_interview', 'final_interview'].includes(app.status)
    )
    .sort((a, b) => 
      new Date(a.interviewDate!).getTime() - new Date(b.interviewDate!).getTime()
    );