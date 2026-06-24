/**
 * Canvas-native document type icon drawing functions.
 *
 * Each function draws a small vector icon at the given (x, y) center
 * within a bounding box of `size` pixels. All drawing uses the current
 * canvas fill/stroke styles set by the caller.
 */

/** Shared rounded-rectangle path helper (also used by the renderer). */
export function roundRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
): void {
	ctx.beginPath()
	ctx.moveTo(x + r, y)
	ctx.lineTo(x + w - r, y)
	ctx.arcTo(x + w, y, x + w, y + r, r)
	ctx.lineTo(x + w, y + h - r)
	ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
	ctx.lineTo(x + r, y + h)
	ctx.arcTo(x, y + h, x, y + h - r, r)
	ctx.lineTo(x, y + r)
	ctx.arcTo(x, y, x + r, y, r)
	ctx.closePath()
}

/**
 * Draw the appropriate document-type icon on the canvas.
 *
 * Wraps the drawing in save/restore so callers don't need to worry about
 * state leaking. Only `iconColor` is needed from the theme.
 */
export function drawDocIcon(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
	type: string,
	iconColor: string,
): void {
	ctx.save()
	ctx.fillStyle = iconColor
	ctx.strokeStyle = iconColor
	ctx.lineWidth = Math.max(1, size / 12)
	ctx.lineCap = "round"
	ctx.lineJoin = "round"

	switch (type) {
		case "webpage":
		case "url":
			drawGlobeIcon(ctx, x, y, size)
			break
		case "pdf":
			drawTextLabel(ctx, x, y, size, "PDF", 0.35)
			break
		case "md":
		case "markdown":
			drawTextLabel(ctx, x, y, size, "MD", 0.3)
			break
		case "doc":
		case "docx":
		case "word":
		case "microsoft_word":
			drawTextLabel(ctx, x, y, size, "W", 0.4)
			break
		case "csv":
		case "excel":
		case "microsoft_excel":
		case "google_sheet":
			drawGridIcon(ctx, x, y, size)
			break
		case "json":
			drawBracesIcon(ctx, x, y, size)
			break
		case "notion":
		case "notion_doc":
			drawNotionIcon(ctx, x, y, size)
			break
		case "google_doc":
			drawGoogleDocIcon(ctx, x, y, size)
			break
		case "google_slide":
		case "powerpoint":
		case "microsoft_powerpoint":
			drawSlidesIcon(ctx, x, y, size)
			break
		case "google_drive":
		case "onedrive":
			drawCloudIcon(ctx, x, y, size)
			break
		case "tweet":
			drawXIcon(ctx, x, y, size)
			break
		case "youtube":
		case "video":
			drawPlayIcon(ctx, x, y, size)
			break
		case "image":
			drawImageIcon(ctx, x, y, size)
			break
		case "text":
		case "note":
			drawTextNoteIcon(ctx, x, y, size)
			break
		case "onenote":
		case "microsoft_onenote":
			drawTextLabel(ctx, x, y, size, "N", 0.4)
			break
		case "mcp":
			drawTextLabel(ctx, x, y, size, "MCP", 0.25)
			break
		default:
			drawDocOutline(ctx, x, y, size)
			break
	}

	ctx.restore()
}

// ---------------------------------------------------------------------------
// Individual icon drawing helpers
// ---------------------------------------------------------------------------

function drawTextLabel(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
	text: string,
	fontRatio: number,
): void {
	ctx.font = `bold ${size * fontRatio}px sans-serif`
	ctx.textAlign = "center"
	ctx.textBaseline = "middle"
	ctx.fillText(text, x, y)
}

function drawGlobeIcon(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
): void {
	const r = size * 0.4
	ctx.beginPath()
	ctx.arc(x, y, r, 0, Math.PI * 2)
	ctx.stroke()
	ctx.beginPath()
	ctx.ellipse(x, y, r * 0.4, r, 0, 0, Math.PI * 2)
	ctx.stroke()
	ctx.beginPath()
	ctx.moveTo(x - r, y)
	ctx.lineTo(x + r, y)
	ctx.stroke()
}

