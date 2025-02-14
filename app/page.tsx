import ChartComponent from './components/ChartComponent';
import { unstable_cache } from 'next/cache';
import styles from './page.module.css';

interface Tag {
  id: number;
  label: string;
}

interface Movie {
  sizeOnDisk: number;
}

interface Series {
  statistics: {
    sizeOnDisk: number;
  };
}

interface Params {
  [key: string]: string | number;
}

export default async function Home() {
  let days = 2000;
  const endDate = new Date().toISOString().slice(0, 10);

  const allParams: Params = {
    days,
    end_date: endDate,
  };

  const allMovieData = await report("jellyfin", "user_usage_stats/MoviesReport", allParams);
  const allTvData = await report("jellyfin", "user_usage_stats/GetTvShowsReport", allParams);
  const allUserData = await report("jellyfin", "user_usage_stats/user_activity", allParams);

  days = 30;

  const monthParams: Params = {
    days,
    end_date: endDate,
  };

  const monthMovieData = await report("jellyfin", "user_usage_stats/MoviesReport", monthParams);
  const monthTvData = await report("jellyfin", "user_usage_stats/GetTvShowsReport", monthParams);
  const monthUserData = await report("jellyfin", "user_usage_stats/user_activity", monthParams);

  const take = 100;
  const sort = 'requests';

  const jellyseerParams: Params = {
    take,
    sort
  };

  const requestData = await report("jellyseerr", "user", jellyseerParams);

  const arrParams: Params = {};
  const radarrTags = await report("radarr", "tag", arrParams);
  const sonarrTags = await report("sonarr", "tag", arrParams);
  const userSizeOnDisk = await getUserSizeOnDisk(radarrTags, sonarrTags);

  return (
    <main className={styles.main}>
      <h1>All time</h1>
      <div className={styles.chartContainer}>
        <div className={styles.chart}>
          <h2>Movies</h2>
          <ChartComponent data={allMovieData}/>
        </div>
        <div className={styles.chart}>
          <h2>TV</h2>
          <ChartComponent data={allTvData}/>
        </div>
        <div className={styles.chart}>
          <h2>User</h2>
          <ChartComponent data={allUserData} type="totalPlayTime"/>
        </div>
      </div>
      <h1>This month</h1>
      <div className={styles.chartContainer}>
        <div className={styles.chart}>
          <h2>Movies</h2>
          <ChartComponent data={monthMovieData}/>
        </div>
        <div className={styles.chart}>
          <h2>TV</h2>
          <ChartComponent data={monthTvData}/>
        </div>
        <div className={styles.chart}>
          <h2>User</h2>
          <ChartComponent data={monthUserData} type="totalPlayTime"/>
        </div>
      </div>
      <h1>User Requests</h1>
      <div className={styles.chartContainer}>
        <div className={styles.chart}>
          <h2>Requests</h2>
          <ChartComponent data={requestData} type="requests"/>
        </div>
        <div className={styles.chart}>
          <h2>Size on Disk (GB)</h2>
          <ChartComponent data={userSizeOnDisk} type="sizeOnDisk"/>
        </div>
      </div>
    </main>
  );
}

async function fetchData(type: string, endpoint: string, params: Params) {
  const queryString = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      acc[key] = value.toString();
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  const reqHeaders = new Headers();
  let url = "";
  if (type === "jellyfin") {
    url = `${process.env.JF_URL}/${endpoint}?${queryString}`
    reqHeaders.set("Authorization", `MediaBrowser Token=${process.env.JF_API_KEY}`);
  } else if (type === "jellyseerr") {
    url = `${process.env.JS_URL}/api/v1/${endpoint}?${queryString}`
    reqHeaders.set("X-Api-Key", `${process.env.JS_API_KEY}`);
  } else if (type === "radarr") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    url = `${process.env.RADARR_URL}/api/v3/${endpoint}?${queryString}`
    reqHeaders.set("X-Api-Key", `${process.env.RADARR_API_KEY}`);
  } else if (type === "sonarr") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    url = `${process.env.SONARR_URL}/api/v3/${endpoint}?${queryString}`
    reqHeaders.set("X-Api-Key", `${process.env.SONARR_API_KEY}`);
  }
  const options = {
    headers: reqHeaders
  }
  const response = await fetch(url, options);

  if (!response.ok) {
    console.warn('Request failed:', response.url, response.status, response.statusText);
  }

  const data = await response.json();
  if (type === "jellyseerr") {
    return data.results;
  }
  return data;
}

async function report(type: string, endpoint: string, params: Params) {
  const cachedFetchData = unstable_cache(fetchData, [endpoint], { revalidate: 3600 });
  const data = await cachedFetchData(type, endpoint, params);
  return data;
}

async function getUserSizeOnDisk(radarrTags: Tag[], sonarrTags: Tag[]) {
  const userSizeOnDisk: Record<string, number> = {};

  for (const tag of radarrTags) {
    if (/^\d+ - .+$/.test(tag.label)) {
      const tagDetail = await report("radarr", `tag/detail/${tag.id}`, {});
      let totalSize = 0;

      for (const movieId of tagDetail.movieIds) {
        const movie: Movie = await report("radarr", `movie/${movieId}`, {});
        totalSize += movie.sizeOnDisk;
      }

      userSizeOnDisk[tag.label] = totalSize / (1024 * 1024 * 1024); // Convert to gigabytes
    }
  }

  for (const tag of sonarrTags) {
    if (/^\d+ - .+$/.test(tag.label)) {
      const tagDetail = await report("sonarr", `tag/detail/${tag.id}`, {});
      let totalSize = 0;

      for (const seriesId of tagDetail.seriesIds) {
        const series: Series = await report("sonarr", `series/${seriesId}`, {});
        totalSize += series.statistics.sizeOnDisk;
      }

      if (userSizeOnDisk[tag.label]) {
        userSizeOnDisk[tag.label] += totalSize / (1024 * 1024 * 1024);
      } else {
        userSizeOnDisk[tag.label] = totalSize / (1024 * 1024 * 1024);
      }
    }
  }

  return userSizeOnDisk;
}