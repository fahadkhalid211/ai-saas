'use client';

import React from 'react';
import { CognitivePipeline } from './CognitivePipeline';

interface NeuralBrainWorkflowProps {
  theme?: 'light' | 'dark';
}

export function NeuralBrainWorkflow({ theme = 'dark' }: NeuralBrainWorkflowProps) {
  return <CognitivePipeline theme={theme} />;
}

export { CognitivePipeline };
