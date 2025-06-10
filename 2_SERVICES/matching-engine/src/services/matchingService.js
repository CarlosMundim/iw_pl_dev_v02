const { calculateSkillMatch, calculateExperienceMatch, calculateLocationMatch } = require('../utils/matching');
const { logger } = require('../utils/logger');

class MatchingService {
  constructor() {
    this.algorithms = {
      'skill-based': this.skillBasedMatching.bind(this),
      'experience-based': this.experienceBasedMatching.bind(this),
      'ai-hybrid': this.aiHybridMatching.bind(this),
      'comprehensive': this.comprehensiveMatching.bind(this)
    };
  }

  /**
   * Main matching method that delegates to specific algorithms
   */
  async matchCandidateToJob(candidate, job, algorithm = 'ai-hybrid') {
    try {
      const matchFunction = this.algorithms[algorithm];
      if (!matchFunction) {
        throw new Error(`Unknown matching algorithm: ${algorithm}`);
      }

      const startTime = Date.now();
      const result = await matchFunction(candidate, job);
      const executionTime = Date.now() - startTime;

      logger.info(`Matching completed for candidate ${candidate.id} and job ${job.id}`, {
        algorithm,
        score: result.score,
        executionTime
      });

      return {
        ...result,
        algorithm,
        executionTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Matching error:', error);
      throw error;
    }
  }

  /**
   * Find best candidates for a job
   */
  async findBestCandidates(job, candidates, limit = 10, algorithm = 'ai-hybrid') {
    try {
      const matches = await Promise.all(
        candidates.map(async (candidate) => {
          const match = await this.matchCandidateToJob(candidate, job, algorithm);
          return {
            candidate,
            match
          };
        })
      );

      // Sort by score and take top matches
      const sortedMatches = matches
        .sort((a, b) => b.match.score - a.match.score)
        .slice(0, limit);

      return {
        job,
        matches: sortedMatches,
        totalCandidates: candidates.length,
        algorithm,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Candidate matching error:', error);
      throw error;
    }
  }

  /**
   * Find best jobs for a candidate
   */
  async findBestJobs(candidate, jobs, limit = 10, algorithm = 'ai-hybrid') {
    try {
      const matches = await Promise.all(
        jobs.map(async (job) => {
          const match = await this.matchCandidateToJob(candidate, job, algorithm);
          return {
            job,
            match
          };
        })
      );

      // Sort by score and take top matches
      const sortedMatches = matches
        .sort((a, b) => b.match.score - a.match.score)
        .slice(0, limit);

      return {
        candidate,
        matches: sortedMatches,
        totalJobs: jobs.length,
        algorithm,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Job matching error:', error);
      throw error;
    }
  }

  /**
   * Skill-based matching algorithm
   */
  async skillBasedMatching(candidate, job) {
    const skillMatch = calculateSkillMatch(candidate.skills, job.requirements);
    
    const score = Math.round(skillMatch.overallScore * 100);
    const confidence = this.calculateConfidence(score, ['skills']);
    
    return {
      score,
      confidence,
      breakdown: {
        skills: skillMatch.overallScore * 100,
        experience: 0,
        location: 0,
        education: 0,
        preferences: 0
      },
      reasons: this.generateSkillReasons(skillMatch),
      recommendations: this.generateRecommendations(score, skillMatch),
      details: {
        matchedSkills: skillMatch.matchedSkills,
        missingSkills: skillMatch.missingSkills,
        skillGaps: skillMatch.skillGaps
      }
    };
  }

  /**
   * Experience-based matching algorithm
   */
  async experienceBasedMatching(candidate, job) {
    const experienceMatch = calculateExperienceMatch(candidate.experience, job);
    const skillMatch = calculateSkillMatch(candidate.skills, job.requirements);
    
    const experienceScore = experienceMatch.score * 100;
    const skillScore = skillMatch.overallScore * 100;
    const score = Math.round((experienceScore * 0.7) + (skillScore * 0.3));
    
    const confidence = this.calculateConfidence(score, ['experience', 'skills']);
    
    return {
      score,
      confidence,
      breakdown: {
        skills: skillScore,
        experience: experienceScore,
        location: 0,
        education: 0,
        preferences: 0
      },
      reasons: [
        ...this.generateExperienceReasons(experienceMatch),
        ...this.generateSkillReasons(skillMatch)
      ],
      recommendations: this.generateRecommendations(score, { experienceMatch, skillMatch }),
      details: {
        totalExperience: experienceMatch.totalYears,
        relevantExperience: experienceMatch.relevantYears,
        industryMatch: experienceMatch.industryMatch,
        roleMatch: experienceMatch.roleMatch
      }
    };
  }

  /**
   * AI-powered hybrid matching algorithm
   */
  async aiHybridMatching(candidate, job) {
    // Calculate individual match components
    const skillMatch = calculateSkillMatch(candidate.skills, job.requirements);
    const experienceMatch = calculateExperienceMatch(candidate.experience, job);
    const locationMatch = calculateLocationMatch(candidate.location, job.location);
    const educationMatch = this.calculateEducationMatch(candidate.education, job);
    const preferencesMatch = this.calculatePreferencesMatch(candidate.preferences, job);

    // Weighted scoring with AI-like adjustments
    const weights = this.calculateDynamicWeights(job, candidate);
    
    const skillScore = skillMatch.overallScore * 100;
    const experienceScore = experienceMatch.score * 100;
    const locationScore = locationMatch.score * 100;
    const educationScore = educationMatch.score * 100;
    const preferencesScore = preferencesMatch.score * 100;

    const weightedScore = (
      (skillScore * weights.skills) +
      (experienceScore * weights.experience) +
      (locationScore * weights.location) +
      (educationScore * weights.education) +
      (preferencesScore * weights.preferences)
    );

    // Apply AI adjustments
    const aiAdjustments = this.calculateAIAdjustments(candidate, job, {
      skillMatch,
      experienceMatch,
      locationMatch,
      educationMatch,
      preferencesMatch
    });

    const finalScore = Math.max(0, Math.min(100, Math.round(weightedScore + aiAdjustments.totalAdjustment)));
    const confidence = this.calculateConfidence(finalScore, ['skills', 'experience', 'location', 'education', 'preferences']);

    return {
      score: finalScore,
      confidence,
      breakdown: {
        skills: skillScore,
        experience: experienceScore,
        location: locationScore,
        education: educationScore,
        preferences: preferencesScore
      },
      weights,
      aiAdjustments,
      reasons: this.generateComprehensiveReasons({
        skillMatch,
        experienceMatch,
        locationMatch,
        educationMatch,
        preferencesMatch
      }),
      recommendations: this.generateAdvancedRecommendations(finalScore, {
        skillMatch,
        experienceMatch,
        locationMatch,
        candidate,
        job
      }),
      details: {
        skillDetails: {
          matchedSkills: skillMatch.matchedSkills,
          missingSkills: skillMatch.missingSkills,
          skillGaps: skillMatch.skillGaps
        },
        experienceDetails: {
          totalExperience: experienceMatch.totalYears,
          relevantExperience: experienceMatch.relevantYears,
          industryMatch: experienceMatch.industryMatch,
          roleMatch: experienceMatch.roleMatch
        },
        locationDetails: {
          distance: locationMatch.distance,
          remoteCompatible: locationMatch.remoteCompatible,
          timezoneCompatible: locationMatch.timezoneCompatible
        }
      }
    };
  }

  /**
   * Comprehensive matching with all factors
   */
  async comprehensiveMatching(candidate, job) {
    const baseMatch = await this.aiHybridMatching(candidate, job);
    
    // Add additional comprehensive factors
    const culturalFit = this.calculateCulturalFit(candidate, job);
    const careerGrowth = this.calculateCareerGrowthPotential(candidate, job);
    const salaryFit = this.calculateSalaryFit(candidate, job);
    const availabilityMatch = this.calculateAvailabilityMatch(candidate, job);

    // Adjust score with comprehensive factors
    const comprehensiveAdjustment = (
      (culturalFit.score * 0.1) +
      (careerGrowth.score * 0.1) +
      (salaryFit.score * 0.05) +
      (availabilityMatch.score * 0.05)
    );

    const finalScore = Math.max(0, Math.min(100, Math.round(baseMatch.score + comprehensiveAdjustment)));

    return {
      ...baseMatch,
      score: finalScore,
      comprehensiveFactors: {
        culturalFit,
        careerGrowth,
        salaryFit,
        availabilityMatch
      },
      reasons: [
        ...baseMatch.reasons,
        ...this.generateComprehensiveFactorReasons({
          culturalFit,
          careerGrowth,
          salaryFit,
          availabilityMatch
        })
      ]
    };
  }

  /**
   * Calculate dynamic weights based on job and candidate characteristics
   */
  calculateDynamicWeights(job, candidate) {
    const baseWeights = {
      skills: 0.35,
      experience: 0.30,
      location: 0.15,
      education: 0.10,
      preferences: 0.10
    };

    // Adjust weights based on job characteristics
    if (job.experienceLevel === 'entry') {
      baseWeights.skills += 0.10;
      baseWeights.experience -= 0.10;
      baseWeights.education += 0.05;
    } else if (job.experienceLevel === 'senior' || job.experienceLevel === 'executive') {
      baseWeights.experience += 0.15;
      baseWeights.skills -= 0.05;
      baseWeights.location -= 0.05;
      baseWeights.education -= 0.05;
    }

    // Adjust for remote jobs
    if (job.location.remote) {
      baseWeights.location = Math.max(0.05, baseWeights.location - 0.10);
      baseWeights.skills += 0.05;
      baseWeights.experience += 0.05;
    }

    // Adjust for high-skill jobs
    const requiredSkillsCount = job.requirements.filter(req => req.required).length;
    if (requiredSkillsCount > 8) {
      baseWeights.skills += 0.10;
      baseWeights.experience -= 0.05;
      baseWeights.preferences -= 0.05;
    }

    return baseWeights;
  }

  /**
   * Calculate AI-powered adjustments
   */
  calculateAIAdjustments(candidate, job, matchComponents) {
    let totalAdjustment = 0;
    const adjustments = [];

    // Career progression adjustment
    if (this.isCareerProgression(candidate, job)) {
      totalAdjustment += 5;
      adjustments.push({ type: 'career_progression', value: 5, reason: 'Position represents natural career progression' });
    }

    // Industry switch penalty
    if (this.isIndustrySwitch(candidate, job)) {
      totalAdjustment -= 3;
      adjustments.push({ type: 'industry_switch', value: -3, reason: 'Industry change may require adaptation' });
    }

    // Overqualification penalty
    if (this.isOverqualified(candidate, job)) {
      totalAdjustment -= 8;
      adjustments.push({ type: 'overqualification', value: -8, reason: 'Candidate may be overqualified' });
    }

    // Underqualification penalty
    if (this.isUnderqualified(candidate, job)) {
      totalAdjustment -= 12;
      adjustments.push({ type: 'underqualification', value: -12, reason: 'Candidate lacks required qualifications' });
    }

    // Recent activity boost
    if (this.isRecentlyActive(candidate)) {
      totalAdjustment += 2;
      adjustments.push({ type: 'recent_activity', value: 2, reason: 'Candidate recently active in job search' });
    }

    // Perfect skill match boost
    if (matchComponents.skillMatch.overallScore > 0.95) {
      totalAdjustment += 5;
      adjustments.push({ type: 'perfect_skills', value: 5, reason: 'Exceptional skill match' });
    }

    return {
      totalAdjustment: Math.max(-15, Math.min(15, totalAdjustment)),
      adjustments
    };
  }

  /**
   * Helper methods for AI adjustments
   */
  isCareerProgression(candidate, job) {
    const currentLevel = this.inferCareerLevel(candidate);
    const jobLevel = this.mapExperienceLevelToNumber(job.experienceLevel);
    return jobLevel === currentLevel + 1;
  }

  isIndustrySwitch(candidate, job) {
    const candidateIndustries = candidate.experience.map(exp => exp.industry).filter(Boolean);
    return candidateIndustries.length > 0 && !candidateIndustries.includes(job.company.industry);
  }

  isOverqualified(candidate, job) {
    const candidateLevel = this.inferCareerLevel(candidate);
    const jobLevel = this.mapExperienceLevelToNumber(job.experienceLevel);
    return candidateLevel > jobLevel + 1;
  }

  isUnderqualified(candidate, job) {
    const candidateLevel = this.inferCareerLevel(candidate);
    const jobLevel = this.mapExperienceLevelToNumber(job.experienceLevel);
    return candidateLevel < jobLevel - 1;
  }

  isRecentlyActive(candidate) {
    const lastActive = new Date(candidate.lastActive);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return lastActive > thirtyDaysAgo;
  }

  inferCareerLevel(candidate) {
    const totalExperience = candidate.experience.reduce((total, exp) => total + exp.durationMonths, 0) / 12;
    
    if (totalExperience < 2) return 1; // Entry
    if (totalExperience < 5) return 2; // Mid
    if (totalExperience < 10) return 3; // Senior
    return 4; // Executive
  }

  mapExperienceLevelToNumber(level) {
    const mapping = {
      'entry': 1,
      'mid': 2,
      'senior': 3,
      'executive': 4
    };
    return mapping[level] || 2;
  }

  /**
   * Calculate confidence level
   */
  calculateConfidence(score, factors) {
    const factorWeight = 1 / factors.length;
    let confidence = 'medium';

    if (score >= 85 && factors.length >= 3) {
      confidence = 'very-high';
    } else if (score >= 75 && factors.length >= 2) {
      confidence = 'high';
    } else if (score >= 60) {
      confidence = 'medium';
    } else if (score >= 40) {
      confidence = 'low';
    } else {
      confidence = 'very-low';
    }

    return confidence;
  }

  /**
   * Additional matching calculations
   */
  calculateEducationMatch(candidateEducation, job) {
    if (!candidateEducation || candidateEducation.length === 0) {
      return { score: 0.5, reasons: ['No education information available'] };
    }

    // Basic education matching logic
    const hasRelevantDegree = candidateEducation.some(edu => 
      job.requirements.some(req => 
        req.skill.toLowerCase().includes(edu.field.toLowerCase()) ||
        edu.field.toLowerCase().includes(req.skill.toLowerCase())
      )
    );

    const score = hasRelevantDegree ? 0.8 : 0.6;
    return {
      score,
      reasons: hasRelevantDegree ? ['Relevant educational background'] : ['General educational background']
    };
  }

  calculatePreferencesMatch(candidatePreferences, job) {
    if (!candidatePreferences) {
      return { score: 0.5, reasons: ['No preferences specified'] };
    }

    let score = 0;
    const reasons = [];

    // Job type match
    if (candidatePreferences.jobTypes && candidatePreferences.jobTypes.includes(job.employmentType)) {
      score += 0.3;
      reasons.push('Employment type matches preferences');
    }

    // Salary match
    if (candidatePreferences.salaryExpectation) {
      const salaryMatch = this.calculateSalaryFit({ preferences: candidatePreferences }, job);
      score += salaryMatch.score * 0.4;
      reasons.push(...salaryMatch.reasons);
    }

    // Remote preference match
    if (candidatePreferences.remotePreference) {
      const remoteMatch = this.matchRemotePreference(candidatePreferences.remotePreference, job.location);
      score += remoteMatch.score * 0.3;
      reasons.push(...remoteMatch.reasons);
    }

    return { score: Math.min(1, score), reasons };
  }

  calculateCulturalFit(candidate, job) {
    // Simplified cultural fit calculation
    let score = 0.7; // Base score
    const reasons = [];

    // Company size preference
    if (candidate.preferences && candidate.preferences.companySizes) {
      if (candidate.preferences.companySizes.includes(job.company.size)) {
        score += 0.2;
        reasons.push('Company size matches preference');
      }
    }

    // Industry preference
    if (candidate.preferences && candidate.preferences.industries) {
      if (candidate.preferences.industries.includes(job.company.industry)) {
        score += 0.1;
        reasons.push('Industry matches preference');
      }
    }

    return { score: Math.min(1, score), reasons };
  }

  calculateCareerGrowthPotential(candidate, job) {
    let score = 0.6; // Base score
    const reasons = [];

    // Career progression opportunity
    if (this.isCareerProgression(candidate, job)) {
      score += 0.3;
      reasons.push('Excellent career progression opportunity');
    }

    // Skill development opportunity
    const newSkills = job.requirements.filter(req => 
      !candidate.skills.some(skill => 
        skill.name.toLowerCase() === req.skill.toLowerCase()
      )
    );

    if (newSkills.length > 0 && newSkills.length <= 3) {
      score += 0.2;
      reasons.push('Good opportunity to learn new skills');
    }

    return { score: Math.min(1, score), reasons };
  }

  calculateSalaryFit(candidate, job) {
    if (!candidate.preferences || !candidate.preferences.salaryExpectation) {
      return { score: 0.7, reasons: ['No salary expectations specified'] };
    }

    const expectation = candidate.preferences.salaryExpectation;
    const jobSalary = job.salary;

    // Check currency compatibility
    if (expectation.currency !== jobSalary.currency) {
      return { score: 0.5, reasons: ['Currency mismatch - conversion needed'] };
    }

    const expectationMid = (expectation.min + expectation.max) / 2;
    const jobSalaryMid = (jobSalary.min + jobSalary.max) / 2;

    const ratio = jobSalaryMid / expectationMid;

    let score;
    let reasons = [];

    if (ratio >= 1.1) {
      score = 1.0;
      reasons.push('Salary exceeds expectations');
    } else if (ratio >= 0.9) {
      score = 0.9;
      reasons.push('Salary meets expectations');
    } else if (ratio >= 0.8) {
      score = 0.7;
      reasons.push('Salary slightly below expectations');
    } else {
      score = 0.4;
      reasons.push('Salary significantly below expectations');
    }

    return { score, reasons };
  }

  calculateAvailabilityMatch(candidate, job) {
    if (!candidate.preferences || !candidate.preferences.availability) {
      return { score: 0.8, reasons: ['Availability not specified'] };
    }

    const availability = candidate.preferences.availability;
    let score = 0.8; // Base score
    const reasons = [];

    switch (availability) {
      case 'immediate':
        score = 1.0;
        reasons.push('Immediately available');
        break;
      case '2weeks':
        score = 0.9;
        reasons.push('Available with 2 weeks notice');
        break;
      case '1month':
        score = 0.8;
        reasons.push('Available with 1 month notice');
        break;
      case '3months':
        score = 0.6;
        reasons.push('Available with 3 months notice');
        break;
      default:
        score = 0.7;
        reasons.push('Availability to be discussed');
    }

    return { score, reasons };
  }

  matchRemotePreference(preference, jobLocation) {
    let score = 0.5;
    const reasons = [];

    if (preference === 'only' && jobLocation.remote) {
      score = 1.0;
      reasons.push('Remote work preference perfectly matched');
    } else if (preference === 'only' && !jobLocation.remote) {
      score = 0.1;
      reasons.push('Remote work required but job is onsite');
    } else if (preference === 'hybrid' && (jobLocation.remote || jobLocation.hybrid)) {
      score = 0.9;
      reasons.push('Hybrid work arrangement available');
    } else if (preference === 'onsite' && !jobLocation.remote) {
      score = 1.0;
      reasons.push('Onsite work preference matched');
    } else if (preference === 'flexible') {
      score = 0.8;
      reasons.push('Flexible work arrangement acceptable');
    }

    return { score, reasons };
  }

  /**
   * Generate various types of reasons
   */
  generateSkillReasons(skillMatch) {
    const reasons = [];
    
    if (skillMatch.matchedSkills.length > 0) {
      reasons.push(`${skillMatch.matchedSkills.length} required skills matched`);
    }
    
    if (skillMatch.overallScore > 0.8) {
      reasons.push('Excellent technical skill alignment');
    } else if (skillMatch.overallScore > 0.6) {
      reasons.push('Good technical skill match');
    }
    
    if (skillMatch.missingSkills.length > 0) {
      reasons.push(`${skillMatch.missingSkills.length} skills need development`);
    }

    return reasons;
  }

  generateExperienceReasons(experienceMatch) {
    const reasons = [];
    
    if (experienceMatch.relevantYears >= experienceMatch.requiredYears) {
      reasons.push('Meets experience requirements');
    }
    
    if (experienceMatch.industryMatch) {
      reasons.push('Relevant industry experience');
    }
    
    if (experienceMatch.roleMatch > 0.7) {
      reasons.push('Strong role similarity');
    }

    return reasons;
  }

  generateComprehensiveReasons(matches) {
    const reasons = [];
    
    // Skill reasons
    if (matches.skillMatch.overallScore > 0.8) {
      reasons.push('Exceptional skill alignment');
    }
    
    // Experience reasons
    if (matches.experienceMatch.score > 0.8) {
      reasons.push('Highly relevant experience');
    }
    
    // Location reasons
    if (matches.locationMatch.score > 0.9) {
      reasons.push('Perfect location match');
    } else if (matches.locationMatch.remoteCompatible) {
      reasons.push('Remote work compatible');
    }
    
    // Education reasons
    if (matches.educationMatch.score > 0.8) {
      reasons.push('Relevant educational background');
    }

    return reasons;
  }

  generateComprehensiveFactorReasons(factors) {
    const reasons = [];
    
    if (factors.culturalFit.score > 0.8) {
      reasons.push('Strong cultural fit indicators');
    }
    
    if (factors.careerGrowth.score > 0.8) {
      reasons.push('Excellent career growth opportunity');
    }
    
    if (factors.salaryFit.score > 0.9) {
      reasons.push('Salary expectations well matched');
    }

    return reasons;
  }

  generateRecommendations(score, matchData) {
    const recommendations = [];
    
    if (score >= 80) {
      recommendations.push('Highly recommended for interview');
      recommendations.push('Fast-track consideration suggested');
    } else if (score >= 60) {
      recommendations.push('Consider for interview');
      recommendations.push('Skills assessment recommended');
    } else if (score >= 40) {
      recommendations.push('Potential with development');
      recommendations.push('Training program consideration');
    } else {
      recommendations.push('Not recommended for current role');
      recommendations.push('Consider for future opportunities');
    }

    return recommendations;
  }

  generateAdvancedRecommendations(score, data) {
    const recommendations = [];
    
    if (score >= 85) {
      recommendations.push('Priority candidate - schedule interview immediately');
      recommendations.push('Consider expedited hiring process');
    } else if (score >= 70) {
      recommendations.push('Strong candidate - proceed with standard interview');
      recommendations.push('Technical assessment recommended');
    } else if (score >= 50) {
      recommendations.push('Potential candidate - additional screening needed');
      
      if (data.skillMatch.missingSkills.length > 0) {
        recommendations.push(`Skills development needed: ${data.skillMatch.missingSkills.slice(0, 3).join(', ')}`);
      }
    } else {
      recommendations.push('Does not meet current requirements');
      recommendations.push('Consider for future roles or with additional training');
    }

    return recommendations;
  }
}

module.exports = new MatchingService();