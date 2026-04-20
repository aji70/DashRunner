/** Small nitro bottle with blue liquid (2D lane pickup). */
export function drawNitroBottle(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.translate(cx, cy);

  const bodyW = 12;
  const bodyH = 18;
  const neckW = 6;
  const neckH = 5;

  // Cap
  ctx.fillStyle = "rgba(148, 163, 184, 0.95)";
  ctx.fillRect(-neckW / 2, -bodyH / 2 - neckH - 2, neckW, 3);

  // Neck
  ctx.fillStyle = "rgba(100, 116, 139, 0.9)";
  ctx.fillRect(-neckW / 2, -bodyH / 2 - neckH, neckW, neckH);

  // Glass body
  ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
  ctx.fillRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH);
  ctx.strokeStyle = "rgba(186, 230, 253, 0.55)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH);

  // Blue liquid (lower portion)
  ctx.fillStyle = "rgba(14, 165, 233, 0.92)";
  ctx.fillRect(-bodyW / 2 + 2, -bodyH / 2 + 6, bodyW - 4, bodyH - 9);

  // Sheen strip
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(-bodyW / 2 + 2, -bodyH / 2 + 2, 2, bodyH - 4);

  ctx.shadowColor = "rgba(14, 165, 233, 0.65)";
  ctx.shadowBlur = 8;
  ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
  ctx.lineWidth = 1;
  ctx.strokeRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH);
  ctx.shadowBlur = 0;

  ctx.restore();
}
