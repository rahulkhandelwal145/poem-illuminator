const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX']

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
  // Parchment fill
  doc.setFillColor(250, 246, 238)
  doc.rect(0, 0, W, H, 'F')
  // Outer border
  doc.setDrawColor(184, 150, 62)
  doc.setLineWidth(1.5)
  doc.rect(22, 22, W - 44, H - 44)
  // Inner border
  doc.setDrawColor(212, 175, 106)
  doc.setLineWidth(0.5)
  doc.rect(28, 28, W - 56, H - 56)
  // Corner marks
  const arms = 10
  const corners = [[22, 22], [W - 22, 22], [22, H - 22], [W - 22, H - 22]]
  corners.forEach(([cx, cy]) => {
    doc.setDrawColor(184, 150, 62)
    doc.setLineWidth(1.2)
    doc.line(cx - arms, cy, cx + arms, cy)
    doc.line(cx, cy - arms, cx, cy + arms)
  })
}

function drawDoubleRule(doc, y, W) {
  doc.setDrawColor(184, 150, 62)
  doc.setLineWidth(1)
  doc.line(40, y, W - 40, y)
  doc.setLineWidth(0.3)
  doc.line(40, y + 4, W - 40, y + 4)
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

  // ── Cover Page ──
  drawPageShell(doc, W, H)

  doc.setFont('times', 'bolditalic')
  doc.setFontSize(32)
  doc.setTextColor(26, 18, 8)
  doc.text(poem.title || 'Untitled', W / 2, 105, { align: 'center' })

  if (poem.author) {
    doc.setFont('times', 'italic')
    doc.setFontSize(14)
    doc.setTextColor(122, 104, 72)
    doc.text(poem.author, W / 2, 128, { align: 'center' })
  }

  drawDoubleRule(doc, 148, W)

  doc.setFont('times', 'italic')
  doc.setFontSize(9)
  doc.setTextColor(184, 150, 62)
  doc.text('◆ verse made luminous ◆', W / 2, 166, { align: 'center' })

  // ── Stanza Pages ──
  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    doc.addPage()
    drawPageShell(doc, W, H)

    let textStartY = 80

    if (result.selectedImage) {
      try {
        const imgData = await loadImageAsBase64(result.selectedImage)
        const imgAreaH = H * 0.44
        doc.addImage(imgData, 'JPEG', 38, 38, W - 76, imgAreaH, undefined, 'MEDIUM')
        drawDoubleRule(doc, 38 + imgAreaH + 12, W)
        textStartY = 38 + imgAreaH + 30
      } catch {
        drawDoubleRule(doc, 55, W)
        textStartY = 80
      }
    } else {
      drawDoubleRule(doc, 55, W)
      textStartY = 80
    }

    // Stanza label
    doc.setFont('times', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(184, 150, 62)
    const label = `◆ Stanza ${ROMAN[i] || i + 1} ◆`
    doc.text(label, W / 2, textStartY, { align: 'center' })

    // Stanza text
    doc.setFont('times', 'italic')
    doc.setFontSize(13)
    doc.setTextColor(26, 18, 8)
    const lines = doc.splitTextToSize(result.stanza, W - 120)
    lines.forEach((line, li) => {
      doc.text(line, W / 2, textStartY + 20 + li * 22, { align: 'center' })
    })

    // Footer ornament
    doc.setFontSize(10)
    doc.setTextColor(184, 150, 62)
    doc.text('· ✦ ·', W / 2, H - 48, { align: 'center' })
  }

  const safeName = (poem.title || 'poem').replace(/[^a-z0-9]/gi, '-').toLowerCase()
  doc.save(`${safeName}-illuminated.pdf`)
}
