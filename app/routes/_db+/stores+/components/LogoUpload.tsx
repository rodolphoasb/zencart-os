import { useRef, useState } from 'react'
import { ImageIcon, Repeat } from 'lucide-react'

export function LogoUpload({
  logoUrl,
  setLogoUrl,
  setFile,
}: {
  logoUrl: string
  setLogoUrl: (url: string) => void
  setFile: (file: File) => void
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Function to handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={`h-24 w-24 shrink-0 overflow-hidden rounded-full bg-gray-50 transition-all hover:bg-gray-100/80`}
    >
      <input
        type="file"
        accept="image/png, image/jpeg"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        id="fileInput"
        ref={fileInputRef}
      />
      <label htmlFor="fileInput">
        {previewUrl ? (
          <div className="group relative h-24 w-24">
            <img
              className="h-full w-full object-cover"
              src={previewUrl}
              alt="preview"
            />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 transform">
              <button
                type="button"
                onClick={triggerFileInput}
                className={`absolute bottom-0 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg bg-gray-50 text-gray-500 opacity-0 transition-all group-hover:opacity-100`}
              >
                <Repeat className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : logoUrl ? (
          <div className="group relative h-24 w-24">
            <img
              className="h-24 w-24 object-cover"
              src={logoUrl}
              alt="preview"
            />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 transform">
              <button
                type="button"
                onClick={triggerFileInput}
                className={`absolute bottom-0 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg bg-gray-50 text-gray-500 opacity-0 transition-all group-hover:opacity-100`}
              >
                <Repeat className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={triggerFileInput}
            className={`flex h-full w-full items-center justify-center rounded-full text-gray-400`}
          >
            <ImageIcon />
          </button>
        )}
      </label>
    </div>
  )
}
