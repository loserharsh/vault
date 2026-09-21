/**
 * SVG Chart Generators for Hatched Spline Chart & Stacked Bar Chart
 */

/**
 * Calculates a smooth cubic bezier SVG path from coordinate points
 */
function getSmoothSplinePath(points, height = 100, width = 300, padding = 10) {
  if (!points || points.length === 0) return { linePath: "", areaPath: "", coords: [] };

  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const stepX = usableWidth / (points.length - 1);

  // Map to x, y coordinates
  const coords = points.map((val, idx) => {
    const x = padding + idx * stepX;
    // val is 0..100; invert so 100 is near top
    const y = height - padding - (val / 100) * usableHeight;
    return { x, y };
  });

  // Construct smooth cubic bezier line
  let linePath = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = i > 0 ? coords[i - 1] : coords[i];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = i != coords.length - 2 ? coords[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    linePath += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  // Create closed area path down to baseline
  const first = coords[0];
  const last = coords[coords.length - 1];
  const baselineY = height;
  const areaPath = `${linePath} L ${last.x.toFixed(1)} ${baselineY} L ${first.x.toFixed(1)} ${baselineY} Z`;

  return { linePath, areaPath, coords };
}

/**
 * Renders or updates the Spending Spline Chart with diagonal hatch pattern
 */
export function renderSpendingSpline(svgElement, points, highlightIdx = 5) {
  if (!svgElement) return;

  const width = 310;
  const height = 95;
  const { linePath, areaPath, coords } = getSmoothSplinePath(points, height, width, 14);

  // Update SVG content with hatched fill, line, and highlight marker
  svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svgElement.innerHTML = `
    <defs>
      <!-- Diagonal Hatch Pattern for Area Fill -->
      <pattern id="spending-hatch-pattern" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="6" stroke="#121316" stroke-width="1.6" />
      </pattern>
    </defs>

    <!-- Hatched Area Fill -->
    <path class="chart-area-fill" d="${areaPath}" fill="url(#spending-hatch-pattern)" opacity="0.9" />

    <!-- Solid Smooth Top Curve Line -->
    <path class="chart-line-stroke" d="${linePath}" fill="none" stroke="#121316" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Pin Vertical Line from Top to Point -->
    <line x1="${coords[highlightIdx].x}" y1="0" x2="${coords[highlightIdx].x}" y2="${coords[highlightIdx].y}" stroke="#F04E23" stroke-width="2" />

    <!-- Point Marker Circle (White center with coral border) -->
    <circle cx="${coords[highlightIdx].x}" cy="${coords[highlightIdx].y}" r="4.5" fill="#FFFFFF" stroke="#F04E23" stroke-width="2.8" />
  `;

  // Return coordinates of highlight point for badge pill alignment
  const highlightCoord = coords[highlightIdx] || coords[coords.length - 2];
  return { highlightCoord, totalWidth: width, totalHeight: height };
}

/**
 * Renders the interactive Stacked Bar Chart with hatched and multi-color bars
 */
export function renderHatchedBarChart(containerElement, barData, onSelect) {
  if (!containerElement) return;
  containerElement.innerHTML = "";

  const days = barData.days;
  const activeIdx = barData.selectedDayIndex;

  days.forEach((item, index) => {
    const col = document.createElement("div");
    col.className = `chart-bar-column ${index === activeIdx ? "active" : ""}`;
    col.dataset.index = index;

    let barTrackContent = "";

    // Floating Tooltip on active bar
    const tooltipHtml = index === activeIdx
      ? `<div class="bar-tooltip-pill">${item.amount || barData.selectedAmount}</div>`
      : "";

    if (item.isStacked && Array.isArray(item.segments) && item.segments.length > 0) {
      const segmentsHtml = item.segments
        .filter((seg) => seg.height > 0)
        .map((seg) => `<div class="stacked-segment segment-${seg.type}" style="height: ${seg.height}px;"></div>`)
        .join("");

      barTrackContent = `
        <div class="chart-bar-track" style="height: ${item.total || 120}px;">
          ${tooltipHtml}
          ${segmentsHtml}
        </div>
      `;
    } else {
      // Default single hatched bar
      const heightPercent = Math.max(18, item.total || 18);
      barTrackContent = `
        <div class="chart-bar-track" style="height: ${heightPercent}px;">
          ${tooltipHtml}
          <div class="bar-hatch-fill" style="height: 100%;"></div>
        </div>
      `;
    }

    col.innerHTML = `
      ${barTrackContent}
      <span class="bar-day-label">${item.day}</span>
    `;

    // Click handler to select this bar
    col.addEventListener("click", () => {
      if (typeof onSelect === "function") {
        onSelect(item, index);
      }
    });

    containerElement.appendChild(col);
  });
}
