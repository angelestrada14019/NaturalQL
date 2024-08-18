import React from 'react';
import TextField from '@material-ui/core/TextField';
import { createStyles, makeStyles } from "@material-ui/core/styles";
import SendIcon from '@material-ui/icons/Send';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useChat } from '../../context/ChatProvider';

const useStyles = makeStyles((theme) =>
  createStyles({
    wrapForm: {
        display: "flex",
        justifyContent: "center",
        width: "95%",
        margin: `${theme.spacing(0)} auto`
    },
    wrapText: {
        width: "100%"
    },
    button: {
        margin: theme.spacing(1),
    },
    buttonDisabled: {
        opacity: 0.5,
    }
  })
);

export const TextInput = () => {
    const { inputMsg, handleMessageChange, handleSubmit,isLoading,setIsLoading } = useChat();
    const classes = useStyles();

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            handleSend();
            event.preventDefault();
        }
    };

    const handleSend = () => {
        setIsLoading(true);
        handleSubmit(); // Asegúrate de que esta función eventualmente llama a setIsLoading(false)
    };

    return (
        <div className={classes.wrapForm}>
            <TextField
                id="standard-text"
                label="Realiza una pregunta"
                className={classes.wrapText}
                value={inputMsg}
                onChange={event => handleMessageChange(event.target.value)}
                onKeyUp={handleKeyPress}
                disabled={isLoading}
            />
            <Button onClick={handleSend} className={isLoading ? `${classes.button} ${classes.buttonDisabled}` : classes.button} disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
            </Button>
        </div>
    )
}
