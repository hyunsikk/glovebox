/**
 * Vehicle Health Score — Minimal Arc Bar
 * Thin semi-circle that fills with color, large number in center.
 * View-based (no SVG) for web compatibility.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '../theme';

const getScoreColor = (score) => {
  if (score >= 90) return Colors.success;
  if (score >= 70) return Colors.warning;
  return Colors.danger;
};

const getScoreLabel = (score) => {
  if (score >= 95) return 'excellent';
  if (score >= 85) return 'great';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'needs care';
};

/**
 * Semi-circle arc using half-circle clipping.
 * Fills clockwise from left to right across a 180° arc.
 */
const ArcBar = ({ score, width, strokeWidth }) => {
  const color = getScoreColor(score);
  const height = width / 2;
  const fillPercent = Math.min(Math.max(score / 100, 0), 1);
  const fillDegrees = fillPercent * 180;
  const radius = width / 2;

  return (
    <View style={{ width, height: height + strokeWidth, overflow: 'hidden' }}>
      {/* Track (gray semi-circle) */}
      <View style={{
        width,
        height: width,
        borderRadius: radius,
        borderWidth: strokeWidth,
        borderColor: Colors.surface1,
        position: 'absolute',
        top: 0,
      }} />

      {/* Filled arc — left quarter (0-90°) */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: width / 2,
        height: height + strokeWidth,
        overflow: 'hidden',
      }}>
        <View style={{
          width,
          height: width,
          borderRadius: radius,
          borderWidth: strokeWidth,
          borderColor: 'transparent',
          borderLeftColor: fillDegrees > 0 ? color : 'transparent',
          borderBottomColor: fillDegrees > 90 ? color : 'transparent',
          position: 'absolute',
          top: 0,
          left: 0,
          transform: fillDegrees <= 90
            ? [{ rotate: `${fillDegrees}deg` }]
            : [{ rotate: '90deg' }],
        }} />
      </View>

      {/* Filled arc — right quarter (90-180°) */}
      {fillDegrees > 90 && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: width / 2,
          width: width / 2,
          height: height + strokeWidth,
          overflow: 'hidden',
        }}>
          <View style={{
            width,
            height: width,
            borderRadius: radius,
            borderWidth: strokeWidth,
            borderColor: 'transparent',
            borderRightColor: color,
            borderTopColor: fillDegrees >= 180 ? color : 'transparent',
            position: 'absolute',
            top: 0,
            left: -width / 2,
            transform: [{ rotate: `${fillDegrees - 90}deg` }],
          }} />
        </View>
      )}
    </View>
  );
};

/**
 * Simpler approach: use dot segments for the semi-circle arc
 * Looks cleaner and more reliable cross-platform
 */
const DotArc = ({ score, width, strokeWidth }) => {
  const color = getScoreColor(score);
  const totalDots = 30;
  const filledDots = Math.round((score / 100) * totalDots);
  const radius = (width - strokeWidth) / 2;
  const centerX = width / 2;
  const centerY = width / 2;
  const dotSize = Math.max(strokeWidth, 3);

  const dots = [];
  for (let i = 0; i < totalDots; i++) {
    // Semi-circle: 180° to 0° (left to right across the top)
    const angle = (180 - (i / (totalDots - 1)) * 180) * (Math.PI / 180);
    const x = centerX + radius * Math.cos(angle) - dotSize / 2;
    const y = centerY - radius * Math.sin(angle) - dotSize / 2;
    const isFilled = i < filledDots;

    dots.push(
      <View
        key={i}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: isFilled ? color : Colors.surface1,
          opacity: isFilled ? 1 : 0.3,
          // Subtle glow on filled dots
          ...(isFilled ? {
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 2,
          } : {}),
        }}
      />
    );
  }

  return (
    <View style={{ width, height: width / 2 + dotSize }}>
      {dots}
    </View>
  );
};

export default function HealthScoreDial({ score = 0, size = 120 }) {
  const color = getScoreColor(score);
  const strokeWidth = Math.max(Math.round(size * 0.035), 3);

  return (
    <View style={{ width: size, alignItems: 'center' }}>
      {/* Arc */}
      <DotArc score={score} width={size} strokeWidth={strokeWidth} />

      {/* Number + label overlaid in the center-bottom of the arc */}
      <View style={{
        position: 'absolute',
        top: size * 0.12,
        left: 0,
        right: 0,
        alignItems: 'center',
      }}>
        <Text style={{
          fontFamily: 'Nunito_700Bold',
          fontSize: Math.round(size * 0.3),
          color: color,
          lineHeight: Math.round(size * 0.34),
        }}>
          {Math.round(score)}
        </Text>
        {size >= 80 && (
          <Text style={{
            fontFamily: 'Nunito_500Medium',
            fontSize: Math.round(size * 0.1),
            color: Colors.textSecondary,
            marginTop: -2,
          }}>
            {getScoreLabel(score)}
          </Text>
        )}
      </View>
    </View>
  );
}

export function HealthScoreDialSmall({ score = 0 }) {
  const color = getScoreColor(score);

  return (
    <View style={{ width: 48, alignItems: 'center' }}>
      <DotArc score={score} width={48} strokeWidth={2} />
      <View style={{
        position: 'absolute',
        top: 6,
        left: 0,
        right: 0,
        alignItems: 'center',
      }}>
        <Text style={{
          fontFamily: 'Nunito_700Bold',
          fontSize: 15,
          color: color,
          lineHeight: 18,
        }}>
          {Math.round(score)}
        </Text>
      </View>
    </View>
  );
}

export function HealthScoreDialLarge({ score = 0 }) {
  return <HealthScoreDial score={score} size={160} />;
}
