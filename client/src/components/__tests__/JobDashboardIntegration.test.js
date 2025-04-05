import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import JobDashboard from '../JobDashboard';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

const renderWithTheme = (component) => {
    return render(
        <ThemeProvider theme={theme}>
            {component}
        </ThemeProvider>
    );
};

jest.mock('axios');

describe('JobDashboard Integration Tests', () => {
    const mockJobs = [
        {
            _id: '1',
            title: 'Frontend Developer',
            company: 'Tech Co',
            location: 'Remote',
            salary: '90000-120000',
            description: 'Frontend role',
            apply_link: 'https://example.com/frontend',
            remote: true,
            posted_at: '2023-01-15'
        },
        {
            _id: '2',
            title: 'Backend Developer',
            company: 'Software Inc',
            location: 'New York',
            salary: '100000-140000',
            description: 'Backend role',
            apply_link: 'https://example.com/backend',
            remote: false,
            posted_at: '2023-01-10'
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        axios.get.mockResolvedValue({ data: { jobs: mockJobs } });
    });

    describe('Form Interaction and API Integration', () => {
        test('should update form fields and trigger search', async () => {
            renderWithTheme(<JobDashboard />);

            // Fill out search form
            await act(async () => {
                await userEvent.type(screen.getByLabelText(/search jobs/i), 'developer');
                await userEvent.type(screen.getByLabelText(/location/i), 'New York');
                fireEvent.click(screen.getByLabelText(/remote only/i));
                await userEvent.type(screen.getByLabelText(/minimum salary/i), '100000');
            });

            // Trigger search
            fireEvent.click(screen.getByText(/search/i));

            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith(
                    'http://localhost:5002/api/jobs/fetch_jobs',
                    expect.objectContaining({
                        params: {
                            query: 'developer',
                            location: 'New York',
                            remote: true,
                            min_salary: '100000'
                        }
                    })
                );
            });
        });

        test('should handle form validation and display errors', async () => {
            renderWithTheme(<JobDashboard />);

            // Submit empty form
            fireEvent.click(screen.getByText(/search/i));
            expect(screen.getByText(/please enter search keywords/i)).toBeInTheDocument();

            // Enter invalid salary
            await userEvent.type(screen.getByLabelText(/minimum salary/i), '-1000');
            fireEvent.click(screen.getByText(/search/i));
            expect(screen.getByText(/invalid salary amount/i)).toBeInTheDocument();
        });
    });

    describe('Job Results Display and Interaction', () => {
        test('should display job results with correct formatting', async () => {
            renderWithTheme(<JobDashboard />);

            await act(async () => {
                await userEvent.type(screen.getByLabelText(/search jobs/i), 'developer');
                fireEvent.click(screen.getByText(/search/i));
            });

            await waitFor(() => {
                expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
                expect(screen.getByText('Backend Developer')).toBeInTheDocument();
                expect(screen.getByText('Tech Co')).toBeInTheDocument();
                expect(screen.getByText('$90,000 - $120,000')).toBeInTheDocument();
            });
        });

        test('should handle job card interactions', async () => {
            renderWithTheme(<JobDashboard />);

            await act(async () => {
                await userEvent.type(screen.getByLabelText(/search jobs/i), 'developer');
                fireEvent.click(screen.getByText(/search/i));
            });

            await waitFor(() => {
                const applyButtons = screen.getAllByText(/apply now/i);
                expect(applyButtons).toHaveLength(2);
                expect(applyButtons[0]).toHaveAttribute('href', 'https://example.com/frontend');
            });
        });
    });

    describe('Sorting and Filtering', () => {
        test('should handle salary sorting', async () => {
            renderWithTheme(<JobDashboard />);

            await act(async () => {
                await userEvent.type(screen.getByLabelText(/search jobs/i), 'developer');
                // Select salary sorting
                fireEvent.mouseDown(screen.getByLabelText(/sort by/i));
                fireEvent.click(screen.getByText(/salary/i));
                fireEvent.click(screen.getByText(/search/i));
            });

            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.objectContaining({
                        params: expect.objectContaining({
                            sort_by: 'salary'
                        })
                    })
                );
            });
        });

        test('should handle date sorting', async () => {
            renderWithTheme(<JobDashboard />);

            await act(async () => {
                await userEvent.type(screen.getByLabelText(/search jobs/i), 'developer');
                // Select date sorting
                fireEvent.mouseDown(screen.getByLabelText(/sort by/i));
                fireEvent.click(screen.getByText(/date posted/i));
                fireEvent.click(screen.getByText(/search/i));
            });

            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.objectContaining({
                        params: expect.objectContaining({
                            sort_by: 'posted_at'
                        })
                    })
                );
            });
        });
    });

    describe('Error Handling', () => {
        test('should handle API errors gracefully', async () => {
            const errorMessage = 'Failed to fetch jobs';
            axios.get.mockRejectedValueOnce(new Error(errorMessage));

            renderWithTheme(<JobDashboard />);

            await act(async () => {
                await userEvent.type(screen.getByLabelText(/search jobs/i), 'developer');
                fireEvent.click(screen.getByText(/search/i));
            });

            await waitFor(() => {
                expect(screen.getByText(errorMessage)).toBeInTheDocument();
            });
        });

        test('should handle network timeout', async () => {
            axios.get.mockRejectedValueOnce(new Error('Network timeout'));

            renderWithTheme(<JobDashboard />);

            await act(async () => {
                await userEvent.type(screen.getByLabelText(/search jobs/i), 'developer');
                fireEvent.click(screen.getByText(/search/i));
            });

            await waitFor(() => {
                expect(screen.getByText(/network timeout/i)).toBeInTheDocument();
            });
        });
    });
});