import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {FaChevronLeft} from "react-icons/fa6";

const ControlModal = ({ isOpen, onClose, children, bgColor = "#f3f3f3", padding="1rem" , hideBg= false}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 1, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 1, y: "100%" }}
                    transition={{ duration: 0.4 }}
                    className="modal-background over_modal"
                    style={{backgroundColor:hideBg ? "transparent" : "white"}}
                >

                    <div className="modal-content" style={{height:'100%',backgroundColor:hideBg ? "transparent" : bgColor, position:"relative", display:"flex", flexDirection:"column"}}>
                        {
                            !hideBg &&
                            <div className={"over_top_menu"} style={{backgroundColor:"transparent", justifyContent:"flex-start",padding:"0 1rem"}}>
                                <button type="button" aria-label="Retour" onClick={()=>{onClose()}} style={{backgroundColor:"white", display:"flex",alignItems:"center",justifyContent:"center",width:"35px",height:"35px",borderRadius:"2rem",zIndex:15, border:0, padding:0}}>
                                    <FaChevronLeft fill={"black"} size={"20px"}/>
                                </button>
                            </div>
                        }

                        <div style={{padding:padding, height:"100%", display:"flex", flexDirection:"column"}}>
                            {children}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ControlModal;
