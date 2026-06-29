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

  const titleY = H / 2 - 30
  doc.setFont('times', 'bolditalic')
  doc.setFontSize(42)
  doc.setTextColor(26, 18, 8)
  doc.text(poem.title || 'Untitled', W / 2, titleY, { align: 'center' })

  if (poem.author) {
    doc.setDrawColor(184, 150, 62)
    doc.setLineWidth(0.8)
    doc.line(38, titleY + 18, W - 38, titleY + 18)
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
        doc.setDrawColor(184, 150, 62)
        doc.setLineWidth(0.8)
        doc.line(38, 36 + imgH + 10, W - 38, 36 + imgH + 10)
        doc.setLineWidth(0.25)
        doc.line(38, 36 + imgH + 14, W - 38, 36 + imgH + 14)
        textStartY = 36 + imgH + 34
      } catch {
        doc.setDrawColor(184, 150, 62)
        doc.setLineWidth(0.8)
        doc.line(38, 52, W - 38, 52)
        doc.setLineWidth(0.25)
        doc.line(38, 56, W - 38, 56)
        textStartY = 75
      }
    } else {
      doc.setDrawColor(184, 150, 62)
      doc.setLineWidth(0.8)
      doc.line(38, 52, W - 38, 52)
      doc.setLineWidth(0.25)
      doc.line(38, 56, W - 38, 56)
      textStartY = 75
    }

    // Stanza text
    doc.setFont('times', 'italic')
    doc.setFontSize(13.5)
    doc.setTextColor(26, 18, 8)
    const stanzaLines = doc.splitTextToSize(result.stanza || '', W - 130)

    const remainingH = H - 42 - textStartY - 50
    const textBlockH = stanzaLines.length * 23
    const centeredY = textStartY + 18 + Math.max(0, (remainingH - textBlockH) / 2)

    stanzaLines.forEach((line, li) => {
      doc.text(line, W / 2, centeredY + li * 23, { align: 'center' })
    })

    // Footer ornament
    doc.setFontSize(10)
    doc.setTextColor(184, 150, 62)
    doc.text('·  ·  ·', W / 2, H - 38, { align: 'center' })
  }

  const safeName = (poem.title || 'poem').replace(/[^a-z0-9]/gi, '-').toLowerCase()
  doc.save(`${safeName}-illuminated.pdf`)
}

const ROMAN_PDF = ['I','II','III','IV','V','VI','VII','VIII','IX','X',
                   'XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX']

