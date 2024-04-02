import { useRef, useState } from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~/components/ui/carousel'
import { Label } from '~/components/ui/label'

export function ProductImages({
  setImageFiles,
}: {
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>
}) {
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newFiles = Array.from(files)
      setImageFiles(prevFiles => [...prevFiles, ...newFiles])
      setPreviewUrls(prevUrls => [
        ...prevUrls,
        ...newFiles.map(file => URL.createObjectURL(file)),
      ])
    }
  }

  function removeImage(indexToRemove: number) {
    setImageFiles(prevFiles =>
      prevFiles.filter((_, index) => index !== indexToRemove),
    )
    setPreviewUrls(prevUrls =>
      prevUrls.filter((_, index) => index !== indexToRemove),
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <Label htmlFor="imageUpload" className="text-left">
          Imagens
        </Label>
        <input
          ref={fileInputRef}
          type="file"
          id="imageUpload"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          multiple
          accept="image/png, image/jpeg"
        />
        <label
          htmlFor="imageUpload"
          className="cursor-pointer rounded-lg border px-4 py-1 text-sm font-medium text-gray-600 transition-all hover:shadow-sm"
        >
          Adicionar
        </label>
      </div>

      {previewUrls.length > 0 ? (
        <div className="relative mt-4 w-full">
          <Carousel
            opts={{
              align: 'start',
            }}
            className="mx-auto w-full max-w-sm"
          >
            <CarouselContent>
              {previewUrls.map((url, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="group relative h-24 w-24">
                    <img
                      className="h-24 w-24 rounded-lg object-cover"
                      src={url as string}
                      alt="preview"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-0 top-0 h-6 w-6 rounded-lg bg-gray-400 p-1 text-xs text-white opacity-0 group-hover:opacity-100"
                      style={{ transition: 'opacity 0.2s' }}
                    >
                      X
                    </button>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      ) : (
        <div className="mt-2 flex justify-center rounded-md border border-dashed p-4">
          <p className="text-sm text-gray-500">
            Adicione suas imagens clicando no botão acima
          </p>
        </div>
      )}
    </div>
  )
}
