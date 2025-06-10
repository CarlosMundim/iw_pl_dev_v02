/**
 * Utility functions for matching calculations
 */

/**
 * Calculate skill match between candidate skills and job requirements
 */
function calculateSkillMatch(candidateSkills, jobRequirements) {
  if (!candidateSkills || !jobRequirements) {
    return {
      overallScore: 0,
      matchedSkills: [],
      missingSkills: [],
      skillGaps: []
    };
  }

  const matchedSkills = [];
  const missingSkills = [];
  const skillGaps = [];

  let totalRequiredWeight = 0;
  let totalMatchedWeight = 0;

  jobRequirements.forEach(requirement => {
    const weight = requirement.required ? 2 : 1;
    totalRequiredWeight += weight;

    const candidateSkill = candidateSkills.find(skill => 
      skill.name.toLowerCase() === requirement.skill.toLowerCase()
    );

    if (candidateSkill) {
      const levelScore = calculateSkillLevelScore(candidateSkill.level, requirement.level);
      const experienceScore = calculateExperienceScore(
        candidateSkill.yearsExperience || 0, 
        requirement.yearsExperience || 0
      );

      const skillScore = (levelScore + experienceScore) / 2;
      totalMatchedWeight += weight * skillScore;

      matchedSkills.push({
        skill: requirement.skill,
        candidateLevel: candidateSkill.level,
        requiredLevel: requirement.level,
        score: skillScore,
        weight
      });

      if (skillScore < 0.8) {
        skillGaps.push({
          skill: requirement.skill,
          gap: requirement.level,
          currentLevel: candidateSkill.level,
          severity: requirement.required ? 'high' : 'medium'
        });
      }
    } else {
      missingSkills.push({
        skill: requirement.skill,
        level: requirement.level,
        required: requirement.required,
        weight
      });

      if (requirement.required) {
        skillGaps.push({
          skill: requirement.skill,
          gap: requirement.level,
          currentLevel: 'none',
          severity: 'critical'
        });
      }
    }
  });

  const overallScore = totalRequiredWeight > 0 ? totalMatchedWeight / totalRequiredWeight : 0;

  return {
    overallScore: Math.max(0, Math.min(1, overallScore)),
    matchedSkills,
    missingSkills,
    skillGaps,
    details: {
      totalRequired: jobRequirements.length,
      totalMatched: matchedSkills.length,
      totalMissing: missingSkills.length,
      criticalGaps: skillGaps.filter(gap => gap.severity === 'critical').length
    }
  };
}

/**
 * Calculate experience match
 */
function calculateExperienceMatch(candidateExperience, job) {
  if (!candidateExperience || candidateExperience.length === 0) {
    return {
      score: 0,
      totalYears: 0,
      relevantYears: 0,
      industryMatch: false,
      roleMatch: 0,
      requiredYears: getRequiredExperience(job.experienceLevel)
    };
  }

  const totalYears = candidateExperience.reduce((total, exp) => {
    return total + (exp.durationMonths || 0);
  }, 0) / 12;

  const requiredYears = getRequiredExperience(job.experienceLevel);
  
  // Calculate relevant experience
  const relevantExperience = candidateExperience.filter(exp => 
    isRelevantExperience(exp, job)
  );

  const relevantYears = relevantExperience.reduce((total, exp) => {
    return total + (exp.durationMonths || 0);
  }, 0) / 12;

  // Industry match
  const industryMatch = candidateExperience.some(exp => 
    exp.industry && exp.industry.toLowerCase() === job.company.industry.toLowerCase()
  );

  // Role similarity
  const roleMatch = calculateRoleMatch(candidateExperience, job.title);

  // Calculate overall experience score
  let score = 0;

  // Years of experience score (40% weight)
  const yearsScore = Math.min(1, relevantYears / requiredYears);
  score += yearsScore * 0.4;

  // Industry experience score (25% weight)
  score += (industryMatch ? 1 : 0.5) * 0.25;

  // Role match score (25% weight)
  score += roleMatch * 0.25;

  // Total experience boost (10% weight)
  const totalExperienceBoost = Math.min(1, totalYears / (requiredYears * 1.5));
  score += totalExperienceBoost * 0.1;

  return {
    score: Math.max(0, Math.min(1, score)),
    totalYears,
    relevantYears,
    requiredYears,
    industryMatch,
    roleMatch,
    details: {
      relevantPositions: relevantExperience.length,
      totalPositions: candidateExperience.length,
      yearsScore,
      totalExperienceBoost
    }
  };
}

/**
 * Calculate location match
 */
function calculateLocationMatch(candidateLocation, jobLocation) {
  if (!candidateLocation || !jobLocation) {
    return {
      score: 0.5,
      distance: null,
      remoteCompatible: false,
      timezoneCompatible: false
    };
  }

  let score = 0;
  let distance = null;
  let timezoneCompatible = false;
  let remoteCompatible = false;

  // Remote work compatibility
  if (jobLocation.remote) {
    remoteCompatible = true;
    score = 1.0;
    timezoneCompatible = isTimezoneCompatible(candidateLocation, jobLocation);
    
    if (!timezoneCompatible) {
      score -= 0.2; // Slight penalty for timezone differences
    }
  } else {
    // Location-based matching
    if (candidateLocation.city.toLowerCase() === jobLocation.city.toLowerCase() &&
        candidateLocation.country.toLowerCase() === jobLocation.country.toLowerCase()) {
      score = 1.0;
      distance = 0;
    } else if (candidateLocation.country.toLowerCase() === jobLocation.country.toLowerCase()) {
      // Same country, different city
      score = 0.7;
      distance = estimateDistance(candidateLocation, jobLocation);
      
      if (distance && distance < 100) {
        score = 0.8; // Close cities
      }
    } else {
      // Different countries
      score = candidateLocation.willingToRelocate ? 0.4 : 0.1;
      distance = estimateDistance(candidateLocation, jobLocation);
    }
  }

  return {
    score: Math.max(0, Math.min(1, score)),
    distance,
    remoteCompatible,
    timezoneCompatible,
    details: {
      sameCity: candidateLocation.city.toLowerCase() === jobLocation.city.toLowerCase(),
      sameCountry: candidateLocation.country.toLowerCase() === jobLocation.country.toLowerCase(),
      willingToRelocate: candidateLocation.willingToRelocate || false
    }
  };
}

