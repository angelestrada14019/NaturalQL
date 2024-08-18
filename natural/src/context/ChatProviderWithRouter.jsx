import { useLocation } from 'react-router-dom';
import { ChatProvider } from './ChatProvider';

const ChatProviderWithRouter = ({ children }) => {
    const location = useLocation();

    return (
        <>
            {console.log(location)}
            <ChatProvider loadPath={location}>
                {children}
            </ChatProvider>
        </>
    );
};
export default ChatProviderWithRouter;