// src/components/admin/LoadingSkeleton.jsx
import React from 'react';
import ContentLoader from 'react-content-loader';

const LoadingSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Skeleton */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 sm:p-8">
        <ContentLoader
          speed={2}
          width="100%"
          height={100}
          backgroundColor="#1e3a8a"
          foregroundColor="#2563eb"
        >
          <rect x="0" y="0" rx="4" ry="4" width="200" height="24" />
          <rect x="0" y="32" rx="4" ry="4" width="300" height="16" />
          <rect x="0" y="56" rx="4" ry="4" width="150" height="14" />
        </ContentLoader>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <ContentLoader
              speed={2}
              width="100%"
              height={80}
              backgroundColor="#f3f4f6"
              foregroundColor="#e5e7eb"
            >
              <rect x="0" y="0" rx="4" ry="4" width="100" height="16" />
              <rect x="0" y="24" rx="4" ry="4" width="80" height="24" />
              <rect x="0" y="56" rx="4" ry="4" width="120" height="14" />
            </ContentLoader>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <ContentLoader
              speed={2}
              width="100%"
              height={250}
              backgroundColor="#f3f4f6"
              foregroundColor="#e5e7eb"
            >
              <rect x="0" y="0" rx="4" ry="4" width="150" height="20" />
              <rect x="0" y="30" rx="4" ry="4" width="100%" height="200" />
            </ContentLoader>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <ContentLoader
          speed={2}
          width="100%"
          height={400}
          backgroundColor="#f3f4f6"
          foregroundColor="#e5e7eb"
        >
          <rect x="0" y="0" rx="4" ry="4" width="200" height="24" />
          <rect x="0" y="40" rx="4" ry="4" width="100%" height="300" />
        </ContentLoader>
      </div>
    </div>
  );
};

export default LoadingSkeleton;