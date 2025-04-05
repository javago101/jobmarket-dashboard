import React, { useState, useEffect, useCallback } from 'react';
import { 
    Container, 
    Grid, 
    Paper, 
    TextField, 
    Button, 
    Card, 
    CardContent, 
    Typography,
    Box,
    FormControlLabel,
    Switch,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import axios from 'axios';

const JobDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [remoteOnly, setRemoteOnly] = useState(false);
    const [minSalary, setMinSalary] = useState('');
    const salaryOptions = [
        { value: '', label: 'Any' },
        { value: '50000', label: '50k+' },
        { value: '100000', label: '100k+' },
        { value: '150000', label: '150k+' },
        { value: '200000', label: '200k+' },
        { value: 'smart', label: 'Smart Match' }
    ];
    const [datePosted, setDatePosted] = useState('');
    const [maxPages, setMaxPages] = useState(1);
    const [sortBy, setSortBy] = useState('posted_at');
    const [sortOrder, setSortOrder] = useState('desc');

    const sortJobs = (jobsToSort) => {
        return [...jobsToSort].sort((a, b) => {
            switch (sortBy) {
                case 'posted_at':
                    const dateA = new Date(a.posted_at);
                    const dateB = new Date(b.posted_at);
                    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
                case 'title':
                    return sortOrder === 'desc' 
                        ? b.title.localeCompare(a.title) 
                        : a.title.localeCompare(b.title);
                case 'salary':
                    // 提取薪资范围的最小值进行比较
                    const getSalaryValue = (salary) => {
                        if (!salary || salary === 'Not specified') return 0;
                        const match = salary.match(/\d+/);
                        return match ? parseInt(match[0]) : 0;
                    };
                    const salaryA = getSalaryValue(a.salary);
                    const salaryB = getSalaryValue(b.salary);
                    return sortOrder === 'desc' ? salaryB - salaryA : salaryA - salaryB;
                default:
                    return 0;
            }
        });
    };

    const fetchJobs = useCallback(async () => {
        if (!query.trim()) {
            setError('Please enter search keywords');
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('http://localhost:5002/api/jobs/fetch_jobs', {
                params: {
                    query: query.trim(),
                    location: location.trim(),
                    remote_only: remoteOnly,
                    min_salary: minSalary || undefined,
                    date_posted: datePosted || undefined,
                    max_pages: maxPages
                },
                headers: {
                    'X-RapidAPI-Key': process.env.REACT_APP_API_KEY,
                    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
                },
                timeout: 10000
            });
            const sortedJobs = sortJobs(response.data.jobs);
            setJobs(sortedJobs);
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.details || '获取工作信息失败，请稍后重试。';
            setError(errorMessage);
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    }, [query, location, remoteOnly, minSalary, datePosted, maxPages]);

    useEffect(() => {
        // 移除自动加载
        // fetchJobs();
    }, [fetchJobs]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchJobs();
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Job Market Dashboard
                </Typography>

                <Paper sx={{ p: 2, mb: 4 }}>
                    <form onSubmit={handleSearch}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={5}>
                                <TextField
                                    fullWidth
                                    label="Search Jobs"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={5}>
                                <TextField
                                    fullWidth
                                    label="Location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <FormControl fullWidth>
                                    <InputLabel>Sort By</InputLabel>
                                    <Select
                                        value={sortBy}
                                        label="Sort By"
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <MenuItem value="posted_at">Date Posted</MenuItem>
                                        <MenuItem value="title">Title</MenuItem>
                                        <MenuItem value="salary">Salary</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <FormControl fullWidth>
                                    <InputLabel>Sort Order</InputLabel>
                                    <Select
                                        value={sortOrder}
                                        label="Sort Order"
                                        onChange={(e) => setSortOrder(e.target.value)}
                                    >
                                        <MenuItem value="asc">Ascending</MenuItem>
                                        <MenuItem value="desc">Descending</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <FormControl fullWidth>
                                    <InputLabel>Minimum Salary</InputLabel>
                                    <Select
                                        value={minSalary}
                                        label="Minimum Salary"
                                        onChange={(e) => setMinSalary(e.target.value)}
                                    >
                                        {salaryOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Date Posted"
                                    value={datePosted}
                                    onChange={(e) => setDatePosted(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    sx={{ height: '56px' }}
                                >
                                    Search
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={remoteOnly}
                                            onChange={(e) => setRemoteOnly(e.target.checked)}
                                        />
                                    }
                                    label="Remote Only"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Max Pages"
                                    value={maxPages}
                                    onChange={(e) => setMaxPages(Number(e.target.value))}
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>
                        </Grid>
                    </form>
                </Paper>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                {loading ? (
                    <Typography>Loading...</Typography>
                ) : (
                    <Grid container spacing={3}>
                        {jobs.map((job) => (
                            <Grid item xs={12} md={6} key={job._id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" component="h2">
                                            {job.title || 'No Title'}
                                        </Typography>
                                        <Typography color="textSecondary" gutterBottom>
                                            {job.company || 'No Company'}
                                        </Typography>
                                        <Typography variant="body2" component="p">
                                            Location: {job.location || 'No Location'}
                                        </Typography>
                                        {job.salary && typeof job.salary === 'string' && (
                                            <Typography variant="body2" component="p">
                                                Salary: {job.salary}
                                            </Typography>
                                        )}
                                        <Typography variant="body2" component="p" sx={{ mt: 1 }}>
                                            {typeof job.description === 'string' ? job.description : 
                                             typeof job.description === 'object' && job.description?.body ? 
                                             job.description.body : 'No description available'}
                                        </Typography>
                                        <Box sx={{ mt: 2 }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                href={job.apply_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Apply Now
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Container>
    );
};

export default JobDashboard;