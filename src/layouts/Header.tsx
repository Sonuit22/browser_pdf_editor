import { ArrowLeft, FileText, Home, Menu, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toolRegistry } from '../config/toolRegistry';
import { ThemeToggle } from '../components/ThemeToggle';

export function Header({ isSidebarOpen, onMenuToggle }: { isSidebarOpen: boolean; showNavigation?: boolean; onMenuToggle: () => void; onRequestUpload?: () => void }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [mobileSearch, setMobileSearch] = useState(false);
    const results = useMemo(() => query.trim() ? toolRegistry.filter((tool) => tool.title.toLowerCase().includes(query.trim().toLowerCase())) : [], [query]);
    const leaveSearch = () => { setQuery(''); setMobileSearch(false); };
    return <header className="app-header"><div className="app-header__inner">
        <button className="icon-button menu-button" type="button" onClick={onMenuToggle} aria-label="Toggle PDF tools" aria-controls="tool-sidebar" aria-expanded={isSidebarOpen} title="PDF tools"><Menu size={21} aria-hidden="true" /></button>
        <Link className="header-brand" to="/" onClick={leaveSearch}><FileText size={24} aria-hidden="true" /><span>PDF Editor <small>by ib</small></span></Link>
        <nav className="header-history" aria-label="Page navigation">
            <Link className="icon-button" to="/" aria-label="Home" title="Home"><Home size={19} aria-hidden="true" /></Link>
            {location.pathname !== '/' && <button className="icon-button" type="button" onClick={() => navigate(-1)} aria-label="Back" title="Back"><ArrowLeft size={19} aria-hidden="true" /></button>}
        </nav>
        <div className={`header-search${mobileSearch ? ' is-open' : ''}`}>
            <Search size={17} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools..." aria-label="Search tools" />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}
            {results.length > 0 && <div className="header-search__results" role="listbox">{results.map((tool) => <Link key={tool.id} role="option" aria-selected="false" to={tool.route} onClick={leaveSearch}><tool.icon size={17} aria-hidden="true" />{tool.title}</Link>)}</div>}
        </div>
        <button className="icon-button mobile-search-toggle" type="button" onClick={() => setMobileSearch((value) => !value)} aria-label="Search tools"><Search size={19} /></button>
        <ThemeToggle />
    </div></header>;
}
