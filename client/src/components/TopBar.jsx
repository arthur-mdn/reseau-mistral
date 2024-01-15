// TopBar.jsx
import React, {useState} from 'react';
import { useTopBar } from '../TopBarContext';
import {Link} from "react-router-dom";
import {FaChevronLeft, FaEllipsis} from "react-icons/fa6";
import ProfileSelection from "./ProfileSelection.jsx";
import Modal from "./Modal.jsx";

const TopBar = () => {
    const { topBarState } = useTopBar();
    const [actionPopup, setActionPopup] = useState(false);

    if (!topBarState.isVisible) return null;
    return (
        <header className={"header-top"} style={{ backgroundColor:"#1E21A4", color:"white" }}>
            <div className={"container"} style={{padding:"0 1rem", height:'60px', display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                {topBarState.backLink && (
                    <Link to={topBarState.backLink.link} style={{color:"white"}} className={"fr ai-c g0-5"}>
                        <FaChevronLeft/>
                        {topBarState.backLink.title}
                    </Link>
                )}
                {!topBarState.backLink && (
                    <div></div>
                )}
                <h4 style={{position:"absolute", left:"50%", transform:"translateX(-50%)", fontWeight:"bold"}}>
                    {topBarState.title}
                </h4>
                {topBarState.actions && topBarState.actions.length > 0 && (
                    <div onClick={()=>{setActionPopup(!actionPopup)}}>
                    <FaEllipsis/>
                    </div>
                )}
            </div>
            <div>
                <Modal isOpen={actionPopup} onClose={() => setActionPopup(false)} hideBg={true} padding={0}>
                    <div style={{position:"fixed",zIndex:9999, top:0, width:"100%", height:"100%" }}>
                        <div style={{position:"relative",width:"100%",height:"100%", display:"flex", justifyContent:"flex-end",alignItems:"flex-end"}}>
                            <div onClick={()=>{setActionPopup(!actionPopup)}} style={{position:"absolute",width:"100%", height:"100%", backgroundColor:"black", opacity:"0", zIndex:999}}>
                            </div>
                            <div style={{position:"relative",listStyleType:"none", margin:"0", padding:"1rem 0.5rem 4rem",gap:"0rem", zIndex:99999,width:"100%", display:"flex", alignItems:"center",justifyContent:"flex-end",flexDirection:"column"}}>
                                <ul style={{listStyleType:"none", margin:"0", width:'100%',borderRadius:"0.5rem",overflow:"hidden"}}>
                                    {topBarState.actions && topBarState.actions.map((action, index) => (
                                        <li key={index} style={{ width:"100%",margin:"0", padding:"0.7rem", backgroundColor:"white", textAlign:"center", borderBottom:'1px solid lightgrey'}}>
                                            {action.action && (
                                                <div onClick={()=>{ setActionPopup(false);action.action()}} style={{color:"blue",textDecoration:"none"}}>
                                                    <h3>
                                                        {action.title}
                                                    </h3>
                                                </div>
                                            )}
                                            {action.link && (
                                                <Link to={action.link} style={{color:"blue", textDecoration:"none", width:'100%', height:'100%'}}>
                                                    <h3>
                                                        {action.title}
                                                    </h3>
                                                </Link>
                                            )}
                                        </li>
                                    ))}

                                </ul>
                                <li key={"cancel"} style={{ width:"100%",margin:"0.5rem 0 0 0", padding:"0.6rem",borderRadius:"0.5rem", backgroundColor:"white",textAlign:"center"}}>
                                    <div onClick={()=>{setActionPopup(!actionPopup)}} style={{color:"blue",fontWeight:"bold", textDecoration:"none"}}>
                                        <h3 style={{fontWeight:"bold"}}>
                                            Annuler
                                        </h3>
                                    </div>
                                </li>
                            </div>

                        </div>

                    </div>
                </Modal>
            </div>
        </header>
    );
};

export default TopBar;
