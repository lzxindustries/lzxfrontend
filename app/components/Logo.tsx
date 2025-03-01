export default function Logo({
  className = '',
  size = 24,
  ...props
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      data-name="Logo"
      // width="224.18"
      height={size}
      className={className}
      viewBox="0 0 224.18 144"
      {...props}
    >
      <path
        d="m178.77 56.12 25.96-45.23c.56-1.04.87-2.24.87-3.51 0-4.08-3.3-7.38-7.39-7.38h-23.37c-2.7 0-5.1 1.47-6.37 3.68l-9.75 17.5-4.79-8.36c-1.18-1.98-2.6-3.79-4.25-5.38A26.216 26.216 0 0 0 138.59 1c-.98-.27-1.96-.5-2.98-.66-1.09-.17-3.92-.34-4.21-.34L50.76.02c-4.09 0-7.39 3.3-7.39 7.38v15.48c0 4.07 3.3 7.37 7.39 7.37h33.17L53.39 82.09H36.83V7.4c.01-4.08-3.3-7.38-7.36-7.38H7.39C3.32.02 0 3.32 0 7.4v79.14c.09 4.42 1.27 8.57 3.29 12.19 2.38 4.3 5.94 7.85 10.22 10.24 3.78 2.09 8.1 3.29 12.71 3.29h116.1c2.65 0 4.97-1.42 6.28-3.52l10.13-17.66 28.32 49.28a7.342 7.342 0 0 0 5.88 3.65h23.86c4.08 0 7.39-3.29 7.39-7.37 0-1.28-.33-2.47-.89-3.51l-44.52-77Zm-54.12 25.97H94.49l20.79-35.18 9.68-16.52 14.32 25.73-14.63 25.97Z"
        fill="currentColor"
      />
    </svg>
  );
}
