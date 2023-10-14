import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface Props {
  width?: number
  height?: number
  color?: string

}

const BackIcon = ({
  width = 28,
  height = 28,
  color = '#F5F5F5'
}: Props): JSX.Element => (
  <Svg width={width} height={height} viewBox='0 0 28 28' fill='none'>
    <Path d='M12.6327 14L18.4077 19.775L16.758 21.4247L9.33337 14L16.758 6.57532L18.4077 8.22498L12.6327 14Z' fill={color} />
  </Svg>

)

export default BackIcon
