export const getBridgePath = (r, rotation = 0, smoothing = 0.6) => {
  const s = Math.max(0, Math.min(1, smoothing));
  const k1 = 0.45 + 0.5 * s; // 0.45 .. 0.95
  const k2 = 0.05 + 0.25 * s; // 0.05 .. 0.30

  switch (rotation) {
    case 0:
      return `M 0 0 C 0 ${r * k1} ${r * k2} ${r} ${r} ${r} H 0 Z`;
    case 90:
      return `M 0 0 C 0 ${r * k1} ${-r * k2} ${r} ${-r} ${r} H 0 Z`;
    case 180:
      return `M 0 0 C 0 ${-r * k1} ${-r * k2} ${-r} ${-r} ${-r} H 0 Z`;
    case 270:
      return `M 0 0 C 0 ${-r * k1} ${r * k2} ${-r} ${r} ${-r} H 0 Z`;
    default:
      return `M 0 0 C 0 ${r * k1} ${r * k2} ${r} ${r} ${r} H 0 Z`;
  }
};

// Bridge path baked at an absolute (x, y) position with no SVG transform.
// Using absolute coordinates is essential so the bridge shares the exact same
// user space as the shape paths -- otherwise a userSpaceOnUse gradient would be
// sampled in each bridge's translated local space and render the wrong color.
export const getBridgePathAt = (x, y, r, rotation = 0, smoothing = 0.6) => {
  const s = Math.max(0, Math.min(1, smoothing));
  const k1 = 0.45 + 0.5 * s;
  const k2 = 0.05 + 0.25 * s;

  let c1y, c2x, c2y, ex, ey;
  switch (rotation) {
    case 90:
      c1y = r * k1;
      c2x = -r * k2;
      c2y = r;
      ex = -r;
      ey = r;
      break;
    case 180:
      c1y = -r * k1;
      c2x = -r * k2;
      c2y = -r;
      ex = -r;
      ey = -r;
      break;
    case 270:
      c1y = -r * k1;
      c2x = r * k2;
      c2y = -r;
      ex = r;
      ey = -r;
      break;
    case 0:
    default:
      c1y = r * k1;
      c2x = r * k2;
      c2y = r;
      ex = r;
      ey = r;
      break;
  }

  return `M ${x} ${y} C ${x} ${y + c1y} ${x + c2x} ${y + c2y} ${x + ex} ${y + ey} H ${x} Z`;
};

export const getRoundedRectPath = (x, y, w, h, corners) => {
  const { tl, tr, br, bl } = corners;

  const maxR = Math.min(w / 2, h / 2);
  const rtl = Math.min(tl, maxR);
  const rtr = Math.min(tr, maxR);
  const rbr = Math.min(br, maxR);
  const rbl = Math.min(bl, maxR);

  return `
    M ${x + rtl} ${y}
    L ${x + w - rtr} ${y}
    ${rtr > 0 ? `A ${rtr} ${rtr} 0 0 1 ${x + w} ${y + rtr}` : `L ${x + w} ${y}`}
    L ${x + w} ${y + h - rbr}
    ${rbr > 0 ? `A ${rbr} ${rbr} 0 0 1 ${x + w - rbr} ${y + h}` : `L ${x + w} ${y + h}`}
    L ${x + bl} ${y + h}
    ${rbl > 0 ? `A ${rbl} ${rbl} 0 0 1 ${x} ${y + h - rbl}` : `L ${x} ${y + h}`}
    L ${x} ${y + rtl}
    ${rtl > 0 ? `A ${rtl} ${rtl} 0 0 1 ${x + rtl} ${y}` : `L ${x} ${y}`}
    Z
  `
    .trim()
    .replace(/\s+/g, ' ');
};

const cornersFor = (cornerRadii, id, globalRadius) =>
  cornerRadii[id] || { tl: globalRadius, tr: globalRadius, br: globalRadius, bl: globalRadius };

export const computeShapesBBox = shapes => {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  shapes.forEach(s => {
    minX = Math.min(minX, s.x);
    minY = Math.min(minY, s.y);
    maxX = Math.max(maxX, s.x + s.w);
    maxY = Math.max(maxY, s.y + s.h);
  });
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
};

