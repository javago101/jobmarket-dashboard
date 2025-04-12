import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, TextField, Select, MenuItem, Button, Card, CardContent, Typography, Chip, Avatar, Pagination, Autocomplete } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
    transition: 'all 0.3s'
  }
}));

const JobTypeChip = styled(Chip)(({ type }) => ({
  backgroundColor: type === 'Full-time' ? '#e3f2fd' : type === 'Part-time' ? '#e8f5e9' : '#fff3e0',
  color: type === 'Full-time' ? '#1976d2' : type === 'Part-time' ? '#2e7d32' : '#f57c00'
}));

const JobSearch = () => {
  const [jobs, setJobs] = useState([]);
  const jobCategories = {
    'Software/Internet/AI': {
      'Backend Engineering': [
        'Backend Engineer',
        'Java Engineer',
        'Python Engineer',
        '.Net Engineer',
        'C/C++ Engineer',
        'Golang Engineer',
        'Full Stack Engineer',
        'Blockchain Engineer',
        'Salesforce Developer'
      ],
      'Frontend/Mobile/Game': [
        'Frontend Software Engineer',
        'React Developer',
        'UI/UX Developer',
        'iOS/Swift Developer',
        'Android Developer',
        'Flutter Developer',
        'Unity Developer',
        'Unreal Engine Developer',
        'AR/VR Developer',
        'Game Developer'
      ],
      'Testing': [
        'Software Testing/Quality Assurance Engineer',
        'Automation Test Engineer',
        'QA Manager'
      ],
      'System Reliability & Security': [
        'DevOps Engineer',
        'Site Reliability Engineer',
        'Security Engineer',
        'Cloud Engineer'
      ]
    }
  };

  const [filters, setFilters] = useState({
    title: '',
    location: '',
    type: 'all',
    salary: 'all',
    workAuth: 'all',
    remote: false
  });

  const getAllJobTitles = () => {
    return Object.values(jobCategories).flatMap(categories =>
      Object.values(categories).flat()
    );
  };
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchJobs();
  }, [filters, page]);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`/api/jobs/fetch_jobs?page=${page}&title=${filters.title}&location=${filters.location}&type=${filters.type}&salary=${filters.salary}`);
      const data = await response.json();
      if (data.success) {
        setJobs(data.jobs);
        setTotalPages(Math.ceil(data.total / 10));
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          With time on our side, we can aim for the perfect match.
        </Typography>
        <Typography variant="subtitle1" gutterBottom color="textSecondary">
          Now, what type of role are you looking for?
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Autocomplete
              fullWidth
              options={getAllJobTitles()}
              value={filters.title}
              onChange={(event, newValue) => {
                setFilters(prev => ({ ...prev, title: newValue || '' }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="title"
                  label="Job Function"
                  placeholder="Please select/enter your expected job function"
                  required
                />
              )}
              freeSolo
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Job Type
            </Typography>
            <Grid container spacing={2}>
              {['Full-time', 'Contract', 'Part-time', 'Internship'].map((type) => (
                <Grid item key={type}>
                  <Chip
                    label={type}
                    onClick={() => setFilters(prev => ({ ...prev, type }))}
                    variant={filters.type === type ? 'filled' : 'outlined'}
                    color={filters.type === type ? 'primary' : 'default'}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="location"
              label="Location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Within US"
            />
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              label="Open to Remote"
              onClick={() => setFilters(prev => ({ ...prev, remote: !prev.remote }))}
              variant={filters.remote ? 'filled' : 'outlined'}
              color={filters.remote ? 'primary' : 'default'}
              icon={<span>ℹ️</span>}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Work Authorization
              <Typography component="span" variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                ℹ️
              </Typography>
            </Typography>
            <Chip
              label="H1B sponsorship"
              onClick={() => setFilters(prev => ({ ...prev, workAuth: prev.workAuth === 'H1B' ? 'all' : 'H1B' }))}
              variant={filters.workAuth === 'H1B' ? 'filled' : 'outlined'}
              color={filters.workAuth === 'H1B' ? 'primary' : 'default'}
              sx={{ mr: 1 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => fetchJobs()}
              sx={{ mt: 2 }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Box>

      {jobs.map((job) => (
        <StyledCard key={job.id}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={2}>
                <Avatar
                  src={job.company_logo}
                  alt={job.company}
                  sx={{ width: 64, height: 64 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" gutterBottom>
                  {job.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {job.company}
                </Typography>
                <Typography variant="body2">
                  {job.location}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4} container direction="column" alignItems="flex-end">
                <JobTypeChip
                  label={job.type}
                  type={job.type}
                  sx={{ mb: 1 }}
                />
                <Typography variant="subtitle1" color="primary">
                  {job.salary}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  发布于 {job.posted_at}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>
      ))}

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Container>
  );
};

export default JobSearch;