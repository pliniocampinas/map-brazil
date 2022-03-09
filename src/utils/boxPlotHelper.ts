/* eslint-disable  @typescript-eslint/no-explicit-any */
import {
  map,
  range,
  bin,
  min,
  max,
  quantile,
  axisBottom,
  axisLeft,
  interpolateRound,
  scaleLinear,
  create
} from "d3";

interface BoxPlotOptions {
  x?: (x: any) => number, // given d in data, returns the (quantitative) x-value
  y?: (y: any) => number, // given d in data, returns the (quantitative) y-value
  width?: number, // outer width, in pixels
  height?: number, // outer height, in pixels
  marginTop?: number, // top margin, in pixels
  marginRight?: number, // right margin, in pixels
  marginBottom?: number, // bottom margin, in pixels
  marginLeft?: number, // left margin, in pixels
  inset?: number, // left and right inset
  insetLeft?: number, // inset for left edge of box, in pixels
  insetRight?: number, // inset for right edge of box, in pixels
  xType?: any, // type of x-scale
  xDomain?: number[], // [xmin, xmax]
  xRange?: number[], // [left, right]
  yType?: any, // type of y-scale
  yDomain?: number[], // [ymin, ymax]
  yRange?: number[], // [bottom, top]
  thresholds?: number, // approximative number of thresholds
  stroke?: string, // stroke color of whiskers, median, outliers
  fill?: string, // fill color of boxes
  jitter?: number, // amount of random jitter for outlier dots, in pixels
  xFormat?: string, // a format specifier string for the x-axis
  yFormat?: string, // a format specifier string for the y-axis
  xLabel?: string, // a label for the x-axis
  yLabel?: string // a label for the y-axis
}
// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/box-plot
export function BoxPlot(data: any[], {
  x = ([x]) => x, // given d in data, returns the (quantitative) x-value
  y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
  width = 640, // outer width, in pixels
  height = 400, // outer height, in pixels
  marginTop = 40, // top margin, in pixels
  marginRight = 30, // right margin, in pixels
  marginBottom = 30, // bottom margin, in pixels
  marginLeft = 40, // left margin, in pixels
  inset = 0.5, // left and right inset
  insetLeft = inset, // inset for left edge of box, in pixels
  insetRight = inset, // inset for right edge of box, in pixels
  xType = scaleLinear, // type of x-scale
  xDomain, // [xmin, xmax]
  xRange = [marginLeft, width - marginRight], // [left, right]
  yType = scaleLinear, // type of y-scale
  yDomain, // [ymin, ymax]
  yRange = [height - marginBottom, marginTop], // [bottom, top]
  thresholds = width / 40, // approximative number of thresholds
  stroke = "currentColor", // stroke color of whiskers, median, outliers
  fill = "#ddd", // fill color of boxes
  jitter = 4, // amount of random jitter for outlier dots, in pixels
  xFormat, // a format specifier string for the x-axis
  yFormat, // a format specifier string for the y-axis
  xLabel = "", // a label for the x-axis
  yLabel = "" // a label for the y-axis
}: BoxPlotOptions = {}) {
  // Compute values.
  const X = map(data, x);
  const Y = map(data, y);

  // Filter undefined values.
  const I = range(X.length).filter((i: any)  => !isNaN(X[i]) && !isNaN(Y[i]));

  // Compute the bins.
  const B = bin()
      .thresholds(thresholds)
      .value((i: any) => X[i])(I)
    .map((bin: any) => {
      const y = (i: number) => Y[i];
      const minValue = min(bin, y) || 0;
      const maxValue = max(bin, y) || 0;
      const q1 = quantile(bin, 0.25, y) || 0;
      const q2 = quantile(bin, 0.50, y) || 0;
      const q3 = quantile(bin, 0.75, y) || 0;
      const iqr = q3 - q1; // interquartile range
      const r0 = Math.max(minValue, q1 - iqr * 1.5);
      const r1 = Math.min(maxValue, q3 + iqr * 1.5);
      bin.quartiles = [q1, q2, q3];
      bin.range = [r0, r1];
      bin.outliers = bin.filter((i: number) => Y[i] < r0 || Y[i] > r1);
      return bin;
    });

  // Compute default domains.
  if (xDomain === undefined) xDomain = [min(B, (d: any) => d.x0), max(B, (d: any) => d.x1)];
  if (yDomain === undefined) yDomain = [min(B, (d: any) => d.range[0]), max(B, (d: any) => d.range[1])];

  // Construct scales and axes.
  const xScale = xType(xDomain, xRange).interpolate(interpolateRound);
  const yScale = yType(yDomain, yRange);
  const xAxis = axisBottom(xScale).ticks(thresholds, xFormat).tickSizeOuter(0);
  const yAxis = axisLeft(yScale).ticks(height / 40, yFormat);

  const svg = create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(yAxis)
      .call((g: any) => g.select(".domain").remove())
      .call((g: any) => g.selectAll(".tick line").clone()
          .attr("x2", width - marginLeft - marginRight)
          .attr("stroke-opacity", 0.1))
      .call((g: any) => g.append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text(yLabel));

  const g = svg.append("g")
    .selectAll("g")
    .data(B)
    .join("g");

  g.append("path")
      .attr("stroke", stroke)
      .attr("d", (d: any) => `
        M${xScale((d.x0 + d.x1) / 2)},${yScale(d.range[1])}
        V${yScale(d.range[0])}
      `);

  g.append("path")
      .attr("fill", fill)
      .attr("d", (d: any) => `
        M${xScale(d.x0) + insetLeft},${yScale(d.quartiles[2])}
        H${xScale(d.x1) - insetRight}
        V${yScale(d.quartiles[0])}
        H${xScale(d.x0) + insetLeft}
        Z
      `);

  g.append("path")
      .attr("stroke", stroke)
      .attr("stroke-width", 2)
      .attr("d", (d: any) => `
        M${xScale(d.x0) + insetLeft},${yScale(d.quartiles[1])}
        H${xScale(d.x1) - insetRight}
      `);

  g.append("g")
      .attr("fill", stroke)
      .attr("fill-opacity", 0.2)
      .attr("stroke", "none")
      .attr("transform", (d: any) => `translate(${xScale((d.x0 + d.x1) / 2)},0)`)
    .selectAll("circle")
    .data((d: any) => d.outliers)
    .join("circle")
      .attr("r", 2)
      .attr("cx", () => (Math.random() - 0.5) * jitter)
      .attr("cy", (i: any) => yScale(Y[i]));

  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(xAxis)
      .call((g: any) => g.append("text")
          .attr("x", width)
          .attr("y", marginBottom - 4)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .text(xLabel));

  return svg.node();
}