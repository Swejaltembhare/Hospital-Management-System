import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({
  title = 'Metric',
  value = 0,
  icon: Icon,
  color = 'teal',
  trend = 0,
  trendDirection = 'neutral',
}) => {
  const colorClasses = {
    teal: 'bg-teal-50 text-teal-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    orange: 'bg-orange-50 text-orange-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  const TrendIcon =
    trendDirection === 'up'
      ? TrendingUp
      : trendDirection === 'down'
      ? TrendingDown
      : Minus;

  const iconBgColor = colorClasses[color] || colorClasses.teal;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200"
    >
      {/* Metric Content and Icon Display Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>

          {/* Trend Delta Indicator */}
          {trend !== 0 && (
            <div className="flex items-center gap-1 mt-2">
              <TrendIcon size={16} className={trendColors[trendDirection]} />
              <span
                className={`text-sm font-medium ${trendColors[trendDirection]}`}
              >
                {Math.abs(trend)}%
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          )}
        </div>

        {/* Metric Icon Container */}
        {Icon && (
          <div className={`p-3 rounded-xl ${iconBgColor}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;