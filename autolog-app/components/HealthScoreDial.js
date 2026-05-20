/**
 * Vehicle Health Score — smooth semi-circular gauge (SVG).
 * Gradient arc fills left → right across the top, with the score in the center.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Platform } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../theme';

// On web, react-native-web's animated wrapper leaks `collapsable` onto the SVG
// DOM node (a noisy dev warning). Use the static primitive there (rendered at
// its resting value, no entrance animation); native keeps the animated version.
const isWeb = Platform.OS === 'web';
const AnimatedPath = isWeb ? Path : Animated.createAnimatedComponent(Path);
const AnimatedCircle = isWeb ? Circle : Animated.createAnimatedComponent(Circle);

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

const polarToCartesian = (cx, cy, r, angleDeg) => {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
};

// Arc from startAngle to endAngle, sweeping over the top. Angles: -90 = left, 0 = top, 90 = right.
// sweep-flag 0 keeps the arc in the upper half (the visible region of the gauge).
const describeArc = (cx, cy, r, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
};

const Gauge = ({ score, size, strokeWidth, gid }) => {
  const color = getScoreColor(score);
  const frac = Math.min(Math.max(score / 100, 0), 1);
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;
  const height = size / 2 + strokeWidth;

  const arcLen = Math.PI * r; // semicircle length
  const reveal = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    reveal.setValue(0);
    Animated.timing(reveal, { toValue: 1, duration: 800, useNativeDriver: false }).start();
  }, [score]); // eslint-disable-line react-hooks/exhaustive-deps
  const dashOffset = reveal.interpolate({ inputRange: [0, 1], outputRange: [arcLen, arcLen * (1 - frac)] });

  const trackPath = describeArc(cx, cy, r, -90, 90);

  return (
    <Svg width={size} height={height}>
      <Defs>
        <LinearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={color} stopOpacity={0.65} />
          <Stop offset="1" stopColor={color} stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Path d={trackPath} stroke={Colors.surface1} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
      <AnimatedPath
        d={trackPath}
        stroke={`url(#${gid})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={arcLen}
        strokeDashoffset={isWeb ? arcLen * (1 - frac) : dashOffset}
      />
    </Svg>
  );
};

export default function HealthScoreDial({ score = 0, size = 120 }) {
  const color = getScoreColor(score);
  const strokeWidth = Math.max(Math.round(size * 0.07), 6);
  // Per-instance gradient id — size-based ids collide when two dials share a size.
  const gid = useRef('hsd_' + Math.random().toString(36).slice(2, 8)).current;

  return (
    <View style={{ width: size, alignItems: 'center' }}>
      <Gauge score={score} size={size} strokeWidth={strokeWidth} gid={gid} />
      <View style={{ position: 'absolute', top: size * 0.18, left: 0, right: 0, alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: Math.round(size * 0.3), color, lineHeight: Math.round(size * 0.34) }}>
          {Math.round(score)}
        </Text>
        {size >= 80 && (
          <Text style={{ fontFamily: 'Nunito_500Medium', fontSize: Math.round(size * 0.1), color: Colors.textSecondary, marginTop: -2 }}>
            {getScoreLabel(score)}
          </Text>
        )}
      </View>
    </View>
  );
}

// Compact full-ring gauge — reads far better than a semicircle at small sizes.
export function HealthScoreDialSmall({ score = 0 }) {
  const color = getScoreColor(score);
  const size = 44;
  const strokeWidth = 4;
  const frac = Math.min(Math.max(score / 100, 0), 1);
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;

  const reveal = useRef(new Animated.Value(0)).current;
  // Per-instance gradient id — garage shows several small dials at once, so a
  // shared id would make them all use the last-rendered gradient color.
  const gid = useRef('hsdSmall' + Math.random().toString(36).slice(2, 8)).current;
  useEffect(() => {
    reveal.setValue(0);
    Animated.timing(reveal, { toValue: 1, duration: 700, useNativeDriver: false }).start();
  }, [score]); // eslint-disable-line react-hooks/exhaustive-deps
  const dashOffset = reveal.interpolate({ inputRange: [0, 1], outputRange: [circ, circ * (1 - frac)] });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.65} />
            <Stop offset="1" stopColor={color} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Circle cx={cx} cy={cy} r={r} stroke={Colors.surface3} strokeWidth={strokeWidth} fill="none" opacity={0.6} />
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={r}
          stroke={`url(#${gid})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={isWeb ? circ * (1 - frac) : dashOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color, lineHeight: 16 }}>
          {Math.round(score)}
        </Text>
      </View>
    </View>
  );
}

export function HealthScoreDialLarge({ score = 0 }) {
  return <HealthScoreDial score={score} size={160} />;
}
