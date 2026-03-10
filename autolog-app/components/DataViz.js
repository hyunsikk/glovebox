import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

const CHART_COLORS = ['#2563EB', '#059669', '#D97706', '#DC2626', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

/**
 * Donut Chart — cost breakdown by category
 * Uses concentric arc segments via rotated half-circles
 */
export const DonutChart = ({ segments, size = 180, strokeWidth = 24, centerLabel, centerValue }) => {
  // Build segments as colored arcs
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  
  if (total === 0) {
    return (
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[Typography.caption, { color: Colors.textTertiary }]}>no data</Text>
      </View>
    );
  }

  let accumulated = 0;
  const arcs = segments.filter(s => s.value > 0).map((seg, i) => {
    const pct = seg.value / total;
    const rotation = accumulated * 360;
    accumulated += pct;
    return { ...seg, pct, rotation, color: seg.color || CHART_COLORS[i % CHART_COLORS.length] };
  });

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size, position: 'relative' }}>
        {/* Background ring */}
        <View style={{
          position: 'absolute', width: size, height: size, borderRadius: size / 2,
          borderWidth: strokeWidth, borderColor: Colors.surface3 || Colors.glassBorder,
        }} />
        
        {/* Colored segments using border trick */}
        {arcs.map((arc, i) => (
          <View
            key={i}
            style={{
              position: 'absolute', width: size, height: size, borderRadius: size / 2,
              borderWidth: strokeWidth, borderColor: 'transparent',
              borderTopColor: arc.color,
              borderRightColor: arc.pct > 0.25 ? arc.color : 'transparent',
              borderBottomColor: arc.pct > 0.5 ? arc.color : 'transparent',
              borderLeftColor: arc.pct > 0.75 ? arc.color : 'transparent',
              transform: [{ rotate: `${arc.rotation - 90}deg` }],
            }}
          />
        ))}
        
        {/* Center content */}
        <View style={{
          position: 'absolute', top: strokeWidth, left: strokeWidth, right: strokeWidth, bottom: strokeWidth,
          borderRadius: (size - strokeWidth * 2) / 2, backgroundColor: Colors.background,
          justifyContent: 'center', alignItems: 'center',
        }}>
          {centerValue && <Text style={[Typography.h1, { color: Colors.textPrimary }]}>{centerValue}</Text>}
          {centerLabel && <Text style={[Typography.small, { color: Colors.textSecondary }]}>{centerLabel}</Text>}
        </View>
      </View>
      
      {/* Legend */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: Spacing.md, gap: Spacing.sm }}>
        {arcs.map((arc, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginRight: Spacing.md }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: arc.color, marginRight: 4 }} />
            <Text style={[Typography.small, { color: Colors.textSecondary }]}>
              {arc.label} ({(arc.pct * 100).toFixed(0)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

/**
 * Horizontal Bar Chart — compare values side by side
 */
export const HorizontalBarChart = ({ data, formatValue, maxBarWidth }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barWidth = maxBarWidth || Dimensions.get('window').width - 140;

  return (
    <View>
      {data.map((item, i) => (
        <View key={i} style={{ marginBottom: Spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={[Typography.caption, { color: Colors.textPrimary }]}>{item.label}</Text>
            <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
              {formatValue ? formatValue(item.value) : item.value}
            </Text>
          </View>
          <View style={{ height: 20, backgroundColor: Colors.surface3 || Colors.glassBorder, borderRadius: 10, overflow: 'hidden' }}>
            <View style={{
              height: 20, borderRadius: 10,
              backgroundColor: item.color || CHART_COLORS[i % CHART_COLORS.length],
              width: `${(item.value / maxVal) * 100}%`,
              minWidth: item.value > 0 ? 8 : 0,
            }} />
          </View>
        </View>
      ))}
    </View>
  );
};

/**
 * Sparkline — tiny trend line for inline use
 */
export const Sparkline = ({ data, width = 120, height = 40, color = Colors.primary, showDots = false }) => {
  if (!data || data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  
  const points = data.map((val, i) => ({
    x: i * stepX,
    y: height - ((val - min) / range) * (height - 8) - 4,
  }));
  
  return (
    <View style={{ width, height, position: 'relative' }}>
      {/* Line segments */}
      {points.slice(0, -1).map((p, i) => {
        const next = points[i + 1];
        const dx = next.x - p.x;
        const dy = next.y - p.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: length,
              height: 2,
              backgroundColor: color,
              borderRadius: 1,
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: '0 0',
            }}
          />
        );
      })}
      {/* Endpoint dot */}
      {showDots && (
        <View style={{
          position: 'absolute',
          left: points[points.length - 1].x - 3,
          top: points[points.length - 1].y - 3,
          width: 6, height: 6, borderRadius: 3,
          backgroundColor: color,
        }} />
      )}
    </View>
  );
};

/**
 * Stat Trend Card — value with sparkline and trend indicator
 */
export const StatTrendCard = ({ title, value, trend, trendLabel, sparkData, color = Colors.primary, icon }) => {
  const trendColor = trend > 0 ? Colors.danger : trend < 0 ? Colors.success : Colors.textTertiary;
  const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';
  
  return (
    <View style={{
      backgroundColor: Colors.glassBackground,
      borderRadius: 16, padding: Spacing.lg,
      borderWidth: 1, borderColor: Colors.glassBorder,
      flex: 1, marginRight: Spacing.sm,
    }}>
      <Text style={[Typography.small, { color: Colors.textSecondary, marginBottom: 4 }]}>{title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Text style={[Typography.h1, { color: Colors.textPrimary }]}>{value}</Text>
        {sparkData && <Sparkline data={sparkData} width={60} height={24} color={color} showDots />}
      </View>
      {trend !== undefined && trend !== null && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Text style={{ fontSize: 12, color: trendColor, fontFamily: 'Nunito_600SemiBold' }}>
            {trendIcon} {Math.abs(trend).toFixed(1)}%
          </Text>
          {trendLabel && (
            <Text style={[Typography.small, { color: Colors.textTertiary, marginLeft: 4 }]}>{trendLabel}</Text>
          )}
        </View>
      )}
    </View>
  );
};

/**
 * Progress Ring — simple circular progress (e.g. health score)
 */
export const ProgressRing = ({ progress, size = 80, strokeWidth = 8, color = Colors.primary, label }) => {
  const pct = Math.min(Math.max(progress, 0), 100);
  
  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {/* Background ring */}
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth, borderColor: Colors.surface3 || Colors.glassBorder,
      }} />
      {/* Progress arc */}
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth, borderColor: 'transparent',
        borderTopColor: color,
        borderRightColor: pct > 25 ? color : 'transparent',
        borderBottomColor: pct > 50 ? color : 'transparent',
        borderLeftColor: pct > 75 ? color : 'transparent',
        transform: [{ rotate: '-90deg' }],
      }} />
      {/* Center */}
      <View style={{
        position: 'absolute', top: strokeWidth, left: strokeWidth, right: strokeWidth, bottom: strokeWidth,
        borderRadius: (size - strokeWidth * 2) / 2,
        justifyContent: 'center', alignItems: 'center',
      }}>
        <Text style={{ fontSize: size * 0.22, fontFamily: 'Nunito_700Bold', color: Colors.textPrimary }}>
          {Math.round(pct)}
        </Text>
        {label && <Text style={{ fontSize: 9, color: Colors.textTertiary }}>{label}</Text>}
      </View>
    </View>
  );
};

