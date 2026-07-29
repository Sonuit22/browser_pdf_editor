import type { BlogArticle } from '../types';

export function ArticleRenderer({ article }: { article: BlogArticle }) {
    return <div className="blog-article__body">
        {article.introduction.map((paragraph) => <p className="blog-article__lead" key={paragraph}>{paragraph}</p>)}
        {article.sections.map((section) => <section id={section.id} key={section.id}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.bullets && <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}
            {section.steps && <ol className="blog-steps">{section.steps.map((step) => <li key={step.title}><div><h3>{step.title}</h3><p>{step.description}</p></div></li>)}</ol>}
            {section.callout && <aside className={`blog-callout blog-callout--${section.callout.tone}`} aria-label={section.callout.title}><strong>{section.callout.title}</strong><p>{section.callout.text}</p></aside>}
            {section.table && <div className="blog-table-scroll" tabIndex={0} role="region" aria-label={`${section.heading} comparison table`}><table><thead><tr>{section.table.headers.map((header) => <th scope="col" key={header}>{header}</th>)}</tr></thead><tbody>{section.table.rows.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table></div>}
        </section>)}
    </div>;
}
