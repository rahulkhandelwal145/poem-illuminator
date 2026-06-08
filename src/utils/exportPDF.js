const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X',
               'XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX']

function loadImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext('2d').drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/jpeg', 0.88))
    }
    img.onerror = reject
    img.src = url
  })
}

function drawPageShell(doc, W, H) {
  doc.setFillColor(250, 246, 238)
  doc.rect(0, 0, W, H, 'F')
  doc.setDrawColor(184, 150, 62)
  doc.setLineWidth(1.5)
  doc.rect(20, 20, W - 40, H - 40)
  doc.setDrawColor(212, 175, 106)
  doc.setLineWidth(0.4)
  doc.rect(26, 26, W - 52, H - 52)
  const arms = 12
  const corners = [[20,20],[W-20,20],[20,H-20],[W-20,H-20]]
  corners.forEach(([cx, cy]) => {
    doc.setDrawColor(184, 150, 62)
    doc.setLineWidth(1.2)
    doc.line(cx - arms, cy, cx + arms, cy)
    doc.line(cx, cy - arms, cx, cy + arms)
  })
}

function drawRule(doc, y, W, double = true) {
  doc.setDrawColor(184, 150, 62)
  doc.setLineWidth(0.8)
  doc.line(38, y, W - 38, y)
  if (double) {
    doc.setLineWidth(0.25)
    doc.line(38, y + 4, W - 38, y + 4)
  }
}

export async function exportPDF({ poem, results }) {
  if (!window.jspdf) {
    alert('PDF library not loaded. Please refresh and try again.')
    return
  }

  const { jsPDF } = window.jspdf
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()

  // Remove the auto-created blank page and manage all pages explicitly
  doc.deletePage(1)

  // ── Cover Page ────────────────────────────────────────────────────────────
  doc.addPage()
  drawPageShell(doc, W, H)

  // Title centred vertically on the page
  const titleY = H / 2 - 30
  doc.setFont('times', 'bolditalic')
  doc.setFontSize(42)
  doc.setTextColor(26, 18, 8)
  doc.text(poem.title || 'Untitled', W / 2, titleY, { align: 'center' })

  if (poem.author) {
    drawRule(doc, titleY + 18, W, false)
    doc.setFont('times', 'italic')
    doc.setFontSize(16)
    doc.setTextColor(122, 104, 72)
    doc.text(poem.author, W / 2, titleY + 42, { align: 'center' })
  }

  // ── Stanza Pages ──────────────────────────────────────────────────────────
  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    doc.addPage()
    drawPageShell(doc, W, H)

    // Page number (top right)
    doc.setFont('times', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(184, 150, 62)
    doc.text(`${i + 1} / ${results.length}`, W - 38, 38, { align: 'right' })

    let textStartY

    if (result.selectedImage) {
      try {
        const imgData = await loadImageAsBase64(result.selectedImage)
        const imgH = H * 0.46
        doc.addImage(imgData, 'JPEG', 36, 36, W - 72, imgH, undefined, 'MEDIUM')
        drawRule(doc, 36 + imgH + 10, W)
        textStartY = 36 + imgH + 30
      } catch {
        drawRule(doc, 52, W)
        textStartY = 75
      }
    } else {
      drawRule(doc, 52, W)
      textStartY = 75
    }

    // Stanza label — use Roman numeral with Latin-1 safe delimiters
    const label = `—  Stanza ${ROMAN[i] || i + 1}  —`
    doc.setFont('times', 'italic')
    doc.setFontSize(8.5)
    doc.setTextColor(184, 150, 62)
    doc.text(label, W / 2, textStartY, { align: 'center' })

    // Stanza text
    doc.setFont('times', 'italic')
    doc.setFontSize(13.5)
    doc.setTextColor(26, 18, 8)
    const stanzaLines = doc.splitTextToSize(result.stanza || '', W - 130)

    // Vertically center the text block in the remaining space
    const remainingH = H - 42 - textStartY - 50
    const textBlockH = stanzaLines.length * 23
    const centeredY = textStartY + 18 + Math.max(0, (remainingH - textBlockH) / 2)

    stanzaLines.forEach((line, li) => {
      doc.text(line, W / 2, centeredY + li * 23, { align: 'center' })
    })

    // Footer ornament — use Latin-1 middle dots
    doc.setFontSize(10)
    doc.setTextColor(184, 150, 62)
    doc.text('·  ·  ·', W / 2, H - 38, { align: 'center' })
  }

  const safeName = (poem.title || 'poem').replace(/[^a-z0-9]/gi, '-').toLowerCase()
  doc.save(`${safeName}-illuminated.pdf`)
}