export async function exportBookPDF({ poems, bookTitle }) {
  if (!window.jspdf) {
    alert('PDF library not loaded. Please refresh and try again.')
    return
  }

  const { jsPDF } = window.jspdf
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()

  doc.deletePage(1)

  // ── Collection Cover + Index ───────────────────────────────────────────────
  doc.addPage()
  drawPageShell(doc, W, H)

  // Title block (upper third)
  const titleY = 130
  doc.setFont('times', 'bolditalic')
  doc.setFontSize(40)
  doc.setTextColor(26, 18, 8)
  doc.text(bookTitle, W / 2, titleY, { align: 'center' })

  // Double rule under title
  doc.setDrawColor(184, 150, 62)
  doc.setLineWidth(1.0)
  doc.line(48, titleY + 18, W - 48, titleY + 18)
  doc.setLineWidth(0.25)
  doc.line(48, titleY + 23, W - 48, titleY + 23)

  // "I  N  D  E  X" label with letter spacing
  doc.setFont('times', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(184, 150, 62)
  doc.text('I  N  D  E  X', W / 2, titleY + 46, { align: 'center' })

  // Index box
  const boxL = 52
  const boxR = W - 52
  const rowH = 32
  const indexStartY = titleY + 60
  const boxTop = indexStartY - 8
  const boxBottom = indexStartY + poems.length * rowH + 8

  // Box border (thin inner, thicker outer)
  doc.setDrawColor(184, 150, 62)
  doc.setLineWidth(0.6)
  doc.line(boxL, boxTop, boxR, boxTop)
  doc.setLineWidth(0.18)
  doc.line(boxL, boxTop + 4, boxR, boxTop + 4)
  doc.line(boxL, boxBottom - 4, boxR, boxBottom - 4)
  doc.setLineWidth(0.6)
  doc.line(boxL, boxBottom, boxR, boxBottom)

  // Index rows
  poems.forEach((entry, idx) => {
    const y = indexStartY + 18 + idx * rowH

    // Roman numeral
    doc.setFont('times', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(184, 150, 62)
    doc.text(ROMAN_PDF[idx] ?? String(idx + 1), boxL + 14, y)

    // Poem title
    doc.setFont('times', 'bolditalic')
    doc.setFontSize(14)
    doc.setTextColor(26, 18, 8)
    const titleText = entry.poem.title || 'Untitled'
    doc.text(titleText, boxL + 46, y)

    // Author (right-aligned)
    if (entry.poem.author) {
      doc.setFont('times', 'italic')
      doc.setFontSize(11)
      doc.setTextColor(122, 104, 72)
      doc.text(entry.poem.author, boxR - 14, y, { align: 'right' })

      // Leader dots between title and author
      const titleEndX = boxL + 46 + doc.getTextWidth(titleText) + 6
      const authorStartX = boxR - 14 - doc.getTextWidth(entry.poem.author) - 6
      if (authorStartX > titleEndX + 10) {
        doc.setFontSize(8)
        doc.setTextColor(184, 150, 62)
        const dotStep = 6
        for (let x = titleEndX; x < authorStartX; x += dotStep) {
          doc.text('.', x, y)
        }
      }
    }

    // Row divider (not after last)
    if (idx < poems.length - 1) {
      doc.setDrawColor(184, 150, 62)
      doc.setLineWidth(0.15)
      doc.line(boxL + 14, y + 10, boxR - 14, y + 10)
    }
  })

  // Ornament below index box
  doc.setFont('times', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(184, 150, 62)
  doc.text('*   *   *', W / 2, boxBottom + 22, { align: 'center' })

  // ── Per-poem sections ─────────────────────────────────────────────────────
  for (let pi = 0; pi < poems.length; pi++) {
    const { poem, results } = poems[pi]

    // Poem divider page
    doc.addPage()
    drawPageShell(doc, W, H)

    // Small collection label at top
    doc.setFont('times', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(184, 150, 62)
    doc.text(bookTitle, W / 2, 46, { align: 'center' })

    // Roman numeral for this poem
    doc.setFont('times', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(184, 150, 62)
    doc.text(ROMAN_PDF[pi] ?? String(pi + 1), W / 2, H / 2 - 52, { align: 'center' })

    // Thin rule
    doc.setDrawColor(184, 150, 62)
    doc.setLineWidth(0.4)
    doc.line(W / 2 - 24, H / 2 - 42, W / 2 + 24, H / 2 - 42)

    // Poem title
    doc.setFont('times', 'bolditalic')
    doc.setFontSize(34)
    doc.setTextColor(26, 18, 8)
    doc.text(poem.title || 'Untitled', W / 2, H / 2 - 16, { align: 'center' })

    if (poem.author) {
      doc.setDrawColor(184, 150, 62)
      doc.setLineWidth(0.8)
      doc.line(48, H / 2 + 4, W - 48, H / 2 + 4)
      doc.setFont('times', 'italic')
      doc.setFontSize(15)
      doc.setTextColor(122, 104, 72)
      doc.text(poem.author, W / 2, H / 2 + 28, { align: 'center' })
    }

    // Stanza pages
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      doc.addPage()
      drawPageShell(doc, W, H)

      // Header: collection · poem title
      doc.setFont('times', 'italic')
      doc.setFontSize(7.5)
      doc.setTextColor(184, 150, 62)
      doc.text(poem.title || 'Untitled', 38, 38)
      doc.text(`${i + 1} / ${results.length}`, W - 38, 38, { align: 'right' })

      let textStartY

      if (result.selectedImage) {
        try {
          const imgData = await loadImageAsBase64(result.selectedImage)
          const imgH = H * 0.46
          doc.addImage(imgData, 'JPEG', 36, 46, W - 72, imgH, undefined, 'MEDIUM')
          doc.setDrawColor(184, 150, 62)
          doc.setLineWidth(0.8)
          doc.line(38, 46 + imgH + 10, W - 38, 46 + imgH + 10)
          doc.setLineWidth(0.25)
          doc.line(38, 46 + imgH + 14, W - 38, 46 + imgH + 14)
          textStartY = 46 + imgH + 34
        } catch {
          doc.setDrawColor(184, 150, 62)
          doc.setLineWidth(0.8)
          doc.line(38, 52, W - 38, 52)
          doc.setLineWidth(0.25)
          doc.line(38, 56, W - 38, 56)
          textStartY = 75
        }
      } else {
        doc.setDrawColor(184, 150, 62)
        doc.setLineWidth(0.8)
        doc.line(38, 52, W - 38, 52)
        doc.setLineWidth(0.25)
        doc.line(38, 56, W - 38, 56)
        textStartY = 75
      }

      doc.setFont('times', 'italic')
      doc.setFontSize(13.5)
      doc.setTextColor(26, 18, 8)
      const stanzaLines = doc.splitTextToSize(result.stanza || '', W - 130)
      const remainingH = H - 42 - textStartY - 50
      const textBlockH = stanzaLines.length * 23
      const centeredY = textStartY + 18 + Math.max(0, (remainingH - textBlockH) / 2)
      stanzaLines.forEach((line, li) => {
        doc.text(line, W / 2, centeredY + li * 23, { align: 'center' })
      })

      doc.setFontSize(10)
      doc.setTextColor(184, 150, 62)
      doc.text('·  ·  ·', W / 2, H - 38, { align: 'center' })
    }
  }

  const safeName = bookTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  doc.save(`${safeName}.pdf`)
}
