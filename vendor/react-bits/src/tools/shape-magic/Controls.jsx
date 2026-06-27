import { Box, Flex, Text, Icon, Input, Kbd } from '@chakra-ui/react';
import {
  Plus,
  Trash2,
  Copy,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignHorizontalSpaceAround,
  AlignVerticalSpaceAround,
  Code2,
  Download,
  Keyboard,
  Merge,
  ChevronUp,
  FileCode2,
  Image,
  Sparkles,
  Palette,
  PenTool,
  Sun,
  Shapes,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { useState, useCallback } from 'react';
import {
  generateMergedSVG,
  generateMergedClipPathSVG,
  generateReactComponent,
  generateCSSClipPath,
  getRoundedRectPath,
  getBridgePathAt
} from './svgRenderers';
import { computeBridges, computeCornerRadii } from './computeBridges';
import { DEFAULT_STYLE } from './types';
import PreviewColorPickerCustom from '../../components/common/Preview/PreviewColorPickerCustom';
import PreviewSlider from '../../components/common/Preview/PreviewSlider';
import PreviewSelect from '../../components/common/Preview/PreviewSelect';
import PreviewSwitch from '../../components/common/Preview/PreviewSwitch';

const ColorInput = ({ label, value, onChange }) => (
  <PreviewColorPickerCustom title={label} color={value} onChange={onChange} />
);

const NumberInput = ({ label, value, onChange, min, max, step = 1 }) => (
  <Flex align="center" gap={2} flex={1} minW={0}>
    <Text fontSize="12px" color="var(--text-muted)" minW="24px" flexShrink={0}>
      {label}
    </Text>
    <Input
      type="number"
      value={Math.round(value)}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      min={min}
      max={max}
      step={step}
      size="sm"
      bg="var(--bg-elevated)"
      border="1px solid var(--border-primary)"
      borderRadius="6px"
      color="var(--text-primary)"
      fontSize="12px"
      px={2}
      h="32px"
      flex={1}
      minW={0}
      _focus={{ borderColor: 'var(--color-primary)', boxShadow: 'none' }}
    />
  </Flex>
);

const ToggleButton = ({ icon: IconComponent, label, isActive, onClick, disabled, flex }) => (
  <Flex
    as="button"
    type="button"
    align="center"
    justify="center"
    gap={1.5}
    px={2.5}
    py={1.5}
    flex={flex}
    bg={isActive ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-elevated)'}
    border={isActive ? '1px solid var(--color-primary)' : '1px solid var(--border-primary)'}
    borderRadius="var(--radius-sm)"
    cursor={disabled ? 'not-allowed' : 'pointer'}
    opacity={disabled ? 0.5 : 1}
    onClick={disabled ? undefined : onClick}
    transition="all 0.15s"
    _hover={{ borderColor: disabled ? 'var(--border-primary)' : 'var(--color-primary)' }}
  >
    <Icon as={IconComponent} boxSize={3.5} color={isActive ? 'var(--color-primary)' : 'var(--text-muted)'} />
    {label && (
      <Text fontSize="11px" color={isActive ? 'var(--color-primary)' : 'var(--text-muted)'}>
        {label}
      </Text>
    )}
  </Flex>
);

const CollapsibleSection = ({ title, icon: IconComponent, action, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Box mb={4}>
      <Flex align="center" justify="space-between" mb={open ? 3 : 0}>
        <Flex
          as="button"
          type="button"
          align="center"
          gap={1.5}
          flex={1}
          onClick={() => setOpen(o => !o)}
          cursor="pointer"
        >
          {IconComponent && <Icon as={IconComponent} boxSize={3} color="var(--text-muted)" />}
          <Text
            fontSize="11px"
            color="var(--text-muted)"
            fontWeight={600}
            textTransform="uppercase"
            letterSpacing="0.5px"
          >
            {title}
          </Text>
          <Icon
            as={ChevronUp}
            boxSize={3}
            color="var(--text-muted)"
            transform={open ? 'rotate(0deg)' : 'rotate(180deg)'}
            transition="transform 0.2s ease"
            ml={1}
          />
        </Flex>
        {action}
      </Flex>
      <Box display={open ? 'block' : 'none'}>{children}</Box>
    </Box>
  );
};

const PresetTile = ({ preset, onClick }) => {
  // Render an accurate, merged preview of the preset (shapes + bridges + merged corners),
  // so the thumbnail matches exactly what gets placed on the canvas.
  const shapes = preset.build();
  const bridges = computeBridges(shapes, preset.radius, 1);
  const corners = computeCornerRadii(shapes, preset.radius, 1);

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
  const pad = 12;
  const vbW = maxX - minX + pad * 2;
  const vbH = maxY - minY + pad * 2;

  return (
    <Flex
      as="button"
      type="button"
      direction="column"
      align="center"
      justify="center"
      gap={1}
      p={2}
      bg="var(--bg-elevated)"
      border="1px solid var(--border-primary)"
      borderRadius="var(--radius-sm)"
      cursor="pointer"
      transition="all 0.15s"
      _hover={{ borderColor: 'var(--color-primary)', bg: 'rgba(168, 85, 247, 0.08)' }}
      onClick={onClick}
      title={preset.name}
    >
      <Box w="100%" h="42px">
        <svg
          width="100%"
          height="100%"
          viewBox={`${minX - pad} ${minY - pad} ${vbW} ${vbH}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <g fill="var(--text-muted)">
            {shapes.map(s => (
              <path
                key={s.id}
                d={getRoundedRectPath(
                  s.x,
                  s.y,
                  s.w,
                  s.h,
                  corners[s.id] || {
                    tl: preset.radius,
                    tr: preset.radius,
                    br: preset.radius,
                    bl: preset.radius
                  }
                )}
              />
            ))}
            {bridges.map(b => (
              <path key={b.id} d={getBridgePathAt(b.x, b.y, b.r, b.rotation, 0.6)} />
            ))}
          </g>
        </svg>
      </Box>
      <Text fontSize="10px" color="var(--text-muted)" fontWeight={500}>
        {preset.name}
      </Text>
    </Flex>
  );
};

const StyledKbd = ({ children }) => (
  <Kbd
    bg="var(--bg-card)"
    borderColor="var(--border-primary)"
    color="var(--color-accent)"
    fontSize="11px"
    fontWeight={500}
    px={1.5}
    py={0.5}
    borderRadius="4px"
  >
    {children}
  </Kbd>
);

const ExportButton = ({ icon: IconComponent, label, active, onClick, flex, primary }) => (
  <Flex
    as="button"
    type="button"
    flex={flex}
    align="center"
    justify="center"
    gap={2}
    bg={primary ? 'var(--color-primary)' : active ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-elevated)'}
    border={primary ? 'none' : active ? '1px solid var(--color-primary)' : '1px solid var(--border-primary)'}
    borderRadius="var(--radius-sm)"
    py={primary ? 2.5 : 2}
    cursor="pointer"
    onClick={onClick}
    transition="all 0.15s"
    _hover={{ borderColor: primary ? 'none' : 'var(--color-primary)', bg: primary ? '#b96dfa' : undefined }}
  >
    <Icon as={IconComponent} boxSize={4} color={primary ? 'var(--text-primary)' : 'var(--text-muted)'} />
    <Text
      fontSize="12px"
      color={primary ? 'var(--text-primary)' : 'var(--text-muted)'}
      fontWeight={primary ? 600 : 500}
    >
      {label}
    </Text>
  </Flex>
);

export default function Controls({
  shapes,
  bridges,
  cornerRadii,
  selectedIds,
  style,
  globalRadius,
  smoothing = 0.6,
  snapToGrid,
  showGrid,
  gridSize,
  presets = [],
  onAddShape,
  onDeleteShapes,
  onDuplicateShapes,
  onStyleChange,
  onGlobalRadiusChange,
  onSmoothingChange,
  onShapeUpdate,
  onAlignShapes,
  onDistributeShapes,
  onApplyPreset,
  onToggleSnap,
  onToggleGrid,
  onGridSizeChange,
  toolSelector,
  disabled = false
}) {
  const [copyStatus, setCopyStatus] = useState(null);
  const [shortcutsHovered, setShortcutsHovered] = useState(false);
  const [pngScale, setPngScale] = useState('2');
  const [exportPad, setExportPad] = useState(16);
  const [includeBg, setIncludeBg] = useState(false);

  const selectedShape = shapes.find(s => s.id === selectedIds[0]);
  const hasMultiSelection = selectedIds.length > 1;
  const hasThreeOrMoreSelected = selectedIds.length >= 3;

  const setStyle = useCallback(patch => onStyleChange({ ...style, ...patch }), [onStyleChange, style]);

  const exportOpts = { padding: exportPad, forceBackground: includeBg };

  const flash = key => {
    setCopyStatus(key);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const handleCopySVG = useCallback(() => {
    navigator.clipboard.writeText(
      generateMergedSVG(shapes, bridges, cornerRadii || {}, style, globalRadius, smoothing, exportOpts)
    );
    flash('svg');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapes, bridges, cornerRadii, globalRadius, style, smoothing, exportPad, includeBg]);

  const handleCopyReact = useCallback(() => {
    navigator.clipboard.writeText(
      generateReactComponent(shapes, bridges, cornerRadii || {}, style, globalRadius, smoothing)
    );
    flash('react');
  }, [shapes, bridges, cornerRadii, globalRadius, style, smoothing]);

  const handleCopyMerged = useCallback(() => {
    navigator.clipboard.writeText(
      generateMergedClipPathSVG(shapes, bridges, cornerRadii || {}, style, globalRadius, smoothing)
    );
    flash('merged');
  }, [shapes, bridges, cornerRadii, globalRadius, style, smoothing]);

  const handleCopyCSS = useCallback(() => {
    navigator.clipboard.writeText(generateCSSClipPath(shapes, bridges, cornerRadii || {}, globalRadius, smoothing));
    flash('css');
  }, [shapes, bridges, cornerRadii, globalRadius, smoothing]);

  const handleDownloadSVG = useCallback(() => {
    const svg = generateMergedSVG(shapes, bridges, cornerRadii || {}, style, globalRadius, smoothing, exportOpts);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'merged-shape.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapes, bridges, cornerRadii, globalRadius, style, smoothing, exportPad, includeBg]);

  const downloadRaster = useCallback(
    format => {
      const isJpg = format === 'jpg';
      // JPG has no alpha, so always bake a background for it.
      const opts = { padding: exportPad, forceBackground: includeBg || isJpg };
      const svg = generateMergedSVG(shapes, bridges, cornerRadii || {}, style, globalRadius, smoothing, opts);
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const img = new window.Image();
      img.onload = () => {
        const scale = parseInt(pngScale, 10) || 2;
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (isJpg) {
          ctx.fillStyle = style.backgroundColor || '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob(
          outBlob => {
            const outUrl = URL.createObjectURL(outBlob);
            const link = document.createElement('a');
            link.download = `merged-shape.${format}`;
            link.href = outUrl;
            link.click();
            URL.revokeObjectURL(outUrl);
          },
          isJpg ? 'image/jpeg' : 'image/png',
          isJpg ? 0.92 : undefined
        );
      };
      img.src = url;
    },
    [shapes, bridges, cornerRadii, globalRadius, style, smoothing, pngScale, exportPad, includeBg]
  );

  const isGradient = style.fillType === 'linear' || style.fillType === 'radial';

  return (
    <Flex
      direction="column"
      h="100%"
      overflow="hidden"
      opacity={disabled ? 0.5 : 1}
      pointerEvents={disabled ? 'none' : 'auto'}
      transition="opacity 0.2s"
    >
      {toolSelector && (
        <Box mb={4} flexShrink={0}>
          {toolSelector}
        </Box>
      )}

      <Box
        flex={1}
        overflowY="auto"
        css={{
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none'
        }}
      >
        {/* Presets */}
        {presets.length > 0 && (
          <CollapsibleSection title="Presets" icon={Sparkles} defaultOpen>
            <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={2}>
              {presets.map(p => (
                <PresetTile key={p.id} preset={p} onClick={() => onApplyPreset?.(p.id)} />
              ))}
            </Box>
          </CollapsibleSection>
        )}

        {/* Toolbar */}
        <CollapsibleSection title="Tools" icon={Shapes} defaultOpen>
          <Flex gap={2}>
            <ToggleButton icon={Plus} label="Add" onClick={onAddShape} flex={1} />
            <ToggleButton icon={Trash2} label="Delete" onClick={onDeleteShapes} flex={1} />
            <ToggleButton icon={Copy} label="Duplicate" onClick={onDuplicateShapes} flex={1} />
          </Flex>

          {hasMultiSelection && (
            <>
              <Text fontSize="11px" color="var(--text-muted)" mt={3} mb={2}>
                Align
              </Text>
              <Flex gap={2} flexWrap="wrap">
                <ToggleButton icon={AlignHorizontalJustifyStart} onClick={() => onAlignShapes('left')} />
                <ToggleButton icon={AlignHorizontalJustifyCenter} onClick={() => onAlignShapes('centerH')} />
                <ToggleButton icon={AlignHorizontalJustifyEnd} onClick={() => onAlignShapes('right')} />
                <ToggleButton icon={AlignVerticalJustifyStart} onClick={() => onAlignShapes('top')} />
                <ToggleButton icon={AlignVerticalJustifyCenter} onClick={() => onAlignShapes('centerV')} />
                <ToggleButton icon={AlignVerticalJustifyEnd} onClick={() => onAlignShapes('bottom')} />
              </Flex>
              {hasThreeOrMoreSelected && (
                <>
                  <Text fontSize="11px" color="var(--text-muted)" mt={3} mb={2}>
                    Distribute
                  </Text>
                  <Flex gap={2}>
                    <ToggleButton
                      icon={AlignHorizontalSpaceAround}
                      label="Horizontal"
                      onClick={() => onDistributeShapes('horizontal')}
                      flex={1}
                    />
                    <ToggleButton
                      icon={AlignVerticalSpaceAround}
                      label="Vertical"
                      onClick={() => onDistributeShapes('vertical')}
                      flex={1}
                    />
                  </Flex>
                </>
              )}
            </>
          )}
        </CollapsibleSection>

        {selectedShape && !hasMultiSelection && (
          <CollapsibleSection title="Selected Shape" icon={SlidersHorizontal} defaultOpen>
            <Flex direction="column" gap={2}>
              <Flex gap={2}>
                <NumberInput
                  label="X"
                  value={selectedShape.x}
                  onChange={v => onShapeUpdate(selectedShape.id, { x: v })}
                />
                <NumberInput
                  label="Y"
                  value={selectedShape.y}
                  onChange={v => onShapeUpdate(selectedShape.id, { y: v })}
                />
              </Flex>
              <Flex gap={2}>
                <NumberInput
                  label="W"
                  value={selectedShape.w}
                  onChange={v => onShapeUpdate(selectedShape.id, { w: Math.max(20, v) })}
                  min={20}
                />
                <NumberInput
                  label="H"
                  value={selectedShape.h}
                  onChange={v => onShapeUpdate(selectedShape.id, { h: Math.max(20, v) })}
                  min={20}
                />
              </Flex>
              <PreviewSlider
                title="Corner Radius"
                min={0}
                max={120}
                step={1}
                value={selectedShape.r !== undefined ? selectedShape.r : globalRadius}
                valueUnit="px"
                onChange={v => onShapeUpdate(selectedShape.id, { r: v })}
              />
              {selectedShape.r !== undefined && (
                <Flex
                  as="button"
                  type="button"
                  align="center"
                  justify="center"
                  gap={1.5}
                  py={1.5}
                  bg="var(--bg-elevated)"
                  border="1px solid var(--border-primary)"
                  borderRadius="var(--radius-sm)"
                  cursor="pointer"
                  _hover={{ borderColor: 'var(--color-primary)' }}
                  onClick={() => onShapeUpdate(selectedShape.id, { r: undefined })}
                >
                  <Icon as={RotateCcw} boxSize={3} color="var(--text-muted)" />
                  <Text fontSize="11px" color="var(--text-muted)">
                    Use global radius
                  </Text>
                </Flex>
              )}
            </Flex>
          </CollapsibleSection>
        )}

        {/* Fill */}
        <CollapsibleSection
          title="Fill"
          icon={Palette}
          action={
            <Flex
              as="button"
              type="button"
              align="center"
              gap={1}
              px={2}
              py={1}
              borderRadius="6px"
              bg="var(--bg-elevated)"
              border="1px solid var(--border-primary)"
              cursor="pointer"
              _hover={{ borderColor: 'var(--color-primary)' }}
              onClick={() => onStyleChange({ ...DEFAULT_STYLE })}
              title="Reset all styles"
            >
              <Icon as={RotateCcw} boxSize={3} color="var(--text-muted)" />
              <Text fontSize="10px" color="var(--text-muted)">
                Reset
              </Text>
            </Flex>
          }
        >
          <Flex direction="column" gap={2}>
            <PreviewSelect
              title="Type"
              value={style.fillType || 'solid'}
              options={[
                { value: 'solid', label: 'Solid' },
                { value: 'linear', label: 'Linear Gradient' },
                { value: 'radial', label: 'Radial Gradient' }
              ]}
              onChange={v => setStyle({ fillType: v })}
            />
            <ColorInput
              label={isGradient ? 'Color 1' : 'Color'}
              value={style.fill}
              onChange={v => setStyle({ fill: v })}
            />
            {isGradient && (
              <ColorInput label="Color 2" value={style.fillColor2} onChange={v => setStyle({ fillColor2: v })} />
            )}
            {style.fillType === 'linear' && (
              <PreviewSlider
                title="Angle"
                min={0}
                max={360}
                step={1}
                value={style.gradientAngle}
                valueUnit="°"
                onChange={v => setStyle({ gradientAngle: v })}
              />
            )}
            <PreviewSlider
              title="Opacity"
              min={0}
              max={1}
              step={0.01}
              value={style.opacity ?? 1}
              displayValue={v => `${Math.round(v * 100)}%`}
              onChange={v => setStyle({ opacity: v })}
            />
          </Flex>
        </CollapsibleSection>

        {/* Stroke */}
        <CollapsibleSection title="Stroke" icon={PenTool} defaultOpen={false}>
          <Flex direction="column" gap={2}>
            <PreviewSwitch
              title="Enable outline"
              isChecked={!!style.strokeEnabled}
              onChange={v => setStyle({ strokeEnabled: v })}
            />
            <ColorInput label="Color" value={style.strokeColor} onChange={v => setStyle({ strokeColor: v })} />
            <PreviewSlider
              title="Width"
              min={1}
              max={40}
              step={1}
              value={style.strokeWidth}
              valueUnit="px"
              isDisabled={!style.strokeEnabled}
              onChange={v => setStyle({ strokeWidth: v })}
            />
          </Flex>
        </CollapsibleSection>

        {/* Shadow */}
        <CollapsibleSection title="Shadow" icon={Sun} defaultOpen={false}>
          <Flex direction="column" gap={2}>
            <PreviewSwitch
              title="Enable shadow"
              isChecked={!!style.shadowEnabled}
              onChange={v => setStyle({ shadowEnabled: v })}
            />
            <ColorInput label="Color" value={style.shadowColor} onChange={v => setStyle({ shadowColor: v })} />
            <PreviewSlider
              title="Blur"
              min={0}
              max={80}
              step={1}
              value={style.shadowBlur}
              valueUnit="px"
              isDisabled={!style.shadowEnabled}
              onChange={v => setStyle({ shadowBlur: v })}
            />
            <PreviewSlider
              title="Offset X"
              min={-60}
              max={60}
              step={1}
              value={style.shadowOffsetX}
              valueUnit="px"
              isDisabled={!style.shadowEnabled}
              onChange={v => setStyle({ shadowOffsetX: v })}
            />
            <PreviewSlider
              title="Offset Y"
              min={-60}
              max={60}
              step={1}
              value={style.shadowOffsetY}
              valueUnit="px"
              isDisabled={!style.shadowEnabled}
              onChange={v => setStyle({ shadowOffsetY: v })}
            />
            <PreviewSlider
              title="Strength"
              min={0}
              max={1}
              step={0.01}
              value={style.shadowOpacity}
              displayValue={v => `${Math.round(v * 100)}%`}
              isDisabled={!style.shadowEnabled}
              onChange={v => setStyle({ shadowOpacity: v })}
            />
          </Flex>
        </CollapsibleSection>

        {/* Geometry */}
        <CollapsibleSection title="Shape" icon={Shapes} defaultOpen={false}>
          <Flex direction="column" gap={2}>
            <PreviewSlider
              title="Global Radius"
              min={0}
              max={120}
              step={1}
              value={globalRadius}
              valueUnit="px"
              onChange={onGlobalRadiusChange}
            />
            <PreviewSlider
              title="Bridge Smoothness"
              min={0}
              max={1}
              step={0.01}
              value={smoothing}
              displayValue={v => `${Math.round(v * 100)}%`}
              onChange={onSmoothingChange}
            />
          </Flex>
        </CollapsibleSection>

        {/* Canvas */}
        <CollapsibleSection title="Canvas" icon={SlidersHorizontal} defaultOpen={false}>
          <Flex direction="column" gap={2}>
            <PreviewSwitch
              title="Background"
              isChecked={!!style.backgroundEnabled}
              onChange={v => setStyle({ backgroundEnabled: v })}
            />
            {style.backgroundEnabled && (
              <ColorInput
                label="Color"
                value={style.backgroundColor}
                onChange={v => setStyle({ backgroundColor: v })}
              />
            )}
            <PreviewSwitch title="Show grid" isChecked={!!showGrid} onChange={v => onToggleGrid?.(v)} />
            <PreviewSwitch title="Snap to grid" isChecked={!!snapToGrid} onChange={v => onToggleSnap?.(v)} />
            <PreviewSlider
              title="Grid Size"
              min={5}
              max={50}
              step={5}
              value={gridSize}
              valueUnit="px"
              isDisabled={!snapToGrid && !showGrid}
              onChange={v => onGridSizeChange?.(v)}
            />
          </Flex>
        </CollapsibleSection>
      </Box>

      <Box
        bg="var(--bg-elevated)"
        border="1px solid var(--border-primary)"
        borderRadius="var(--radius-sm)"
        mb={4}
        flexShrink={0}
        overflow="hidden"
        onMouseEnter={() => setShortcutsHovered(true)}
        onMouseLeave={() => setShortcutsHovered(false)}
        transition="all 0.2s ease"
      >
        <Flex align="center" justify="space-between" gap={1.5} p={3} cursor="pointer">
          <Flex align="center" gap={1.5}>
            <Icon as={Keyboard} boxSize={3} color="var(--text-muted)" />
            <Text
              fontSize="10px"
              color="var(--text-muted)"
              fontWeight={600}
              textTransform="uppercase"
              letterSpacing="0.5px"
            >
              Shortcuts
            </Text>
          </Flex>
          <Icon
            as={ChevronUp}
            boxSize={3}
            color="var(--text-muted)"
            transform={shortcutsHovered ? 'rotate(0deg)' : 'rotate(180deg)'}
            transition="transform 0.2s ease"
          />
        </Flex>
        <Box
          maxH={shortcutsHovered ? '240px' : '0px'}
          opacity={shortcutsHovered ? 1 : 0}
          overflow="hidden"
          transition="all 0.2s ease"
          px={3}
          pb={shortcutsHovered ? 3 : 0}
        >
          <Flex direction="column" gap={1.5}>
            {[
              ['Undo', ['⌘', 'Z']],
              ['Redo', ['⌘', '⇧', 'Z']],
              ['Duplicate', ['⌘', 'D']],
              ['Copy / Paste', ['⌘', 'C/V']],
              ['Delete', ['⌫']],
              ['Pan', ['Space+Drag']],
              ['Duplicate-drag', ['Alt+Drag']]
            ].map(([label, keys]) => (
              <Flex key={label} justify="space-between" align="center">
                <Text fontSize="12px" color="var(--text-muted)">
                  {label}
                </Text>
                <Flex gap={1}>
                  {keys.map((k, i) => (
                    <StyledKbd key={i}>{k}</StyledKbd>
                  ))}
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Box>
      </Box>

      <Box pt={4} borderTop="1px solid var(--border-primary)" flexShrink={0}>
        <Flex align="center" justify="space-between" mb={3}>
          <Text
            fontSize="11px"
            color="var(--text-muted)"
            fontWeight={600}
            textTransform="uppercase"
            letterSpacing="0.5px"
          >
            Export
          </Text>
        </Flex>

        <Flex direction="column" gap={2} mb={3}>
          <PreviewSwitch title="Bake background" isChecked={includeBg} onChange={setIncludeBg} />
          <PreviewSlider
            title="Padding"
            min={0}
            max={120}
            step={2}
            value={exportPad}
            valueUnit="px"
            onChange={setExportPad}
          />
          <PreviewSelect
            title="Raster scale"
            value={pngScale}
            options={[
              { value: '1', label: '1x' },
              { value: '2', label: '2x' },
              { value: '3', label: '3x' },
              { value: '4', label: '4x' }
            ]}
            onChange={setPngScale}
          />
        </Flex>

        <Flex direction="column" gap={2}>
          <ExportButton
            icon={Merge}
            label={copyStatus === 'merged' ? 'Copied!' : 'Merge & Copy (Mask-Ready)'}
            active={copyStatus === 'merged'}
            onClick={handleCopyMerged}
          />
          <Flex gap={2}>
            <ExportButton
              icon={Code2}
              label={copyStatus === 'svg' ? 'Copied!' : 'Copy SVG'}
              active={copyStatus === 'svg'}
              onClick={handleCopySVG}
              flex={1}
            />
            <ExportButton
              icon={Code2}
              label={copyStatus === 'react' ? 'Copied!' : 'Copy React'}
              active={copyStatus === 'react'}
              onClick={handleCopyReact}
              flex={1}
            />
          </Flex>
          <ExportButton
            icon={FileCode2}
            label={copyStatus === 'css' ? 'Copied!' : 'Copy CSS clip-path'}
            active={copyStatus === 'css'}
            onClick={handleCopyCSS}
          />
          <Flex gap={2}>
            <ExportButton icon={Download} label="SVG" onClick={handleDownloadSVG} flex={1} primary />
            <ExportButton icon={Image} label="PNG" onClick={() => downloadRaster('png')} flex={1} primary />
            <ExportButton icon={Image} label="JPG" onClick={() => downloadRaster('jpg')} flex={1} primary />
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
}
