import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import GettingStarted from '~/routes/($lang).getting-started._index';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Getting Started index page', () => {
  it('renders heading', () => {
    renderWithRouter(<GettingStarted />);
    expect(
      screen.getByRole('heading', {level: 1, name: 'Getting Started'}),
    ).toBeTruthy();
  });

  it('renders all three path cards', () => {
    renderWithRouter(<GettingStarted />);
    expect(screen.getByText('Learn Video Synthesis')).toBeTruthy();
    expect(screen.getByText('Start with Modular')).toBeTruthy();
    expect(screen.getByText('Start with Videomancer')).toBeTruthy();
  });

  it('renders CTA buttons for each path', () => {
    renderWithRouter(<GettingStarted />);
    expect(screen.getByText('Start Learning')).toBeTruthy();
    expect(screen.getByText('Build Your System')).toBeTruthy();
    expect(screen.getByText('Videomancer Quick Start')).toBeTruthy();
  });

  it('links to correct routes', () => {
    renderWithRouter(<GettingStarted />);
    const learnLink = screen.getByText('Start Learning');
    expect(learnLink.closest('a')?.getAttribute('href')).toBe(
      '/getting-started/learn',
    );

    const modularLink = screen.getByText('Build Your System');
    expect(modularLink.closest('a')?.getAttribute('href')).toBe(
      '/getting-started/modular',
    );

    const vmLink = screen.getByText('Videomancer Quick Start');
    expect(vmLink.closest('a')?.getAttribute('href')).toBe(
      '/instruments/videomancer/manual/quick-start',
    );
  });
});
