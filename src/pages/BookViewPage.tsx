import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDataContext } from "../context/DataContext";
import HTMLFlipBook from "react-pageflip";

const BookViewPage: React.FC = () => {
  const { docId } = useParams<{ docId: string }>();
  const { data } = useDataContext();
  const navigate = useNavigate();

  // Vérifier si les données des documents existent
  if (!data.docs || !data.docs.items) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">No documents available</h1>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Récupérer le document correspondant à l'id
  const document = data.docs.items.find((doc: any) => doc.id === docId);

  if (!document) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Document not found</h1>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Viewing Document: {document.title}
      </h1>
      <div className="relative flex justify-center items-center">
        <HTMLFlipBook
          width={400}
          height={500}
          className="shadow-lg rounded-lg"
          style={{ margin: "0 auto", backgroundColor: "#fff" }}
          startPage={0}
          size="fixed"
          minWidth={300}
          maxWidth={600}
          minHeight={400}
          maxHeight={800}
          drawShadow={true}
          flippingTime={1000}
          useMouseEvents={true}
          usePortrait={true}
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          clickEventForward={true}
          swipeDistance={50}
          showPageCorners={true}
          disableFlipByClick={false}
        >
          {document.pages.map((page: any, index: number) => (
            <div
              key={index}
              className="page flex justify-center items-center"
            >
              <img
                src={page.imageUrl}
                alt={`Page ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </HTMLFlipBook>
      </div>
      <button
        onClick={() => navigate(-1)}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Go Back
      </button>
    </div>
  );
};

export default BookViewPage;