import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, Platform } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Line, Rect, G } from 'react-native-svg';
import { Colors, Typography, Spacing } from '../theme';

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

// On web, react-native-web's animated wrapper leaks `collapsable` onto the SVG
// DOM node (a noisy dev warning). Use static primitives there (rendered at the
// resting value, no entrance animation); native keeps the animated version.
const isWeb = Platform.OS === 'web';
const AnimatedCircle = isWeb ? Circle : Animated.createAnimatedComponent(Circle);
const AnimatedPath = isWeb ? Path : Animated.createAnimatedComponent(Path);

// ---- geometry helpers -------------------------------------------------------

// 0° at top, sweeping clockwise.
const polarToCartesian = (cx, cy, r, angleDeg) => {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
};

// Stroke arc path following the centerline from startAngle to endAngle.
const arcPath = (cx, cy, r, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
};

// Catmull-Rom → cubic bezier, for smooth lines through points.
const smoothPath = (pts) => {
  if (pts.length < 2) return '';
  if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
};

const polylineLength = (pts) => {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return len || 1;
};

// Mount-time reveal value (0 → 1). Drives entrance animations.
const useReveal = (deps = [], duration = 650) => {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    v.setValue(0);
    Animated.timing(v, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    }).start();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return v;
};

// ---- DonutChart -------------------------------------------------------------

/**
 * Donut chart — accurate arc segments via SVG paths (replaces the old
 * border-quadrant trick that quantised every segment to 25% steps).
 */
