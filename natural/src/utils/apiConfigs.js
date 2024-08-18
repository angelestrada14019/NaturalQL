const API_BASE_URL = 'http://localhost:9000/api/v0';

const ENDPOINTS = {
    GET_QUESTION_HISTORY: `${API_BASE_URL}/get_question_history`,
    GET_QUESTION_ALL_DATA_MESSAGE: `${API_BASE_URL}/get_question_all_data_message`,
    GET_TRAINING_DATA: `${API_BASE_URL}/get_training_data`,
    GENERATE_SQL: `${API_BASE_URL}/generate_sql`,
    RUN_SQL: `${API_BASE_URL}/run_sql`,
    GENERATE_PLOTLY_FIGURE: `${API_BASE_URL}/generate_plotly_figure`,
    TRAIN: `${API_BASE_URL}/train`,
    GENERATE_SCHEMA: `${API_BASE_URL}/generate_schema`,
    GET_USER_BY_ID: (id) => `${API_BASE_URL}/users/${id}`,
};

export default ENDPOINTS;