/**
 * Calendar Heatmap — spending by day (GitHub-contributions style)
 */
export const CalendarHeatmap = ({ data, months = 3, colorScale = Colors.primary }) => {
  // data: { [YYYY-MM-DD]: number }
  const today = new Date();
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // start on Sunday
  
  const days = [];
  const d = new Date(startDate);
  while (d <= today) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  
  const values = days.map(day => {
    const key = day.toISOString().slice(0, 10);
    return { date: day, value: data[key] || 0 };
  });
  
  const maxVal = Math.max(...values.map(v => v.value), 1);
  const cellSize = 12;
  const gap = 2;
  
  // Group by weeks
  const weeks = [];
  let currentWeek = [];
  values.forEach((v, i) => {
    currentWeek.push(v);
    if (v.date.getDay() === 6 || i === values.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const getOpacity = (val) => {
    if (val === 0) return 0.08;
    return 0.2 + (val / maxVal) * 0.8;
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', gap }}>
        {weeks.map((week, wi) => (
          <View key={wi} style={{ gap }}>
            {week.map((day, di) => (
              <View
                key={di}
                style={{
                  width: cellSize, height: cellSize, borderRadius: 3,
                  backgroundColor: colorScale,
                  opacity: getOpacity(day.value),
                }}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <Text style={[Typography.small, { color: Colors.textTertiary }]}>less</Text>
        <View style={{ flexDirection: 'row', gap: 2 }}>
          {[0.08, 0.3, 0.5, 0.7, 1].map((op, i) => (
            <View key={i} style={{ width: cellSize, height: cellSize, borderRadius: 3, backgroundColor: colorScale, opacity: op }} />
          ))}
        </View>
        <Text style={[Typography.small, { color: Colors.textTertiary }]}>more</Text>
      </View>
    </View>
  );
};

export default { DonutChart, HorizontalBarChart, Sparkline, StatTrendCard, ProgressRing, CalendarHeatmap };
