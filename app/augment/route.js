import { NextResponse } from 'next/server';

export async function GET(request) {
  let augmentData = {
    EUID: '4n1ty4$3r',
    roles: ['administrator', 'reader', 'consumer'],
    licenses: ['012-aue-539-ioa', '902-fse-124-abc'],
  };
  return NextResponse.json(augmentData);
}