// How much extra room the shadow / stroke effects need outside the shape bounds.
export const effectPadding = style => {
  let pad = 0;
  if (style?.shadowEnabled) {
    pad = Math.max(
      pad,
      (style.shadowBlur || 0) + Math.max(Math.abs(style.shadowOffsetX || 0), Math.abs(style.shadowOffsetY || 0))
    );
  }
  if (style?.strokeEnabled) {
    pad = Math.max(pad, style.strokeWidth || 0);
  }
  return Math.ceil(pad);
};

// Build a renderer-agnostic description of the fill (solid color or gradient).
// `bbox` must be in the same coordinate space as the drawn paths so a gradient
// spans the whole merged silhouette seamlessly (gradientUnits=userSpaceOnUse).
export const getFillSpec = (style, bbox, idSuffix = '') => {
  const id = `sm-fill-${idSuffix}`;
  const type = style.fillType || 'solid';
  if (type === 'solid') {
    return { type: 'solid', id, paint: style.fill };
  }

  const c1 = style.fill;
  const c2 = style.fillColor2 || style.fill;
  const cx = bbox.x + bbox.w / 2;
  const cy = bbox.y + bbox.h / 2;

  if (type === 'linear') {
    const angle = (((style.gradientAngle ?? 135) - 90) * Math.PI) / 180;
    const half = (Math.abs(Math.cos(angle)) * bbox.w + Math.abs(Math.sin(angle)) * bbox.h) / 2;
    const dx = Math.cos(angle) * half;
    const dy = Math.sin(angle) * half;
    return {
      type: 'linear',
      id,
      paint: `url(#${id})`,
      x1: cx - dx,
      y1: cy - dy,
      x2: cx + dx,
      y2: cy + dy,
      stops: [
        { offset: 0, color: c1 },
        { offset: 1, color: c2 }
      ]
    };
  }

  // radial
  return {
    type: 'radial',
    id,
    paint: `url(#${id})`,
    cx,
    cy,
    r: Math.max(bbox.w, bbox.h) / 2,
    stops: [
      { offset: 0, color: c1 },
      { offset: 1, color: c2 }
    ]
  };
};

// Description of the shadow + outer-stroke filter applied to the merged group.
export const getFxSpec = (style, idSuffix = '') => {
  const hasShadow = !!style.shadowEnabled;
  const hasStroke = !!style.strokeEnabled && (style.strokeWidth || 0) > 0;
  if (!hasShadow && !hasStroke) return null;
  return {
    id: `sm-fx-${idSuffix}`,
    hasShadow,
    hasStroke,
    shadowColor: style.shadowColor,
    shadowBlur: style.shadowBlur,
    shadowOffsetX: style.shadowOffsetX,
    shadowOffsetY: style.shadowOffsetY,
    shadowOpacity: style.shadowOpacity,
    strokeColor: style.strokeColor,
    strokeWidth: style.strokeWidth
  };
};

// String builders (used by the export generators).
export const fillDefsString = spec => {
  if (!spec || spec.type === 'solid') return '';
  const stops = spec.stops.map(s => `<stop offset="${s.offset}" stop-color="${s.color}" />`).join('');
  if (spec.type === 'linear') {
    return `<linearGradient id="${spec.id}" gradientUnits="userSpaceOnUse" x1="${spec.x1}" y1="${spec.y1}" x2="${spec.x2}" y2="${spec.y2}">${stops}</linearGradient>`;
  }
  return `<radialGradient id="${spec.id}" gradientUnits="userSpaceOnUse" cx="${spec.cx}" cy="${spec.cy}" r="${spec.r}">${stops}</radialGradient>`;
};

export const fxFilterString = spec => {
  if (!spec) return '';
  const parts = [];
  if (spec.hasShadow) {
    parts.push(`<feGaussianBlur in="SourceAlpha" stdDeviation="${spec.shadowBlur}" result="smBlur" />`);
    parts.push(`<feOffset in="smBlur" dx="${spec.shadowOffsetX}" dy="${spec.shadowOffsetY}" result="smOff" />`);
    parts.push(
      `<feFlood flood-color="${spec.shadowColor}" flood-opacity="${spec.shadowOpacity}" result="smShadowColor" />`
    );
    parts.push(`<feComposite in="smShadowColor" in2="smOff" operator="in" result="smShadow" />`);
  }
  if (spec.hasStroke) {
    parts.push(`<feMorphology in="SourceAlpha" operator="dilate" radius="${spec.strokeWidth}" result="smDilated" />`);
    parts.push(`<feFlood flood-color="${spec.strokeColor}" result="smStrokeColor" />`);
    parts.push(`<feComposite in="smStrokeColor" in2="smDilated" operator="in" result="smOutline" />`);
  }
  const merge = [
    spec.hasShadow ? '<feMergeNode in="smShadow" />' : '',
    spec.hasStroke ? '<feMergeNode in="smOutline" />' : '',
    '<feMergeNode in="SourceGraphic" />'
  ].join('');
  return `<filter id="${spec.id}" x="-50%" y="-50%" width="200%" height="200%">${parts.join('')}<feMerge>${merge}</feMerge></filter>`;
};