/**
 * Helper functions
 */
function calculateSkillLevelScore(candidateLevel, requiredLevel) {
  const levels = {
    'beginner': 1,
    'intermediate': 2,
    'advanced': 3,
    'expert': 4
  };

  const candidateScore = levels[candidateLevel?.toLowerCase()] || 1;
  const requiredScore = levels[requiredLevel?.toLowerCase()] || 2;

  if (candidateScore >= requiredScore) {
    return 1.0;
  } else if (candidateScore === requiredScore - 1) {
    return 0.7;
  } else {
    return 0.3;
  }
}

function calculateExperienceScore(candidateYears, requiredYears) {
  if (requiredYears === 0) return 1.0;
  
  const ratio = candidateYears / requiredYears;
  
  if (ratio >= 1.0) return 1.0;
  if (ratio >= 0.8) return 0.9;
  if (ratio >= 0.6) return 0.7;
  if (ratio >= 0.4) return 0.5;
  return 0.3;
}

function getRequiredExperience(experienceLevel) {
  const mapping = {
    'entry': 1,
    'mid': 3,
    'senior': 7,
    'executive': 12
  };
  return mapping[experienceLevel?.toLowerCase()] || 3;
}

function isRelevantExperience(experience, job) {
  const titleSimilarity = calculateTitleSimilarity(experience.title, job.title);
  const industrySimilarity = experience.industry && 
    experience.industry.toLowerCase() === job.company.industry.toLowerCase();
  
  return titleSimilarity > 0.3 || industrySimilarity;
}

function calculateRoleMatch(candidateExperience, jobTitle) {
  if (!candidateExperience || candidateExperience.length === 0) return 0;

  const maxSimilarity = candidateExperience.reduce((max, exp) => {
    const similarity = calculateTitleSimilarity(exp.title, jobTitle);
    return Math.max(max, similarity);
  }, 0);

  return maxSimilarity;
}

function calculateTitleSimilarity(title1, title2) {
  if (!title1 || !title2) return 0;

  const t1 = title1.toLowerCase().split(/\s+/);
  const t2 = title2.toLowerCase().split(/\s+/);
  
  const commonWords = t1.filter(word => t2.includes(word));
  const totalWords = new Set([...t1, ...t2]).size;
  
  return totalWords > 0 ? (commonWords.length * 2) / totalWords : 0;
}

function isTimezoneCompatible(candidateLocation, jobLocation) {
  // Simplified timezone compatibility check
  // In a real implementation, you'd use a proper timezone library
  const timezoneMapping = {
    'US': ['UTC-8', 'UTC-7', 'UTC-6', 'UTC-5'],
    'UK': ['UTC+0'],
    'Germany': ['UTC+1'],
    'Japan': ['UTC+9'],
    'Australia': ['UTC+10'],
    'India': ['UTC+5:30'],
    'Singapore': ['UTC+8'],
    'China': ['UTC+8']
  };

  const candidateTimezones = timezoneMapping[candidateLocation.country] || ['UTC+0'];
  const jobTimezones = timezoneMapping[jobLocation.country] || ['UTC+0'];

  // Consider compatible if within 5 hours
  return candidateTimezones.some(ctz => 
    jobTimezones.some(jtz => {
      const cOffset = parseTimezoneOffset(ctz);
      const jOffset = parseTimezoneOffset(jtz);
      return Math.abs(cOffset - jOffset) <= 5;
    })
  );
}

function parseTimezoneOffset(timezone) {
  const match = timezone.match(/UTC([+-]?)(\d+)(?::(\d+))?/);
  if (!match) return 0;
  
  const sign = match[1] === '-' ? -1 : 1;
  const hours = parseInt(match[2]) || 0;
  const minutes = parseInt(match[3]) || 0;
  
  return sign * (hours + minutes / 60);
}

function estimateDistance(location1, location2) {
  // Simplified distance estimation
  // In a real implementation, you'd use proper geolocation APIs
  
  if (!location1.coordinates || !location2.coordinates) {
    // Return estimated distance based on city/country
    if (location1.country !== location2.country) {
      return 1000; // Approximate international distance
    } else if (location1.city !== location2.city) {
      return 200; // Approximate domestic distance
    }
    return 0;
  }

  // Haversine formula for actual coordinates
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(location2.coordinates.lat - location1.coordinates.lat);
  const dLon = toRadians(location2.coordinates.lon - location1.coordinates.lon);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(location1.coordinates.lat)) * Math.cos(toRadians(location2.coordinates.lat)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

module.exports = {
  calculateSkillMatch,
  calculateExperienceMatch,
  calculateLocationMatch,
  calculateTitleSimilarity,
  isTimezoneCompatible,
  estimateDistance
};