const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Job = require('../models/Job');

describe('Job Search API Advanced Features', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/jobmarket_test');
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await Job.deleteMany({});
        // Insert test data with varied salaries and dates
        await Job.create([
            {
                title: 'Junior Developer',
                company: 'StartUp Co',
                location: 'Remote',
                salary: '60000-80000',
                description: 'Entry level position',
                apply_link: 'https://example.com/junior',
                remote: true,
                posted_at: new Date('2023-01-01')
            },
            {
                title: 'Senior Developer',
                company: 'Tech Giant',
                location: 'San Francisco',
                salary: '150000-200000',
                description: 'Senior position',
                apply_link: 'https://example.com/senior',
                remote: false,
                posted_at: new Date('2023-01-15')
            },
            {
                title: 'Full Stack Developer',
                company: 'Mid Corp',
                location: 'New York',
                salary: '100000-130000',
                description: 'Full stack role',
                apply_link: 'https://example.com/fullstack',
                remote: true,
                posted_at: new Date('2023-01-10')
            }
        ]);
    });

    describe('Sorting Functionality', () => {
        test('should sort jobs by salary in ascending order', async () => {
            const response = await request(app)
                .get('/api/jobs/fetch_jobs')
                .query({ 
                    sort_by: 'salary',
                    sort_order: 'asc'
                });
            
            expect(response.status).toBe(200);
            expect(response.body.jobs).toHaveLength(3);
            expect(response.body.jobs[0].salary).toBe('60000-80000');
            expect(response.body.jobs[2].salary).toBe('150000-200000');
        });

        test('should sort jobs by date posted in descending order', async () => {
            const response = await request(app)
                .get('/api/jobs/fetch_jobs')
                .query({ 
                    sort_by: 'posted_at',
                    sort_order: 'desc'
                });
            
            expect(response.status).toBe(200);
            expect(response.body.jobs[0].title).toBe('Senior Developer');
            expect(response.body.jobs[2].title).toBe('Junior Developer');
        });
    });

    describe('Pagination', () => {
        test('should return paginated results', async () => {
            const response = await request(app)
                .get('/api/jobs/fetch_jobs')
                .query({ 
                    page: 1,
                    limit: 2
                });
            
            expect(response.status).toBe(200);
            expect(response.body.jobs).toHaveLength(2);
            expect(response.body).toHaveProperty('total');
            expect(response.body).toHaveProperty('pages');
        });

        test('should handle last page with fewer items', async () => {
            const response = await request(app)
                .get('/api/jobs/fetch_jobs')
                .query({ 
                    page: 2,
                    limit: 2
                });
            
            expect(response.status).toBe(200);
            expect(response.body.jobs).toHaveLength(1);
        });
    });

    describe('Advanced Filtering', () => {
        test('should filter jobs by salary range', async () => {
            const response = await request(app)
                .get('/api/jobs/fetch_jobs')
                .query({ 
                    min_salary: 100000,
                    max_salary: 150000
                });
            
            expect(response.status).toBe(200);
            expect(response.body.jobs).toHaveLength(1);
            expect(response.body.jobs[0].title).toBe('Full Stack Developer');
        });

        test('should combine multiple filters', async () => {
            const response = await request(app)
                .get('/api/jobs/fetch_jobs')
                .query({ 
                    remote: true,
                    min_salary: 50000,
                    location: 'Remote'
                });
            
            expect(response.status).toBe(200);
            expect(response.body.jobs).toHaveLength(1);
            expect(response.body.jobs[0].title).toBe('Junior Developer');
        });
    });

    describe('Search Optimization', () => {
        test('should perform case-insensitive search', async () => {
            const response = await request(app)
                .get('/api/jobs/fetch_jobs')
                .query({ query: 'DEVELOPER' });
            
            expect(response.status).toBe(200);
            expect(response.body.jobs).toHaveLength(3);
        });

        test('should handle partial word matches', async () => {
            const response = await request(app)
                .get('/api/jobs/fetch_jobs')
                .query({ query: 'dev' });
            
            expect(response.status).toBe(200);
            expect(response.body.jobs).toHaveLength(3);
        });
    });
});