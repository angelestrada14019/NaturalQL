import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';
import './dataTable.css'

const DataTable = ({ data }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    if (!data || data.length === 0) {
        return <p>No hay datos para mostrar.</p>;
    }

    const columns = Object.keys(data[0]);

    // Estados para paginación

    // Cambia la página actual
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Cambia el número de filas por página
    const handleChangeRowsPerPage = event => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Cortar los datos para mostrar solo la porción de la página actual
    const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (<>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 'auto' }} aria-label="tabla dinámica">
                    <TableHead>
                        <TableRow>
                            {columns.map((column, index) => (
                                <TableCell key={index}>{column}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((row, index) => (
                            <TableRow
                                key={index}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                {columns.map((column, colIndex) => (
                                    <TableCell key={colIndex} component="th" scope="row">
                                        {row[column] !== null ? row[column].toString() : 'null'}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                className='tablePagination'
            />
            </>
    );
};

export default DataTable;


