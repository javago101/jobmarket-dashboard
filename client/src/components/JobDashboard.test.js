import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JobDashboard from './JobDashboard';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('JobDashboard', () => {
  const mockJobs = [
    {
      job_id: '1',
      employer_name: 'Test Company',
      job_title: 'Frontend Developer',
      job_city: 'San Francisco',
      job_country: 'US',
      job_posted_at_timestamp: Date.now(),
      job_employment_type: 'Full-time',
      job_apply_link: 'https://example.com',
      employer_logo: 'https://example.com/logo.png'
    }
  ];

  beforeEach(() => {
    // Mock fetch function
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockJobs })
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders job dashboard', async () => {
    renderWithTheme(<JobDashboard />);
    expect(screen.getByText(/Job Dashboard/i)).toBeInTheDocument();
  });

  test('displays loading state', () => {
    renderWithTheme(<JobDashboard />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('sorts jobs when sort button is clicked', async () => {
    renderWithTheme(<JobDashboard />);
    const sortButton = screen.getByRole('button', { name: /sort/i });
    fireEvent.click(sortButton);
    // Add assertions based on your sorting implementation
  });

  test('filters jobs based on search input', async () => {
    renderWithTheme(<JobDashboard />);
    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'Frontend' } });
    // Add assertions for filtered results
  });
});