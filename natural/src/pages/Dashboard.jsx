import { Chat } from "../components/chat/Chat";
import { TextInput } from "../components/chat/TextInput";
import {motion } from "framer-motion";
const Dashboard = () => {
    return <>
        <div className="title">
            <motion.h1
                initial="hidden"
                animate="show"
                exit="hidden"
            >
                Chatea con NaturalQL
            </motion.h1>
        </div>
        <div className="content_chat">
            <Chat />
            <div className="text_chat">
                <TextInput />
            </div>
        </div>
    </>;
};

export default Dashboard;
