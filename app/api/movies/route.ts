import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import fetchData from '../../lib/fetchData';

// Wrap fetchData with unstable_cache
const cachedFetchData = unstable_cache(fetchData, ['MoviesReport'], { revalidate: 3600 });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = searchParams.get('days');
  const endDate = searchParams.get('endDate');
  const stamp = searchParams.get('stamp');
  const timezoneOffset = searchParams.get('timezoneOffset');

  try {
    const data = await cachedFetchData(
      Number(days),
      String(endDate),
      Number(stamp),
      Number(timezoneOffset)
    );
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}