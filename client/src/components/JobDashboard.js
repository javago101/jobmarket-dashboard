import React, { useState, useEffect, useCallback } from 'react';
import { 
    Container, 
    Grid, 
    Paper, 
    TextField, 
    Button, 
    Typography,
    Box,
    FormControlLabel,
    Switch,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    Autocomplete,
    Chip
} from '@mui/material';
import JobPreview from './JobPreview';
import axios from 'axios';

const JobDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [remoteOnly, setRemoteOnly] = useState(false);
    const [minSalary, setMinSalary] = useState('');
    const [jobCategory, setJobCategory] = useState('');
    const [jobTitle, setJobTitle] = useState(null);

    const jobCategories = [
        '技术/IT',
        '金融/财务',
        '市场/营销',
        '销售',
        '人力资源',
        '运营',
        '设计',
        '产品',
        '其他'
    ];

    const jobTitlesMap = {
        '技术/IT': ['软件工程师', '前端开发', '后端开发', 'DevOps工程师', '数据工程师', '人工智能工程师'],
        '金融/财务': ['财务分析师', '会计', '投资经理', '风险控制', '审计师'],
        '市场/营销': ['市场经理', '营销专员', '品牌经理', '内容营销', '数字营销'],
        '销售': ['销售经理', '客户经理', '销售代表', '商务拓展', '销售支持'],
        '人力资源': ['HR经理', '招聘专员', '培训经理', 'HRBP', '薪酬福利专员'],
        '运营': ['运营经理', '产品运营', '内容运营', '用户运营', '活动运营'],
        '设计': ['UI设计师', 'UX设计师', '平面设计师', '交互设计师', '视觉设计师'],
        '产品': ['产品经理', '产品专员', '数据分析师', '产品运营', '用户研究员'],
        '其他': ['行政', '客服', '法务', '采购', '其他职位']
    };

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

                <Paper sx={{ p: 3, mb: 4 }}>
                    <form onSubmit={handleSearch}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={3}>
                                <FormControl fullWidth>
                                    <InputLabel>职位类别</InputLabel>
                                    <Select
                                        value={jobCategory}
                                        label="职位类别"
                                        onChange={(e) => {
                                            setJobCategory(e.target.value);
                                            setJobTitle(null); // 重置职位选择
                                        }}
                                    >
                                        {jobCategories.map((category) => (
                                            <MenuItem key={category} value={category}>
                                                {category}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Autocomplete
                                    value={jobTitle}
                                    onChange={(event, newValue) => {
                                        setJobTitle(newValue);
                                        if (newValue) {
                                            setQuery(newValue);
                                        }
                                    }}
                                    options={jobCategory ? jobTitlesMap[jobCategory] : []}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="具体职位"
                                            fullWidth
                                        />
                                    )}
                                    disabled={!jobCategory}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    label="关键词搜索"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="输入技能、公司等关键词"
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    label="工作地点"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="城市名称"
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
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <JobPreview jobs={jobs} loading={loading} />
            </Box>
        </Container>
    );
};

export default JobDashboard;