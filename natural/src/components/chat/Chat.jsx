import React from 'react'
import './chat.css'
import { MessageLeft, MessageRight } from "./Message";
import { useChat } from '../../context/ChatProvider';

export const Chat = () => {
    const { messages } = useChat();
    
    return (
        <div className='chat'>
            <MessageLeft
              message="Hola éste es NaturalQL para responder tus preguntas acerca de tú base de datos"
              photoURL="https://example.com/photo.jpg"
              displayName="NaturalQL"
              typeData= "text"
            />
            {messages.map((message, index) => {
                if (message.type === 'right') {
                    return (
                        <MessageRight
                            key={index}
                            message={message.text}
                        />
                    );
                }else if (message.type === 'left') {
                    return (<MessageLeft
                        message={message.text}
                        typeData={message.typeData}
                        key={index}
                        photoURL="https://example.com/photo.jpg"
                        displayName="NaturalQL"
                    />)
                }
                return null;
            })}
        </div>
    );
}
