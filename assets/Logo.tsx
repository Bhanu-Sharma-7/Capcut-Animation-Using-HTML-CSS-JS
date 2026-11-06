import React from 'react';
import Svg, {
  Rect,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';

interface LogoProps {
  size?: number;
  primaryColor?: string;
  accentColor?: string;
  textColor?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 96,
  primaryColor = '#2563EB',
  accentColor = '#38BDF8',
  textColor = '#FFFFFF',
}) => {
  const cellSize = size / 3.4;
  const gap = size / 28;
  const cornerRadius = size / 16;

  // Grid coordinates and sample numbers
  const cells = [
    { row: 0, col: 0, num: '9', fill: 'url(#gradAccent)' },
    { row: 0, col: 1, num: '2', fill: 'url(#gradCard)' },
    { row: 0, col: 2, num: '5', fill: 'url(#gradCard)' },
    { row: 1, col: 0, num: '7', fill: 'url(#gradCard)' },
    { row: 1, col: 1, num: 'S', fill: 'url(#gradPrimary)', highlight: true },
    { row: 1, col: 2, num: '1', fill: 'url(#gradCard)' },
    { row: 2, col: 0, num: '4', fill: 'url(#gradCard)' },
    { row: 2, col: 1, num: '8', fill: 'url(#gradCard)' },
    { row: 2, col: 2, num: '3', fill: 'url(#gradAccent)' },
  ];

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <LinearGradient id="gradPrimary" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#3B82F6" />
          <Stop offset="1" stopColor="#1D4ED8" />
        </LinearGradient>
        <LinearGradient id="gradAccent" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#38BDF8" />
          <Stop offset="1" stopColor="#0284C7" />
        </LinearGradient>
        <LinearGradient id="gradCard" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#1E293B" />
          <Stop offset="1" stopColor="#0F172A" />
        </LinearGradient>
      </Defs>

      {/* Outer subtle shadow / glow frame */}
      <Rect
        x={2}
        y={2}
        width={size - 4}
        height={size - 4}
        rx={cornerRadius * 1.4}
        fill="#090D16"
        stroke={accentColor}
        strokeWidth={1.5}
        opacity={0.85}
      />

      <G transform={`translate(${gap * 1.5}, ${gap * 1.5})`}>
        {cells.map((c, i) => {
          const x = c.col * (cellSize + gap);
          const y = c.row * (cellSize + gap);
          return (
            <G key={`logo-cell-${i}`}>
              <Rect
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                rx={cornerRadius}
                fill={c.fill}
              />
              <SvgText
                x={x + cellSize / 2}
                y={y + cellSize / 1.45}
                fontSize={c.highlight ? cellSize * 0.58 : cellSize * 0.46}
                fontWeight={c.highlight ? '900' : '700'}
                fill={c.highlight ? '#FFFFFF' : textColor}
                textAnchor="middle"
              >
                {c.num}
              </SvgText>
            </G>
          );
        })}
      </G>
    </Svg>
  );
};

export default Logo;

