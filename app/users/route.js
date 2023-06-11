import { NextResponse } from 'next/server';

export async function GET(request) {
  let users = [
    {
      email: 'mark.vong@okta.com',
      uid: '0021200',
    },
    {
      email: 'mark.vong@acme.com',
      uid: '0000000',
    },
  ];
  return NextResponse.json(users);
}
