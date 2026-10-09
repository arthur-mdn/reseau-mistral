import { useEffect, useMemo, useState } from 'react';
import { useTopBar } from '../TopBarContext.jsx';
import { FaSearch } from 'react-icons/fa';
import { FaBus, FaTrain, FaWheelchair, FaXmark } from 'react-icons/fa6';
import PullToRefresh from '../components/PullToRefresh.jsx';

const TABS = [
    { id: 'favoris', label: 'Favoris' },
    { id: 'lignes', label: 'Lignes' },
    { id: 'arrets', label: 'Arrêts' },
    { id: 'gares', label: 'Gares' },
];

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
    { BulleId: '20', BulleColor: '#f5a623', Titre: 'Ft Rouge/Ft Blanc-Ft d\'Art.', Réseau: 'Réseau Mistral' },
    { BulleId: '23', BulleColor: '#8b1a1a', Titre: 'Gare (Toulon) - Espace 3000', Réseau: 'Réseau Mistral' },
    { BulleId: '28', BulleColor: '#7cb342', Titre: 'Sablettes - Hauts de St Mandrier', Réseau: 'Réseau Mistral' },
    { BulleId: '29', BulleColor: '#1b7a4a', Titre: 'Gare Routière (Toulon) - Lycée Costebelle', Réseau: 'Réseau Mistral' },
    { BulleId: '31', BulleColor: '#e67e22', Titre: 'Art. de Marine - Ste Claire', Réseau: 'Réseau Mistral' },
    { BulleId: '33', BulleColor: '#f1c40f', TextColor: '#111', Titre: 'Navette Mourillon', Réseau: 'Réseau Mistral' },
    { BulleId: '36', BulleColor: '#7c35b1', Titre: 'Ameniers-Ste Roseline/B.Herb.', Réseau: 'Réseau Mistral' },
    { BulleId: '39', BulleColor: '#1b7a4a', Titre: 'Gare Routière (Toulon) - Lycée Golf Hôtel', Réseau: 'Réseau Mistral' },
    { BulleId: '40', BulleColor: '#2f6fed', Titre: 'Mas du Faron - Super Toulon/La Barre', Réseau: 'Réseau Mistral' },
    { BulleId: '55', BulleColor: '#8bc34a', Titre: 'Revest/Campus La Garde - La Valette', Réseau: 'Réseau Mistral' },
    { BulleId: '63', BulleColor: '#9aa7c7', Titre: 'Aéroport Toulon/Hyères - Moulin Premier', Réseau: 'Réseau Mistral' },
    { BulleId: '67', BulleColor: '#f1c40f', TextColor: '#111', Titre: 'Hyères Centre (Joffre) - Tour Fondue', Réseau: 'Réseau Mistral' },
    { BulleId: '70', BulleColor: '#26a69a', Titre: 'Gare Routière (Toulon) - Bonnegrâce', Réseau: 'Réseau Mistral' },
    { BulleId: '72', BulleColor: '#c0d923', TextColor: '#111', Titre: 'Langevin - Gare (Ollioules/Sanary)', Réseau: 'Réseau Mistral' },
];

const INITIAL_STOPS = [
    { name: '11 nov', city: 'Cagnes-sur-Mer', accessible: false },
    { name: '11 novembre', city: 'Grasse', accessible: false },
    { name: '11 Novembre', city: 'La Valette-du-Var', accessible: true },
    { name: '11 Novembre 1918', city: 'Le Beausset', accessible: false },
    { name: '14 Juillet', city: 'Toulon', accessible: true },
    { name: '1er Escalier', city: 'Roquebrune-Cap-Martin', accessible: false },
    { name: '1er Hameau', city: 'Roquebrune-Cap-Martin', accessible: false },
    { name: '1ère DFL', city: 'La Garde', accessible: true },
    { name: '1ers Borrels', city: 'Hyères', accessible: true },
    { name: '2 Chênes', city: 'La Seyne-sur-Mer', accessible: true },
    { name: '2eme Escalier', city: 'Roquebrune-Cap-Martin', accessible: false },
    { name: '2eme Hameau', city: 'Roquebrune-Cap-Martin', accessible: false },
    { name: '2èmes Borrels', city: 'Hyères', accessible: true },
    { name: '3 Pins (Ste Anne)', city: 'Toulon', accessible: true },
    { name: '3 Sollies', city: 'Solliès-Toucas', accessible: false },
    { name: '3èmes Borrels', city: 'Hyères', accessible: true },
    { name: '4 ch.des Routes', city: 'Toulon', accessible: true },
    { name: '4 Chemins', city: 'La Garde', accessible: false },
    { name: '4 Chemins', city: 'Les Arcs', accessible: false },
    { name: '4 Chemins', city: 'Fayence', accessible: true },
    { name: '4 Chemins (Pauline)', city: 'La Garde', accessible: true },
    { name: '4 Chemins/RD4', city: 'Fayence', accessible: true },
    { name: '4 Chemins/RD562', city: 'Fayence', accessible: true },
    { name: '4 Chemins/RD67', city: 'La Garde', accessible: false },
    { name: '4 Chemins/RDN7', city: 'Roquebrune-sur-Argens', accessible: false },
    { name: '4 Saisons', city: 'Le Pradet', accessible: true },
    { name: '8 Mai', city: 'La Seyne-sur-Mer', accessible: true },
    { name: 'A. Rogier', city: 'Carpentras', accessible: false },
    { name: 'Abadie II', city: 'Cannes', accessible: false },
    { name: 'Abattoirs', city: 'Nice', accessible: false },
    { name: 'Abbaye de Montmajour', city: 'Arles', accessible: false },
    { name: 'Abeilles d\'Or', city: 'Le Revest-les-Eaux', accessible: true },
    { name: 'Abriès OT/Place du Glacis', city: 'Abriès-Ristolas', accessible: false },
    { name: 'Acacias', city: 'Ollioules', accessible: true },
    { name: 'Aéropôle', city: 'Tallard', accessible: true },
    { name: 'Aéroport', city: 'Hyères', accessible: true },
    { name: 'Aeroport Promenade', city: 'Nice', accessible: false },
    { name: 'Aeroport Terminal 2', city: 'Nice', accessible: false },
    { name: 'Aéroport Toulon Hyeres', city: 'Hyères', accessible: true },
    { name: 'AFN', city: 'Vence', accessible: false },
    { name: 'AFUZI', city: 'La Garde', accessible: true },
    { name: 'Agassins', city: 'Le Pontet', accessible: false },
    { name: 'Agora', city: 'Callian', accessible: true },
    { name: 'Agora', city: 'La Garde', accessible: true },
    { name: 'Agricampus', city: 'Hyères', accessible: true },
];

