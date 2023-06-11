'use server';

import { redirect } from 'next/navigation';

export async function completeForm(data) {
  let domain = data.get('domain');
  let state = data.get('state');
  let firstname = data.get('firstname');
  let terms = data.get('terms');
  let redirectUrl = `https://${domain}/continue?state=${state}&firstname=${firstname}&terms=${terms}`;
  redirect(redirectUrl);
}
