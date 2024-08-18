import { useAutocomplete } from '@mui/material';
import React from 'react';
import Plot from 'react-plotly.js';

const PlotGraph = ({ data }) => {
    return (
        <div className='plot_container'>
            <Plot
            data={data.data}
            layout={{
                ...data.layout,
                autosize: true,
                margin:{
                    r:useAutocomplete,
                }
            }}
            
            useResizeHandler={true}
            />
        </div>
    );
};

export default PlotGraph;
