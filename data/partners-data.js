export const fetchPartners = async () => {
    const resp = await fetch('https://capbio.bi/cci/api/partner');
    const data = await resp.json();
    return data;
}

export const partners = await fetchPartners();
