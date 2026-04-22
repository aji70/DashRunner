'use client';

import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#12100e',
          color: '#FFB347',
          fontSize: '16px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <p>3D rendering unavailable</p>
            <p style={{ fontSize: '12px', opacity: 0.7 }}>
              Try disabling browser extensions or using a different browser
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
