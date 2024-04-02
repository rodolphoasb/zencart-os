import { useRef } from 'react'
import { XIcon } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~/components/ui/carousel'
import { Label } from '~/components/ui/label'

export function ProductImagesEdit({
  imageFiles,
  setImageFiles,
  currentImages,
  setCurrentImages,
}: {
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>
  currentImages?: string[]
  setCurrentImages: React.Dispatch<React.SetStateAction<string[]>>
  imageFiles: File[]
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function removeImage(indexToRemove: number) {
    setImageFiles(prevFiles =>
      prevFiles.filter((_, index) => index !== indexToRemove),
    )

    setCurrentImages(prevUrls =>
      prevUrls.filter((_, index) => index !== indexToRemove),
    )
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || [])
    setImageFiles(prevFiles => [...prevFiles, ...newFiles])
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <Label htmlFor="storeName" className="text-left">
          Imagens
        </Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          multiple
        />
        <button
          type="button"
          className={`rounded-lg border px-4 py-1 text-sm font-medium text-gray-600 transition-all hover:shadow-sm`}
          onClick={triggerFileInput}
        >
          Adicionar
        </button>
      </div>

      {[
        ...(currentImages ?? []),
        ...imageFiles.map(file => URL.createObjectURL(file)),
      ].length > 0 ? (
        <div className="relative mt-4 w-full">
          <Carousel
            opts={{
              align: 'start',
            }}
            className="mx-auto w-full max-w-sm"
          >
            <CarouselContent>
              {[
                ...(currentImages ?? []),
                ...imageFiles.map(file => URL.createObjectURL(file)),
              ].map((url, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="relative h-24 w-24">
                    <img
                      className="h-24 w-24 rounded-lg object-cover"
                      src={url}
                      alt="preview"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      type="button"
                      className="absolute -right-[0.5px] -top-[0.5px] flex h-6 w-6 items-center justify-center rounded-bl-lg rounded-tr-lg border-b border-l bg-white p-1 text-xs transition-all"
                      style={{ transition: 'opacity 0.2s' }}
                    >
                      <XIcon className="h-3.5 w-3.5" />
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
