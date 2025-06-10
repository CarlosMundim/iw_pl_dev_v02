import { Client } from '@elastic/elasticsearch';
import { elasticsearchConfig } from '../config/elasticsearch';
import { logger } from '../utils/logger';
import {
  SearchQuery,
  SearchResult,
  JobDocument,
  CandidateDocument,
  SearchFilters,
  SuggestionQuery,
  SuggestionResult
} from '../types';

export class SearchService {
  private client: Client;

  constructor() {
    this.client = elasticsearchConfig.getClient();
  }

  // Job Search Methods
  public async searchJobs(searchQuery: SearchQuery): Promise<SearchResult<JobDocument>> {
    try {
      const query = this.buildJobSearchQuery(searchQuery);
      
      const response = await this.client.search({
        index: 'jobs',
        body: query,
        size: searchQuery.size || 20,
        from: ((searchQuery.page || 1) - 1) * (searchQuery.size || 20)
      });

      return this.formatSearchResponse<JobDocument>(response, searchQuery);
    } catch (error) {
      logger.error('Job search error:', error);
      throw error;
    }
  }

  public async searchCandidates(searchQuery: SearchQuery): Promise<SearchResult<CandidateDocument>> {
    try {
      const query = this.buildCandidateSearchQuery(searchQuery);
      
      const response = await this.client.search({
        index: 'candidates',
        body: query,
        size: searchQuery.size || 20,
        from: ((searchQuery.page || 1) - 1) * (searchQuery.size || 20)
      });

      return this.formatSearchResponse<CandidateDocument>(response, searchQuery);
    } catch (error) {
      logger.error('Candidate search error:', error);
      throw error;
    }
  }

  // Job Search Query Builder
  private buildJobSearchQuery(searchQuery: SearchQuery): any {
    const { query, filters, sort, highlight, aggregations } = searchQuery;

    const esQuery: any = {
      query: {
        bool: {
          must: [],
          filter: [],
          should: [],
          must_not: []
        }
      }
    };

    // Main search query
    if (query && query.trim()) {
      esQuery.query.bool.must.push({
        multi_match: {
          query: query.trim(),
          fields: [
            'title^3',
            'description^2',
            'requirements.skill^2',
            'company.name^1.5',
            'location.city',
            'tags'
          ],
          type: 'best_fields',
          fuzziness: 'AUTO',
          operator: 'and'
        }
      });
    } else {
      esQuery.query.bool.must.push({
        match_all: {}
      });
    }

    // Apply filters
    if (filters) {
      this.applyJobFilters(esQuery.query.bool.filter, filters);
    }

    // Boost active jobs
    esQuery.query.bool.should.push({
      term: { status: { value: 'active', boost: 2.0 } }
    });

    // Boost featured jobs
    esQuery.query.bool.should.push({
      term: { featured: { value: true, boost: 1.5 } }
    });

    // Boost urgent hiring
    esQuery.query.bool.should.push({
      term: { urgentHiring: { value: true, boost: 1.3 } }
    });

    // Apply sorting
    if (sort && sort.length > 0) {
      esQuery.sort = sort.map(s => ({ [s.field]: { order: s.order } }));
    } else {
      esQuery.sort = [
        { _score: { order: 'desc' } },
        { featured: { order: 'desc' } },
        { postedDate: { order: 'desc' } }
      ];
    }

    // Add highlighting
    if (highlight) {
      esQuery.highlight = {
        pre_tags: ['<mark>'],
        post_tags: ['</mark>'],
        fields: {
          title: { fragment_size: 0 },
          description: { fragment_size: 150, number_of_fragments: 3 },
          'requirements.skill': { fragment_size: 0 }
        }
      };
    }

    // Add aggregations
    if (aggregations) {
      esQuery.aggs = {
        employment_types: {
          terms: { field: 'employmentType', size: 10 }
        },
        experience_levels: {
          terms: { field: 'experienceLevel', size: 10 }
        },
        companies: {
          terms: { field: 'company.name.keyword', size: 20 }
        },
        locations: {
          terms: { field: 'location.city.keyword', size: 30 }
        },
        salary_ranges: {
          range: {
            field: 'salary.min',
            ranges: [
              { key: '0-50k', from: 0, to: 50000 },
              { key: '50k-100k', from: 50000, to: 100000 },
              { key: '100k-150k', from: 100000, to: 150000 },
              { key: '150k+', from: 150000 }
            ]
          }
        },
        top_skills: {
          nested: { path: 'requirements' },
          aggs: {
            skills: {
              terms: { field: 'requirements.skill.keyword', size: 20 }
            }
          }
        }
      };
    }

    return esQuery;
  }

