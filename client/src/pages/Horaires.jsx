import { useEffect, useMemo, useState } from 'react';
import { useTopBar } from '../TopBarContext.jsx';
import { FaSearch } from 'react-icons/fa';
import { FaXmark } from 'react-icons/fa6';
import PullToRefresh from '../components/PullToRefresh.jsx';

const INITIAL_LINES = [
    { BulleId: 'U', BulleColor: 'orange', Titre: 'Tech.Mer/Pôle d\'Act. Tln Est', Réseau: 'Réseau Mistral' },
    { BulleId: '1', BulleColor: '#0000b7', Titre: 'Coupiane - Beaucaire', Réseau: 'Réseau Mistral' },
    { BulleId: '3', BulleColor: '#e90000', Titre: '4 Ch. des Routes - Mourillon', Réseau: 'Réseau Mistral' },
    { BulleId: '6', BulleColor: '#009ee9', Titre: 'Ripelle - Terre Promise', Réseau: 'Réseau Mistral' },
    { BulleId: '8', BulleColor: '#28677f', Titre: 'La Seyne - Blache', Réseau: 'Réseau Mistral' },
    { BulleId: '9', BulleColor: '#66c34f', Titre: 'Hôpital - Gare Toulon', Réseau: 'Réseau Mistral' },
    { BulleId: '10', BulleColor: '#063951', Titre: 'Lyautey - Darboussèdes', Réseau: 'Réseau Mistral' },
    { BulleId: '11', BulleColor: '#7c35b1', Titre: 'Blache - Montserrat', Réseau: 'Réseau Mistral' },
    { BulleId: '11B', BulleColor: '#7c35b1', Titre: 'La Baume - Blache', Réseau: 'Réseau Mistral' },
    { BulleId: '12', BulleColor: '#e90000', Titre: 'Portes Oll. - La Seyne', Réseau: 'Réseau Mistral' },
    { BulleId: '15', BulleColor: '#000000', TextColor: '#e90000', Titre: 'Bas Faron-Port-Liberté-Gare', Réseau: 'Réseau Mistral' },
    { BulleId: '16', BulleColor: '#7c35b1', Titre: 'Moulin Premier - Maurels', Réseau: 'Réseau Mistral' },
    { BulleId: '17', BulleColor: '#e90000', Titre: 'L\'oratoire - Lycée Costebelle', Réseau: 'Réseau Mistral' },
    { BulleId: '18', BulleColor: '#b39ddb', Titre: 'Blache - Sablettes', Réseau: 'Réseau Mistral' },
];

function Horaires() {
    const { setTopBarState } = useTopBar();
    const [query, setQuery] = useState('');
    const [lines, setLines] = useState(INITIAL_LINES);

    useEffect(() => {
        setTopBarState({ backLink: '', title: 'Horaires', isVisible: true, actions: [] });
        return () => setTopBarState({ title: '', isVisible: true });
    }, [setTopBarState]);

    const filteredLines = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return lines;
        return lines.filter((item) => {
            const haystack = `${item.BulleId} ${item.Titre} ${item.Réseau}`.toLowerCase();
            return haystack.includes(needle);
        });
    }, [lines, query]);

    const refreshLines = () => {
        setQuery('');
        setLines([...INITIAL_LINES]);
    };

    return (
        <div className="page-scroll">
            <div className="page-scroll__header">
                <div className={"fr g1"} style={{ backgroundColor: '#1E21A4', color: 'lightgrey', textAlign: 'center', padding: '0 0 0.5rem 0' }}>
                    <div style={{ width: '100%' }}>Favoris</div>
                    <div style={{ width: '100%', color: 'white', position: 'relative' }}>
                        Lignes
                        <div style={{ position: 'absolute', width: '100%', height: '4px', backgroundColor: 'white', bottom: '-0.5rem', left: 0 }} />
                    </div>
                    <div style={{ width: '100%' }}>Arrêts</div>
                    <div style={{ width: '100%' }}>Gares</div>
                </div>
                <div className="horaires-search">
                    <FaSearch className="horaires-search__icon" aria-hidden="true" />
                    <input
                        type="search"
                        className="horaires-search__input"
                        placeholder="Rechercher"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Rechercher une ligne"
                    />
                    {query.length > 0 && (
                        <button
                            type="button"
                            className="horaires-search__clear"
                            onClick={() => setQuery('')}
                            aria-label="Vider la recherche"
                        >
                            <FaXmark size={12} />
                        </button>
                    )}
                </div>
            </div>
            <PullToRefresh className="page-scroll__body" style={{ padding: '0.5rem', backgroundColor: '#ebebeb' }}>
                {filteredLines.length > 0 ? (
                    <div className={"fc g0-5 jc-fs"}>
                        {filteredLines.map((item, index) => (
                            <div key={`${item.BulleId}-${index}`} className={"fr ai-c g0-5"} style={{ padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
                                <div style={{ backgroundColor: item.BulleColor, color: item.TextColor || 'white', fontWeight: 'bold', borderRadius: '4rem', padding: '0.3rem 0.8rem' }}>
                                    {item.BulleId}
                                </div>
                                <div>
                                    <h4>{item.Titre}</h4>
                                    <p style={{ color: 'grey', fontSize: '0.8rem' }}>{item.Réseau}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="horaires-empty">
                        <img src="/elements/icons/no-lines.svg" alt="" className="horaires-empty__image" />
                        <h3 className="horaires-empty__title">Aucune ligne trouvée ! Veuillez réessayer</h3>
                        <p className="horaires-empty__text">
                            Cliquez sur rafraichir pour tenter de nouveau de récupérer les lignes.
                        </p>
                        <button type="button" className="horaires-empty__refresh" onClick={refreshLines}>
                            Rafraîchir
                        </button>
                    </div>
                )}
            </PullToRefresh>
        </div>
    );
}

export default Horaires;