function drawGridIcon(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
): void {
	const w = size * 0.7
	const h = size * 0.7
	ctx.strokeRect(x - w / 2, y - h / 2, w, h)
	ctx.beginPath()
	ctx.moveTo(x, y - h / 2)
	ctx.lineTo(x, y + h / 2)
	ctx.moveTo(x - w / 2, y)
	ctx.lineTo(x + w / 2, y)
	ctx.stroke()
}

function drawBracesIcon(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
): void {
	const w = size * 0.6
	const h = size * 0.8
	ctx.beginPath()
	ctx.moveTo(x - w / 4, y - h / 2)
	ctx.quadraticCurveTo(x - w / 2, y - h / 3, x - w / 2, y)
	ctx.quadraticCurveTo(x - w / 2, y + h / 3, x - w / 4, y + h / 2)
	ctx.stroke()
	ctx.beginPath()
	ctx.moveTo(x + w / 4, y - h / 2)
	ctx.quadraticCurveTo(x + w / 2, y - h / 3, x + w / 2, y)
	ctx.quadraticCurveTo(x + w / 2, y + h / 3, x + w / 4, y + h / 2)
	ctx.stroke()
}

function drawDocOutline(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
): void {
	const w = size * 0.7
	const h = size * 0.85
	const fold = size * 0.2
	ctx.beginPath()
	ctx.moveTo(x - w / 2, y - h / 2)
	ctx.lineTo(x + w / 2 - fold, y - h / 2)
	ctx.lineTo(x + w / 2, y - h / 2 + fold)
	ctx.lineTo(x + w / 2, y + h / 2)
	ctx.lineTo(x - w / 2, y + h / 2)
	ctx.closePath()
	ctx.stroke()
	const sp = size * 0.15
	const lw = size * 0.4
	ctx.beginPath()
	ctx.moveTo(x - lw / 2, y - sp)
	ctx.lineTo(x + lw / 2, y - sp)
	ctx.moveTo(x - lw / 2, y)
	ctx.lineTo(x + lw / 2, y)
	ctx.moveTo(x - lw / 2, y + sp)
	ctx.lineTo(x + lw / 2, y + sp)
	ctx.stroke()
}

/** Draw a simplified Notion "N" logo mark */
function drawNotionIcon(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
): void {
	const w = size * 0.5
	const h = size * 0.6
	const r = size * 0.08
	ctx.lineWidth = Math.max(1, size / 14)
	roundRect(ctx, x - w / 2, y - h / 2, w, h, r)
	ctx.stroke()
	// Inner "N" shape
	const inset = size * 0.12
	const left = x - w / 2 + inset
	const right = x + w / 2 - inset
	const top = y - h / 2 + inset
	const bottom = y + h / 2 - inset
	ctx.beginPath()
	ctx.moveTo(left, top)
	ctx.lineTo(left, bottom)
	ctx.moveTo(left, top)
	ctx.lineTo(right, bottom)
	ctx.moveTo(right, top)
	ctx.lineTo(right, bottom)
	ctx.stroke()
}

/** Draw a Google Docs icon (document with lines) */
function drawGoogleDocIcon(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
): void {
	const w = size * 0.55
	const h = size * 0.7
	const fold = size * 0.15
	ctx.beginPath()
	ctx.moveTo(x - w / 2, y - h / 2)
	ctx.lineTo(x + w / 2 - fold, y - h / 2)
	ctx.lineTo(x + w / 2, y - h / 2 + fold)
	ctx.lineTo(x + w / 2, y + h / 2)
	ctx.lineTo(x - w / 2, y + h / 2)
	ctx.closePath()
	ctx.stroke()
	const lineW = w * 0.6
	const sp = size * 0.1
	ctx.beginPath()
	ctx.moveTo(x - lineW / 2, y - sp)
	ctx.lineTo(x + lineW / 2, y - sp)
	ctx.moveTo(x - lineW / 2, y + sp * 0.3)
	ctx.lineTo(x + lineW / 2, y + sp * 0.3)
	ctx.moveTo(x - lineW / 2, y + sp * 1.6)
	ctx.lineTo(x + lineW / 3, y + sp * 1.6)
	ctx.stroke()
}

