import { NextRequest, NextResponse } from 'next/server';
import fetchData from '../../lib/fetchData';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = searchParams.get('days');
  const endDate = searchParams.get('endDate');
  const stamp = searchParams.get('stamp');
  const timezoneOffset = searchParams.get('timezoneOffset');

  try {
    const data = await fetchData(
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