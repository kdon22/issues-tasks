declare module 'react-image-crop' {
  import { Component } from 'react'

  export interface Crop {
    x: number
    y: number
    width: number
    height: number
    unit?: 'px' | '%'
  }

  export interface ReactCropProps {
    crop: Crop
    onChange: (crop: Crop) => void
    aspect?: number
    className?: string
    children: React.ReactNode
  }

  export default class ReactCrop extends Component<ReactCropProps> {}
}

declare module 'browser-image-compression' {
  export interface Options {
    maxSizeMB: number
    maxWidthOrHeight?: number
    useWebWorker?: boolean
  }

  export default function imageCompression(
    file: File,
    options: Options
  ): Promise<Blob>
} 