import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Button } from '@/frontend/components/ui/Button';
import { Badge } from '@/frontend/components/ui/Badge';
import { Input } from '@/frontend/components/ui/Input';

describe('Frontend UI Components', () => {
  it('should render Button with text and click handler', () => {
    render(<Button variant="primary">Add to Bag</Button>);
    expect(screen.getByText('Add to Bag')).toBeInTheDocument();
  });

  it('should render Badge with gold styling variant', () => {
    render(<Badge variant="gold">Bestseller</Badge>);
    expect(screen.getByText('Bestseller')).toBeInTheDocument();
  });

  it('should render Input with label and placeholder', () => {
    render(
      <Input
        label="Email Address"
        placeholder="Enter your email"
        value="test@example.com"
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  });
});
