'use client'

import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import { Download, Share2 } from 'lucide-react'
import { useState } from 'react'

interface QRCodeDisplayProps {
  value: string
  title?: string
}

export function QRCodeDisplay({
  value,
  title = 'Verification QR Code',
}: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  const downloadQR = () => {
    const canvas = document.getElementById(
      'qr-code-canvas'
    ) as HTMLCanvasElement | null

    if (!canvas) return

    const pngFile = canvas.toDataURL('image/png')
    const downloadLink = document.createElement('a')
    downloadLink.download = `agrochain-verification-${Date.now()}.png`
    downloadLink.href = pngFile
    downloadLink.click()
  }

  const shareQR = async () => {
    if (!navigator.share) return

    try {
      await navigator.share({
        title: 'AgroChain Verification',
        text: 'Verify this AgroChain record',
        url: value,
      })
    } catch {
      // user cancelled share
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>

      <div className="flex flex-col items-center space-y-4">
        {/* Hidden canvas for PNG download */}
        <QRCodeCanvas
          id="qr-code-canvas"
          value={value}
          size={200}
          level="H"
          className="hidden"
        />

        {/* Visible SVG */}
        <div className="p-4 bg-white border rounded-lg">
          <QRCodeSVG value={value} size={200} level="H" />
        </div>

        <div className="text-center text-sm text-gray-600">
          Scan with any QR app or camera
        </div>

        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={copyToClipboard}
            className="text-agro-blue hover:underline"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <span className="text-gray-400">•</span>
          <button
            onClick={shareQR}
            className="flex items-center gap-1 text-agro-blue"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={downloadQR}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download QR
          </button>

          <button
            onClick={shareQR}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  )
}
