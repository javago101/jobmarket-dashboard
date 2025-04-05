const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const axios = require('axios');
const apiConfig = require('../config/api.config');

// Get all jobs with filters
router.get('/fetch_jobs', async (req, res) => {
    try {
        const { query = apiConfig.DEFAULT_QUERY, location, remote_only, min_salary, date_posted, max_pages = apiConfig.DEFAULT_MAX_PAGES } = req.query;
        
        // 更严格的参数验证
        if (!query.trim()) {
            return res.status(400).json({ 
                success: false, 
                error: 'Search keyword cannot be empty',
                details: 'Please enter a valid search keyword'
            });
        }
        
        if (max_pages && (isNaN(max_pages) || max_pages < 1)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid page parameter',
                details: 'Page number must be greater than 0'
            });
        }
        
        if (min_salary && (isNaN(min_salary) || min_salary < 0)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid minimum salary parameter',
                details: 'Minimum salary must be a number greater than or equal to 0'
            });
        }
        
        // First try to fetch from JSearch API
        const options = {
            method: 'GET',
            url: apiConfig.JSEARCH_API_URL,
            params: {
                query: `${query.trim()}${location ? ' in ' + location.trim() : ''}`,
                page: '1',
                num_pages: String(max_pages)  // 确保转换为字符串
            },
            headers: {
                'X-RapidAPI-Key': apiConfig.JSEARCH_API_KEY,
                'X-RapidAPI-Host': apiConfig.JSEARCH_API_HOST
            }
        };

        console.log('Sending request to JSearch API with options:', {
            url: options.url,
            params: options.params,
            headers: {
                ...options.headers,
                'X-RapidAPI-Key': '***' // 隐藏API密钥
            }
        });

        const apiResponse = await axios.request(options);
        
        if (!apiResponse.data || !apiResponse.data.data) {
            throw new Error('Invalid response format from JSearch API');
        }

        const newJobs = apiResponse.data.data.map(job => ({
            title: job.job_title,
            company: job.employer_name,
            location: job.job_city || job.job_country || 'Remote',
            salary: job.job_min_salary ? `${job.job_min_salary}-${job.job_max_salary}` : 'Not specified',
            apply_link: job.job_apply_link,
            job_description: job.job_description,
            posted_at: new Date(job.job_posted_at_timestamp * 1000)
        }));

        // Save new jobs to database
        await Job.insertMany(newJobs, { ordered: false }).catch(err => {
            console.log('Some jobs already exist in database');
        });

        // Build filter object for database query
        const filter = {};
        if (query) filter.title = new RegExp(query, 'i');
        if (location) filter.location = new RegExp(location, 'i');
        if (remote_only === 'true') filter.location = /remote/i;
        if (min_salary) {
            // Extract minimum salary from the range string and compare numerically
            filter.$or = [
                { salary: { $regex: new RegExp(`^${min_salary}|^\d*-?\d*$`) } },
                { salary: { $regex: new RegExp(`^\d*-${min_salary}`) } }
            ];
        }
        if (date_posted) {
            const date = new Date(date_posted);
            filter.posted_at = { $gte: date };
        }

        const jobs = await Job.find(filter).sort({ posted_at: -1 });
        res.json({
            success: true,
            message: "Job data fetching completed",
            jobs
        })
    } catch (error) {
        console.error('Error in fetch_jobs:', error);
        if (error.response) {
            // Error from JSearch API
            res.status(error.response.status).json({
                success: false,
                error: 'Failed to fetch jobs from external API',
                details: error.response.data
            });
        } else if (error.request) {
            // Network error
            res.status(500).json({
                success: false,
                error: 'Network error while fetching jobs',
                details: 'Please check your internet connection'
            });
        } else {
            // Other errors
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                details: error.message
            });
        }
    }
});

// Add a new job
router.post('/jobs', async (req, res) => {
    try {
        const job = new Job(req.body);
        await job.save();
        res.status(201).json({ success: true, job });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;