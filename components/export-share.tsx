'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Share2, Copy, Download, Printer } from 'lucide-react'

interface ExportShareProps {
  routeCode: string
  routeName: string
  data: string
}

export function ExportShare({ routeCode, routeName, data }: ExportShareProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = `${routeCode}: ${routeName}\n\n${data}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>${routeCode} - ${routeName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .content { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h1>${routeCode}: ${routeName}</h1>
          <div class="content">${data}</div>
        </body>
      </html>
    `
    const printWindow = window.open('', '', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/?route=${routeCode}`
    if (navigator.share) {
      navigator.share({
        title: `NaviCebu - ${routeCode}`,
        text: `Check out route ${routeCode}: ${routeName}`,
        url: shareUrl,
      })
    } else {
      navigator.clipboard.writeText(shareUrl)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Export & Share
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="flex items-center gap-2"
            title="PDF export coming soon"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