/** Draw a slides/presentation icon (rectangle with play triangle) */
function drawSlidesIcon(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
): void {
	const w = size * 0.7
	const h = size * 0.5
	ctx.strokeRect(x - w / 2, y - h / 2, w, h)
	const triSize = size * 0.15
	ctx.beginPath()
	ctx.moveTo(x - triSize * 0.5, y - triSize * 0.7)
	ctx.lineTo(x - triSize * 0.5, y + triSize * 0.7)
	ctx.lineTo(x + triSize * 0.7, y)
	ctx.closePath()
	ctx.fill()
}

/** Draw a cloud icon for drive/storage types */
function drawCloudIcon(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
): void {
	const s = size * 0.35
	ctx.beginPath()
	ctx.arc(x - s * 0.3, y + s * 0.1, s * 0.5, Math.PI * 0.7, Math.PI * 1.9)
	ctx.arc(x + s * 0.1, y - s * 0.3, s * 0.55, Math.PI * 1.1, Math.PI * 0.3)
	ctx.arc(x + s * 0.5, y + s * 0.1, s * 0.4, Math.PI * 1.4, Math.PI * 0.6)
	ctx.lineTo(x - s * 0.7, y + s * 0.45)
	ctx.closePath()
	ctx.stroke()
}

/** Draw an X (formerly Twitter) icon */
function drawXIcon(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
): void {
	const s = size * 0.3
	ctx.lineWidth = Math.max(1.5, size / 10)
	ctx.beginPath()
	ctx.moveTo(x - s, y - s)
	ctx.lineTo(x + s, y + s)
	ctx.moveTo(x + s, y - s)
	ctx.lineTo(x - s, y + s)
	ctx.stroke()
}

/** Draw a play button icon for video/youtube */
function drawPlayIcon(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
): void {
	const r = size * 0.38
	const w = r * 2.2
	const h = r * 1.5
	const cr = size * 0.08
	roundRect(ctx, x - w / 2, y - h / 2, w, h, cr)
	ctx.stroke()
	const triH = size * 0.22
	ctx.beginPath()
	ctx.moveTo(x - triH * 0.45, y - triH)
	ctx.lineTo(x - triH * 0.45, y + triH)
	ctx.lineTo(x + triH * 0.7, y)
	ctx.closePath()
	ctx.fill()
}

/** Draw an image/photo icon (landscape with mountain) */
function drawImageIcon(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
): void {
	const w = size * 0.7
	const h = size * 0.55
	ctx.strokeRect(x - w / 2, y - h / 2, w, h)
	ctx.beginPath()
	ctx.moveTo(x - w / 2 + w * 0.1, y + h / 2 - h * 0.1)
	ctx.lineTo(x - w * 0.05, y - h * 0.05)
	ctx.lineTo(x + w * 0.15, y + h * 0.15)
	ctx.lineTo(x + w * 0.25, y - h * 0.02)
	ctx.lineTo(x + w / 2 - w * 0.1, y + h / 2 - h * 0.1)
	ctx.stroke()
	const sunR = size * 0.06
	ctx.beginPath()
	ctx.arc(x - w * 0.15, y - h * 0.15, sunR, 0, Math.PI * 2)
	ctx.fill()
}

/** Draw a text/note icon (lines of text) */
function drawTextNoteIcon(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
): void {
	const w = size * 0.55
	const h = size * 0.6
	const sp = h / 5
	ctx.beginPath()
	for (let i = 0; i < 4; i++) {
		const lineY = y - h / 2 + sp * (i + 0.5)
		const lineW = i === 3 ? w * 0.6 : w
		ctx.moveTo(x - w / 2, lineY)
		ctx.lineTo(x - w / 2 + lineW, lineY)
	}
	ctx.stroke()
}
