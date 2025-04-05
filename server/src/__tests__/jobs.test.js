const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Job = require('../models/Job');

describe('Jobs API Endpoints', () => {
    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/jobmarket_test');
    });

    afterAll(async () => {
        // Disconnect from test database
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Clear the database before each test
        await Job.deleteMany({});
    });

    describe('GET /api/jobs/fetch_jobs', () => {
        beforeEach(async () => {
            // Insert test data
            await Job.create([
                {
                    title: 'Software Engineer',
                    company: 'Tech Corp',
                    location: 'San Francisco',
                    salary: '100000-150000',
                    description: 'Great job opportunity',
                    apply_link: 'https://example.com/apply',
                    remote: false,
                    posted_at: new Date('2023-01-01')
                },
                {
                    title: 'Senior Developer',
                    company: 'Dev Inc',
                    location: 'New York',
                    salary: '150000-200000',
                    description: 'Senior role available',
                    apply_link: 'https://example.com/apply2',
                    remote: true,
                    posted_at: new Date('2023-01-02')
                }
            ]);
        });

        test('should fetch all jobs when no query parameters', async () => {
            const response = await request(app).get('/api/jobs/fetch_jobs');
            
            expect(response.status).toBe(200);
            expect(response.body.jobs).toHaveLength(2);
            expect(response.body.jobs[0]).toHaveProperty('title');
            expect(response.body.jobs[0]).toHaveProperty('company');
        });

        test('should filter jobs by search query', async () => {
            const response = await request(app)
                .get('/api/jobs/fetch_jobs')
                .query({ query: 'Senior' });
            
            expect(response.status).toBe(200);
            expect(response.body.jobs).toHaveLength(1);
            expect(response.body.jobs[0].title).toBe('Senior Developer');
        });

        test('should filter jobs by location', async () => {
            const response = await request(app)
                .get('/api/jobs/fetch_jobs')
                .query({ location: 'San Francisco' });
            
            expect(response.status).toBe(200);
            expect(response.body.jobs).toHaveLength(1);
            expect(response.body.jobs[0].location).toBe('San Francisco');
        });

        test('should filter remote jobs', async () => {
            const response = await request(app)
                .get('/api/jobs/fetch_jobs')
                .query({ remote: true });
            
            expect(response.status).toBe(200);
            expect(response.body.jobs).toHaveLength(1);
            expect(response.body.jobs[0].remote).toBe(true);
        });

        test('should filter jobs by date posted', async () => {
            const response = await request(app)
                .get('/api/jobs/fetch_jobs')
                .query({ date_posted: '2023-01-02' });
            
            expect(response.status).toBe(200);
            expect(response.body.jobs).toHaveLength(1);
            expect(response.body.jobs[0].title).toBe('Senior Developer');
        });

        test('should handle empty search query', async () => {
            const response = await request(app)
                .get('/api/jobs/fetch_jobs')
                .query({ query: '' });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Search keyword cannot be empty');
        });

        test('should handle invalid max_pages parameter', async () => {
            const response = await request(app)
                .get('/api/jobs/fetch_jobs')
                .query({ max_pages: -1 });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid page parameter');
        });

        test('should handle invalid min_salary parameter', async () => {
            const response = await request(app)
                .get('/api/jobs/fetch_jobs')
                .query({ min_salary: -1000 });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid minimum salary parameter');
        });

        test('should handle invalid query parameters gracefully', async () => {
            const response = await request(app)
                .get('/api/jobs/fetch_jobs')
                .query({ minSalary: 'invalid' });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('Error Handling', () => {
        test('should handle database connection errors', async () => {
            // Simulate database error by closing the connection
            await mongoose.connection.close();

            const response = await request(app).get('/api/jobs/fetch_jobs');
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');

            // Reconnect for other tests
            await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/jobmarket_test');
        });

        test('should handle missing API key', async () => {
            const response = await request(app)
                .get('/api/jobs/fetch_jobs')
                .set('x-rapidapi-key', '');
            
            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized - Invalid API Key');
        });

        test('should handle network errors from external API', async () => {
            // Mock axios to simulate network error
            jest.spyOn(require('axios'), 'request').mockRejectedValue({
                request: {}, // Network error
                message: 'Network Error'
            });

            const response = await request(app)
                .get('/api/jobs/fetch_jobs')
                .query({ query: 'developer' });
            
            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Network error while fetching jobs');
        });
    });
});