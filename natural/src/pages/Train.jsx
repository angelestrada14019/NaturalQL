import '../App.css';
import ButtonTrain from "../components/Button/ButtonTrain";
import CustomSnackbar from '../components/customSnackbar/CustomSnackbar';
import DataTable from "../components/dataTable/DataTable";
import DragDropDocument from '../components/dragDropDocument/DragDropDocument';
import { useChat } from '../context/ChatProvider';
import { useState } from 'react';
import {motion } from "framer-motion";
const Train = () => {
    const { dataTrain, handleMessageChangeTrain,
        textTrainValue, handleSubmitTrain, handleCloseSnackbar, snackbarInfo } = useChat();

    return (
        <>
            <div className="title"> 
            <motion.h1
                initial="hidden"
                animate="show"
                exit="hidden"
            >
                Entrenar IA
            </motion.h1>
            </div>
            <div className="button_train">
                <ButtonTrain name='Agregar documentación'>
                    <DragDropDocument
                        accept={{ 'application/pdf': ['.pdf'] }}
                        title="Solo archivos PDF"
                    />
                </ButtonTrain>
                <ButtonTrain name='Agregar DDL'>
                    <DragDropDocument
                        accept={{ 'application/txt': ['.txt'], 'application/sql': ['.sql'] }}
                        title="Archivos SQL o PDF"
                    />
                </ButtonTrain>
                <ButtonTrain name='Agregar Query'>
                    <DragDropDocument
                        title="Ingresa tu texto"
                        textAreas={[
                            {
                                placeholder: "Escribe un query en SQL",
                                value: textTrainValue.sql,
                                handleMessageChange: handleMessageChangeTrain('sql')
                            },
                            {
                                placeholder: "Escribe la pregunta (opcional)",
                                value: textTrainValue.question,
                                handleMessageChange: handleMessageChangeTrain('question')
                            }
                        ]}
                        onSubmit={handleSubmitTrain}
                    />
                </ButtonTrain>
            </div>
            <CustomSnackbar
                open={snackbarInfo.open}
                handleClose={handleCloseSnackbar}
                severity={snackbarInfo.severity}
                message={snackbarInfo.message}
            />
            <div className="container_train">
                <div className="container_table_train">
                    <DataTable data={dataTrain} />
                </div>
            </div>
        </>
    );
};


export default Train;

