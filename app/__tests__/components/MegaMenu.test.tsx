import {describe, expect, it} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';

import {DesktopMegaMenu} from '~/components/MegaMenu';

describe('DesktopMegaMenu', () => {
  it('includes the Cases & Power, Accessories, Parts, and Merchandise links under Products', () => {
    render(<DesktopMegaMenu url="/" />);

    fireEvent.mouseEnter(screen.getByRole('button', {name: 'Products'}).parentElement!);

    expect(screen.getByRole('link', {name: 'Cases & Power'})).toHaveAttribute(
      'href',
      '/cases-and-power',
    );
    expect(screen.getByRole('link', {name: 'Accessories'})).toHaveAttribute(
      'href',
      '/accessories',
    );
    expect(screen.getByRole('link', {name: 'Parts'})).toHaveAttribute(
      'href',
      '/parts',
    );
    expect(screen.getByRole('link', {name: 'Merchandise'})).toHaveAttribute(
      'href',
      '/merchandise',
    );
  });
});