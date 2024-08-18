import './sidebar.css'
import { NavLink } from "react-router-dom";
import { FaBars, FaPlus } from "react-icons/fa";
import { BiAnalyse,BiData } from "react-icons/bi";
import { AiTwotoneFileExclamation } from "react-icons/ai";
import { useState, useEffect } from "react";
import { useChat } from '../../context/ChatProvider';
import { AnimatePresence, motion } from "framer-motion";
import SidebarMenu from "./SidebarMenu";
import SchemaSubMenu from './SchemaSubMenu';


const SideBar = ({ children }) => {
    const { historyChat,schemaData } = useChat();
    const [isOpen, setIsOpen] = useState(true);
    const toggle = () => setIsOpen(!isOpen);
    const [routes, setRoutes] = useState([
        {
            path: "/dashboard",
            name: "Agregar Chat",
            icon: <FaPlus />,
        },
        {
            path: "/train",
            name: "Entrenar IA",
            icon: <BiAnalyse />,
        },
        {
            path: "/history",
            name: "Historial Caché",
            icon: <AiTwotoneFileExclamation />,
            subRoutes: historyChat
        },
        {
            path: "/schema",
            name: "Esquema DB",
            icon: <BiData />,
            subRoutes: schemaData,
        }
    ])
    useEffect(() => {
        if (!routes.some(route => route.path === "/history")) {
            const historyRoutes = {
                path: "/history",
                name: "Historial Caché",
                icon: <AiTwotoneFileExclamation />,
                subRoutes: historyChat
            };
            setRoutes(routes => [...routes, historyRoutes]);
        } else {
            setRoutes(routes =>
                routes.map(route =>
                    route.path === "/history" ? { ...route, subRoutes: historyChat } : route
                )
            );
        }
    }, [historyChat]); 

    useEffect(() => {
        // Código para manejar actualización de schemaData
        if (schemaData) {
            // Haz algo con schemaData aquí
        }
    }, [schemaData]);
    

    const showAnimation = {
        hidden: {
            width: 0,
            opacity: 0,
            transition: {
                duration: 0.5,
            },
        },
        show: {
            opacity: 1,
            width: "auto",
            transition: {
                duration: 0.5,
            },
        },
    };

    return (
        <>
            <div className="main-container">
                <motion.div
                    animate={{
                        width: isOpen ? "300px" : "45px",

                        transition: {
                            duration: 0.5,
                            type: "spring",
                            damping: 10,
                        },
                    }}
                    className={'sidebar'}
                >
                    <div className="top_section">
                        <AnimatePresence>
                            {isOpen && (
                                <motion.h1
                                    variants={showAnimation}
                                    initial="hidden"
                                    animate="show"
                                    exit="hidden"
                                    className="logo"
                                >
                                    NaturalQL
                                </motion.h1>
                            )}
                        </AnimatePresence>

                        <div className="bars">
                            <FaBars onClick={toggle} />
                        </div>
                    </div>
                    <section className="routes">
                        {console.log("schema data sidebar:", schemaData)}
                        {routes.map((route, index) => {
                            if (route.path === "/schema") {
                                return <SchemaSubMenu
                                key={schemaData.length || 'initial'}
                                route={{ ...route, subRoutes: schemaData }}
                                isOpen={isOpen}
                                showAnimation={showAnimation}
                            />
                            ;
                            }
                            <di></di>
                            if (route.subRoutes) {
                                return (
                                    <SidebarMenu
                                        setIsOpen={setIsOpen}
                                        route={route}
                                        showAnimation={showAnimation}
                                        isOpen={isOpen}
                                    />
                                );
                            }
                            return (
                                <NavLink
                                    to={route.path}
                                    key={`${index}-${route.name}`}
                                    className="link"
                                >
                                    <div className="icon">{route.icon}</div>
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                variants={showAnimation}
                                                initial="hidden"
                                                animate="show"
                                                exit="hidden"
                                                className="link_text"
                                            >
                                                {route.name}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </NavLink>
                            );
                        })}
                    </section>
                </motion.div>

                <main>{children}</main>
            </div>
        </>
    );
};

export default SideBar;
