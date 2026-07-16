const statusItems = [
    ['Zoom', '100%'],
    ['Current page', '-'],
    ['Total pages', '-'],
    ['File size', '-'],
    ['Rendering', 'Waiting'],
];

export function StatusBar() {
    return (
        <section className="status-bar" aria-label="Document status">
            {statusItems.map(([label, value]) => (
                <div key={label} className="status-bar__item">
                    <span>{label}</span>
                    <strong>{value}</strong>
                </div>
            ))}
        </section>
    );
}
