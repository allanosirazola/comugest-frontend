import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { NotFoundPage } from '@/pages/NotFound';

describe('NotFoundPage', () => {
  it('renders 404 text', () => {
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders a link back to home', () => {
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });
});
