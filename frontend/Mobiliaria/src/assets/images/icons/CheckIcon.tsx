import React from "react";
import Svg, { Circle, G, Path } from "react-native-svg";

const CheckIcon = (): JSX.Element => {
  return (
    <Svg
      fill="#1a6b0f"
      height={35}
      width={35}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 490.05 490.05"
      xmlSpace="preserve"
      stroke="#1a6b0f"
    >
      <Path d="M418.275 418.275c95.7-95.7 95.7-250.8 0-346.5s-250.8-95.7-346.5 0-95.7 250.8 0 346.5 250.9 95.7 346.5 0zm-261.1-210.7l55.1 55.1 120.7-120.6 42.7 42.7-120.6 120.6-42.8 42.7-42.7-42.7-55.1-55.1 42.7-42.7z" />
    </Svg>
  );
};

export default CheckIcon;
