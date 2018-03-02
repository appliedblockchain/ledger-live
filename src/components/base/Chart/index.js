// @flow

/* eslint-disable react/no-multi-comp */

import React, { Fragment, PureComponent } from 'react'
import {
  VictoryChart,
  VictoryArea,
  VictoryAxis,
  VictoryTooltip,
  VictoryVoronoiContainer,
  VictoryLabel,
} from 'victory'

import { radii, space, colors, fontSizes } from 'styles/theme'
import { ff } from 'styles/helpers'

import Box from 'components/base/Box'

const ANIMATION_DURATION = 600
const DEFAULT_PROPS = {
  color: 'blue',
  padding: 0,
}

type Props = {
  height: number,
  render: Function,
}

type State = {
  isAnimationActive: boolean,
  width: number,
}

export class WrapperChart extends PureComponent<Props, State> {
  state = {
    isAnimationActive: true,
    width: 0,
  }

  componentDidMount() {
    this._timeout = setTimeout(
      () =>
        this.setState({
          isAnimationActive: false,
        }),
      ANIMATION_DURATION * 2,
    )

    if (this._node) {
      this._ro = new ResizeObserver(entries => {
        const entry = entries.find(entry => this._node === entry.target)
        if (entry) {
          this.setState({
            width: entry.contentRect.width,
          })
        }
      })

      this._ro.observe(this._node)
    }
  }

  componentWillUnmount() {
    clearTimeout(this._timeout)

    if (this._ro) {
      this._ro.disconnect()
    }
  }

  _ro = undefined
  _node = undefined
  _timeout = undefined

  render() {
    const { render, height } = this.props
    const { isAnimationActive, width } = this.state
    return (
      <Box ff="Open Sans" innerRef={n => (this._node = n)} style={{ height }}>
        {render({ isAnimationActive, height, width })}
      </Box>
    )
  }
}

function getLinearGradient({
  linearGradient,
  id,
  color,
}: {
  linearGradient: LinearGradient,
  id: string,
  color: string,
}) {
  return linearGradient.length > 0 ? (
    <svg style={{ height: 0 }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="100%">
          {linearGradient.map((g, i) => (
            <stop
              key={i} // eslint-disable-line react/no-array-index-key
              offset={`${g[0]}%`}
              stopColor={color}
              stopOpacity={g[1]}
            />
          ))}
        </linearGradient>
      </defs>
    </svg>
  ) : null
}

type LinearGradient = Array<Array<*>>

type GenericChart = {
  id: string,
  linearGradient: LinearGradient,
  strokeWidth: number,
  height: number,
  padding: Object | number,
  color: string,
  data: Array<Object>,
}
type Chart = GenericChart & {
  renderLabels: Function,
  renderTickX: Function,
  renderTickY: Function,
}

export const SimpleAreaChart = ({
  linearGradient,
  height,
  data,
  strokeWidth,
  id,
  padding,
  color,
}: GenericChart) => (
  <WrapperChart
    height={height}
    render={({ width }) => (
      <Fragment>
        {getLinearGradient({
          linearGradient,
          id,
          color,
        })}
        <VictoryArea
          domainPadding={{
            y: [0, space[1]],
          }}
          data={data}
          x="name"
          y="value"
          style={{
            data: {
              stroke: color,
              fill: `url(#${id})`,
              strokeWidth,
            },
          }}
          padding={padding}
          height={height}
          width={width}
        />
      </Fragment>
    )}
  />
)

SimpleAreaChart.defaultProps = {
  height: 50,
  id: 'simple-chart',
  linearGradient: [],
  strokeWidth: 1,
  ...DEFAULT_PROPS,
}

const areaChartTooltip = ({ renderLabels }: { renderLabels: Function }) => (
  <VictoryTooltip
    corderRadius={radii[1]}
    pointerLength={0}
    height={25}
    labelComponent={
      <VictoryLabel
        style={{
          ...ff('Open Sans|SemiBold'),
          fontSize: fontSizes[2],
          fill: colors.white,
        }}
      />
    }
    flyoutStyle={{
      fill: colors.dark,
      stroke: null,
    }}
    width={a => space[2] * 2 + renderLabels(a).length * 5.2} // Approximatif size of char for calculate Tooltip witdh
  />
)

const AreaChartContainer = <VictoryVoronoiContainer voronoiDimension="x" />

export class AreaChart extends PureComponent<Chart> {
  static defaultProps = {
    height: 100,
    id: 'chart',
    linearGradient: [[5, 0.2], [50, 0]],
    strokeWidth: 2,
    renderLabels: (d: Object) => d.y,
    renderTickX: (t: any) => t,
    renderTickY: (t: any) => t,
    ...DEFAULT_PROPS,
  }

  render() {
    const {
      color,
      data,
      height,
      id,
      linearGradient,
      padding,
      renderLabels,
      renderTickX,
      renderTickY,
      strokeWidth,
    } = this.props

    const tickLabelsStyle = {
      fill: colors.grey,
      fontSize: fontSizes[4],
      fontFamily: 'inherit',
      fontWeight: 'inherit',
    }

    return (
      <WrapperChart
        height={height}
        render={({ width, isAnimationActive }) => (
          <Fragment>
            {getLinearGradient({
              linearGradient,
              id,
              color,
            })}
            <VictoryChart
              height={height}
              width={width}
              padding={padding}
              domainPadding={{
                y: [0, space[1]],
              }}
              containerComponent={AreaChartContainer}
            >
              <VictoryAxis
                tickCount={6}
                tickFormat={renderTickX}
                style={{
                  axis: {
                    stroke: colors.lightGrey,
                  },
                  tickLabels: {
                    ...tickLabelsStyle,
                    padding: space[2],
                  },
                }}
              />
              <VictoryAxis
                dependentAxis
                tickCount={4}
                tickFormat={renderTickY}
                style={{
                  grid: {
                    stroke: colors.lightGrey,
                    strokeDasharray: 5,
                  },
                  axis: {
                    stroke: null,
                  },
                  tickLabels: {
                    ...tickLabelsStyle,
                    padding: space[4],
                  },
                }}
              />
              <VictoryArea
                animate={isAnimationActive ? { duration: ANIMATION_DURATION } : null}
                data={data}
                x="name"
                y="value"
                labelComponent={areaChartTooltip({
                  renderLabels,
                })}
                labels={renderLabels}
                style={{
                  data: {
                    stroke: color,
                    fill: `url(#${id})`,
                    strokeWidth,
                  },
                }}
                width={width}
              />
            </VictoryChart>
          </Fragment>
        )}
      />
    )
  }
}
