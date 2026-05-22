import { API_BASE_URL } from '../config.js';

export const fetchPartners = async () => {
    const resp = await fetch(`${API_BASE_URL}/partner`);
    const data = await resp.json();
    return data;
}

export const partners = await fetchPartners();