const INITIAL_STATIONS = [
    { name: 'Agay', city: 'Saint-Raphaël' },
    { name: 'Aix-en-Provence TGV', city: 'Aix-en-Provence' },
    { name: 'Aubagne', city: 'Aubagne' },
    { name: 'Bandol', city: 'Bandol' },
    { name: 'Boulouris sur Mer', city: 'Saint-Raphaël' },
    { name: 'Carnoules', city: 'Carnoules' },
    { name: 'Cassis', city: 'Cassis' },
    { name: 'Cuers - Pierrefeu', city: 'Cuers' },
    { name: 'Fréjus', city: 'Fréjus' },
    { name: 'Gardanne', city: 'Gardanne' },
    { name: 'Gonfaron', city: 'Gonfaron' },
    { name: 'Hyères', city: 'Hyères' },
    { name: 'L\'Estaque', city: 'Marseille' },
    { name: 'La Barasse', city: 'Marseille' },
    { name: 'La Ciotat-Ceyreste', city: 'La Ciotat' },
    { name: 'La Crau', city: 'La Crau' },
    { name: 'La Garde', city: 'La Garde' },
    { name: 'La Pauline', city: 'La Garde' },
    { name: 'La Penne-sur-Huveaune', city: 'La Penne-sur-Huveaune' },
    { name: 'La Pomme', city: 'Marseille' },
    { name: 'La Seyne - Six Fours', city: 'La Seyne-sur-Mer' },
    { name: 'Le Dramont', city: 'Saint-Raphaël' },
    { name: 'Le Luc - Le Cannet', city: 'Le Cannet-des-Maures' },
    { name: 'Les Arcs - Draguignan', city: 'Les Arcs' },
    { name: 'Marseille Arenc Euroméditerranée', city: 'Marseille' },
    { name: 'Marseille Blancarde', city: 'Marseille' },
    { name: 'Marseille Saint-Charles', city: 'Marseille' },
    { name: 'Ollioules - Sanary-sur-Mer', city: 'Ollioules' },
    { name: 'Picon Busserine', city: 'Marseille' },
    { name: 'Pignans', city: 'Pignans' },
    { name: 'Puget-Ville', city: 'Puget-Ville' },
    { name: 'Saint-Antoine', city: 'Marseille' },
    { name: 'Saint-Cyr Les Lecques - La Cadière', city: 'Saint-Cyr-sur-Mer' },
    { name: 'Saint-Joseph le Castellas', city: 'Marseille' },
    { name: 'Saint-Marcel', city: 'Marseille' },
    { name: 'Saint-Raphaël Valescure', city: 'Saint-Raphaël' },
    { name: 'Sainte-Marthe en Provence', city: 'Marseille' },
    { name: 'Septèmes', city: 'Septèmes-les-Vallons' },
    { name: 'Simiane', city: 'Simiane-Collongue' },
    { name: 'Solliès-Pont', city: 'Solliès-Pont' },
    { name: 'Toulon', city: 'Toulon' },
    { name: 'Toulon Sainte-Musse', city: 'Toulon' },
    { name: 'Vidauban', city: 'Vidauban' },
];

