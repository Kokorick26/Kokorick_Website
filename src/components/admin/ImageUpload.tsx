import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    folder?: string;
    className?: string;
    aspectRatio?: "square" | "video" | "auto";
    placeholder?: string;
}

export default function ImageUpload({
    value,
    onChange,
    folder = "general",
    className = "",
    aspectRatio = "video",
    placeholder = "Click or drag to upload image"
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const aspectClasses = {
        square: "aspect-square",
        video: "aspect-video",
        auto: "min-h-[200px]"
    };

    const handleUpload = async (file: File) => {
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            setError("Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed.");
            return;
        }

        // Validate file size (35MB)
        if (file.size > 35 * 1024 * 1024) {
            setError("File too large. Maximum size is 35MB.");
            return;
        }

        setUploading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("image", file);
            formData.append("folder", folder);

            const res = await fetch("/api/upload/image", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Upload failed");
            }

            const data = await res.json();
            onChange(data.url);
        } catch (err) {
            console.error("Upload error:", err);
            setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <div
                onClick={() => !uploading && inputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                    w-full ${aspectClasses[aspectRatio]} rounded-xl border-2 border-dashed 
                    flex flex-col items-center justify-center relative overflow-hidden cursor-pointer
                    transition-all duration-200
                    ${dragActive
                        ? "border-blue-500 bg-blue-500/10"
                        : value
                            ? "border-zinc-700 bg-zinc-800"
                            : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800"
                    }
                    ${uploading ? "pointer-events-none" : ""}
                `}
            >
                {uploading ? (
                    <div className="flex flex-col items-center gap-3 text-zinc-400">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="text-sm">Uploading...</span>
                    </div>
                ) : value ? (
                    <>
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        {/* Always visible change indicator */}
                        <div className="absolute bottom-2 right-2 flex gap-2">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    inputRef.current?.click();
                                }}
                                className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors shadow-lg"
                                title="Change image"
                            >
                                <Upload className="w-4 h-4 text-white" />
                            </button>
                            <button
                                type="button"
                                onClick={handleClear}
                                className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-lg"
                                title="Remove image"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">Click to change</span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-3 text-zinc-400 p-6">
                        <div className="p-4 bg-blue-500/20 rounded-full border-2 border-blue-500/30">
                            <Upload className="w-8 h-8 text-blue-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-white">{placeholder}</p>
                            <p className="text-xs text-zinc-500 mt-1">Click to browse or drag & drop</p>
                            <p className="text-xs text-zinc-600 mt-0.5">JPEG, PNG, GIF, WebP, SVG up to 35MB</p>
                        </div>
                        <button
                            type="button"
                            className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Image
                        </button>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                    onChange={handleChange}
                    className="hidden"
                />
            </div>

            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}
        </div>
    );
}
