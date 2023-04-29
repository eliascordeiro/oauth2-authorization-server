import axios from 'axios';
import { debug, error } from './logging.mjs';

function formatResponse(r) {        
    let msg = `${r.config.method.toUpperCase()} ${r.config.url} ${r.status}`;    
    const {data = {}} = r;
    if (Object.keys(data).length > 0) msg += ' ' + JSON.stringify(data);
    else msg += r.statusText ? ` (${r.statusText})` : '';
    
    return msg;
}

export function newAxios(params) {
    const instance = axios.create({
        validateStatus: (status) => true,
        ...params
    });

    instance.interceptors.response.use(r => {
        const logger = r.status < 400 ? debug : error;
        logger({origin: 'axios', description: formatResponse(r)})
        return r;
    });

    return instance;
}