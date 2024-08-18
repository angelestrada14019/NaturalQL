import { createStyles, makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import { deepOrange } from "@material-ui/core/colors";
import React, { useState } from 'react'
import { useChat } from '../../context/ChatProvider';
import DataTable from "../dataTable/DataTable";
import PlotGraph from "../plotGraph/PlotGraph";
import { Paper } from '@mui/material';
import TextField from '@material-ui/core/TextField';
const useStyles = makeStyles((theme) =>
    createStyles({
        messageRow: {
            display: "flex",
            maxWidth: "100%",
        },
        messageRowRight: {
            display: "flex",
            justifyContent: "flex-end",
            maxWidth: "100%",
        },
        messageBlue: {
            color: '#ffffff',
            position: "relative",
            marginLeft: "20px",
            marginBottom: "10px",
            padding: "10px",
            backgroundColor: '#00073d',
            //height: "50px",
            textAlign: "left",
            font: "400 .9em 'Open Sans', sans-serif",
            border: "1px solid #00073d",
            borderRadius: "10px",
            maxWidth: "650px",
            wordWrap: "break-word",
            "&:after": {
                content: "''",
                position: "absolute",
                width: "0",
                height: "0",
                borderTop: "15px solid #00073d",
                borderLeft: "15px solid transparent",
                borderRight: "15px solid transparent",
                top: "0",
                left: "-15px"
            },
            "&:before": {
                content: "''",
                position: "absolute",
                width: "0",
                height: "0",
                borderTop: "17px solid #00073d",
                borderLeft: "16px solid transparent",
                borderRight: "16px solid transparent",
                top: "-1px",
                left: "-17px"
            }
        },
        messageOrange: {
            position: "relative",
            marginRight: "20px",
            marginBottom: "10px",
            padding: "10px",
            backgroundColor: "#f8e896",
            //height: "50px",
            textAlign: "left",
            font: "400 .9em 'Open Sans', sans-serif",
            border: "1px solid #dfd087",
            borderRadius: "10px",
            maxWidth: "600px", // Establece un ancho máximo para los mensajes
            wordWrap: "break-word",
            "&:after": {
                content: "''",
                position: "absolute",
                width: "0",
                height: "0",
                borderTop: "15px solid #f8e896",
                borderLeft: "15px solid transparent",
                borderRight: "15px solid transparent",
                top: "0",
                right: "-15px"
            },
            "&:before": {
                content: "''",
                position: "absolute",
                width: "0",
                height: "0",
                borderTop: "17px solid #dfd087",
                borderLeft: "16px solid transparent",
                borderRight: "16px solid transparent",
                top: "-1px",
                right: "-17px"
            }
        },

        messageContent: {
            padding: 0,
            margin: 0,
            overflowWrap: "break-word",
        },

        darkBlue: {
            color: theme.palette.getContrastText(deepOrange[500]),
            backgroundColor: '#00073d',
            width: theme.spacing(4),
            height: theme.spacing(4)
        },
        avatarNothing: {
            color: "transparent",
            backgroundColor: "transparent",
            width: theme.spacing(4),
            height: theme.spacing(4)
        },
        displayName: {
            marginLeft: "20px"
        },
        // Media queries para ajustar los estilos en pantallas más pequeñas
        '@media (max-width: 650px)': {
            messageBlue: {
                marginLeft: "10px",
                padding: "5px",
                maxWidth: "200px", // Usa todo el ancho disponible en pantallas pequeñas
            },
            messageOrange: {
                marginRight: "10px",
                padding: "5px",
                maxWidth: "200px", // Usa todo el ancho disponible en pantallas pequeñas
            },
        },
    })
);

export const MessageLeft = (props) => {
    const message = props.message ? props.message : "no message";
    const typeData = props.typeData ? props.typeData : "no type";
    const photoURL = props.photoURL ? props.photoURL : "";
    const displayName = props.displayName ? props.displayName : "NaturalQL";
    const classes = useStyles();
    const { executeSql, generateFigure,handleMessageChangeInstructions,params } = useChat();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMenuFigOpen, setIsMenuFigOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    const toggleMenuFig = () => {
        setIsMenuFigOpen(!isMenuFigOpen);
    };
    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            generateFigure();
            event.preventDefault();
        }
    };

    return (
        <>
            <div className={classes.messageRow}>
                <Avatar
                    alt={displayName}
                    className={classes.darkBlue}
                    src={photoURL}
                ></Avatar>
                <div>
                    <div className={classes.displayName}>{displayName}</div>
                    <div className={classes.messageBlue}>
                        <div>
                            {typeData === "sql" && (
                                <>
                                    <div className="sql_container" onClick={toggleMenu}>
                                        <pre>
                                            <code>{message}</code>
                                        </pre>
                                        {isMenuOpen && (
                                            <div className="menu_options">
                                                <div className="generate_dataTable" onClick={executeSql}>
                                                    generar tabla
                                                </div>
                                                <div className="generate_plotly" onClick={generateFigure}>
                                                    generar grafica
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                            {typeData === "df" && (
                                <DataTable data={message} />
                            )
                            }
                            {(typeData === "plotly_figure" || typeData === "fig_json") && (
                                message ? <>
                                    <Paper onClick={toggleMenuFig}>
                                        <PlotGraph data={message} />
                                    </Paper>
                                    {isMenuFigOpen && (
                                        <div className="menu_options">
                                            <div className="generate_dataTable">
                                                <TextField
                                                    id="standard-text"
                                                    label="Modificar grafica"
                                                    value={params.chart_instructions}
                                                    onChange={event => handleMessageChangeInstructions(event.target.value)}
                                                    onKeyUp={handleKeyPress}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </> : <p>Loading...</p>
                            )
                            }
                            {typeData === "text" && (
                                <p>{message}</p>
                            )
                            }

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export const MessageRight = (props) => {
    const classes = useStyles();
    const message = props.message ? props.message : "no message";
    return (
        <div className={classes.messageRowRight}>
            <div className={classes.messageOrange}>
                <p className={classes.messageContent}>{message}</p>
            </div>
        </div>
    );
};