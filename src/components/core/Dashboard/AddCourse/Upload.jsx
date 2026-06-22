import { useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { FiUploadCloud } from "react-icons/fi"

export default function Upload({
  name,
  label,
  register,
  setValue,
  errors,
  video = false,
  viewData = null,
  editData = null,
}) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewSource, setPreviewSource] = useState(
    viewData ? viewData : editData ? editData : ""
  )
  const isRequired = !viewData && !editData

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      previewFile(file)
      setSelectedFile(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: !video
      ? { "image/*": [".jpeg", ".jpg", ".png", ".webp"] }
      : { "video/*": [".mp4", ".webm", ".mov"] },
    onDrop,
    multiple: false,
    noClick: true,
    disabled: !!viewData,
  })

  const previewFile = (file) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setPreviewSource(reader.result)
    }
  }

  const clearSelection = () => {
    setPreviewSource("")
    setSelectedFile(null)
    setValue(name, editData ? editData : null)
  }

  useEffect(() => {
    register(name, {
      required: isRequired,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [register, isRequired])

  useEffect(() => {
    if (selectedFile) {
      setValue(name, selectedFile)
      return
    }

    if (viewData || editData) {
      setValue(name, viewData || editData)
      return
    }

    setValue(name, null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile, setValue, viewData, editData])

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label}{" "}
        {isRequired && <sup className="text-pink-200">*</sup>}
      </label>
      <div
        {...getRootProps()}
        className={`${
          isDragActive ? "bg-richblack-600" : "bg-richblack-700"
        } flex min-h-[250px] items-center justify-center rounded-md border-2 border-dotted border-richblack-500`}
      >
        <input {...getInputProps()} id={name} />
        {previewSource ? (
          <div className="flex w-full flex-col p-6">
            {!video ? (
              <img
                src={previewSource}
                alt="Preview"
                className="h-full w-full rounded-md object-cover"
              />
            ) : (
              <video
                controls
                playsInline
                src={previewSource}
                className="aspect-video w-full rounded-md bg-richblack-900 object-contain"
              />
            )}
            {!viewData && (
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={open}
                  className="rounded-md bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900"
                >
                  Change file
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-sm text-richblack-400 underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex w-full flex-col items-center p-6">
            <div className="grid aspect-square w-14 place-items-center rounded-full bg-pure-greys-800">
              <FiUploadCloud className="text-2xl text-yellow-50" />
            </div>
            <p className="mt-2 max-w-[260px] text-center text-sm text-richblack-200">
              Drag and drop {!video ? "an image" : "a video"} here, or use the
              button below to browse your files.
            </p>
            <button
              type="button"
              onClick={open}
              className="mt-4 rounded-md bg-yellow-50 px-5 py-2 text-sm font-semibold text-richblack-900 transition-colors hover:bg-yellow-100"
            >
              Browse files
            </button>
            <ul className="mt-10 flex list-disc justify-between space-x-12 text-center text-xs text-richblack-200">
              <li>Aspect ratio 16:9</li>
              <li>Recommended size 1024x576</li>
            </ul>
          </div>
        )}
      </div>
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  )
}