function Horaires() {
    const { setTopBarState } = useTopBar();
    const [activeTab, setActiveTab] = useState('lignes');
    const [query, setQuery] = useState('');
    const [lines, setLines] = useState(INITIAL_LINES);

    useEffect(() => {
        setTopBarState({ backLink: '', title: 'Horaires', isVisible: true, actions: [] });
        return () => setTopBarState({ title: '', isVisible: true });
    }, [setTopBarState]);

    useEffect(() => {
        setQuery('');
    }, [activeTab]);

    const filteredLines = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return lines;
        return lines.filter((item) => {
            const haystack = `${item.BulleId} ${item.Titre} ${item.Réseau}`.toLowerCase();
            return haystack.includes(needle);
        });
    }, [lines, query]);

    const filteredStops = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return INITIAL_STOPS;
        return INITIAL_STOPS.filter((item) => {
            const haystack = `${item.name} ${item.city}`.toLowerCase();
            return haystack.includes(needle);
        });
    }, [query]);

    const filteredStations = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return INITIAL_STATIONS;
        return INITIAL_STATIONS.filter((item) => {
            const haystack = `${item.name} ${item.city}`.toLowerCase();
            return haystack.includes(needle);
        });
    }, [query]);

    const refreshLines = () => {
        setQuery('');
        setLines([...INITIAL_LINES]);
    };

    const searchPlaceholder =
        activeTab === 'arrets'
            ? 'Rechercher un arrêt'
            : activeTab === 'gares'
                ? 'Rechercher une gare'
                : 'Rechercher';

    return (
        <div className="page-scroll">
            <div className="page-scroll__header">
                <div className="horaires-tabs" role="tablist" aria-label="Sections horaires">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            className={`horaires-tabs__btn${activeTab === tab.id ? ' is-active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                {activeTab !== 'favoris' && (
                    <div className="horaires-search">
                        <FaSearch className="horaires-search__icon" aria-hidden="true" />
                        <input
                            type="search"
                            className="horaires-search__input"
                            placeholder={searchPlaceholder}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            aria-label={searchPlaceholder}
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
                )}
            </div>
            <PullToRefresh className="page-scroll__body" style={{ padding: '0.5rem', backgroundColor: '#F1F3F4' }}>
                {activeTab === 'favoris' && (
                    <div className="horaires-empty horaires-empty--favoris">
                        <img
                            src="/elements/icons/empty-favorite.svg"
                            alt=""
                            className="horaires-empty__image horaires-empty__image--favoris"
                        />
                        <h3 className="horaires-empty__title">Vous n&apos;avez aucun favori</h3>
                        <p className="horaires-empty__text">
                            Gardez un œil sur vos lignes et arrêts en les ajoutant en favoris !
                        </p>
                    </div>
                )}

                {activeTab === 'lignes' && (
                    filteredLines.length > 0 ? (
                        <div className="fc g0-5 jc-fs">
                            {filteredLines.map((item, index) => (
                                <div
                                    key={`${item.BulleId}-${index}`}
                                    className="horaires-list-card fr ai-c g0-5"
                                >
                                    <div
                                        style={{
                                            backgroundColor: item.BulleColor,
                                            color: item.TextColor || 'white',
                                            fontWeight: 'bold',
                                            borderRadius: '4rem',
                                            padding: '0.3rem 0.8rem',
                                        }}
                                    >
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
                    )
                )}

                {activeTab === 'arrets' && (
                    filteredStops.length > 0 ? (
                        <div className="fc g0-5 jc-fs">
                            {filteredStops.map((item, index) => (
                                <div key={`stop-${item.name}-${item.city}-${index}`} className="horaires-list-card horaires-place-card">
                                    <div className="horaires-place-card__text">
                                        <h4>{item.name}</h4>
                                        <p>{item.city}</p>
                                    </div>
                                    <div className="horaires-place-card__icons">
                                        {item.accessible && (
                                            <FaWheelchair
                                                className="horaires-place-card__access"
                                                aria-label="Accessible"
                                            />
                                        )}
                                        <span className="horaires-place-card__badge horaires-place-card__badge--bus" aria-hidden="true">
                                            <FaBus size={11} />
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="horaires-empty">
                            <h3 className="horaires-empty__title">Aucun arrêt trouvé</h3>
                            <p className="horaires-empty__text">Essayez une autre recherche.</p>
                        </div>
                    )
                )}

                {activeTab === 'gares' && (
                    filteredStations.length > 0 ? (
                        <div className="fc g0-5 jc-fs">
                            {filteredStations.map((item, index) => (
                                <div key={`station-${item.name}-${item.city}-${index}`} className="horaires-list-card horaires-place-card">
                                    <div className="horaires-place-card__text">
                                        <h4>{item.name}</h4>
                                        <p>{item.city}</p>
                                    </div>
                                    <div className="horaires-place-card__icons">
                                        <span className="horaires-place-card__badge horaires-place-card__badge--train" aria-hidden="true">
                                            <FaTrain size={11} />
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="horaires-empty">
                            <h3 className="horaires-empty__title">Aucune gare trouvée</h3>
                            <p className="horaires-empty__text">Essayez une autre recherche.</p>
                        </div>
                    )
                )}
            </PullToRefresh>
        </div>
    );
}

export default Horaires;