export const DonutChart = ({ segments, size = 180, strokeWidth = 22, centerLabel, centerValue }) => {
  const reveal = useReveal([JSON.stringify(segments?.map(s => s.value))]);
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;
  const total = (segments || []).reduce((sum, s) => sum + (s.value || 0), 0);

  if (total === 0) {
    return (
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[Typography.caption, { color: Colors.textTertiary }]}>no data</Text>
      </View>
    );
  }

  const GAP = segments.filter(s => s.value > 0).length > 1 ? 3 : 0; // degrees between segments
  let cursor = 0;
  const arcs = segments
    .filter(s => s.value > 0)
    .map((seg, i) => {
      const pct = seg.value / total;
      const startAngle = cursor + GAP / 2;
      const endAngle = cursor + pct * 360 - GAP / 2;
      cursor += pct * 360;
      return {
        ...seg,
        pct,
        startAngle,
        endAngle: Math.max(endAngle, startAngle + 0.5),
        color: seg.color || CHART_COLORS[i % CHART_COLORS.length],
      };
    });

  const scale = reveal.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });

  return (
    <View style={{ alignItems: 'center' }}>
      <Animated.View style={{ width: size, height: size, opacity: reveal, transform: [{ scale }] }}>
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cy} r={r} stroke={Colors.surface3} strokeWidth={strokeWidth} fill="none" opacity={0.5} />
          {arcs.length === 1 && arcs[0].pct > 0.999 ? (
            <Circle cx={cx} cy={cy} r={r} stroke={arcs[0].color} strokeWidth={strokeWidth} fill="none" />
          ) : (
            arcs.map((arc, i) => (
              <Path
                key={i}
                d={arcPath(cx, cy, r, arc.startAngle, arc.endAngle)}
                stroke={arc.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
              />
            ))
          )}
        </Svg>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
          {centerValue != null && <Text style={[Typography.h1, { color: Colors.textPrimary }]}>{centerValue}</Text>}
          {centerLabel && <Text style={[Typography.small, { color: Colors.textSecondary }]}>{centerLabel}</Text>}
        </View>
      </Animated.View>

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

// ---- HorizontalBarChart -----------------------------------------------------

/**
 * Horizontal bars with gradient fill and a width-grow entrance animation.
 */
export const HorizontalBarChart = ({ data, formatValue, maxBarWidth }) => {
  const reveal = useReveal([JSON.stringify(data?.map(d => d.value))]);
  const uid = useRef('bar' + Math.random().toString(36).slice(2, 8)).current;
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barTrack = maxBarWidth || Dimensions.get('window').width - 140;

  return (
    <View>
      {data.map((item, i) => {
        const color = item.color || CHART_COLORS[i % CHART_COLORS.length];
        const target = (item.value / maxVal) * barTrack;
        const w = reveal.interpolate({ inputRange: [0, 1], outputRange: [0, Math.max(target, item.value > 0 ? 6 : 0)] });
        return (
          <View key={i} style={{ marginBottom: Spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={[Typography.caption, { color: Colors.textPrimary }]}>{item.label}</Text>
              <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                {formatValue ? formatValue(item.value) : item.value}
              </Text>
            </View>
            <View style={{ height: 18, backgroundColor: Colors.surface3, borderRadius: 9, overflow: 'hidden' }}>
              <Animated.View style={{ width: w, height: 18 }}>
                <Svg width="100%" height={18}>
                  <Defs>
                    <LinearGradient id={`${uid}_${i}`} x1="0" y1="0" x2="1" y2="0">
                      <Stop offset="0" stopColor={color} stopOpacity={0.7} />
                      <Stop offset="1" stopColor={color} stopOpacity={1} />
                    </LinearGradient>
                  </Defs>
                  <Rect x="0" y="0" width="100%" height="18" rx="9" fill={`url(#${uid}_${i})`} />
                </Svg>
              </Animated.View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

// ---- Sparkline --------------------------------------------------------------

/**
 * Smooth sparkline with optional gradient area fill.
 */
export const Sparkline = ({ data, width = 120, height = 40, color = Colors.primary, showDots = false, fill = true }) => {
  const gid = useRef('spark' + Math.random().toString(36).slice(2, 8)).current;
  if (!data || data.length < 2) return null;
  const pad = 4;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = (width - pad * 2) / (data.length - 1);
  const pts = data.map((val, i) => ({
    x: pad + i * stepX,
    y: height - pad - ((val - min) / range) * (height - pad * 2),
  }));
  const line = smoothPath(pts);
  const area = `${line} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;

  return (
    <Svg width={width} height={height}>
      {fill && (
        <>
          <Defs>
            <LinearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity={0.28} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={area} fill={`url(#${gid})`} />
        </>
      )}
      <Path d={line} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {showDots && <Circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={3} fill={color} />}
    </Svg>
  );
};

// ---- LineChart (new) --------------------------------------------------------

/**
 * Full trend chart: gridlines, smooth gradient area, animated line reveal,
 * value dots, and x-axis labels. data: [{ label, value }].
 */
export const LineChart = ({ data, height = 170, color = Colors.primary, formatValue, showArea = true }) => {
  const [width, setWidth] = useState(Dimensions.get('window').width - 80);
  const reveal = useReveal([JSON.stringify(data?.map(d => d.value)), width]);
  // Per-instance gradient id — multiple LineCharts share an SVG surface, so a
  // hardcoded id makes them all pick up the last-rendered gradient.
  const gradId = useRef('lineArea_' + Math.random().toString(36).slice(2, 8)).current;

  if (!data || data.length < 2) {
    return (
      <View style={{ height, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[Typography.caption, { color: Colors.textTertiary }]}>not enough data yet</Text>
      </View>
    );
  }

  const padX = 8;
  const padTop = 12;
  const padBottom = 22;
  const values = data.map(d => d.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;
  const stepX = (width - padX * 2) / (data.length - 1);
  const yOf = (v) => padTop + (1 - (v - min) / range) * (height - padTop - padBottom);
  const pts = data.map((d, i) => ({ x: padX + i * stepX, y: yOf(d.value), value: d.value, label: d.label }));

  const line = smoothPath(pts);
  const area = `${line} L ${pts[pts.length - 1].x} ${height - padBottom} L ${pts[0].x} ${height - padBottom} Z`;
  const len = polylineLength(pts);
  const dashOffset = reveal.interpolate({ inputRange: [0, 1], outputRange: [len, 0] });
  const gridYs = [0.5, 1].map(f => padTop + f * (height - padTop - padBottom));

  return (
    <View
      style={{ width: '100%' }}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w && Math.abs(w - width) > 1) setWidth(w);
      }}
    >
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.25} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        {gridYs.map((gy, i) => (
          <Line key={i} x1={padX} y1={gy} x2={width - padX} y2={gy} stroke={Colors.glassBorder} strokeWidth={1} />
        ))}
        {showArea && <AnimatedPath d={area} fill={`url(#${gradId})`} opacity={isWeb ? 1 : reveal} />}
        <AnimatedPath
          d={line}
          stroke={color}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={len}
          strokeDashoffset={isWeb ? 0 : dashOffset}
        />
        {pts.map((p, i) => (
          <AnimatedCircle key={i} cx={p.x} cy={p.y} r={3} fill={Colors.background} stroke={color} strokeWidth={2} opacity={isWeb ? 1 : reveal} />
        ))}
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: -padBottom + 4, paddingHorizontal: padX }}>
        {data.map((d, i) => (
          <Text key={i} style={[Typography.small, { color: Colors.textTertiary, fontSize: 9 }]} numberOfLines={1}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

// ---- StatTrendCard ----------------------------------------------------------

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
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <Text style={[Typography.h1, { color: Colors.textPrimary }]}>{value}</Text>
        {sparkData && <Sparkline data={sparkData} width={64} height={28} color={color} showDots />}
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

// ---- ProgressRing -----------------------------------------------------------

/**
 * Circular progress with gradient stroke and an animated sweep reveal.
 */
export const ProgressRing = ({ progress, size = 80, strokeWidth = 8, color = Colors.primary, label }) => {
  const pct = Math.min(Math.max(progress, 0), 100) / 100;
  const reveal = useReveal([progress]);
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = reveal.interpolate({ inputRange: [0, 1], outputRange: [circ, circ * (1 - pct)] });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={r} stroke={Colors.surface3} strokeWidth={strokeWidth} fill="none" opacity={0.5} />
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={isWeb ? circ * (1 - pct) : offset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: size * 0.22, fontFamily: 'Nunito_700Bold', color: Colors.textPrimary }}>
          {Math.round(pct * 100)}
        </Text>
        {label && <Text style={{ fontSize: 9, color: Colors.textTertiary }}>{label}</Text>}
      </View>
    </View>
  );
};

// ---- CalendarHeatmap --------------------------------------------------------

export const CalendarHeatmap = ({ data, months = 3, colorScale = Colors.primary }) => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setDate(startDate.getDate() - startDate.getDay());

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

  const weeks = [];
  let currentWeek = [];
  values.forEach((v, i) => {
    currentWeek.push(v);
    if (v.date.getDay() === 6 || i === values.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const getOpacity = (val) => (val === 0 ? 0.08 : 0.2 + (val / maxVal) * 0.8);

  return (
    <View>
      <View style={{ flexDirection: 'row', gap }}>
        {weeks.map((week, wi) => (
          <View key={wi} style={{ gap }}>
            {week.map((day, di) => (
              <View key={di} style={{ width: cellSize, height: cellSize, borderRadius: 3, backgroundColor: colorScale, opacity: getOpacity(day.value) }} />
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

export default { DonutChart, HorizontalBarChart, Sparkline, LineChart, StatTrendCard, ProgressRing, CalendarHeatmap };
