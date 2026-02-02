import React, { useState } from 'react';

interface ImageUploadProps {
    onImageSelect: (file: File) => void;
    preview?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, preview: initialPreview }) => {
    const [preview, setPreview] = useState<string | null>(initialPreview || null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image must be less than 5MB');
                return;
            }

            onImageSelect(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClear = () => {
        setPreview(null);
    };

    return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-400 transition">
            {preview ? (
                <div className="relative">
                    <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded" />
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                        id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="text-6xl mb-3">📷</div>
                        <p className="text-gray-600 font-medium">Click to upload image</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
                    </label>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
