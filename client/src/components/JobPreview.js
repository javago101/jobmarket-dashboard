import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    Grid,
    Avatar,
    Chip,
    Divider
} from '@mui/material';
import { Work, LocationOn, AttachMoney } from '@mui/icons-material';

const JobPreview = ({ jobs, loading }) => {
    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Grid container spacing={3}>
            {jobs.map((job) => (
                <Grid item xs={12} md={6} key={job._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar
                                    src={job.company_logo}
                                    alt={job.company}
                                    sx={{ width: 50, height: 50, mr: 2 }}
                                >
                                    {job.company ? job.company[0] : '?'}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                                        {job.title || 'No Title'}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        {job.company || 'No Company'}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                <Chip
                                    icon={<LocationOn />}
                                    label={job.location || 'No Location'}
                                    size="small"
                                    variant="outlined"
                                />
                                {job.salary && typeof job.salary === 'string' && (
                                    <Chip
                                        icon={<AttachMoney />}
                                        label={job.salary}
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                                {job.type && (
                                    <Chip
                                        icon={<Work />}
                                        label={job.type}
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="body2" sx={{
                                mb: 2,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 4,
                                WebkitBoxOrient: 'vertical',
                                textOverflow: 'ellipsis'
                            }}>
                                {typeof job.description === 'string' ? job.description :
                                 typeof job.description === 'object' && job.description?.body ?
                                 job.description.body : 'No description available'}
                            </Typography>
                            
                            <Box sx={{ mt: 'auto', textAlign: 'right' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    href={job.apply_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Apply Now
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default JobPreview;