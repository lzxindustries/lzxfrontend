import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import SupportHub from '~/routes/($lang).support';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Support hub page', () => {
  it('renders heading', () => {
    renderWithRouter(<SupportHub />);
    expect(
      screen.getByRole('heading', {level: 1, name: 'Support'}),
    ).toBeTruthy();
  });

  it('renders all 6 task-oriented section cards', () => {
    renderWithRouter(<SupportHub />);
    expect(screen.getByText('I need to set up a new product')).toBeTruthy();
    expect(screen.getByText('I need to find documentation')).toBeTruthy();
    expect(screen.getByText('I need firmware or downloads')).toBeTruthy();
    expect(screen.getByText(/I need to update firmware/)).toBeTruthy();
    expect(screen.getByText(/I need to troubleshoot/)).toBeTruthy();
    expect(screen.getByText(/I need to look up a term/)).toBeTruthy();
  });

  it('renders contact section', () => {
    renderWithRouter(<SupportHub />);
    expect(screen.getByText('Contact Us')).toBeTruthy();
    expect(
      screen.getByText('support@lzxindustries.net'),
    ).toBeTruthy();
  });
});