  // Candidate Search Query Builder
  private buildCandidateSearchQuery(searchQuery: SearchQuery): any {
    const { query, filters, sort, highlight, aggregations } = searchQuery;

    const esQuery: any = {
      query: {
        bool: {
          must: [],
          filter: [],
          should: [],
          must_not: []
        }
      }
    };

    // Main search query
    if (query && query.trim()) {
      esQuery.query.bool.must.push({
        multi_match: {
          query: query.trim(),
          fields: [
            'name^2',
            'title^2',
            'summary^1.5',
            'skills.name^2',
            'experience.title^1.5',
            'experience.company',
            'education.field',
            'education.institution'
          ],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      });
    } else {
      esQuery.query.bool.must.push({
        match_all: {}
      });
    }

    // Apply filters
    if (filters) {
      this.applyCandidateFilters(esQuery.query.bool.filter, filters);
    }

    // Boost verified candidates
    esQuery.query.bool.should.push({
      term: { verified: { value: true, boost: 1.5 } }
    });

    // Boost available candidates
    esQuery.query.bool.should.push({
      term: { availability: { value: 'available', boost: 2.0 } }
    });

    // Boost recently active candidates
    esQuery.query.bool.should.push({
      range: {
        lastActive: {
          gte: 'now-7d',
          boost: 1.3
        }
      }
    });

    // Apply sorting
    if (sort && sort.length > 0) {
      esQuery.sort = sort.map(s => ({ [s.field]: { order: s.order } }));
    } else {
      esQuery.sort = [
        { _score: { order: 'desc' } },
        { verified: { order: 'desc' } },
        { lastActive: { order: 'desc' } }
      ];
    }

    // Add highlighting
    if (highlight) {
      esQuery.highlight = {
        pre_tags: ['<mark>'],
        post_tags: ['</mark>'],
        fields: {
          name: { fragment_size: 0 },
          title: { fragment_size: 0 },
          summary: { fragment_size: 150 },
          'skills.name': { fragment_size: 0 }
        }
      };
    }

    return esQuery;
  }

  // Apply job-specific filters
  private applyJobFilters(filterArray: any[], filters: SearchFilters): void {
    if (filters.employmentTypes?.length) {
      filterArray.push({
        terms: { employmentType: filters.employmentTypes }
      });
    }

    if (filters.experienceLevels?.length) {
      filterArray.push({
        terms: { experienceLevel: filters.experienceLevels }
      });
    }

    if (filters.locations?.length) {
      filterArray.push({
        terms: { 'location.city.keyword': filters.locations }
      });
    }

    if (filters.companies?.length) {
      filterArray.push({
        terms: { 'company.name.keyword': filters.companies }
      });
    }

    if (filters.skills?.length) {
      filterArray.push({
        nested: {
          path: 'requirements',
          query: {
            terms: { 'requirements.skill.keyword': filters.skills }
          }
        }
      });
    }

    if (filters.salaryRange) {
      const salaryFilter: any = { range: { 'salary.min': {} } };
      
      if (filters.salaryRange.min !== undefined) {
        salaryFilter.range['salary.min'].gte = filters.salaryRange.min;
      }
      
      if (filters.salaryRange.max !== undefined) {
        salaryFilter.range['salary.max'] = { lte: filters.salaryRange.max };
      }
      
      filterArray.push(salaryFilter);
    }

    if (filters.remote !== undefined) {
      filterArray.push({
        term: { 'location.remote': filters.remote }
      });
    }

    if (filters.postedWithin) {
      filterArray.push({
        range: {
          postedDate: {
            gte: `now-${filters.postedWithin}`
          }
        }
      });
    }

    if (filters.geo) {
      filterArray.push({
        geo_distance: {
          distance: filters.geo.distance || '50km',
          'location.coordinates': {
            lat: filters.geo.latitude,
            lon: filters.geo.longitude
          }
        }
      });
    }

    // Always filter for active jobs
    filterArray.push({
      term: { status: 'active' }
    });
  }

  // Apply candidate-specific filters
  private applyCandidateFilters(filterArray: any[], filters: SearchFilters): void {
    if (filters.skills?.length) {
      filterArray.push({
        nested: {
          path: 'skills',
          query: {
            terms: { 'skills.name.keyword': filters.skills }
          }
        }
      });
    }

    if (filters.locations?.length) {
      filterArray.push({
        terms: { 'location.city.keyword': filters.locations }
      });
    }

    if (filters.salaryRange) {
      const salaryFilter: any = {};
      
      if (filters.salaryRange.min !== undefined) {
        salaryFilter['preferences.salaryExpectation.max'] = { gte: filters.salaryRange.min };
      }
      
      if (filters.salaryRange.max !== undefined) {
        salaryFilter['preferences.salaryExpectation.min'] = { lte: filters.salaryRange.max };
      }
      
      if (Object.keys(salaryFilter).length > 0) {
        filterArray.push({ range: salaryFilter });
      }
    }

    if (filters.geo) {
      filterArray.push({
        geo_distance: {
          distance: filters.geo.distance || '100km',
          'location.coordinates': {
            lat: filters.geo.latitude,
            lon: filters.geo.longitude
          }
        }
      });
    }

    // Filter for searchable candidates
    filterArray.push({
      terms: { visibility: ['public', 'recruiter-only'] }
    });

    // Filter for recently active candidates (within 90 days)
    filterArray.push({
      range: {
        lastActive: {
          gte: 'now-90d'
        }
      }
    });
  }

  // Format search response
  private formatSearchResponse<T>(response: any, searchQuery: SearchQuery): SearchResult<T> {
    const { hits, aggregations, took, timed_out } = response;
    const size = searchQuery.size || 20;
    const page = searchQuery.page || 1;

    const result: SearchResult<T> = {
      data: hits.hits.map((hit: any) => ({
        ...hit._source,
        _score: hit._score,
        _highlights: hit.highlight
      })),
      pagination: {
        total: hits.total.value,
        page,
        size,
        pages: Math.ceil(hits.total.value / size)
      },
      took,
      suggestions: []
    };

    // Format aggregations
    if (aggregations && searchQuery.aggregations) {
      result.aggregations = this.formatAggregations(aggregations);
    }

    return result;
  }

  // Format aggregations
  private formatAggregations(aggregations: any): any {
    const formatted: any = {};

    if (aggregations.employment_types) {
      formatted.employmentTypes = aggregations.employment_types.buckets.map((bucket: any) => ({
        key: bucket.key,
        count: bucket.doc_count
      }));
    }

    if (aggregations.experience_levels) {
      formatted.experienceLevels = aggregations.experience_levels.buckets.map((bucket: any) => ({
        key: bucket.key,
        count: bucket.doc_count
      }));
    }

    if (aggregations.companies) {
      formatted.companies = aggregations.companies.buckets.map((bucket: any) => ({
        key: bucket.key,
        count: bucket.doc_count
      }));
    }

    if (aggregations.locations) {
      formatted.locations = aggregations.locations.buckets.map((bucket: any) => ({
        key: bucket.key,
        count: bucket.doc_count
      }));
    }

    if (aggregations.salary_ranges) {
      formatted.salaryRanges = aggregations.salary_ranges.buckets.map((bucket: any) => ({
        key: bucket.key,
        count: bucket.doc_count
      }));
    }

    if (aggregations.top_skills) {
      formatted.skills = aggregations.top_skills.skills.buckets.map((bucket: any) => ({
        key: bucket.key,
        count: bucket.doc_count
      }));
    }

    return formatted;
  }

  // Suggestion methods
  public async getSuggestions(suggestionQuery: SuggestionQuery): Promise<SuggestionResult> {
    try {
      const response = await this.client.search({
        index: suggestionQuery.field.includes('job') ? 'jobs' : 'candidates',
        body: {
          suggest: {
            suggestions: {
              prefix: suggestionQuery.prefix,
              completion: {
                field: suggestionQuery.field,
                size: suggestionQuery.size || 10,
                contexts: suggestionQuery.contexts
              }
            }
          }
        }
      });

      return {
        suggestions: response.suggest.suggestions[0].options.map((option: any) => ({
          text: option.text,
          score: option._score,
          contexts: option.contexts
        }))
      };
    } catch (error) {
      logger.error('Suggestion error:', error);
      throw error;
    }
  }

  // Indexing methods
  public async indexJob(job: JobDocument): Promise<void> {
    try {
      await this.client.index({
        index: 'jobs',
        id: job.id,
        body: job
      });
      
      logger.debug(`Job indexed: ${job.id}`);
    } catch (error) {
      logger.error(`Error indexing job ${job.id}:`, error);
      throw error;
    }
  }

  public async indexCandidate(candidate: CandidateDocument): Promise<void> {
    try {
      await this.client.index({
        index: 'candidates',
        id: candidate.id,
        body: candidate
      });
      
      logger.debug(`Candidate indexed: ${candidate.id}`);
    } catch (error) {
      logger.error(`Error indexing candidate ${candidate.id}:`, error);
      throw error;
    }
  }

  public async bulkIndex(operations: any[]): Promise<void> {
    try {
      const response = await this.client.bulk({
        body: operations
      });

      if (response.errors) {
        const errors = response.items.filter((item: any) => item.index?.error || item.update?.error);
        logger.error('Bulk indexing errors:', errors);
      }

      logger.info(`Bulk operation completed: ${operations.length / 2} documents`);
    } catch (error) {
      logger.error('Bulk indexing error:', error);
      throw error;
    }
  }

  // Delete methods
  public async deleteJob(jobId: string): Promise<void> {
    try {
      await this.client.delete({
        index: 'jobs',
        id: jobId
      });
      
      logger.debug(`Job deleted: ${jobId}`);
    } catch (error) {
      logger.error(`Error deleting job ${jobId}:`, error);
      throw error;
    }
  }

  public async deleteCandidate(candidateId: string): Promise<void> {
    try {
      await this.client.delete({
        index: 'candidates',
        id: candidateId
      });
      
      logger.debug(`Candidate deleted: ${candidateId}`);
    } catch (error) {
      logger.error(`Error deleting candidate ${candidateId}:`, error);
      throw error;
    }
  }
}