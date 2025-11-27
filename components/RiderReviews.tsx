import React from 'react';
import { Review } from '../types';

interface RiderReviewsProps {
    reviews: Review[];
}

const RiderReviews: React.FC<RiderReviewsProps> = ({ reviews }) => {
    if (!reviews || reviews.length === 0) return null;

    return (
        <section id="reviews" className="py-20 bg-garage-900 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-bronze-500 blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-garage-800 blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-wider uppercase">
                        Rider <span className="text-bronze-500">Reviews</span>
                    </h2>
                    <div className="w-24 h-1 bg-bronze-500 mx-auto transform -skew-x-12"></div>
                    <p className="mt-4 text-garage-300 max-w-2xl mx-auto">
                        See what our clients say about their Helix experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-garage-950 border border-garage-800 p-8 rounded-sm relative group hover:border-bronze-500/50 transition-all duration-300">
                            {/* Quote Icon */}
                            <div className="absolute top-6 right-6 text-garage-800 group-hover:text-bronze-500/20 transition-colors duration-300">
                                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14.017 21L14.017 18C14.017 16.896 14.325 16.053 14.941 15.471C15.558 14.89 16.502 14.599 17.773 14.599H19.924C19.924 13.369 19.58 12.345 18.89 11.529C18.2 10.713 17.18 10.305 15.83 10.305H14.017V4H22V10.305C22 13.363 21.146 15.823 19.438 17.684C17.729 19.545 15.922 20.65 14.017 21ZM5 21L5 18C5 16.896 5.308 16.053 5.924 15.471C6.54 14.89 7.484 14.599 8.755 14.599H10.906C10.906 13.369 10.562 12.345 9.872 11.529C9.182 10.713 8.162 10.305 6.812 10.305H5V4H12.983V10.305C12.983 13.363 12.129 15.823 10.42 17.684C8.711 19.545 6.904 20.65 5 21Z" />
                                </svg>
                            </div>

                            {/* Stars */}
                            <div className="flex mb-4 text-bronze-500">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-garage-700'}`} viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>

                            <p className="text-garage-300 mb-6 italic relative z-10">"{review.text}"</p>

                            <div className="border-t border-garage-800 pt-4 mt-auto">
                                <p className="text-white font-bold uppercase tracking-wider text-sm">{review.name}</p>
                                <p className="text-garage-500 text-xs mt-1">{new Date(review.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RiderReviews;