export const generateMergedSVG = (shapes, bridges, cornerRadii, style, globalRadius, smoothing = 0.6, opts = {}) => {
  const basePad = 10;
  const userPad = opts.padding ?? 0;
  const fxPad = effectPadding(style);
  const padding = basePad + userPad + fxPad;

  const bb = computeShapesBBox(shapes);
  const width = bb.w + padding * 2;
  const height = bb.h + padding * 2;
  const offsetX = -bb.x + padding;
  const offsetY = -bb.y + padding;

  const drawnBBox = { x: padding, y: padding, w: bb.w, h: bb.h };
  const fillSpec = getFillSpec(style, drawnBBox, 'merged');
  const fxSpec = getFxSpec(style, 'merged');

  const shapePaths = shapes
    .map(s => {
      const corners = cornersFor(cornerRadii, s.id, globalRadius);
      return `<path d="${getRoundedRectPath(s.x + offsetX, s.y + offsetY, s.w, s.h, corners)}" />`;
    })
    .join('\n      ');

  const bridgePaths = bridges
    .map(b => {
      return `<path d="${getBridgePathAt(b.x + offsetX, b.y + offsetY, b.r, b.rotation, smoothing)}" />`;
    })
    .join('\n      ');

  const defs = `${fillDefsString(fillSpec)}${fxFilterString(fxSpec)}`;
  const bg =
    style.backgroundEnabled || opts.forceBackground
      ? `<rect x="0" y="0" width="${width}" height="${height}" fill="${style.backgroundColor}" />\n  `
      : '';

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${defs ? `<defs>${defs}</defs>\n  ` : ''}${bg}<g fill="${fillSpec.paint}" fill-opacity="${style.opacity ?? 1}"${fxSpec ? ` filter="url(#${fxSpec.id})"` : ''}>
      ${shapePaths}
      ${bridgePaths}
  </g>
</svg>`;
};

export const generateMergedClipPathSVG = (shapes, bridges, cornerRadii, style, globalRadius, smoothing = 0.6) => {
  const padding = 10;
  const bb = computeShapesBBox(shapes);
  const width = bb.w + padding * 2;
  const height = bb.h + padding * 2;
  const offsetX = -bb.x + padding;
  const offsetY = -bb.y + padding;

  const allPaths = [];

  shapes.forEach(s => {
    const corners = cornersFor(cornerRadii, s.id, globalRadius);
    allPaths.push(getRoundedRectPath(s.x + offsetX, s.y + offsetY, s.w, s.h, corners));
  });

  bridges.forEach(b => {
    allPaths.push(getBridgePathAt(b.x + offsetX, b.y + offsetY, b.r, b.rotation, smoothing));
  });

  const combinedPath = allPaths.join(' ');
  const fillSpec = getFillSpec(style, { x: padding, y: padding, w: bb.w, h: bb.h }, 'clip');
  const defs = fillDefsString(fillSpec);

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="merged-shape-clip">
      <path d="${combinedPath}" fill-rule="nonzero" />
    </clipPath>
    ${defs}
  </defs>

  <!-- The merged shape - use as mask for images/videos -->
  <path d="${combinedPath}" fill="${fillSpec.paint}" fill-rule="nonzero" />

  <!-- Example: Clipped content container -->
  <!-- <g clip-path="url(#merged-shape-clip)">
    <image href="your-image.jpg" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" />
  </g> -->
</svg>`;
};

