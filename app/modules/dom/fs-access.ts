import { useStore } from "@nanostores/react"
import { atom } from "nanostores"
import { useEffect } from "react"

declare global {
  interface Window {
    showDirectoryPicker: (options: {
      mode?: "read" | "readwrite"
    }) => Promise<Directory>
  }

  interface Directory {
    getFileHandle: (
      name: string,
      options?: { create?: boolean },
    ) => Promise<FileHandle>
  }

  interface FileHandle {
    createWritable: () => Promise<Writable>
  }

  type WritableData = BufferSource | Blob | string

  interface Writable {
    write: (data: WritableData) => Promise<void>
    close: () => Promise<void>
  }
}

// externalize the state, so it's shared across all hooks usage
// and true on render if another hook already set it
const fsAccessSupported = atom(false)

export function useFsAccessSupported() {
  // we want to set this from an effect,
  // which serves as our "if in the browser" check
  // and sidesteps hydration issues
  useEffect(() => fsAccessSupported.set("showDirectoryPicker" in window), [])

  return useStore(fsAccessSupported)
}
