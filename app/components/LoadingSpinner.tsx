'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CircularProgress } from '@mui/material';

export default function LoadingSpinner() {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const startLoading = () => {
      console.log('Loading started');
      setLoading(true);
    };

    const stopLoading = () => {
      console.log('Loading stopped');
      setLoading(false);
    };

    // Show loading on initial page load
    startLoading();
    const initialTimeout = setTimeout(stopLoading, 1000);

    // Handle page transitions
    window.addEventListener('beforeunload', startLoading);
    window.addEventListener('load', stopLoading);

    // Handle client-side navigation
    const handleMutation = (mutations: MutationRecord[]) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.target === document.body) {
          startLoading();
          setTimeout(stopLoading, 500);
        }
      }
    };

    // Observe DOM changes for navigation
    const observer = new MutationObserver(handleMutation);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      window.removeEventListener('beforeunload', startLoading);
      window.removeEventListener('load', stopLoading);
      observer.disconnect();
      clearTimeout(initialTimeout);
    };
  }, []);

  if (!mounted || !loading) return null;

  const LoadingOverlay = (
    <div 
      id="loading-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 99999,
        backdropFilter: 'blur(5px)',
        pointerEvents: 'none',
      }}
    >
      <CircularProgress
        sx={{
          color: '#2e7d32',
        }}
      />
    </div>
  );

  // Use createPortal to render the loading overlay at the document root
  return mounted ? createPortal(LoadingOverlay, document.body) : null;
} 