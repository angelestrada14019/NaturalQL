import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdMessage } from "react-icons/md";
import axios from 'axios';
import ENDPOINTS from '../utils/apiConfigs';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children, loadPath }) => {
    const [inputMsg, setInputMsg] = useState("");
    const [params, setParams] = useState({ id: null, question: null, sql: null, chart_instructions: null });
    const [messages, setMessages] = useState([]);
    const [historyChat, setHistoryChat] = useState([])
    const navigate = useNavigate();
    const [dataTrain, setDataTrain] = useState([]);
    const [textTrainValue, setTextTrainValue] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [schemaData, setSchemaData] = useState([]);


    const createHistoryChat = (data) => {
        const transformedArray = data.map(item => ({
            id: item.id,
            path: `/dashboard/${item.id}`,
            name: item.question.length > 25 ? `${item.question.substring(0, 25)}...` : item.question,
            description: item.question,
            icon: <MdMessage />
        }));
        setHistoryChat(historyParams => {
            const existingIds = new Set(historyParams.map(p => p.id));
            const newItems = transformedArray.filter(item => !existingIds.has(item.id));
            return [...historyParams, ...newItems];
        });
    }

    const resetChat = () => {
        setParams({ id: null, question: null, sql: null, chart_instructions: null });
        setInputMsg("");
        setMessages([]);
    };
    //trer el historial
    useEffect(() => {
        let isMounted = true;
        traerHistorial(isMounted)
        return () => {
            isMounted = false;
        };
    }, []);

    const traerHistorial = (isMounted) => {
        axios.get(ENDPOINTS.GET_QUESTION_HISTORY)
            .then(response => {
                if (isMounted) {
                    createHistoryChat(response.data.questions)
                }
            })
            .catch(error => {
                if (isMounted) {
                    console.error('Hubo un error en la petición', error);
                }
            });
    }
      
    //------------------------------render sideBAr menu------------------------------
    useEffect(() => {
        if (!loadPath || !loadPath.pathname) {
            console.log('LoadPath is undefined or pathname is missing, waiting...');
            return;
        }

        console.log('LoadPath changed:', loadPath);

        const match = /\/dashboard\/([^\/]+)/.exec(loadPath.pathname);
        if (match) {
            const id = match[1];
            console.log('Fetching data for ID:', id);
            axios.get(ENDPOINTS.GET_QUESTION_ALL_DATA_MESSAGE, { params: { id } })
                .then(response => {
                    setMessages([])
                    console.log("Loaded question:", response.data.history);
                    const history = response.data.history
                    console.log("history: ", history);
                    const transformHistory = history.map(item => {
                        // // Determinar la clave y el valor del objeto
                        const key = Object.keys(item)[0]; // Asumimos que solo hay una clave por objeto
                        const value = item[key];

                        // // Definir la estructura del objeto transformado
                        return {
                            type: key === 'question' ? 'right' : 'left',
                            text: ((key === 'fig_json' || key === 'df') ? JSON.parse(value) : value),
                            ...(key !== 'question' && { typeData: key })
                        };
                    });
                    console.log("tranform: ", transformHistory);
                    setMessages(prevMessages => [...prevMessages, ...transformHistory]);
                    setParams(parameters => ({ ...parameters, id: response.data.id }))
                })
                .catch(error => {
                    console.error('Error loading question based on route', error);
                });
        } else {
            console.log('Not a valid dashboard ID route');
            resetChat()
        }
    }, [loadPath]);

    const handleMessageChange = (message) => {
        setInputMsg(message);
        setParams(prevParams => ({ ...prevParams, question: message }));
    };
    const handleMessageChangeInstructions = (message) => {
        setParams(prevParams => ({ ...prevParams, chart_instructions: message }));
    };
    useEffect(() => {
        let isMounted = true;
        getSchemaData(isMounted);
        return () => {
            isMounted = false;
        };  
    }, []); 
    
    const getSchemaData = (isMounted) => {
            axios.get(ENDPOINTS.GENERATE_SCHEMA)
            .then( response =>{
                console.log("response data schema: ", response.data);
                if (isMounted && response.data.schema && response.data.type === 'list') {
                    console.log("list schema", response.data);
                    setSchemaData(response.data.schema);
                }
            })
            .catch(
                error =>{
                    if (isMounted) {
                        console.error('Error al obtener el esquema:', error);
                        handleOpenSnackbar('error', 'Hubo un error al obtener el esquema: ' + error.message);
                    }
                })
    };
    
    //------------------train-----------------------------------------------------------------
    useEffect(() => {
        let isMounted = true;
        getDataTrain(isMounted)
        return () => {
            isMounted = false;
        };
    }, []);
    const getDataTrain = (isMounted) => {
        axios.get(ENDPOINTS.GET_TRAINING_DATA)
            .then(response => {
                if (isMounted) {
                    console.log("train: ", JSON.parse(response.data.df));
                    addDataTrainList(JSON.parse(response.data.df))
                }
            })
            .catch(error => {
                if (isMounted) {
                    console.error('Hubo un error en la petición', error);
                }
            });
    }
    const addDataTrainList = (newDataList) => {
        // Asegurarse de que newDataList es siempre un array
        if (!Array.isArray(newDataList)) {
            // Si newDataList es un objeto, conviértelo en un array
            newDataList = [newDataList];
        }
        setDataTrain(prevData => {
            const newDataToAdd = newDataList.filter(newData => {
                const exists = prevData.some(data => data.id === newData.id);
                if (exists) {
                    console.log(`Un objeto con el id ${newData.id} ya existe.`);
                    return false;
                }
                return true;
            });
    
            return [...prevData, ...newDataToAdd];
        });
    };

    const handleMessageChangeTrain = (prop) => (message) =>{
        setTextTrainValue(value=>({...value, [prop]: message}));
    };
    const handleSubmitTrain = () => {
        console.log(textTrainValue);
        const formData = formDataTrain(textTrainValue.question, textTrainValue.sql);
        axios.post(ENDPOINTS.TRAIN, formData)
            .then(response => {
                console.log('Respuesta recibida:', response);
                handleOpenSnackbar('success', 'Mensaje enviado!');
            })
            .catch(error => {
                handleOpenSnackbar('error', 'Hubo un error en la petición!');
            });
        setTextTrainValue({ sql: "", question: "" });
    };
    const formDataTrain = (question,sql)=>{
        const formData = new FormData();
        formData.append('question', '');
        formData.append('sql', '');
        return formData
    }
    const onDrop = useCallback((acceptedFiles) => {
        console.log(acceptedFiles);
        acceptedFiles.forEach(file => {
            const formData = new FormData();
            if (file.type === 'application/pdf') {
                formData.append('documentation', file);
            } else if (file.type === 'text/plain' || file.name.endsWith('.sql')) {
                formData.append('ddl', file);
            }
            axios.post(ENDPOINTS.TRAIN, formData)
                .then(response => {
                    console.log('Archivo cargado con éxito:', response);
                    handleOpenSnackbar('success', 'Archivo Cargado!');
                })
                .catch(error => {
                    console.error('Hubo un error al subir el archivo', error);
                    handleOpenSnackbar('error', 'No se cargó correctamente!');
                });
            
        });
    }, []);
    //--------------------------CHAT-----------------------------------------------------------------
    const handleSubmit = () => {
        console.log("handleSubmit");
        console.log(params);
        axios.get(ENDPOINTS.GENERATE_SQL, { params })
            .then(response => {
                console.log("submit: ", response.data);
                setMessages(prevMessages => [...prevMessages,
                { type: 'right', text: params.question },
                { type: 'left', text: response.data.text, typeData: response.data.type }]);
                setParams(parameters => ({ ...parameters, id: response.data.id }))
                setInputMsg("");
                createHistoryChat([response.data])
                navigate(`/dashboard/${response.data.id}`);
            })
            .catch(error => {
                console.error('Hubo un error en la petición', error);
                handleOpenSnackbar('error', 'Hubo un error en la petición!');
            }
        ).finally(()=>{
            setIsLoading(false)
        });
    };
    
    const executeSql = () => {
        axios.get(ENDPOINTS.RUN_SQL, { params })
            .then(response => {
                console.log("respone execute: ", response);
                console.log(JSON.parse(response.data.df));
                setMessages(prevMessages => [...prevMessages,
                { type: 'left', text: JSON.parse(response.data.df), typeData: response.data.type }]);
            })
            .catch(error => {
                alert('Error al ejecutar SQL: ' + error.message);
                setMessages(prevMessages => [...prevMessages,
                    { type: 'left', text: error.message, typeData: 'text' }])
            });
    };
    const generateFigure = () => {
        axios.get(ENDPOINTS.GENERATE_PLOTLY_FIGURE, { params })
            .then(response => {
                console.log(JSON.parse(response.data.fig));
                setMessages(prevMessages => [...prevMessages,
                { type: 'left', text: JSON.parse(response.data.fig), typeData: response.data.type }]);
            })
            .catch(error => {
                alert('Error al ejecutar SQL: ' + error.message);
            });
        setParams(prevParams => ({ ...prevParams, chart_instructions: "" }));
    };
//----------------------------------------CustomSnackBar Alert--------------------------------------
    const [snackbarInfo, setSnackbarInfo] = useState({
      open: false,
      severity: 'info',
      message: ''
    });
  
    const handleOpenSnackbar = (severity, message) => {
      setSnackbarInfo({
        open: true,
        severity,
        message
      });
    };
  
    const handleCloseSnackbar = () => {
      setSnackbarInfo((prev) => ({ ...prev, open: false }));
    };


    return (
        <ChatContext.Provider value={{
            inputMsg, params, handleMessageChange,
            handleSubmit, messages, executeSql, generateFigure, handleMessageChangeInstructions,
             historyChat, dataTrain,handleMessageChangeTrain,textTrainValue,handleSubmitTrain,onDrop,
             handleCloseSnackbar,snackbarInfo,isLoading,setIsLoading,schemaData
        }}>
            {children}
        </ChatContext.Provider>
    );
};

