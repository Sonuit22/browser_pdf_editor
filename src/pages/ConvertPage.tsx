import { useMemo, useState } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { conversionTabs, findConversions, officeConversions, type ConversionTab, type ConversionTool } from '../modules/convert/conversionRegistry';

export default function ConvertPage() {
    const [tab, setTab] = useState<ConversionTab>('pdf-to-other');
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<ConversionTool | null>(null);
    const tools = useMemo(() => findConversions(query, tab), [query, tab]);
    if (selected) return <section className="convert-workspace"><Button variant="secondary" size="compact" type="button" onClick={() => setSelected(null)}><ArrowLeft size={16} aria-hidden="true" />Back to conversions</Button><h1>{selected.title}</h1><p>{selected.description}</p><div className="conversion-empty" role="status"><strong>{selected.status === 'experimental' ? 'Experimental conversion' : 'Coming later'}</strong><p>This browser-only converter is listed for discovery but is not available in the beta yet.</p></div></section>;
    return <section className="convert-page" aria-labelledby="convert-title"><h1 id="convert-title">Convert</h1><div className="convert-tabs" role="tablist" aria-label="Conversion categories">{conversionTabs.map((item) => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} className={tab === item.id ? 'is-active' : ''} onClick={() => setTab(item.id)}>{item.label}</button>)}</div><label className="convert-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Search conversions</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversions..." />{query && <button type="button" aria-label="Clear conversion search" onClick={() => setQuery('')}><X size={16} aria-hidden="true" /></button>}</label><div className="conversion-grid">{tools.map((tool) => <ConversionCard key={tool.id} tool={tool} onSelect={setSelected} />)}</div>{tools.length === 0 && <p className="conversion-empty">No conversions match your search.</p>}<section className="coming-later"><h2>Coming later</h2><p>High-fidelity Office conversion is not currently available in the browser-only edition.</p><ul>{officeConversions.map((tool) => <li key={tool}>{tool}</li>)}</ul></section></section>;
}

function ConversionCard({ tool, onSelect }: { tool: ConversionTool; onSelect: (tool: ConversionTool) => void }) { const Icon = tool.icon; return <button className="conversion-card" type="button" onClick={() => onSelect(tool)}><Icon size={22} aria-hidden="true" /><strong>{tool.title}</strong><span>{tool.description}</span><small>{tool.status === 'experimental' ? 'Experimental' : 'Coming later'}</small></button>; }
