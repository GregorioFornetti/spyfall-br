
export const dbPath = process.env.NODE_ENV === 'development' ? 
                                               'http://localhost:3000' + process.env.REACT_APP_DB_PATH :
                                                process.env.REACT_APP_DB_PATH