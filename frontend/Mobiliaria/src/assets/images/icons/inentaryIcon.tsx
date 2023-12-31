import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface Props {
    width?: number
    height?: number
    color?: string
    focused?: boolean
}

const InvetaryIcon = ({ width, height, color, focused = false }: Props): JSX.Element => (
    <Svg
        width={width ?? 24}
        height={height ?? 24}
        viewBox='0 0 24 24'
    >
        {
            focused
                ? <Path d="M3 21C2.73478 21 2.48043 20.8946 2.29289 20.7071C2.10536 20.5196 2 20.2652 2 20V4C2 3.73478 2.10536 3.48043 2.29289 3.29289C2.48043 3.10536 2.73478 3 3 3H10.414L12.414 5H20C20.2652 5 20.5196 5.10536 20.7071 5.29289C20.8946 5.48043 21 5.73478 21 6V9H19V7H11.586L9.586 5H4V16.998L5.5 11H22.5L20.19 20.243C20.1358 20.4592 20.011 20.6512 19.8352 20.7883C19.6595 20.9255 19.4429 21 19.22 21H3ZM19.938 13H7.062L5.562 19H18.438L19.938 13Z" fill={color ?? '#A86FFB'} />
                : <Path d="M3 21C2.73478 21 2.48043 20.8946 2.29289 20.7071C2.10536 20.5196 2 20.2652 2 20V4C2 3.73478 2.10536 3.48043 2.29289 3.29289C2.48043 3.10536 2.73478 3 3 3H10.414L12.414 5H20C20.2652 5 20.5196 5.10536 20.7071 5.29289C20.8946 5.48043 21 5.73478 21 6V9H19V7H11.586L9.586 5H4V16.998L5.5 11H22.5L20.19 20.243C20.1358 20.4592 20.011 20.6512 19.8352 20.7883C19.6595 20.9255 19.4429 21 19.22 21H3ZM19.938 13H7.062L5.562 19H18.438L19.938 13Z" fill={color ?? '#828D9E'} />
        }

    </Svg>
)

export default InvetaryIcon

