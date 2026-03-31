import { describe, it, expect } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

describe('app shell', () => {
  it('mounts Mantine + Query providers', () => {
    render(
      <MantineProvider>
        <QueryClientProvider client={new QueryClient()}>
          <span>Sitio shell</span>
        </QueryClientProvider>
      </MantineProvider>,
    );
    expect(screen.getByText('Sitio shell')).toBeTruthy();
  });
});
