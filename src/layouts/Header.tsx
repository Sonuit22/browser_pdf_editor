import { ArrowLeft, Home, Menu, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toolRegistry } from '../config/toolRegistry';
import { ThemeToggle } from '../components/ThemeToggle';

export function Header({ isSidebarOpen, onMenuToggle, onNavigateRequest }: { isSidebarOpen: boolean; showNavigation?: boolean; onMenuToggle: () => void; onRequestUpload?: () => void; onNavigateRequest: (destination: string | 'back') => void }) {
    const location = useLocation();
    const [query, setQuery] = useState('');
    const [mobileSearch, setMobileSearch] = useState(false);
    const results = useMemo(() => query.trim() ? toolRegistry.filter((tool) => tool.title.toLowerCase().includes(query.trim().toLowerCase())) : [], [query]);
    const leaveSearch = () => { setQuery(''); setMobileSearch(false); };
    return <header className="app-header"><div className="app-header__inner">
        <button className="icon-button menu-button" type="button" onClick={onMenuToggle} aria-label="Toggle PDF tools" aria-controls="tool-sidebar" aria-expanded={isSidebarOpen} title="PDF tools"><Menu size={21} aria-hidden="true" /></button>
        <Link className="header-brand" to="/" aria-label="PDF by ib home" onClick={(event) => { event.preventDefault(); leaveSearch(); onNavigateRequest('/'); }}><img className="header-brand__logo" src="/logo-64.png" width="36" height="36" alt="" aria-hidden="true" /><span>PDF by ib</span></Link>
        <nav className="header-history" aria-label="Page navigation">
            <Link className="icon-button" to="/" onClick={(event) => { event.preventDefault(); onNavigateRequest('/'); }} aria-label="Home" title="Home"><Home size={19} aria-hidden="true" /></Link>
            {location.pathname !== '/' && <button className="icon-button" type="button" onClick={() => onNavigateRequest('back')} aria-label="Back" title="Back"><ArrowLeft size={19} aria-hidden="true" /></button>}
        </nav>
        <div className={`header-search${mobileSearch ? ' is-open' : ''}`}>
            <Search size={17} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools..." aria-label="Search tools" />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}
            {results.length > 0 && <div className="header-search__results" role="listbox">{results.map((tool) => tool.enabled
                ? <Link key={tool.id} role="option" aria-selected="false" to={tool.route} aria-label={`${tool.title}. ${tool.description}`} onClick={(event) => { event.preventDefault(); leaveSearch(); onNavigateRequest(tool.route); }}><tool.icon size={17} aria-hidden="true" /><span><strong>{tool.title}</strong><small>{tool.description}</small></span>{tool.badge && <em className="tool-status-badge">{tool.badge}</em>}</Link>
                : <div key={tool.id} className="header-search__disabled" role="option" aria-disabled="true" aria-label={`${tool.title}, coming soon`}><tool.icon size={17} aria-hidden="true" /><span><strong>{tool.title}</strong><small>{tool.description}</small></span><em className="tool-status-badge">Coming Soon</em></div>)}</div>}
        </div>
        <button className="icon-button mobile-search-toggle" type="button" onClick={() => setMobileSearch((value) => !value)} aria-label="Search tools"><Search size={19} /></button>
        <ThemeToggle />
    </div></header>;
}
