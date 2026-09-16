import {useState} from 'react';
import type {Review} from '../types';

interface ReviewCarouselProps {
    reviews: Review[];
}

const CARDS_PER_PAGE = 3;
const COMMENT_TRUNCATE_LENGTH = 120;

function ReviewCarousel({reviews}: ReviewCarouselProps) {
    const [page, setPage] = useState(0);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);

    const totalPages = Math.ceil(reviews.length / CARDS_PER_PAGE);
    const pages = Array.from({length: totalPages}, (_, i) =>
        reviews.slice(i * CARDS_PER_PAGE, i * CARDS_PER_PAGE + CARDS_PER_PAGE)
    );

    const goToPage = (newPage: number) => {
        if (newPage < 0 || newPage >= totalPages) return;
        setPage(newPage);
    };

    return (
        <div>
            <div className="relative flex items-center gap-3">
                {totalPages > 1 && (
                    <button
                        onClick={() => goToPage(page - 1)}
                        disabled={page === 0}
                        aria-label="Previous reviews"
                        className="cursor-pointer shrink-0 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center text-teal-900 text-2xl leading-none hover:bg-teal-900 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-teal-900 z-10"
                    >
                        ‹
                    </button>
                )}

                <div className="flex-1 overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-out"
                        style={{transform: `translateX(-${page * 100}%)`}}
                    >
                        {pages.map((pageReviews, pageIndex) => (
                            <div key={pageIndex}
                                 className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full shrink-0 px-0.5">
                                {pageReviews.map((review) => {
                                    const isLong = review.comment && review.comment.length > COMMENT_TRUNCATE_LENGTH;
                                    const displayText = isLong
                                        ? review.comment.slice(0, COMMENT_TRUNCATE_LENGTH).trim() + '...'
                                        : review.comment;

                                    return (
                                        <div key={review.id}
                                             className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-semibold text-charcoal text-sm truncate">{review.customerName}</p>
                                                <span className="text-xs text-gray-400 shrink-0 ml-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2">{review.roomType}</p>
                                            <p className="text-coral text-sm mb-2">
                                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                            </p>
                                            {displayText &&
                                                <p className="text-charcoal text-sm flex-1">{displayText}</p>}
                                            {isLong && (
                                                <button
                                                    onClick={() => setSelectedReview(review)}
                                                    className="text-teal-600 text-sm font-medium mt-2 self-start hover:underline"
                                                >
                                                    Read more
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {totalPages > 1 && (
                    <button
                        onClick={() => goToPage(page + 1)}
                        disabled={page === totalPages - 1}
                        aria-label="Next reviews"
                        className="cursor-pointer shrink-0 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center text-teal-900 text-2xl leading-none hover:bg-teal-900 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-teal-900 z-10"
                    >
                        ›
                    </button>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center gap-1.5 mt-4">
                    {Array.from({length: totalPages}).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goToPage(i)}
                            aria-label={`Go to page ${i + 1}`}
                            className={`w-2 h-2 rounded-full transition-colors ${
                                i === page ? 'bg-teal-900' : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                        />
                    ))}
                </div>
            )}

            {selectedReview && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center px-6 z-50"
                    onClick={() => setSelectedReview(null)}
                >
                    <div
                        className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-semibold text-charcoal">{selectedReview.customerName}</p>
                                <p className="text-xs text-gray-500">{selectedReview.roomType}</p>
                            </div>
                            <button
                                onClick={() => setSelectedReview(null)}
                                aria-label="Close"
                                className="text-gray-400 hover:text-charcoal text-xl leading-none"
                            >
                                ×
                            </button>
                        </div>
                        <p className="text-coral mb-3">
                            {'★'.repeat(selectedReview.rating)}{'☆'.repeat(5 - selectedReview.rating)}
                        </p>
                        <p className="text-charcoal text-sm whitespace-pre-wrap">{selectedReview.comment}</p>
                        <p className="text-xs text-gray-400 mt-4">
                            {new Date(selectedReview.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReviewCarousel;