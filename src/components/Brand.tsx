import { Link } from 'react-router-dom';

export function Brand() {
    return (
        <Link className="brand" to="/" aria-label="PDF Editor by ib home">
            <img src="/assets/icons/app-icon.svg" width="36" height="36" alt="" />
            <span>PDF Editor by ib</span>
        </Link>
    );
}
