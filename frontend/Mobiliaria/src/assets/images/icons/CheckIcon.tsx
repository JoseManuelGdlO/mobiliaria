import React from "react";
import Svg, { Circle, G, Path } from "react-native-svg";

const CheckIcon = (): JSX.Element => {
  return (
    <Svg xmlns="http://www.w3.org/2000/svg" width={24} height={24}>
    <G transform="translate(0 -1028.362)">
      <Circle cx={12} cy={1040.362} r={12} fill="#50b748" />
      <Path
        style={{
          lineHeight: "normal",
          textIndent: 0,
          textAlign: "start",
          textDecorationLine: "none",
          textTransform: "none",
          blockProgression: "tb"
        }}
        fill="#10a711"
        d="M14.525 23.717a12 12 0 00.686-.154 12 12 0 001.137-.38 12 12 0 001.095-.488 12 12 0 001.041-.597 12 12 0 00.975-.698 12 12 0 00.902-.793 12 12 0 00.817-.877 12 12 0 00.726-.955 12 12 0 00.627-1.021 12 12 0 00.522-1.08 12 12 0 00.412-1.127 12 12 0 00.26-1.016l-7.13-7.129a6.473 6.473 0 00-4.593-1.906 6.482 6.482 0 00-4.598 1.906 6.494 6.494 0 000 9.194l7.121 7.12z"
        color="#000"
        fontFamily="sans-serif"
        fontWeight={400}
        transform="translate(0 1028.362)"
      />
      <Path
        style={{
          lineHeight: "normal",
          textIndent: 0,
          textAlign: "start",
          textDecorationLine: "none",
          textTransform: "none",
          blockProgression: "tb"
        }}
        fill="#fff"
        d="M8.504 2c1.662 0 3.324.635 4.596 1.906a6.494 6.494 0 010 9.194 6.494 6.494 0 01-9.194 0 6.494 6.494 0 010-9.194A6.482 6.482 0 018.504 2zm2.96 4.502a.503.503 0 00-.26.103L7.55 9.345 5.857 7.653c-.367-.382-1.09.34-.707.707l2 2a.517.517 0 00.653.047l4-3c.336-.245.129-.898-.287-.904a.5.5 0 00-.051 0z"
        color="#000"
        fontFamily="sans-serif"
        fontWeight={400}
        overflow="visible"
        transform="translate(3.497 1031.859)"
      />
    </G>
  </Svg>
  );
};

export default CheckIcon;
