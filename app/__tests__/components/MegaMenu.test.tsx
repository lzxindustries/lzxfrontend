import {describe, expect, it} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';

import {DesktopMegaMenu} from '~/components/MegaMenu';

describe('DesktopMegaMenu', () => {
  it('includes the Cases & Power link under Products', () => {
    render(<DesktopMegaMenu url="/" />);

    fireEvent.mouseEnter(screen.getByRole('button', {name: 'Products'}).parentElement!);

    expect(screen.getByRole('link', {name: 'Cases & Power'})).toHaveAttribute(
      'href',
      '/cases-and-power',
    );
  });
});