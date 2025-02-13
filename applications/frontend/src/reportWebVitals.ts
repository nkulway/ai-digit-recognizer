// src/reportWebVitals.ts

const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Cast the imported module to any to bypass TypeScript's type checking on its exports.
    import('web-vitals').then((webVitals: any) => {
      webVitals.getCLS(onPerfEntry);
      webVitals.getFID(onPerfEntry);
      webVitals.getFCP(onPerfEntry);
      webVitals.getLCP(onPerfEntry);
      webVitals.getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
