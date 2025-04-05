const request = require('supertest');
const express = require('express');
const router = require('../jobs');
const Job = require('../../models/Job');
const axios = require('axios');

// Mock axios and Job model
jest.mock('axios');
jest.mock('../../models/Job');

const app = express();
app.use(express.json());
app.use('/', router);

describe('Jobs API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /fetch_jobs', () => {
        test('returns 400 when query is empty', async () => {
            const response = await request(app)
                .get('/fetch_jobs')
                .query({ query: '' });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Search keyword cannot be empty');
        });

        test('returns 400 for invalid max_pages', async () => {
            const response = await request(app)
                .get('/fetch_jobs')
                .query({ query: 'developer', max_pages: -1 });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Invalid page parameter');
        });

        test('returns 400 for invalid min_salary', async () => {
            const response = await request(app)
                .get('/fetch_jobs')
                .query({ query: 'developer', min_salary: -1000 });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Invalid minimum salary parameter');
        });

        test('successfully fetches jobs from external API', async () => {
            const mockApiResponse = {
                data: {
                    data: [{
                        job_title: 'Software Engineer',
                        employer_name: 'Tech Corp',
                        job_city: 'San Francisco',
                        job_min_salary: 100000,
                        job_max_salary: 150000,
                        job_apply_link: 'https://example.com/apply',
                        job_description: 'Great opportunity',
                        job_posted_at_timestamp: 1672531200 // 2023-01-01
                    }]
                }
            };

            const mockDbJobs = [{
                title: 'Software Engineer',
                company: 'Tech Corp',
                location: 'San Francisco',
                salary: '100000-150000',
                apply_link: 'https://example.com/apply',
                job_description: 'Great opportunity',
                posted_at: new Date('2023-01-01')
            }];

            axios.request.mockResolvedValueOnce(mockApiResponse);
            Job.find.mockResolvedValueOnce(mockDbJobs);
            Job.insertMany.mockResolvedValueOnce();

            const response = await request(app)
                .get('/fetch_jobs')
                .query({ query: 'developer' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.jobs).toEqual(mockDbJobs);
            expect(axios.request).toHaveBeenCalled();
            expect(Job.insertMany).toHaveBeenCalled();
        });

        test('handles external API error correctly', async () => {
            const mockError = {
                response: {
                    status: 429,
                    data: { message: 'Too Many Requests' }
                }
            };

            axios.request.mockRejectedValueOnce(mockError);

            const response = await request(app)
                .get('/fetch_jobs')
                .query({ query: 'developer' });

            expect(response.status).toBe(429);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Failed to fetch jobs from external API');
        });

        test('handles network error correctly', async () => {
            const mockError = {
                request: {},
                message: 'Network Error'
            };

            axios.request.mockRejectedValueOnce(mockError);

            const response = await request(app)
                .get('/fetch_jobs')
                .query({ query: 'developer' });

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Network error while fetching jobs');
        });
    });

    describe('POST /jobs', () => {
        test('successfully creates a new job', async () => {
            const mockJob = {
                title: 'Software Engineer',
                company: 'Tech Corp',
                location: 'San Francisco',
                salary: '100000-150000'
            };

            Job.prototype.save.mockResolvedValueOnce(mockJob);

            const response = await request(app)
                .post('/jobs')
                .send(mockJob);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.job).toEqual(mockJob);
        });

        test('handles validation error', async () => {
            const invalidJob = {};
            const mockError = new Error('Validation failed');

            Job.prototype.save.mockRejectedValueOnce(mockError);

            const response = await request(app)
                .post('/jobs')
                .send(invalidJob);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Validation failed');
        });
    });
});