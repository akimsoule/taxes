import React, { useState } from "react";

interface ThumbnailWithLoaderProps {
  fileLink: string;
  fileName: string;
  onClick: () => void;
}

const ThumbnailWithLoader: React.FC<ThumbnailWithLoaderProps> = ({
  fileLink,
  fileName,
  onClick,
}) => {
  const [isImageLoading, setIsImageLoading] = useState(true);

  return (
    <div className="flex items-center justify-center w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded">
      {isImageLoading && (
        <div className="loader border-t-4 border-blue-500 rounded-full w-6 h-6 animate-spin"></div>
      )}
      <img
        src={fileLink}
        alt={fileName}
        className={`w-16 h-16 object-cover rounded cursor-pointer transition-opacity duration-300 ${
          isImageLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setIsImageLoading(false)}
        onClick={onClick}
      />
    </div>
  );
};

export default ThumbnailWithLoader;
