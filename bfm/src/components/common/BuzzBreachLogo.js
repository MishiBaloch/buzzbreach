import React from 'react';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { colors } from '../../theme/colors';

// Custom BuzzBreach Logo Component
const BuzzBreachLogo = ({ size = 24, color = colors.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <G>
      {/* Left vertical line of B */}
      <Path
        d="M25 20 L25 80"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      {/* Top curve of B */}
      <Path
        d="M25 20 Q55 20 55 35 Q55 50 25 50"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      {/* Bottom curve of B */}
      <Path
        d="M25 50 Q60 50 60 65 Q60 80 25 80"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      {/* Network connection nodes */}
      <Circle cx="70" cy="25" r="8" fill={color} />
      <Circle cx="78" cy="50" r="6" fill={color} opacity="0.7" />
      <Circle cx="72" cy="75" r="8" fill={color} />
      {/* Connection lines */}
      <Path
        d="M55 35 L70 25"
        stroke={color}
        strokeWidth="3"
        strokeDasharray="4,3"
        opacity="0.6"
      />
      <Path
        d="M60 65 L72 75"
        stroke={color}
        strokeWidth="3"
        strokeDasharray="4,3"
        opacity="0.6"
      />
    </G>
  </Svg>
);

export default BuzzBreachLogo;
