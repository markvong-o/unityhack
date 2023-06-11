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
    {
        email: 'mark.vong@atko.email',
        uid: '01010101'
    },
    {
        email: 'bob.dylan@unity.com',
        uid: '123102301230'
    }
  ];
  return NextResponse.json(users);
}
