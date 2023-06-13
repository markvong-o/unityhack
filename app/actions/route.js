import markdown from './actions.md';
import { marked } from 'marked';
import { NextResponse } from 'next/server';

export async function GET(request) {
  return NextResponse.json(markdown)
}
