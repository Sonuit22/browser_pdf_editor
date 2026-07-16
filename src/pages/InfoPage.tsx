export function InfoPage({ title, children }: { title: string; children: string }) {
    return (
        <section className="info-page" aria-labelledby="info-title">
            <p className="eyebrow">PDF Editor by ib</p>
            <h1 id="info-title">{title}</h1>
            <p>{children}</p>
        </section>
    );
}
