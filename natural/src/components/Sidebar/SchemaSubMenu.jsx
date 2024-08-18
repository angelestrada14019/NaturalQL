import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { FaAngleDown } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import './sidebar.css'

const menuAnimation = {
    hidden: {
        opacity: 0,
        height: 0,
        transition: { duration: 0.3 }
    },
    show: {
        opacity: 1,
        height: "auto",
        transition: { duration: 0.3 }
    },
};

const SchemaSubMenu = ({ route, showAnimation, isOpen }) => {
    const [openSchemaIndices, setOpenSchemaIndices] = useState({});
    const [inputValue, setInputValue] = useState("");
    const [searchType, setSearchType] = useState('columna'); // Default search type
    const [searchQuery, setSearchQuery] = useState("");

    const toggleMenu = (index, level) => {
        setOpenSchemaIndices(prev => ({
            ...prev,
            [`${level}-${index}`]: !prev[`${level}-${index}`]
        }));
    };

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setInputValue(value);

        const parts = value.split(':');
        if (parts.length === 2) {
            const prefix = parts[0].toLowerCase();
            const query = parts[1].toLowerCase();
            if (['schema', 'tabla', 'columna'].includes(prefix)) {
                setSearchType(prefix);
                setSearchQuery(query);
            }
        } else {
            setSearchType('columna');
            setSearchQuery(value);
        }
    };

    const filteredData = route.subRoutes.filter(schema => {
        if (searchType === 'schema' && schema.eschema.toLowerCase().includes(searchQuery)) {
            return true;
        } else if (searchType === 'tabla') {
            return schema.tabla.some(tabla => tabla.nombre_tabla.toLowerCase().includes(searchQuery));
        } else if (searchType === 'columna') {
            return schema.tabla.some(tabla => tabla.columnas.some(columna => columna.nombre_columna.toLowerCase().includes(searchQuery)));
        }
        return false;
    }).map(schema => ({
        ...schema,
        tabla: schema.tabla.filter(tabla => {
            if (searchType === 'tabla' && tabla.nombre_tabla.toLowerCase().includes(searchQuery)) {
                return true;
            } else if (searchType === 'columna') {
                return tabla.columnas.some(columna => columna.nombre_columna.toLowerCase().includes(searchQuery));
            }
            return searchType === 'schema';
        }).map(tabla => ({
            ...tabla,
            columnas: searchType === 'columna' ?
                tabla.columnas.filter(columna => columna.nombre_columna.toLowerCase().includes(searchQuery)) :
                tabla.columnas
        }))
    }));

    return (
        <div>
            <div className="menu" onClick={() => toggleMenu('main', 'schema')}>
                <div className="menu_item">
                    <div className="icon">{route.icon}</div>
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
                    <motion.div
                        animate={openSchemaIndices['schema-main'] ? { rotate: 0 } : { rotate: -90 }}
                        className="icon"
                    >
                        <FaAngleDown />
                    </motion.div>
                </div>
            </div>
            <AnimatePresence>
                {isOpen && openSchemaIndices['schema-main'] && (
                    <>
                        <div className="search">
                            <div className="search_icon"><BiSearch /></div>
                            <motion.input
                                initial="hidden"
                                animate="show"
                                exit="hidden"
                                type="text"
                                placeholder="tabla:nombre,columna,schema:nombre"
                                onChange={handleSearchChange}
                                value={inputValue}
                            />
                        </div>
                        <motion.div
                            variants={menuAnimation}
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            className="menu_container"
                        >
                            {filteredData.map((schema, schemaIndex) => (
                                <div key={schemaIndex}>
                                    <div className="menu" onClick={() => toggleMenu(schemaIndex, 'table')}>
                                        <div className="menu_item">
                                            <div className="link_text">{schema.eschema}</div>
                                            <motion.div
                                                animate={openSchemaIndices[`table-${schemaIndex}`] ? { rotate: 0 } : { rotate: -90 }}
                                                className="icon"
                                            >
                                                <FaAngleDown />
                                            </motion.div>
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {openSchemaIndices[`table-${schemaIndex}`] && (
                                            <motion.div
                                                variants={menuAnimation}
                                                initial="hidden"
                                                animate="show"
                                                exit="hidden"
                                                className="menu_container"
                                            >
                                                {schema.tabla.map((tabla, tablaIndex) => (
                                                    <div key={tablaIndex}>
                                                        <div className="menu" onClick={() => toggleMenu(`${schemaIndex}-${tablaIndex}`, 'column')}>
                                                            <div className="menu_item">
                                                                <div className="link_text">{tabla.nombre_tabla}</div>
                                                                <motion.div
                                                                    animate={openSchemaIndices[`column-${schemaIndex}-${tablaIndex}`] ? { rotate: 0 } : { rotate: -90 }}
                                                                    className="icon"
                                                                >
                                                                    <FaAngleDown />
                                                                </motion.div>
                                                            </div>
                                                        </div>
                                                        <AnimatePresence>
                                                            {openSchemaIndices[`column-${schemaIndex}-${tablaIndex}`] && (
                                                                <motion.div
                                                                    variants={menuAnimation}
                                                                    initial="hidden"
                                                                    animate="show"
                                                                    exit="hidden"
                                                                    className="menu_container"
                                                                >
                                                                    {tabla.columnas.map((columna, columnaIndex) => (
                                                                        <div key={columnaIndex} className="link_text" style={{ paddingLeft: "40px" }}>
                                                                            {columna.nombre_columna} ({columna.tipo_dato})
                                                                        </div>
                                                                    ))}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SchemaSubMenu;
