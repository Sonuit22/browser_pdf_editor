import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { publishedArticleMetadata } from '../content';

export function ToolGuideLink({ toolPath }: { toolPath: string }) {
    const guides = publishedArticleMetadata.filter((article) => article.relatedToolPath === toolPath).slice(0, 3);
    if (!guides.length) return null;
    return <aside className="tool-guide-link"><BookOpen size={18} aria-hidden="true" /><div><strong>Related guides</strong><nav aria-label="Related guides for this tool">{guides.map((guide) => <Link key={guide.slug} to={`/blog/${guide.slug}`}>{guide.title}</Link>)}</nav></div></aside>;
}
