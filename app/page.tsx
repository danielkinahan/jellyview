import ChartComponent from './components/ChartComponent';
import { unstable_cache } from 'next/cache';

export default async function Home() {
  const days = 30;
  const endDate = new Date().toISOString().slice(0, 10);
  const stamp = "1737230226092";
  const timezoneOffset = "-5";

  const params = {
    days,
    end_date: endDate,
    stamp,
    timezoneOffset,
  };

  const movieData = await report("user_usage_stats/MoviesReport", params);
  const tvData = await report("user_usage_stats/GetTvShowsReport", params);
  const userData = await report("user_usage_stats/user_activity", params);
  return (
    <main>
      <h1>Top 10 Movies by Watch Time</h1>
      <ChartComponent data={movieData}/>
      <h1>Top 10 TV Shows by Watch Time</h1>
      <ChartComponent data={tvData}/>
      <h1>Top 10 Users by Total Play Time</h1>
      <ChartComponent data={userData} type="totalPlayTime"/>
    </main>
  );
}

async function fetchData(endpoint: string, params: any) {
  const cachedFetch = unstable_cache(fetch, [endpoint], { revalidate: 3600 });
  const queryString = new URLSearchParams(params).toString();
  const url = `${process.env.JF_URL}/${endpoint}?${queryString}`
  console.log(url);
  const reqHeaders = new Headers();
  reqHeaders.set("Authorization", `MediaBrowser Token=${process.env.API_KEY}`);
  const options = {
    headers: reqHeaders
  }
  const response = await cachedFetch(url, options);

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  return data;
}


async function report(endpoint: string, params: any) {
  const cachedFetchData = unstable_cache(fetchData, [endpoint], { revalidate: 3600 });
  const movieData = await cachedFetchData(endpoint, params);
  return movieData;
}