export const generateCSSClipPath = (shapes, bridges, cornerRadii, globalRadius, smoothing = 0.6) => {
  const padding = 10;
  const bb = computeShapesBBox(shapes);
  const width = bb.w + padding * 2;
  const height = bb.h + padding * 2;
  const offsetX = -bb.x + padding;
  const offsetY = -bb.y + padding;

  const allPaths = [];

  shapes.forEach(s => {
    const corners = cornersFor(cornerRadii, s.id, globalRadius);
    allPaths.push(getRoundedRectPath(s.x + offsetX, s.y + offsetY, s.w, s.h, corners));
  });

  bridges.forEach(b => {
    allPaths.push(getBridgePathAt(b.x + offsetX, b.y + offsetY, b.r, b.rotation, smoothing));
  });

  const combinedPath = allPaths.join(' ').replace(/\s+/g, ' ').trim();

  return `/* Container dimensions: ${Math.round(width)}px × ${Math.round(height)}px */
.clipped-element {
  clip-path: path('${combinedPath}');
  width: ${Math.round(width)}px;
  height: ${Math.round(height)}px;
}`;
};

const computeNegativeSpaces = (shapes, bridges, globalRadius, minX, minY, maxX, maxY) => {
  const negativeSpaces = [];

  for (const bridge of bridges) {
    let cornerX = bridge.x;
    let cornerY;
    if (bridge.rotation === 0 || bridge.rotation === 90) {
      cornerY = bridge.y + bridge.r;
    } else {
      cornerY = bridge.y - bridge.r;
    }

    let nsLeft, nsTop, nsRight, nsBottom;

    switch (bridge.rotation) {
      case 0:
        nsLeft = cornerX;
        nsBottom = cornerY;
        nsTop = minY;
        nsRight = maxX;

        for (const s of shapes) {
          if (s.x < nsRight && s.x + s.w > nsLeft && s.y + s.h <= cornerY && s.y + s.h > nsTop) {
            nsTop = s.y + s.h;
          }
          if (s.y < cornerY && s.x >= cornerX && s.x < nsRight) {
            nsRight = s.x;
          }
        }
        break;

      case 90:
        nsRight = cornerX;
        nsBottom = cornerY;
        nsTop = minY;
        nsLeft = minX;

        for (const s of shapes) {
          if (s.x < nsRight && s.x + s.w > nsLeft && s.y + s.h <= cornerY && s.y + s.h > nsTop) {
            nsTop = s.y + s.h;
          }
          if (s.y < cornerY && s.x + s.w <= cornerX && s.x + s.w > nsLeft) {
            nsLeft = s.x + s.w;
          }
        }
        break;

      case 180:
        nsRight = cornerX;
        nsTop = cornerY;
        nsBottom = maxY;
        nsLeft = minX;

        for (const s of shapes) {
          if (s.x < nsRight && s.x + s.w > nsLeft && s.y >= cornerY && s.y < nsBottom) {
            nsBottom = s.y;
          }
          if (s.y + s.h > cornerY && s.x + s.w <= cornerX && s.x + s.w > nsLeft) {
            nsLeft = s.x + s.w;
          }
        }
        break;

      case 270:
        nsLeft = cornerX;
        nsTop = cornerY;
        nsBottom = maxY;
        nsRight = maxX;

        for (const s of shapes) {
          if (s.x < nsRight && s.x + s.w > nsLeft && s.y >= cornerY && s.y < nsBottom) {
            nsBottom = s.y;
          }
          if (s.y + s.h > cornerY && s.x >= cornerX && s.x < nsRight) {
            nsRight = s.x;
          }
        }
        break;

      default:
        continue;
    }

    const width = nsRight - nsLeft;
    const height = nsBottom - nsTop;

    if (width > 0 && height > 0) {
      const newNS = {
        id: `negative-${negativeSpaces.length}`,
        x: nsLeft,
        y: nsTop,
        w: width,
        h: height,
        rotation: bridge.rotation
      };

      let shouldAdd = true;
      for (const existing of negativeSpaces) {
        const overlapLeft = Math.max(newNS.x, existing.x);
        const overlapTop = Math.max(newNS.y, existing.y);
        const overlapRight = Math.min(newNS.x + newNS.w, existing.x + existing.w);
        const overlapBottom = Math.min(newNS.y + newNS.h, existing.y + existing.h);

        if (overlapLeft < overlapRight && overlapTop < overlapBottom) {
          if (newNS.x === existing.x && newNS.y === existing.y) {
            if (newNS.w > existing.w) {
              const existingOriginalBottom = existing.y + existing.h;
              existing.y = newNS.y + newNS.h;
              existing.h = existingOriginalBottom - existing.y;
            } else {
              newNS.y = existing.y + existing.h;
              newNS.h = nsBottom - newNS.y;
            }
          } else if (newNS.y < existing.y) {
            newNS.h = existing.y - newNS.y;
          } else if (newNS.x < existing.x) {
            newNS.w = existing.x - newNS.x;
          } else {
            shouldAdd = false;
          }

          if (newNS.w <= 0 || newNS.h <= 0) {
            shouldAdd = false;
          }
        }
      }

      for (let i = negativeSpaces.length - 1; i >= 0; i--) {
        if (negativeSpaces[i].w <= 0 || negativeSpaces[i].h <= 0) {
          negativeSpaces.splice(i, 1);
        }
      }

      if (shouldAdd && newNS.w > 0 && newNS.h > 0) {
        negativeSpaces.push(newNS);
      }
    }
  }

  return negativeSpaces;
};

