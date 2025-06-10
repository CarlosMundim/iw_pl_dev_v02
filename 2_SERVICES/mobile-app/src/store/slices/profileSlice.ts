import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Education {
  id: string;
  degree: string;
  field: string;
  school: string;
  graduationYear: number;
  gpa?: number;
  description?: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  skills: string[];
  location?: string;
}

interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
  endorsements?: number;
}

interface ProfileState {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location: string;
    profilePicture?: string;
    headline?: string;
    summary?: string;
    website?: string;
    linkedIn?: string;
    github?: string;
    portfolio?: string;
  };
  workPreferences: {
    jobTypes: string[];
    preferredLocations: string[];
    remoteWork: 'yes' | 'no' | 'hybrid';
    salaryExpectation?: {
      min: number;
      max: number;
      currency: string;
    };
    availability: string;
    workAuthorization: string;
  };
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    dateEarned: string;
    expiryDate?: string;
    credentialId?: string;
    url?: string;
  }[];
  languages: {
    id: string;
    name: string;
    proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
  }[];
  completionScore: number;
  profileViews: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: ProfileState = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    location: '',
  },
  workPreferences: {
    jobTypes: [],
    preferredLocations: [],
    remoteWork: 'hybrid',
    availability: 'immediately',
    workAuthorization: '',
  },
  education: [],
  experience: [],
  skills: [],
  certifications: [],
  languages: [],
  completionScore: 0,
  profileViews: 0,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // Fetch profile
    fetchProfileStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchProfileSuccess: (state, action: PayloadAction<Omit<ProfileState, 'isLoading' | 'error'>>) => {
      state.isLoading = false;
      Object.assign(state, action.payload);
      state.error = null;
    },
    fetchProfileFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update personal info
    updatePersonalInfo: (state, action: PayloadAction<Partial<ProfileState['personalInfo']>>) => {
      state.personalInfo = { ...state.personalInfo, ...action.payload };
      state.lastUpdated = new Date().toISOString();
      state.completionScore = calculateCompletionScore(state);
    },

    // Update work preferences
    updateWorkPreferences: (state, action: PayloadAction<Partial<ProfileState['workPreferences']>>) => {
      state.workPreferences = { ...state.workPreferences, ...action.payload };
      state.lastUpdated = new Date().toISOString();
      state.completionScore = calculateCompletionScore(state);
    },

    // Education management
    addEducation: (state, action: PayloadAction<Education>) => {
      state.education.push(action.payload);
      state.lastUpdated = new Date().toISOString();
      state.completionScore = calculateCompletionScore(state);
    },
    updateEducation: (state, action: PayloadAction<Education>) => {
      const index = state.education.findIndex(edu => edu.id === action.payload.id);
      if (index !== -1) {
        state.education[index] = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.completionScore = calculateCompletionScore(state);
      }
    },
    removeEducation: (state, action: PayloadAction<string>) => {
      state.education = state.education.filter(edu => edu.id !== action.payload);
      state.lastUpdated = new Date().toISOString();
      state.completionScore = calculateCompletionScore(state);
    },

    // Experience management
    addExperience: (state, action: PayloadAction<Experience>) => {
      state.experience.push(action.payload);
      state.lastUpdated = new Date().toISOString();
      state.completionScore = calculateCompletionScore(state);
    },
    updateExperience: (state, action: PayloadAction<Experience>) => {
      const index = state.experience.findIndex(exp => exp.id === action.payload.id);
      if (index !== -1) {
        state.experience[index] = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.completionScore = calculateCompletionScore(state);
      }
    },
    removeExperience: (state, action: PayloadAction<string>) => {
      state.experience = state.experience.filter(exp => exp.id !== action.payload);
      state.lastUpdated = new Date().toISOString();
      state.completionScore = calculateCompletionScore(state);
    },

    // Skills management
    addSkill: (state, action: PayloadAction<Skill>) => {
      state.skills.push(action.payload);
      state.lastUpdated = new Date().toISOString();
      state.completionScore = calculateCompletionScore(state);
    },
    updateSkill: (state, action: PayloadAction<Skill>) => {
      const index = state.skills.findIndex(skill => skill.id === action.payload.id);
      if (index !== -1) {
        state.skills[index] = action.payload;
        state.lastUpdated = new Date().toISOString();
      }
    },
    removeSkill: (state, action: PayloadAction<string>) => {
      state.skills = state.skills.filter(skill => skill.id !== action.payload);
      state.lastUpdated = new Date().toISOString();
      state.completionScore = calculateCompletionScore(state);
    },

    // Profile views
    incrementProfileViews: (state) => {
      state.profileViews += 1;
    },
    setProfileViews: (state, action: PayloadAction<number>) => {
      state.profileViews = action.payload;
    },

    // Upload profile picture
    updateProfilePicture: (state, action: PayloadAction<string>) => {
      state.personalInfo.profilePicture = action.payload;
      state.lastUpdated = new Date().toISOString();
      state.completionScore = calculateCompletionScore(state);
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Helper function to calculate profile completion score
const calculateCompletionScore = (state: ProfileState): number => {
  let score = 0;
  const maxScore = 100;

  // Personal info (30 points)
  if (state.personalInfo.firstName) score += 3;
  if (state.personalInfo.lastName) score += 3;
  if (state.personalInfo.email) score += 3;
  if (state.personalInfo.phone) score += 3;
  if (state.personalInfo.location) score += 3;
  if (state.personalInfo.profilePicture) score += 5;
  if (state.personalInfo.headline) score += 5;
  if (state.personalInfo.summary) score += 5;

  // Work preferences (20 points)
  if (state.workPreferences.jobTypes.length > 0) score += 5;
  if (state.workPreferences.preferredLocations.length > 0) score += 5;
  if (state.workPreferences.salaryExpectation) score += 5;
  if (state.workPreferences.workAuthorization) score += 5;

  // Education (15 points)
  if (state.education.length > 0) score += 15;

  // Experience (20 points)
  if (state.experience.length > 0) score += 10;
  if (state.experience.length > 1) score += 5;
  if (state.experience.length > 2) score += 5;

  // Skills (10 points)
  if (state.skills.length >= 3) score += 5;
  if (state.skills.length >= 8) score += 5;

  // Social links (5 points)
  if (state.personalInfo.linkedIn || state.personalInfo.github || state.personalInfo.portfolio) {
    score += 5;
  }

  return Math.min(score, maxScore);
};

export const {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  updatePersonalInfo,
  updateWorkPreferences,
  addEducation,
  updateEducation,
  removeEducation,
  addExperience,
  updateExperience,
  removeExperience,
  addSkill,
  updateSkill,
  removeSkill,
  incrementProfileViews,
  setProfileViews,
  updateProfilePicture,
  clearError,
} = profileSlice.actions;

export default profileSlice.reducer;

// Selectors
export const selectProfile = (state: { profile: ProfileState }) => state.profile;
export const selectPersonalInfo = (state: { profile: ProfileState }) => state.profile.personalInfo;
export const selectWorkPreferences = (state: { profile: ProfileState }) => state.profile.workPreferences;
export const selectEducation = (state: { profile: ProfileState }) => state.profile.education;
export const selectExperience = (state: { profile: ProfileState }) => state.profile.experience;
export const selectSkills = (state: { profile: ProfileState }) => state.profile.skills;
export const selectCompletionScore = (state: { profile: ProfileState }) => state.profile.completionScore;
export const selectProfileLoading = (state: { profile: ProfileState }) => state.profile.isLoading;
export const selectProfileError = (state: { profile: ProfileState }) => state.profile.error;