import axios from 'axios';

const fetchData = async (days: number, endDate: string, stamp: number, timezoneOffset: number) => {

  const url = `${process.env.JF_URL}/user_usage_stats/MoviesReport`;

  const params = {
    days,
    end_date: endDate,
    stamp,
    timezoneOffset,
  };

  const headers = {
    Authorization: `MediaBrowser Token=${process.env.API_KEY}`,
  };

  try {
    const response = await axios.get(url, { params, headers });
    console.log('response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export default fetchData;