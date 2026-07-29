import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { publishedArticleMetadata } from '../content';

export function ToolGuideLink({ toolPath }: { toolPath: string }) {
    const guide = publishedArticleMetadata.find((article) => article.relatedToolPath === toolPath);
    if (!guide) return null;
    return <aside className="tool-guide-link"><BookOpen size={18} aria-hidden="true" /><div><strong>Learning Center</strong><Link to={`/blog/${guide.slug}`}>{guide.title}</Link></div></aside>;
}
