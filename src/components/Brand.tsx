import { Link } from 'react-router-dom';

export function Brand() {
    return (
        <Link className="brand" to="/" aria-label="PDF by ib home">
            <img src="/logo-64.png" width="36" height="36" alt="" aria-hidden="true" />
            <span>PDF by ib</span>
        </Link>
    );
}

export function BrandLockup() {
    return <div className="brand-lockup" aria-label="PDF by ib"><div className="brand-title">PDF</div><div className="brand-by">by</div><div className="brand-ib">ib</div></div>;
}
