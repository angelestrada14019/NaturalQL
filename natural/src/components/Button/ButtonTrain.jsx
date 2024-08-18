import TransitionsModal from '../modal/TransitionsModal';
import './button.css'
import { useState } from 'react';

const ButtonTrain = ({ name, children }) => {
    const [open, setOpen] = useState(false);

    function handleOpen() {
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
    }

    return (
        <div>
            <div onClick={handleOpen} className="myButton">
                {name}
            </div>
            <TransitionsModal open={open} handleClose={handleClose}>
                {children}
            </TransitionsModal>
        </div>
    );
}

export default ButtonTrain;

