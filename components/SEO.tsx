import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    image?: string;
    url?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, image, url }) => {
    const siteTitle = "Helix Motorcycles";
    const fullTitle = title === siteTitle ? siteTitle : `${title} | ${siteTitle}`;
    const siteUrl = "https://helix-motorcycles.com"; // Replace with actual domain if known
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
    const defaultImage = "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200"; // Fallback image

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image || defaultImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={fullUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image || defaultImage} />
        </Helmet>
    );
};

export default SEO;
