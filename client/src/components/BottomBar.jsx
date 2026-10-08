import { Link, useLocation } from 'react-router-dom';

function BottomBar() {
    const location = useLocation();
    function isActive(base, path) {
        return path === base || path.startsWith(`${base}/`);
    }
    return (
        <nav className="bottom-bar" aria-label="Navigation principale">
            <ul className="bottom-bar__menu">
                <li className="bottom-bar__item">
                    <Link to={'/'} className={`bottom-bar__link${location.pathname === '/' ? ' is-active' : ''}`}>
                        <img
                            src={location.pathname === '/' ? '/elements/menu/home_active.svg' : '/elements/menu/home.svg'}
                            alt=""
                            className="bottom-bar__icon"
                        />
                        <span className="bottom-bar__label">Accueil</span>
                    </Link>
                </li>
                <li className="bottom-bar__item">
                    <Link
                        to={'/horaires'}
                        className={`bottom-bar__link${isActive('/horaires', location.pathname) ? ' is-active' : ''}`}
                    >
                        <img
                            src={isActive('/horaires', location.pathname) ? '/elements/menu/clock_active.svg' : '/elements/menu/clock.svg'}
                            alt=""
                            className="bottom-bar__icon"
                        />
                        <span className="bottom-bar__label">Horaires</span>
                    </Link>
                </li>
                <li className="bottom-bar__item">
                    <Link
                        to={'/tickets'}
                        className={`bottom-bar__link${isActive('/tickets', location.pathname) ? ' is-active' : ''}`}
                    >
                        <img
                            src={isActive('/tickets', location.pathname) ? '/elements/menu/ticket_active.svg' : '/elements/menu/ticket.svg'}
                            alt=""
                            className="bottom-bar__icon"
                        />
                        <span className="bottom-bar__label">M-Tickets</span>
                    </Link>
                </li>
                <li className="bottom-bar__item">
                    <Link
                        to={'/trafic'}
                        className={`bottom-bar__link${isActive('/trafic', location.pathname) ? ' is-active' : ''}`}
                    >
                        <img
                            src={isActive('/trafic', location.pathname) ? '/elements/menu/trafic_active.svg' : '/elements/menu/trafic.svg'}
                            alt=""
                            className="bottom-bar__icon"
                        />
                        <span className="bottom-bar__label">Infos trafic</span>
                    </Link>
                </li>
                <li className="bottom-bar__item">
                    <Link
                        to={'/menu'}
                        className={`bottom-bar__link${isActive('/menu', location.pathname) ? ' is-active' : ''}`}
                    >
                        <img
                            src={isActive('/menu', location.pathname) ? '/elements/menu/menu_active.svg' : '/elements/menu/menu.svg'}
                            alt=""
                            className="bottom-bar__icon"
                        />
                        <span className="bottom-bar__label">Menu</span>
                    </Link>
                </li>
            </ul>
        </nav>
    );
}

export default BottomBar;
