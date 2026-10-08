import { useEffect, useState } from 'react';
import { useTopBar } from '../TopBarContext.jsx';
import { FaExclamation } from 'react-icons/fa6';
import PullToRefresh from '../components/PullToRefresh.jsx';

const LINES_EN_COURS = [
    { BulleId: 'U', BulleColor: 'orange' },
    { BulleId: '1', BulleColor: '#0000b7' },
    { BulleId: '3', BulleColor: '#e90000' },
    { BulleId: '6', BulleColor: '#009ee9' },
    { BulleId: '8', BulleColor: '#28677f' },
    { BulleId: '9', BulleColor: '#66c34f' },
    { BulleId: '10', BulleColor: '#063951' },
    { BulleId: '11', BulleColor: '#7c35b1' },
    { BulleId: '11B', BulleColor: '#7c35b1' },
    { BulleId: '12', BulleColor: '#e90000' },
];

const LINES_A_VENIR = [
    { BulleId: '8M', BulleColor: '#c4a8e8', TextColor: '#ffffff' },
    { BulleId: '81', BulleColor: '#e90000', TextColor: '#ffffff' },
];

function Trafic() {
    const { setTopBarState } = useTopBar();
    const [tab, setTab] = useState('en-cours');
    const lines = tab === 'en-cours' ? LINES_EN_COURS : LINES_A_VENIR;

    useEffect(() => {
        setTopBarState({ backLink: '', title: 'Info trafic', isVisible: true, actions: [] });
        return () => setTopBarState({ title: '', isVisible: true });
    }, [setTopBarState]);

    return (
        <div className="page-scroll">
            <div className="page-scroll__header" style={{ backgroundColor: '#ebebeb', padding: '0.5rem 0.5rem 0' }}>
                <div className="trafic-tabs" role="tablist" aria-label="Infos trafic">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={tab === 'en-cours'}
                        className={`trafic-tabs__btn${tab === 'en-cours' ? ' is-active' : ''}`}
                        onClick={() => setTab('en-cours')}
                    >
                        En cours
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={tab === 'a-venir'}
                        className={`trafic-tabs__btn${tab === 'a-venir' ? ' is-active' : ''}`}
                        onClick={() => setTab('a-venir')}
                    >
                        À venir
                    </button>
                </div>
                <h4 style={{ padding: '0.5rem 0.5rem 0.5rem 0.8rem' }}>Toutes les lignes concernées</h4>
            </div>
            <PullToRefresh className="page-scroll__body" style={{ padding: '0 0.5rem 0.5rem', backgroundColor: '#ebebeb' }}>
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-evenly',
                        gap: '1rem',
                        backgroundColor: 'white',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #e6e6e6',
                    }}
                >
                    {lines.map((item) => (
                        <div
                            key={item.BulleId}
                            style={{
                                position: 'relative',
                                backgroundColor: item.BulleColor,
                                color: item.TextColor || 'white',
                                fontWeight: 'bold',
                                fontSize: '1.3rem',
                                borderRadius: '4rem',
                                padding: '0.3rem 0.9rem',
                            }}
                        >
                            {item.BulleId}
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: '-4px',
                                    right: '-4px',
                                    backgroundColor: '#f5752a',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '4rem',
                                }}
                                className={"fr ai-c jc-c"}
                            >
                                <FaExclamation size={'15px'} />
                            </div>
                        </div>
                    ))}
                </div>
            </PullToRefresh>
        </div>
    );
}

export default Trafic;
