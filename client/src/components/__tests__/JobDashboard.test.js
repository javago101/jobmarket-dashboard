import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Mock axios
jest.mock('axios');

describe('JobDashboard Component', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    test('renders search form correctly', () => {
        renderWithTheme(<JobDashboard />);
        expect(screen.getByLabelText('Search Jobs')).toBeInTheDocument();
        expect(screen.getByLabelText('Location')).toBeInTheDocument();
        expect(screen.getByLabelText('Remote Only')).toBeInTheDocument();
        expect(screen.getByLabelText('Minimum Salary')).toBeInTheDocument();
    });

    test('shows error when search with empty query', async () => {
        renderWithTheme(<JobDashboard />);
        const searchButton = screen.getByText('Search');
        
        fireEvent.click(searchButton);
        
        expect(screen.getByText('Please enter search keywords')).toBeInTheDocument();
        expect(axios.get).not.toHaveBeenCalled();
    });

    test('fetches jobs successfully', async () => {
        const mockJobs = [
            {
                _id: '1',
                title: 'Software Engineer',
                company: 'Tech Corp',
                location: 'San Francisco',
                salary: '100000-150000',
                description: 'Great job opportunity',
                apply_link: 'https://example.com/apply'
            }
        ];

        axios.get.mockResolvedValueOnce({
            data: { jobs: mockJobs }
        });

        renderWithTheme(<JobDashboard />);

        // Fill in search form
        fireEvent.change(screen.getByLabelText('Search Jobs'), {
            target: { value: 'software engineer' }
        });

        // Click search button
        fireEvent.click(screen.getByText('Search'));

        // Wait for API call and check if job is displayed
        await waitFor(() => {
            expect(screen.getByText('Software Engineer')).toBeInTheDocument();
            expect(screen.getByText('Tech Corp')).toBeInTheDocument();
        });

        // Verify API call
        expect(axios.get).toHaveBeenCalledWith(
            'http://localhost:5002/api/jobs/fetch_jobs',
            expect.objectContaining({
                params: expect.objectContaining({
                    query: 'software engineer'
                })
            })
        );
    });

    test('handles API error correctly', async () => {
        const errorMessage = 'Failed to fetch job information. Please try again later.';
        axios.get.mockRejectedValueOnce({
            response: {
                data: { error: errorMessage }
            }
        });

        renderWithTheme(<JobDashboard />);

        // Fill in search form and submit
        fireEvent.change(screen.getByLabelText('Search Jobs'), {
            target: { value: 'developer' }
        });
        fireEvent.click(screen.getByText('Search'));

        // Wait for error message
        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    test('updates sort order correctly', async () => {
        const mockJobs = [
            {
                _id: '1',
                title: 'Software Engineer',
                posted_at: '2023-01-01',
                salary: '100000-150000'
            },
            {
                _id: '2',
                title: 'Senior Developer',
                posted_at: '2023-01-02',
                salary: '150000-200000'
            }
        ];

        axios.get.mockResolvedValueOnce({
            data: { jobs: mockJobs }
        });

        renderWithTheme(<JobDashboard />);

        // Change sort order
        fireEvent.mouseDown(screen.getByLabelText('Sort By'));
        fireEvent.click(screen.getByText('Salary'));

        fireEvent.mouseDown(screen.getByLabelText('Sort Order'));
        fireEvent.click(screen.getByText('Ascending'));

        // Trigger search
        fireEvent.change(screen.getByLabelText('Search Jobs'), {
            target: { value: 'developer' }
        });
        fireEvent.click(screen.getByText('Search'));

        await waitFor(() => {
            const jobTitles = screen.getAllByRole('heading', { level: 2 });
            expect(jobTitles[0].textContent).toBe('Software Engineer');
            expect(jobTitles[1].textContent).toBe('Senior Developer');
        });
    });
});