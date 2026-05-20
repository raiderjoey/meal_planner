import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import DayHeader from '../DayHeader';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('DayHeader', () => {
  it('renders the formatted date correctly', () => {
    render(
      <BrowserRouter>
        <DayHeader date="2026-05-20" />
      </BrowserRouter>
    );
    
    // Wednesday, May 20, 2026
    expect(screen.getByText(/Wednesday, May 20, 2026/i)).toBeInTheDocument();
  });

  it('navigates to the previous day when clicking the left button', () => {
    render(
      <BrowserRouter>
        <DayHeader date="2026-05-20" />
      </BrowserRouter>
    );
    
    const prevButton = screen.getByLabelText(/Previous day/i);
    fireEvent.click(prevButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/day/2026-05-19');
  });

  it('navigates to the next day when clicking the right button', () => {
    render(
      <BrowserRouter>
        <DayHeader date="2026-05-20" />
      </BrowserRouter>
    );
    
    const nextButton = screen.getByLabelText(/Next day/i);
    fireEvent.click(nextButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/day/2026-05-21');
  });
});
