import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Button} from '~/components/Button';
import {MemoryRouter} from 'react-router-dom';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Button', () => {
  it('renders as a button by default', () => {
    renderWithRouter(<Button>Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button.tagName).toBe('BUTTON');
  });

  it('applies primary variant classes', () => {
    renderWithRouter(<Button variant="primary">Primary</Button>);
    const button = screen.getByText('Primary');
    expect(button.className).toContain('btn-primary');
  });

  it('applies secondary variant classes', () => {
    renderWithRouter(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByText('Secondary');
    expect(button.className).toContain('btn-secondary');
  });

  it('applies inline variant classes', () => {
    renderWithRouter(<Button variant="inline">Inline</Button>);
    const button = screen.getByText('Inline');
    expect(button.className).toContain('btn-link');
  });

  it('applies full width class', () => {
    renderWithRouter(<Button width="full">Full</Button>);
    const button = screen.getByText('Full');
    expect(button.className).toContain('w-full');
  });

  it('applies auto width class by default', () => {
    renderWithRouter(<Button>Auto</Button>);
    const button = screen.getByText('Auto');
    expect(button.className).toContain('w-auto');
  });

  it('renders as a link when "to" prop is provided', () => {
    renderWithRouter(<Button to="/products">Shop</Button>);
    const link = screen.getByText('Shop');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/products');
  });

  it('accepts custom className', () => {
    renderWithRouter(<Button className="custom-class">Custom</Button>);
    const button = screen.getByText('Custom');
    expect(button.className).toContain('custom-class');
  });
});
