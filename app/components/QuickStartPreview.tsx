/**
 * Compact quick-start preview for product overview pages.
 * Shows the first few setup steps inline with a link to the full manual.
 */
import {Link} from '@remix-run/react';
import quickStartStepsData from '../../content/landing/quick-start-steps.json';

export interface QuickStartStep {
  title: string;
  description: string;
}

interface QuickStartPreviewProps {
  steps: QuickStartStep[];
  manualUrl: string;
  productTitle: string;
}

/**
 * Instrument-specific quick-start step data.
 * Source of truth: content/landing/quick-start-steps.json
 */
export const QUICK_START_STEPS: Record<string, QuickStartStep[]> =
  quickStartStepsData;

export function QuickStartPreview({
  steps,
  manualUrl,
  productTitle,
}: QuickStartPreviewProps) {
  return (
    <div className="rounded-xl border border-base-300 bg-base-200/50 p-5">
      <h3 className="text-base font-bold mb-3">
        Get Started with {productTitle}
      </h3>
      <ol className="space-y-3 mb-4">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-content text-sm font-bold">
              {i + 1}
            </span>
            <div className="min-w-0">
              <span className="font-semibold text-sm">{step.title}</span>
              <p className="text-sm text-base-content/70 mt-0.5">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <Link
        to={manualUrl}
        className="btn btn-sm btn-outline"
      >
        Read Full Quick Start Guide &rarr;
      </Link>
    </div>
  );
}