export const generateReactComponent = (
  shapes,
  bridges,
  cornerRadii,
  style,
  globalRadius,
  smoothing = 0.6,
  name = 'MergedShape'
) => {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  shapes.forEach(s => {
    minX = Math.min(minX, s.x);
    minY = Math.min(minY, s.y);
    maxX = Math.max(maxX, s.x + s.w);
    maxY = Math.max(maxY, s.y + s.h);
  });

  const width = maxX - minX;
  const height = maxY - minY;

  const negativeSpaces = computeNegativeSpaces(shapes, bridges, globalRadius, minX, minY, maxX, maxY);

  const shapeElements = shapes
    .map((s, i) => {
      const corners = cornersFor(cornerRadii, s.id, globalRadius);
      const left = s.x - minX;
      const top = s.y - minY;

      return `      {/* Shape ${i + 1} */}
      <div
        style={{
          position: 'absolute',
          left: ${left},
          top: ${top},
          width: ${s.w},
          height: ${s.h},
          backgroundColor: fill,
          borderRadius: '${corners.tl}px ${corners.tr}px ${corners.br}px ${corners.bl}px',
        }}
      >
        {/* Add content here */}
      </div>`;
    })
    .join('\n');

  const negativeSpaceElements = negativeSpaces
    .map((ns, i) => {
      const left = ns.x - minX;
      const top = ns.y - minY;

      return `      {/* Negative Space ${i + 1} - Content container for empty region */}
      <div
        style={{
          position: 'absolute',
          left: ${left},
          top: ${top},
          width: ${ns.w},
          height: ${ns.h},
          // Transparent container for content in negative space
        }}
      >
        {/* Add content here */}
      </div>`;
    })
    .join('\n');

  const bridgeElements = bridges
    .map((b, i) => {
      const left = b.x - minX;
      const top = b.y - minY;
      const size = b.r;

      let viewBox,
        offsetLeft = 0,
        offsetTop = 0;
      switch (b.rotation) {
        case 0:
          viewBox = `0 0 ${size} ${size}`;
          break;
        case 90:
          viewBox = `${-size} 0 ${size} ${size}`;
          offsetLeft = -size;
          break;
        case 180:
          viewBox = `${-size} ${-size} ${size} ${size}`;
          offsetLeft = -size;
          offsetTop = -size;
          break;
        case 270:
          viewBox = `0 ${-size} ${size} ${size}`;
          offsetTop = -size;
          break;
        default:
          viewBox = `0 0 ${size} ${size}`;
      }

      return `      {/* Bridge ${i + 1} */}
      <svg
        style={{
          position: 'absolute',
          left: ${left + offsetLeft},
          top: ${top + offsetTop},
          width: ${size},
          height: ${size},
          pointerEvents: 'none',
        }}
        viewBox="${viewBox}"
      >
        <path d="${getBridgePath(b.r, b.rotation, smoothing)}" fill={fill} />
      </svg>`;
    })
    .join('\n');

  return `const ${name} = ({ fill = "${style.fill}", children, style: containerStyle, ...props }) => (
  <div
    style={{
      position: 'relative',
      width: ${width},
      height: ${height},
      ...containerStyle,
    }}
    {...props}
  >
${shapeElements}
${negativeSpaceElements}
${bridgeElements}
    {children}
  </div>
);

export default ${name};`;
};
